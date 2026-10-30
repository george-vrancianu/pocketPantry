import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import type { Locale } from '../i18n/resources';
import { adminCatalogQueryKey } from './admin';
import { ApiError, apiRequest } from './api';
import { catalogChangeQueryKeys } from './queryKeys';
import { familySynonymsQueueKey } from './familySynonymsQueue';

type Leaf = { id: string; name: string };

/** One Family's copy of a Family Ingredient; no Family identity. */
export type FamilyIngredientCopy = {
  id: string;
  name: string;
  locale: Locale;
  defaultUnit: string;
  leafCategory: Leaf;
};

/** Family Ingredients sharing a normalised name across Families. */
export type FamilyIngredientGroup = {
  normalizedName: string;
  name: string;
  leafCategory: Leaf;
  familyCount: number;
  /** The locale the name was typed in (the oldest copy's). */
  locale: Locale;
  /** Oldest first. */
  copies: FamilyIngredientCopy[];
};

export type PromoteResult = {
  ingredientId: string;
  name: string;
  mergedIngredientIds: string[];
};

type Page = {
  /** Every group in the queue, not just this page. */
  total: number;
  groups: FamilyIngredientGroup[];
  nextCursor: string | null;
};

/** The queue one page at a time, fetched only while `enabled`. */
const queueKey = ['admin-family-ingredients'] as const;

export function useFamilyIngredientsQueue(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queueKey,
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      apiRequest<Page>(
        `/admin/family-ingredients?${new URLSearchParams(
          pageParam ? { cursor: pageParam } : {},
        )}`,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Counts move between pages, so a name can repeat: keep its first appearance.
    select: (data) => ({
      groups: [
        ...new Map(
          data.pages
            .flatMap((page) => page.groups)
            .map((group) => [group.normalizedName, group]),
        ).values(),
      ],
      total: data.pages.at(-1)?.total ?? 0,
    }),
  });
}

export type MergeResult = {
  targetIngredientId: string;
  mergedIngredientIds: string[];
};

/**
 * Promote and merge turn Family copies into shared Ingredients (or fold them
 * away), so everything that shows Ingredients, the Pantry or the lists is stale.
 */
export function invalidateCatalogDependents(queryClient: QueryClient) {
  return Promise.all(
    [
      queueKey,
      familySynonymsQueueKey,
      adminCatalogQueryKey,
      ...catalogChangeQueryKeys,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/** Someone else got there first: the picker is on a group that has gone. */
function refreshOnNotFound(queryClient: QueryClient) {
  return (error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      void queryClient.invalidateQueries({ queryKey: queueKey });
    }
  };
}

export function usePromoteFamilyIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ingredientId: string) =>
      apiRequest<PromoteResult>('/admin/family-ingredients/promote', {
        method: 'POST',
        body: { ingredientId },
      }),
    onError: refreshOnNotFound(queryClient),
    onSuccess: () => invalidateCatalogDependents(queryClient),
  });
}

/** Merge the whole group `ingredientId` belongs to into a shared Ingredient. */
export function useMergeFamilyIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { ingredientId: string; targetIngredientId: string }) =>
      apiRequest<MergeResult>('/admin/family-ingredients/merge', {
        method: 'POST',
        body: input,
      }),
    onError: refreshOnNotFound(queryClient),
    onSuccess: () => invalidateCatalogDependents(queryClient),
  });
}
