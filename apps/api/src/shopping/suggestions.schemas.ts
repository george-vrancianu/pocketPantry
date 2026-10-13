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
};

/** One key per group: missing Staples first, then Used Up Ingredients (no quantity). */
export type SuggestionsView = {
  staples: SuggestionView[];
  usedUp: SuggestionView[];
};
