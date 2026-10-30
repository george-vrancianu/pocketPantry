import { apiRequest } from './api';
import type { ReviewLine } from './review';
import { type NewShoppingItem, type AddedShoppingItems } from './shopping';

/** One guess at the dish in the photo. */
export type DishGuess = { title: string; confidence: number };
/** `token` proves to step two that these guesses came from this Member's Scan; send it back with the pick. */
export type PlateDishes = { dishes: DishGuess[]; token: string };

/**
 * Plate Scan step two: the server writes the picked dish as a whole Recipe and keeps it as the
 * Member's Recipe Draft (ADR 0035), the way a link read does. Aborting `signal` abandons the request.
 */
export function writePlateRecipe({
  dishTitle,
  plateToken,
  signal,
}: {
  dishTitle: string;
  plateToken: string;
  signal?: AbortSignal;
}) {
  return apiRequest<{ recipeDraftId: string }>('/scan/plate/recipe', {
    method: 'POST',
    body: { dishTitle, plateToken },
    ...(signal ? { signal } : {}),
  });
}

/** Adds reviewed Plate lines to the Shopping List, all or none; the server merges. */
export const postShoppingItems = (items: NewShoppingItem[]) =>
  apiRequest<AddedShoppingItems>('/shopping-list/items/bulk', {
    method: 'POST',
    body: { items },
  });

/** A reviewed line as a Shopping Item: by Ingredient id when matched, else by name. A blank quantity sends neither quantity nor unit. */
export function toNewShoppingItem(line: ReviewLine): NewShoppingItem {
  const quantity = line.quantity.trim() === '' ? null : Number(line.quantity);
  return {
    ...(line.match
      ? { ingredientId: line.match.id }
      : { name: line.name.trim(), source: 'plate' as const }),
    ...(quantity === null ? {} : { quantity, unit: line.unit }),
  };
}
