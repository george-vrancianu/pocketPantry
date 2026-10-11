import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { suggestionsQueryKey } from './queryKeys';
import { SHOPPING_POLL_INTERVAL_MS } from './shopping';
import type { Aisle } from './staples';

/** A missing Staple or a Used Up Ingredient (no quantity), offered at the top of the Shopping List. */
export type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  aisle: Aisle | null;
};

/** One key per group: missing Staples first, then Ingredients recently used up. */
export type Suggestions = { staples: Suggestion[]; usedUp: Suggestion[] };

/** Refreshed on an interval, like the list, so other Members' changes show up. */
export function useSuggestions(locale: string, today: string) {
  return useQuery({
    queryKey: [...suggestionsQueryKey, locale, today],
    queryFn: () =>
      apiRequest<Suggestions>(
        `/shopping-list/suggestions?${new URLSearchParams({ locale, today })}`,
      ),
    refetchInterval: SHOPPING_POLL_INTERVAL_MS,
    refetchOnWindowFocus: 'always',
  });
}

/** Dismissing hides the Suggestion for the whole Family until the Ingredient is restocked. */
export function useDismissSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ingredientId: string) =>
      apiRequest<void>(`/shopping-list/suggestions/${ingredientId}/dismiss`, {
        method: 'POST',
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
  });
}

/** How many Suggestions the Dashboard Widget names. */
export const WIDGET_SUGGESTION_COUNT = 3;
