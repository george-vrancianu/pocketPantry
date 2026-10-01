import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from './api';

export type StorageLocation = 'fridge' | 'freezer' | 'cupboard' | 'spices';
export const UNITS = ['g', 'kg', 'ml', 'l', 'pcs'] as const;
export type Unit = (typeof UNITS)[number];

export type CatalogSearchResult = {
  defaults: { expiryDays: number | null; location: StorageLocation | null };
  id: string;
  name: string;
  defaultUnit: Unit;
  leafCategory: { id: string; name: string };
  parentCategory: { id: string; name: string; aisle: string };
};

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export const catalogSearchQueryKey = ['catalog-search'] as const;

/** Catalog search, with names in `locale`. Idle for a blank query. */
export function useCatalogSearch(query: string, locale: string) {
  const debounced = useDebounced(query.trim(), 150);
  const result = useQuery({
    queryKey: [...catalogSearchQueryKey, locale, debounced],
    queryFn: () =>
      apiRequest<{ results: CatalogSearchResult[] }>(
        `/catalog/search?${new URLSearchParams({ q: debounced, locale })}`,
      ).then((body) => body.results),
    enabled: debounced.length > 0,
    staleTime: 60_000,
  });
  return {
    ...result,
    // Typing ahead of the debounce counts as still searching.
    isSearching: query.trim() !== debounced || result.isFetching,
    active: debounced.length > 0,
  };
}
