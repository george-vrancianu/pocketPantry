import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Locale } from '../i18n/resources';
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
} & ({ ingredientId: string } | { newIngredient: IngredientInput });

const queueKey = ['admin-unmatched'] as const;

type UnmatchedPage = { entries: UnmatchedEntry[]; nextCursor: string | null };

/** The queue one page at a time; `fetchNextPage` follows the server's cursor. */
export function useUnmatchedQueue(status: UnmatchedStatus) {
  return useInfiniteQuery({
    queryKey: [...queueKey, status],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      apiRequest<UnmatchedPage>(
        `/admin/unmatched?${new URLSearchParams({
          status,
          ...(pageParam ? { cursor: pageParam } : {}),
        })}`,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Counts move between pages, so a name can repeat: keep its first appearance.
    select: (data) => [
      ...new Map(
        data.pages
          .flatMap((page) => page.entries)
          .map((e) => [e.normalizedName, e]),
      ).values(),
    ],
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

export function useUndismissUnmatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (normalizedName: string) =>
      apiRequest('/admin/unmatched/undismiss', {
        method: 'POST',
        body: { normalizedName },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queueKey }),
  });
}
