import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from './api';

export const LOCATIONS = ['fridge', 'freezer', 'cupboard', 'spices'] as const;
export type StorageLocation = (typeof LOCATIONS)[number];
export const UNITS = ['g', 'kg', 'ml', 'l', 'pcs'] as const;
export type Unit = (typeof UNITS)[number];

export type CatalogSearchResult = {
  defaults: { expiryDays: number | null; location: StorageLocation | null };
  id: string;
  name: string;
  defaultUnit: Unit;
  leafCategory: { id: string; name: string };
  parentCategory: {
    id: string;
    name: string;
    aisle: { id: string; name: string };
  };
};

export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export const catalogSearchQueryKey = ['catalog-search'] as const;

export type CatalogParent = { id: string; name: string };

/** The Catalog's Parent Categories by name in `locale`; `enabled` holds the request back until a screen needs it. */
export function useCatalogParents(locale: string, enabled = true) {
  return useQuery({
    queryKey: ['catalog-parents', locale],
    queryFn: () =>
      apiRequest<{ parents: CatalogParent[] }>(
        `/catalog/parents?${new URLSearchParams({ locale })}`,
      ).then((body) => body.parents),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export type CatalogAisle = {
  id: string;
  name: string;
  parentCategories: CatalogParent[];
};

/** The Aisles in shop order with their Parent Categories, for Browse by aisle. */
export function useCatalogAisles(
  locale: string,
  scope: 'family' | 'shared' = 'family',
  enabled = true,
) {
  return useQuery({
    queryKey: ['catalog-aisles', locale, scope],
    enabled,
    queryFn: () => {
      const params = new URLSearchParams({ locale });
      if (scope === 'shared') params.set('scope', 'shared');
      return apiRequest<{ aisles: CatalogAisle[] }>(
        `/catalog/aisles?${params}`,
      ).then((body) => body.aisles);
    },
    staleTime: 5 * 60_000,
  });
}

/** Restricts a search to an Aisle, and within it to one Parent Category. */
export type SearchWithin = { aisleId: string; parentCategoryId: string | null };

/** The Aisle a search key was made for ('' for none): the key ends with `{ aisleId, parentCategoryId }`. */
const aisleOfKey = (key: readonly unknown[]) =>
  (key.at(-1) as { aisleId: string }).aisleId;

/**
 * Catalog search, with names in `locale`. Idle for a blank query unless
 * `within` names an Aisle, which then lists it A to Z. `shared` searches the
 * shared Catalog only (Admin); `family` adds the Family's own.
 */
export function useCatalogSearch(
  query: string,
  locale: string,
  scope: 'family' | 'shared' = 'family',
  within: SearchWithin | null = null,
) {
  const debounced = useDebounced(query.trim(), 150);
  const aisleId = within?.aisleId ?? '';
  const parentCategoryId = within?.parentCategoryId ?? '';
  const result = useQuery({
    queryKey: [
      ...catalogSearchQueryKey,
      locale,
      scope,
      debounced,
      { aisleId, parentCategoryId },
    ],
    queryFn: () => {
      const params = new URLSearchParams({ q: debounced, locale });
      if (scope === 'shared') params.set('scope', 'shared');
      if (aisleId) params.set('aisleId', aisleId);
      if (parentCategoryId) params.set('parentCategoryId', parentCategoryId);
      return apiRequest<{ results: CatalogSearchResult[] }>(
        `/catalog/search?${params}`,
      ).then((body) => body.results);
    },
    enabled: debounced.length > 0 || aisleId !== '',
    // Keep the shown options (and their nodes) while the next query loads, so
    // a click mid-refresh still lands. Not across Aisles: those show skeletons.
    placeholderData: (previous, previousQuery) =>
      previousQuery && aisleOfKey(previousQuery.queryKey) === aisleId
        ? previous
        : undefined,
    staleTime: 60_000,
  });
  return {
    ...result,
    // Typing ahead of the debounce counts as still searching.
    isSearching: query.trim() !== debounced || result.isFetching,
    active: debounced.length > 0 || aisleId !== '',
    /** The trimmed query the results belong to (it lags what is typed). */
    query: debounced,
  };
}
