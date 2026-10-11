import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScanLanguage } from '../i18n/resources';
import { apiRequest } from './api';
import type { Unit } from './catalog';

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type RecipeLine = {
  id: string;
  ingredientId: string | null;
  quantity: number | null;
  unit: Unit | null;
  optional: boolean;
  note: string | null;
};
export type RecipeStep = {
  id: string;
  text: string;
  timerSeconds: number | null;
};
export type RecipeTip = { id: string; stepId: string | null; text: string };
export type RecipeLocaleText = {
  title: string | null;
  steps: Record<string, string>;
  lines: Record<string, string>;
  tips: Record<string, string>;
};

/** The Admin's view of one Catalog Recipe (mirror of the API's `AdminRecipeDetail`). */
export type AdminRecipe = {
  id: string;
  parentId: string | null;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: Difficulty | null;
  cuisineId: string | null;
  methodId: string | null;
  archived: boolean;
  lines: RecipeLine[];
  steps: RecipeStep[];
  tips: RecipeTip[];
  /** A Variant's base Recipe-level Tips with whether this Variant hides each. */
  parentTips: (RecipeTip & { hidden: boolean })[] | null;
  translations: Record<string, RecipeLocaleText>;
};

export type AdminRecipeListItem = {
  id: string;
  parentId: string | null;
  title: string;
  servings: number;
  difficulty: Difficulty | null;
  cuisineId: string | null;
  methodId: string | null;
  archived: boolean;
};

/** The document an Admin saves: lines and Steps with an `id` are updated in place. */
export type RecipeDocument = {
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: Difficulty | null;
  cuisineId: string | null;
  methodId: string | null;
  lines: Array<{
    id?: string;
    ingredientId: string | null;
    quantity: number | null;
    unit: Unit | null;
    optional: boolean;
    note: string | null;
  }>;
  steps: Array<{ id?: string; text: string; timerSeconds: number | null }>;
};

export type TranslationsInput = {
  title?: string | null;
  steps?: Record<string, string | null>;
  lines?: Record<string, string | null>;
  tips?: Record<string, string | null>;
};

export const adminRecipesQueryKey = ['admin-recipes'] as const;
const recipeKey = (id: string) => [...adminRecipesQueryKey, 'detail', id];

export function useAdminRecipes() {
  return useQuery({
    queryKey: [...adminRecipesQueryKey, 'list'],
    queryFn: () => apiRequest<AdminRecipeListItem[]>('/admin/recipes'),
  });
}

export function useAdminRecipe(id: string | null) {
  return useQuery({
    queryKey: recipeKey(id ?? ''),
    queryFn: () => apiRequest<AdminRecipe>(`/admin/recipes/${id}`),
    enabled: id !== null,
  });
}

/** A write that refreshes the list and details; a returned Recipe seeds its detail. */
function useRecipeWrite<Input>(send: (input: Input) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: send,
    onSuccess: (result) => {
      const detail = result as Partial<AdminRecipe> | undefined;
      if (detail?.id && detail.lines) {
        queryClient.setQueryData(recipeKey(detail.id), detail);
      }
      return queryClient.invalidateQueries({ queryKey: adminRecipesQueryKey });
    },
  });
}

export function useCreateRecipe() {
  return useRecipeWrite((document: RecipeDocument) =>
    apiRequest<AdminRecipe>('/admin/recipes', {
      method: 'POST',
      body: document,
    }),
  );
}
export function useUpdateRecipe(id: string) {
  return useRecipeWrite((document: RecipeDocument) =>
    apiRequest<AdminRecipe>(`/admin/recipes/${id}`, {
      method: 'PUT',
      body: document,
    }),
  );
}
export function useArchiveRecipe(id: string) {
  return useRecipeWrite(() =>
    apiRequest<AdminRecipe>(`/admin/recipes/${id}/archive`, {
      method: 'POST',
    }),
  );
}
export function useMakeVariant(baseId: string) {
  return useRecipeWrite((input: { title: string }) =>
    apiRequest<AdminRecipe>(`/admin/recipes/${baseId}/variants`, {
      method: 'POST',
      body: input,
    }),
  );
}

/** Tip writes return no Recipe, so the detail is refetched. */
export function useTipWrites(id: string) {
  const path = `/admin/recipes/${id}`;
  const add = useRecipeWrite((input: { text: string; stepId: string | null }) =>
    apiRequest(`${path}/tips`, { method: 'POST', body: input }),
  );
  const update = useRecipeWrite(
    ({ tipId, text }: { tipId: string; text: string }) =>
      apiRequest(`${path}/tips/${tipId}`, { method: 'PATCH', body: { text } }),
  );
  const remove = useRecipeWrite((tipId: string) =>
    apiRequest(`${path}/tips/${tipId}`, { method: 'DELETE' }),
  );
  const reorder = useRecipeWrite((ids: string[]) =>
    apiRequest(`${path}/tips/order`, { method: 'PUT', body: { ids } }),
  );
  const hide = useRecipeWrite((tipIds: string[]) =>
    apiRequest(`${path}/hidden-tips`, { method: 'PUT', body: { tipIds } }),
  );
  return { add, update, remove, reorder, hide };
}

export function useSetRecipeTranslations(id: string) {
  return useRecipeWrite(
    ({ locale, input }: { locale: ScanLanguage; input: TranslationsInput }) =>
      apiRequest(`/admin/recipes/${id}/translations/${locale}`, {
        method: 'PUT',
        body: input,
      }),
  );
}
