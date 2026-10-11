import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { SHOPPING_POLL_INTERVAL_MS } from './shopping';

type Aisle = { id: string; name: string; sortOrder: number };

/** An Ingredient the Family always wants in stock, with an optional preferred amount. */
export type Staple = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  aisle: Aisle | null;
};

/** A missing Staple, offered at the top of the Shopping List. */
export type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  aisle: Aisle | null;
};

/** One key per group; a Used Up group will join `staples`. */
export type Suggestions = { staples: Suggestion[] };

export const staplesQueryKey = ['staples'] as const;
/** Every locale's Suggestions; refetch after anything that changes the Pantry, the list or the Staples. */
export const suggestionsQueryKey = ['suggestions'] as const;

const query = (locale: string) => `?${new URLSearchParams({ locale })}`;

export function useStaples(locale: string) {
  return useQuery({
    queryKey: [...staplesQueryKey, locale],
    queryFn: () =>
      apiRequest<{ staples: Staple[] }>(`/staples${query(locale)}`).then(
        (body) => body.staples,
      ),
  });
}

/** Refreshed on an interval, like the list, so other Members' changes show up. */
export function useSuggestions(locale: string, today: string) {
  return useQuery({
    queryKey: [...suggestionsQueryKey, locale],
    queryFn: () =>
      apiRequest<Suggestions>(
        `/shopping-list/suggestions?${new URLSearchParams({ locale, today })}`,
      ),
    refetchInterval: SHOPPING_POLL_INTERVAL_MS,
    refetchOnWindowFocus: 'always',
  });
}

export type StapleDraft = {
  ingredientId: string;
  quantity?: number | null;
  unit?: Unit | null;
};

export function useStapleMutations(locale: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: staplesQueryKey }),
      queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
    ]);

  const add = useMutation({
    mutationFn: (draft: StapleDraft) =>
      apiRequest<Staple>(`/staples${query(locale)}`, {
        method: 'POST',
        body: draft,
      }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      quantity,
      unit,
    }: {
      id: string;
      quantity: number | null;
      unit: Unit | null;
    }) =>
      apiRequest<Staple>(`/staples/${id}${query(locale)}`, {
        method: 'PATCH',
        body: { quantity, unit },
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/staples/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });
  return { add, update, remove };
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
