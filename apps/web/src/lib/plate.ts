import { apiRequest } from './api';

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
