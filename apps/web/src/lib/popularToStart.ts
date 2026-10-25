import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult } from './catalog';

const LOCALES = ['en', 'ro', 'da'] as const;

/** The UI language as a Catalog locale; anything else reads the English list. */
export function popularLocale(language: string): (typeof LOCALES)[number] {
  const base = language.slice(0, 2);
  return LOCALES.find((locale) => locale === base) ?? 'en';
}

/** Popular to start: the fixed Ingredients offered to a Family with nothing Recently Stocked. */
export function usePopularToStart(language: string, enabled: boolean) {
  const locale = popularLocale(language);
  return useQuery({
    queryKey: ['catalog', 'popular-to-start', locale],
    queryFn: () =>
      apiRequest<{ ingredients: CatalogSearchResult[] }>(
        `/catalog/popular-to-start?${new URLSearchParams({ locale })}`,
      ).then((body) => body.ingredients),
    enabled,
    staleTime: 5 * 60_000,
  });
}
