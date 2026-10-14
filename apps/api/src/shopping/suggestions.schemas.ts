import { z } from 'zod';
import type { AisleView } from '../catalog/ingredient-placement';
import type { StapleUnit } from './staples.schemas';

export const ingredientIdParam = z.object({ ingredientId: z.uuid() });

export type SuggestionView = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: StapleUnit | null;
  aisle: AisleView | null;
  /**
   * Since when it is gone: the Used Up timestamp (ISO), the latest expiry date
   * (YYYY-MM-DD) of an expired Ingredient, or null for a missing Staple.
   */
  since: string | null;
};

/** One key per group: missing Staples, Used Up Ingredients and expired Ingredients (the last two carry no quantity). */
export type SuggestionsView = {
  staples: SuggestionView[];
  usedUp: SuggestionView[];
  expired: SuggestionView[];
};
