import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { ReviewLine } from './review';
import type { ScanResponse } from './scan';
import type { NewShoppingItem, ShoppingList } from './shopping';

/** One guess at the dish in the photo. */
export type DishGuess = { title: string; confidence: number };
/** `token` proves to step two that these guesses came from this Member's Scan; send it back with the pick. */
export type PlateDishes = { dishes: DishGuess[]; token: string };

/** Plate Scan step one: the photo goes up as a data URL and is never stored. */
export function usePlateDishes(locale: string) {
  return useMutation({
    mutationFn: (plateImage: string) =>
      apiRequest<PlateDishes>(
        `/scan/plate?${new URLSearchParams({ locale })}`,
        {
          method: 'POST',
          body: { plateImage },
        },
      ),
  });
}

/** Plate Scan step two: the picked dish becomes proposed lines for one serving. */
export function usePlateIngredients(locale: string) {
  return useMutation({
    mutationFn: (pick: { dishTitle: string; plateToken: string }) =>
      apiRequest<ScanResponse>(
        `/scan/plate/ingredients?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: pick },
      ),
  });
}

/** Adds reviewed Plate lines to the Shopping List, all or none; the server merges. */
export function useAddShoppingItems(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: NewShoppingItem[]) =>
      apiRequest<ShoppingList>(
        `/shopping-list/items/bulk?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: { items } },
      ),
    onSuccess: (list) =>
      queryClient.setQueryData(['shopping-list', locale], list),
  });
}

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
