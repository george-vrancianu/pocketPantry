import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Locale } from '../i18n/resources';
import { adminCatalogQueryKey } from './admin';
import { apiRequest } from './api';
import { catalogSearchQueryKey, type Unit } from './catalog';

export type UnmatchedStatus = 'open' | 'dismissed';
export type UnmatchedSource =
  | 'product'
  | 'receipt'
  | 'plate'
  | 'ingredients'
  | 'manual'
  | 'finish_shopping';

export type UnmatchedReference = {
  type: 'batch' | 'shopping_item';
  id: string;
  source: UnmatchedSource;
  locale: Locale;
  rawName: string;
};

/** Every Batch and Shopping Item carrying one normalised raw name. */
export type UnmatchedEntry = {
  normalizedName: string;
  rawName: string;
  count: number;
  /** Locale of the most recent row: the default language of the Synonym. */
  locale: Locale;
  locales: Locale[];
  sources: UnmatchedSource[];
  dismissed: boolean;
  references: UnmatchedReference[];
};

export type UnmatchedResolution = {
  ingredientId: string;
  locale: Locale;
  relinkedBatches: number;
  relinkedShoppingItems: number;
  synonymAdded: boolean;
};

export type ResolveInput = {
  normalizedName: string;
  locale: Locale;
} & (
  | { ingredientId: string }
  | {
      newIngredient: {
        name: string;
        leafCategoryId: string;
        defaultUnit: Unit;
      };
    }
);

const queueKey = ['admin-unmatched'] as const;

export function useUnmatchedQueue(status: UnmatchedStatus) {
  return useQuery({
    queryKey: [...queueKey, status],
    queryFn: () =>
      apiRequest<{ entries: UnmatchedEntry[] }>(
        `/admin/unmatched?${new URLSearchParams({ status })}`,
      ).then((body) => body.entries),
  });
}

export function useResolveUnmatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResolveInput) =>
      apiRequest<UnmatchedResolution>('/admin/unmatched/resolve', {
        method: 'POST',
        body: input,
      }),
    // Resolving can create an Ingredient and a Synonym, and relinks Pantry and
    // Shopping List rows, so everything that shows them is stale.
    onSuccess: () =>
      Promise.all(
        [
          queueKey,
          adminCatalogQueryKey,
          catalogSearchQueryKey,
          ['pantry'],
          ['shopping-list'],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

export function useDismissUnmatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (normalizedName: string) =>
      apiRequest('/admin/unmatched/dismiss', {
        method: 'POST',
        body: { normalizedName },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queueKey }),
  });
}
