import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult } from './catalog';
import { catalogChangeQueryKeys } from './queryKeys';

/** What uses a Family Ingredient: the counts in the delete confirmation. */
export type FamilyIngredientUsage = {
  batches: number;
  shoppingItems: number;
  templateLines: number;
  recipeLines: number;
  staples: number;
};

/** Whether a Member has tagged a Family Ingredient's Allergens, and with which (ADR 0014). */
export type FamilyIngredientAllergens = {
  /** False = Unchecked; true with no ids = "None". */
  allergensChecked: boolean;
  allergenIds: string[];
};

export type FamilyCatalogIngredient = CatalogSearchResult &
  FamilyIngredientAllergens & {
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
    Promise.all(
      catalogChangeQueryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
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

/**
 * Replaces the Allergens a Family Ingredient contains (empty = "None") and marks it checked.
 * Every Recipe using it changes its Allergens and Allergy Warning, so all Recipe screens refresh.
 */
export function useSetFamilyIngredientAllergens() {
  const refresh = useRefreshAfterCatalogChange();
  return useMutation({
    mutationFn: ({ id, allergenIds }: { id: string; allergenIds: string[] }) =>
      apiRequest<{ id: string } & FamilyIngredientAllergens>(
        `/catalog/family-ingredients/${id}/allergens`,
        { method: 'PUT', body: { allergenIds } },
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
