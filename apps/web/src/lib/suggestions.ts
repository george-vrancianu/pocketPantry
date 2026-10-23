import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult, Unit } from './catalog';
import { suggestionsQueryKey } from './queryKeys';
import { SHOPPING_POLL_INTERVAL_MS } from './shopping';
import type { Aisle } from './staples';

/** A missing Staple, a Used Up or an expired Ingredient (the last two without a quantity), offered for the Shopping List. */
export type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  aisle: Aisle | null;
  /** Since when it is gone: a `YYYY-MM-DD` expiry date, an ISO timestamp (Used Up), or null (a Staple). */
  since: string | null;
  /** The Ingredient as a search result, so a tile selects it without another request. */
  ingredient: CatalogSearchResult;
};

/** One key per group: missing Staples, Ingredients recently used up, Ingredients flagged running low, and Ingredients whose Batches have all expired. */
export type Suggestions = {
  staples: Suggestion[];
  usedUp: Suggestion[];
  runningLow: Suggestion[];
  expired: Suggestion[];
  /** The Ingredient ids with an active dismissal for the Family. */
  dismissed: string[];
};

export const noSuggestions: Suggestions = {
  staples: [],
  usedUp: [],
  runningLow: [],
  expired: [],
  dismissed: [],
};

export type GoneReason = 'expired' | 'usedUp' | 'staple';
export type GoneEntry = { suggestion: Suggestion; reason: GoneReason };

/**
 * Everything gone from the Pantry in tile order: expired, then Used Up (each
 * most recent first), then missing Staples by name. The API sends each group in
 * Aisle order, so the order is made here.
 */
export function goneInOrder(suggestions: Suggestions): GoneEntry[] {
  const recentFirst = (list: Suggestion[]) =>
    [...list].sort(
      (a, b) =>
        (b.since ?? '').localeCompare(a.since ?? '') ||
        a.name.localeCompare(b.name),
    );
  const entries = (list: Suggestion[], reason: GoneReason) =>
    list.map((suggestion) => ({ suggestion, reason }));
  return [
    ...entries(recentFirst(suggestions.expired), 'expired'),
    ...entries(recentFirst(suggestions.usedUp), 'usedUp'),
    ...entries(
      [...suggestions.staples].sort((a, b) => a.name.localeCompare(b.name)),
      'staple',
    ),
  ];
}

/** Refreshed on an interval, like the list, so other Members' changes show up. */
export function useSuggestions(today: string) {
  return useQuery({
    queryKey: [...suggestionsQueryKey, today],
    queryFn: () =>
      apiRequest<Suggestions>(
        `/shopping-list/suggestions?${new URLSearchParams({ today })}`,
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
