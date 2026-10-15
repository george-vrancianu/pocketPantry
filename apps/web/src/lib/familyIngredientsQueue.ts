import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Locale } from '../i18n/resources';
import { adminCatalogQueryKey } from './admin';
import { ApiError, apiRequest } from './api';
import { catalogSearchQueryKey } from './catalog';
import { suggestionsQueryKey, templateDetailsQueryKey } from './queryKeys';
import { recipesQueryKey } from './recipes';
import { shoppingListQueryKey } from './shopping';

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

type Page = { groups: FamilyIngredientGroup[]; nextCursor: string | null };

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
    select: (data) => [
      ...new Map(
        data.pages
          .flatMap((page) => page.groups)
          .map((group) => [group.normalizedName, group]),
      ).values(),
    ],
  });
}

export function usePromoteFamilyIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ingredientId: string) =>
      apiRequest<PromoteResult>('/admin/family-ingredients/promote', {
        method: 'POST',
        body: { ingredientId },
      }),
    // Someone else promoted it first: the picker is on a group that has gone.
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: queueKey });
      }
    },
    // The Ingredient turns shared and the other copies are merged away, so
    // everything that shows Ingredients, the Pantry or the lists is stale.
    onSuccess: () =>
      Promise.all(
        [
          queueKey,
          adminCatalogQueryKey,
          catalogSearchQueryKey,
          ['pantry'],
          shoppingListQueryKey,
          suggestionsQueryKey,
          templateDetailsQueryKey,
          recipesQueryKey,
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}
