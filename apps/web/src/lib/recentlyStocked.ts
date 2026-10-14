import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult } from './catalog';
import { recentlyStockedQueryKey } from './queryKeys';

/** A Recently Stocked Ingredient: a search result plus when it was last added and whether it is still in the Pantry. */
export type RecentlyStocked = CatalogSearchResult & {
  lastStockedAt: string;
  inPantry: boolean;
};

export function useRecentlyStocked(locale: string, limit: number) {
  return useQuery({
    queryKey: [...recentlyStockedQueryKey, locale, limit],
    queryFn: () =>
      apiRequest<{ ingredients: RecentlyStocked[] }>(
        `/pantry/recently-stocked?${new URLSearchParams({
          locale,
          limit: String(limit),
        })}`,
      ).then((body) => body.ingredients),
  });
}
