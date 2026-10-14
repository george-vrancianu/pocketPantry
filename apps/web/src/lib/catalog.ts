import { keepPreviousData, useQuery } from '@tanstack/react-query';
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

/**
 * Catalog search, with names in `locale`. Idle for a blank query. `shared`
 * searches the shared Catalog only (Admin); `family` adds the Family's own.
 */
export function useCatalogSearch(
  query: string,
  locale: string,
  scope: 'family' | 'shared' = 'family',
) {
  const debounced = useDebounced(query.trim(), 150);
  const result = useQuery({
    queryKey: [...catalogSearchQueryKey, locale, scope, debounced],
    queryFn: () => {
      const params = new URLSearchParams({ q: debounced, locale });
      if (scope === 'shared') params.set('scope', 'shared');
      return apiRequest<{ results: CatalogSearchResult[] }>(
        `/catalog/search?${params}`,
      ).then((body) => body.results);
    },
    enabled: debounced.length > 0,
    // Keep the shown options (and their nodes) while the next query loads, so
    // a click mid-refresh still lands.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  return {
    ...result,
    // Typing ahead of the debounce counts as still searching.
    isSearching: query.trim() !== debounced || result.isFetching,
    active: debounced.length > 0,
    /** The trimmed query the results belong to (it lags what is typed). */
    query: debounced,
  };
}
