import { useQuery } from '@tanstack/react-query';
import { popularToStartQueryKey } from './queryKeys';
import { apiRequest } from './api';
import { LOCALES, type Locale } from '../i18n/resources';
import type { CatalogSearchResult } from './catalog';

/** The UI language as a Catalog locale; anything else reads the English list. */
export function popularLocale(language: string): Locale {
  const base = language.slice(0, 2);
  return LOCALES.find((locale) => locale === base) ?? 'en';
}

/** Popular to start: the fixed Ingredients offered to a Family with nothing Recently Stocked. */
export function usePopularToStart(language: string) {
  const locale = popularLocale(language);
  return useQuery({
    queryKey: popularToStartQueryKey(locale),
    queryFn: () =>
      apiRequest<{ ingredients: CatalogSearchResult[] }>(
        `/catalog/popular-to-start?${new URLSearchParams({ locale })}`,
      ).then((body) => body.ingredients),
    staleTime: 5 * 60_000,
  });
}
