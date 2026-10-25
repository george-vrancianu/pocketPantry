import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { FamilyRecipeEdit, FamilyRecipeDocument } from './familyRecipes';
import { parseQuantity } from './pantry';
import type { ReviewLine } from './review';
import { recipeChangeQueryKeys } from './queryKeys';
import { recipesQueryKey, type CompactAllergyWarning } from './recipes';

/** A Catalog Base Recipe that resembles the dish, best first. */
export type PlateMatch = {
  id: string;
  title: string;
  score: number;
  /** The Family's live copy of this Catalog Base, else null. */
  familyCopyId: string | null;
  allergyWarning: CompactAllergyWarning | null;
};

/** The matches, with how many "Hide Recipes with my Allergies" left out of the closest five. */
export type PlateMatches = {
  matches: PlateMatch[];
  hiddenByAllergiesCount: number;
};

/** The ids of the Ingredients the Plate Scan recognised, each once. */
export const matchedIngredientIds = (lines: ReviewLine[]): string[] => [
  ...new Set(lines.flatMap((line) => (line.match ? [line.match.id] : []))),
];

/** The closest Catalog Base Recipes to the picked dish, once the panel is open. */
export function usePlateMatches(
  input: {
    dishTitle: string;
    ingredientIds: string[];
    /** Also ask for the matches "Hide Recipes with my Allergies" would leave out. */
    showHidden?: true;
  },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'plate-matches', input],
    queryFn: () =>
      apiRequest<PlateMatches>('/recipes/plate-matches', {
        method: 'POST',
        body: input,
      }),
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
export function useSaveFromPlate() {
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
          title: input.title.trim(),
          parentId: input.parentId,
          lines: input.lines.map(toRecipeLine),
        },
      }),
    onSuccess: () =>
      Promise.all(
        recipeChangeQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}
