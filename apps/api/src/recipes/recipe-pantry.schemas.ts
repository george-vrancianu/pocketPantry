import { z } from 'zod';
import { shoppingLocaleQuery } from '../shopping/shopping.schemas';
import type { LineMatch } from './matching/pantry-match';

/** The most Servings a Member can ask a match or add-missing for. */
export const MAX_MATCH_SERVINGS = 100;

const servings = z.number().int().positive().max(MAX_MATCH_SERVINGS);

export const recipeIdParam = z.object({ id: z.uuid() });

/** `today` is the Member's local date; it defaults to the server's UTC date. */
export const pantryMatchQuery = z.object({
  today: z.iso.date().optional(),
  servings: z.coerce.number().pipe(servings).optional(),
});
export type PantryMatchQuery = z.infer<typeof pantryMatchQuery>;

export const addMissingQuery = shoppingLocaleQuery;

export const addMissingBody = z.object({
  today: z.iso.date().optional(),
  servings: servings.optional(),
});
export type AddMissingBody = z.infer<typeof addMissingBody>;

export const addLineBody = addMissingBody.extend({ lineId: z.uuid() });
export type AddLineBody = z.infer<typeof addLineBody>;

export type PantryLineView = LineMatch & {
  /** An unchecked Shopping Item for the same Ingredient (or Unmatched name) is on the Family's list. It never changes `status`. */
  onShoppingList: boolean;
};

export type PantryMatchView = {
  /** The Servings the quantities are scaled to. */
  servings: number;
  canMake: boolean;
  shortOrMissingCount: number;
  expiringCoveredCount: number;
  coverageRatio: number;
  lines: PantryLineView[];
};
