import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Locale, ScanLanguage } from '../i18n/resources';
import { adminCatalogQueryKey, type IngredientInput } from './admin';
import { apiRequest } from './api';
import { catalogSearchQueryKey } from './catalog';
import type { ScanMode } from './scan';

export type UnmatchedStatus = 'open' | 'dismissed';
export type UnmatchedSource = ScanMode | 'manual' | 'finish_shopping';

export type UnmatchedReference = {
  type: 'batch' | 'shopping_item';
  id: string;
  source: UnmatchedSource;
  locale: Locale;
  rawName: string;
  /** The text as printed, and the Scan Language it was read in; null when not recorded. */
  sourceText: string | null;
  sourceLanguage: ScanLanguage | null;
};

/** Every Batch and Shopping Item carrying one normalised raw name. */
export type UnmatchedEntry = {
  normalizedName: string;
  rawName: string;
  count: number;
  /** Locale of the most recent row: the default language of the Synonym. */
  locale: Locale;
  locales: Locale[];
  /** Printed text of the most recent row that has one, with its Scan Language. */
  sourceText: string | null;
  sourceLanguage: ScanLanguage | null;
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
  /** A Synonym of the printed text was added. */
  sourceSynonymAdded: boolean;
  /** Why no printed-text Synonym was added: no printed text, already a Synonym of the target, or owned by another Ingredient. Null when added or not asked for. */
  sourceSynonymSkipped: 'none' | 'exists' | 'taken' | null;
};

export type ResolveInput = {
  normalizedName: string;
  /** Language of the Synonym made from the raw name: a catalog locale. */
  locale: Locale;
  /** Also make a Synonym of the printed text, in its own Scan Language. */
  sourceSynonym?: boolean;
} & ({ ingredientId: string } | { newIngredient: IngredientInput });

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
