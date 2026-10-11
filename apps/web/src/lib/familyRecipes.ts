import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import type {
  Difficulty,
  GuidanceInput,
  RecipeStep,
  RecipeTip,
} from './adminRecipes';
import { recipesQueryKey } from './recipes';

type GuidanceInputWithIds = {
  nutritionNote: string | null;
  pairings: (GuidanceInput['pairings'][number] & { id: string })[];
  eatingMoments: GuidanceInput['eatingMoments'];
};

/** An unsaved "Make a variant" draft (mirror of the API's `FamilyRecipeDraft`). */
export type FamilyRecipeDraft = {
  parentId: string;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: Difficulty | null;
  cuisineId: string | null;
  methodId: string | null;
  lines: {
    ingredientId: string | null;
    rawName: string | null;
    ingredientName: string;
    quantity: number | null;
    unit: Unit | null;
    optional: boolean;
    note: string | null;
  }[];
  steps: { text: string; timerSeconds: number | null }[];
  /** The source's guidance in the Member's locale, ready to post (Pairings without ids). */
  guidance: GuidanceInput;
};

/** The editable view of a Family Recipe (mirror of the API's `FamilyRecipeEdit`). */
export type FamilyRecipeEdit = {
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
  lines: {
    id: string;
    ingredientId: string | null;
    rawName: string | null;
    ingredientName: string;
    quantity: number | null;
    unit: Unit | null;
    optional: boolean;
    note: string | null;
  }[];
  steps: RecipeStep[];
  tips: RecipeTip[];
  parentTips: (RecipeTip & { hidden: boolean })[] | null;
} & GuidanceInputWithIds;

/** The document a Member saves: each line has an Ingredient or a free-text name. */
export type FamilyRecipeDocument = {
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
    rawName: string | null;
    quantity: number | null;
    unit: Unit | null;
    optional: boolean;
    note: string | null;
  }>;
  steps: Array<{ id?: string; text: string; timerSeconds: number | null }>;
  /** Only on create: a saved draft brings its guidance along. */
  guidance?: GuidanceInput;
};

const localeQuery = (locale: string) => new URLSearchParams({ locale });

/** The copy of a visible Recipe to start a Family Variant from. */
export function useVariantDraft(sourceId: string, locale: string) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'variant-draft', sourceId, locale],
    queryFn: () =>
      apiRequest<FamilyRecipeDraft>(
        `/recipes/${sourceId}/variant-draft?${localeQuery(locale)}`,
      ),
    // A draft is a snapshot the Member is editing: never refetch under them.
    staleTime: Infinity,
    gcTime: 0,
  });
}

/** The Family's own Recipe for editing. */
export function useFamilyRecipeEdit(id: string, locale: string) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'edit', id, locale],
    queryFn: () =>
      apiRequest<FamilyRecipeEdit>(
        `/recipes/${id}/edit?${localeQuery(locale)}`,
      ),
    // Unsaved edits live in the form: never refetch under them.
    refetchOnWindowFocus: false,
  });
}

/** A write that refreshes every Recipe query (list, detail, edit). */
function useFamilyWrite<Input, Result>(
  send: (input: Input) => Promise<Result>,
  { refetchNow = true }: { refetchNow?: boolean } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: send,
    onSuccess: (result) => {
      const edit = result as Partial<FamilyRecipeEdit> | undefined;
      if (edit?.id && edit.lines) {
        // The write returned the edit view: seed it so the editor does not flash stale.
        queryClient.setQueriesData(
          { queryKey: [...recipesQueryKey, 'edit', edit.id] },
          edit,
        );
      }
      return queryClient.invalidateQueries({
        queryKey: recipesQueryKey,
        // Archiving navigates away: mark stale, do not refetch the archived page.
        ...(refetchNow ? {} : { refetchType: 'none' as const }),
      });
    },
  });
}

/** Create a Variant under `parentId` (or, with null, a standalone Base Recipe). */
export function useCreateFamilyRecipe(locale: string) {
  return useFamilyWrite(
    (input: { parentId: string | null; document: FamilyRecipeDocument }) =>
      apiRequest<FamilyRecipeEdit>('/recipes', {
        method: 'POST',
        body: { ...input.document, parentId: input.parentId, locale },
      }),
  );
}

export function useUpdateFamilyRecipe(id: string, locale: string) {
  return useFamilyWrite((document: FamilyRecipeDocument) =>
    apiRequest<FamilyRecipeEdit>(`/recipes/${id}`, {
      method: 'PUT',
      body: { ...document, locale },
    }),
  );
}

/** The UI's Delete: the Recipe is archived, never removed. */
export function useArchiveFamilyRecipe(id: string, locale: string) {
  return useFamilyWrite(
    () =>
      apiRequest<FamilyRecipeEdit>(
        `/recipes/${id}/archive?${localeQuery(locale)}`,
        { method: 'POST' },
      ),
    { refetchNow: false },
  );
}

/** Same shape as the Admin's `useTipWrites`, so the Tips editor serves both. */
export function useFamilyTipWrites(id: string, locale: string) {
  const path = `/recipes/${id}`;
  const query = `?${localeQuery(locale)}`;
  const add = useFamilyWrite((input: { text: string; stepId: string | null }) =>
    apiRequest<unknown>(`${path}/tips${query}`, {
      method: 'POST',
      body: input,
    }),
  );
  const update = useFamilyWrite(
    ({ tipId, text }: { tipId: string; text: string }) =>
      apiRequest<unknown>(`${path}/tips/${tipId}${query}`, {
        method: 'PATCH',
        body: { text },
      }),
  );
  const remove = useFamilyWrite((tipId: string) =>
    apiRequest<unknown>(`${path}/tips/${tipId}`, { method: 'DELETE' }),
  );
  const reorder = useFamilyWrite((ids: string[]) =>
    apiRequest<unknown>(`${path}/tips/order${query}`, {
      method: 'PUT',
      body: { ids },
    }),
  );
  const hide = useFamilyWrite((tipIds: string[]) =>
    apiRequest<unknown>(`${path}/hidden-tips${query}`, {
      method: 'PUT',
      body: { tipIds },
    }),
  );
  return { add, update, remove, reorder, hide };
}

/** Replace the guidance of the Family's own Recipe (its own save, apart from the document). */
export function useSetFamilyGuidance(id: string, locale: string) {
  return useFamilyWrite((input: GuidanceInput) =>
    apiRequest<FamilyRecipeEdit>(
      `/recipes/${id}/guidance?${localeQuery(locale)}`,
      { method: 'PUT', body: input },
    ),
  );
}
