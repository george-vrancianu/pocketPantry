import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { catalogSearchQueryKey, type CatalogSearchResult } from './catalog';
import {
  familyIngredientRelinkQueryKeys,
  recentlyStockedQueryKey,
} from './queryKeys';
import { staplesQueryKey } from './staples';

/** What uses a Family Ingredient: the counts in the delete confirmation. */
export type FamilyIngredientUsage = {
  batches: number;
  shoppingItems: number;
  templateLines: number;
  recipeLines: number;
  staples: number;
};

export type FamilyCatalogIngredient = CatalogSearchResult & {
  usage: FamilyIngredientUsage;
};

export type FamilyCatalogSynonym = {
  id: string;
  name: string;
  ingredient: { id: string; name: string };
};

export type FamilyCatalog = {
  ingredients: FamilyCatalogIngredient[];
  synonyms: FamilyCatalogSynonym[];
};

export const familyCatalogQueryKey = ['family-catalog'] as const;

/** The Family's own Ingredients and Synonyms, names in `locale`. */
export function useFamilyCatalog(locale: string) {
  return useQuery({
    queryKey: [...familyCatalogQueryKey, locale],
    queryFn: () =>
      apiRequest<FamilyCatalog>(
        `/catalog/family?${new URLSearchParams({ locale })}`,
      ),
  });
}

/** Everything a rename, move or delete can change on screen. */
function useRefreshAfterCatalogChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: familyCatalogQueryKey }),
      queryClient.invalidateQueries({ queryKey: catalogSearchQueryKey }),
      queryClient.invalidateQueries({ queryKey: staplesQueryKey }),
      queryClient.invalidateQueries({ queryKey: recentlyStockedQueryKey }),
      ...familyIngredientRelinkQueryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    ]);
}

export type FamilyIngredientChange = {
  id: string;
  name?: string;
  leafCategoryId?: string;
};

/**
 * Renames and/or recategorises a Family Ingredient. A taken name fails with
 * `catalog.family_ingredient_exists` and the existing result in `params.existing`.
 */
export function useUpdateFamilyIngredient(locale: string) {
  const refresh = useRefreshAfterCatalogChange();
  return useMutation({
    mutationFn: ({ id, ...changes }: FamilyIngredientChange) =>
      apiRequest<CatalogSearchResult>(
        `/catalog/family-ingredients/${id}?${new URLSearchParams({ locale })}`,
        { method: 'PATCH', body: changes },
      ),
    onSuccess: refresh,
  });
}

/** Deletes a Family Ingredient; what used it becomes Unmatched under its name. */
export function useDeleteFamilyIngredient() {
  const refresh = useRefreshAfterCatalogChange();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/catalog/family-ingredients/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: refresh,
  });
}

/** Deletes a Family Synonym; it stops matching at once. */
export function useDeleteFamilySynonym() {
  const refresh = useRefreshAfterCatalogChange();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/catalog/family-synonyms/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });
}
