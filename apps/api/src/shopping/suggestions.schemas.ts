import { z } from 'zod';
import type { CatalogSearchResult } from '../catalog/catalog.schemas';
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
  /** The Ingredient as a search result, so a tap can select it without another request. */
  ingredient: CatalogSearchResult;
};

/** One key per group: missing Staples, Used Up Ingredients and expired Ingredients (the last two carry no quantity). */
export type SuggestionsView = {
  staples: SuggestionView[];
  usedUp: SuggestionView[];
  expired: SuggestionView[];
};
