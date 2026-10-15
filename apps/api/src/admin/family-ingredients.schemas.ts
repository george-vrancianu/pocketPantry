import { z } from 'zod';
import { unmatchedListQuery } from './unmatched-queue.schemas';

/** Keyset paging like the Unmatched queue: count descending, then name. */
export const familyIngredientsListQuery = unmatchedListQuery.omit({
  status: true,
});
export type FamilyIngredientsListQuery = z.infer<
  typeof familyIngredientsListQuery
>;

export const promoteBody = z.object({ ingredientId: z.uuid() });
export type PromoteBody = z.infer<typeof promoteBody>;

export const mergeBody = z.object({
  ingredientId: z.uuid(),
  targetIngredientId: z.uuid(),
});
export type MergeBody = z.infer<typeof mergeBody>;

export type MergedFamilyIngredients = {
  targetIngredientId: string;
  mergedIngredientIds: string[];
};

type Leaf = { id: string; name: string };

/** One Family's copy. No Family identity is exposed. */
export type FamilyIngredientCopy = {
  id: string;
  name: string;
  locale: string;
  defaultUnit: string;
  leafCategory: Leaf;
};

export type FamilyIngredientGroup = {
  normalizedName: string;
  /** As typed in the oldest copy. */
  name: string;
  /** The most common Leaf Category among copies; ties go to the oldest. */
  leafCategory: Leaf;
  familyCount: number;
  locale: string;
  /** Oldest first. */
  copies: FamilyIngredientCopy[];
};

export type FamilyIngredientsPage = {
  groups: FamilyIngredientGroup[];
  nextCursor: string | null;
};

export type PromotedIngredient = {
  ingredientId: string;
  name: string;
  mergedIngredientIds: string[];
};
