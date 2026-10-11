import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { FamilyRecipeEdit, FamilyRecipeDocument } from './familyRecipes';
import { parseQuantity } from './pantry';
import type { ReviewLine } from './review';
import { recipesQueryKey } from './recipes';

/** A Catalog Base Recipe that resembles the dish, best first. */
export type PlateSuggestion = { id: string; title: string; score: number };

/** The ids of the Ingredients the Plate Scan recognised, each once. */
export const matchedIngredientIds = (lines: ReviewLine[]): string[] => [
  ...new Set(lines.flatMap((line) => (line.match ? [line.match.id] : []))),
];

/** The closest Catalog Base Recipes to the picked dish, once the panel is open. */
export function usePlateSuggestions(
  input: { locale: string; dishTitle: string; ingredientIds: string[] },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'plate-suggestions', input],
    queryFn: () =>
      apiRequest<{ suggestions: PlateSuggestion[] }>(
        '/recipes/plate-suggestions',
        { method: 'POST', body: input },
      ).then((body) => body.suggestions),
    enabled,
    staleTime: Infinity,
  });
}

type Line = FamilyRecipeDocument['lines'][number];

/** A reviewed line as a Recipe line: by Ingredient id when Matched, else by name. A blank quantity sends no unit. */
export function toRecipeLine(line: ReviewLine): Line {
  // The Review has already refused invalid text; an invalid one never becomes a number here.
  const parsed = parseQuantity(line.quantity);
  const value = parsed.valid ? parsed.value : null;
  return {
    ingredientId: line.match?.id ?? null,
    rawName: line.match ? null : line.name.trim(),
    quantity: value,
    unit: value === null ? null : line.unit,
    optional: false,
    note: null,
  };
}

/** Saves the dish as a Family Recipe: a Variant of `parentId`, or standalone when it is null. */
export function useSaveFromPlate(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      parentId: string | null;
      lines: ReviewLine[];
    }) =>
      apiRequest<FamilyRecipeEdit>('/recipes/from-plate', {
        method: 'POST',
        body: {
          locale,
          title: input.title.trim(),
          parentId: input.parentId,
          lines: input.lines.map(toRecipeLine),
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recipesQueryKey }),
  });
}
