import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { suggestionsQueryKey } from './queryKeys';

export type Aisle = { id: string; name: string; sortOrder: number };

/** An Ingredient the Family always wants in stock, with an optional preferred amount. */
export type Staple = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  aisle: Aisle | null;
};

export const staplesQueryKey = ['staples'] as const;

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
