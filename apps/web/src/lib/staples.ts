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

export function useStaples() {
  return useQuery({
    queryKey: staplesQueryKey,
    queryFn: () =>
      apiRequest<{ staples: Staple[] }>('/staples').then(
        (body) => body.staples,
      ),
  });
}

export type StapleDraft = {
  ingredientId: string;
  quantity?: number | null;
  unit?: Unit | null;
};

/** An add's request, plus the Ingredient's name for the Staple shown while it is in flight. */
export type NewStaple = StapleDraft & { name?: string };

/** The Staple shown while an add is in flight; the refresh replaces it with the saved one. */
const placeholderId = (ingredientId: string) => `pending:${ingredientId}`;

/** Whether a Staple is the placeholder of an add in flight: it has no server id to edit or remove by. */
export const isPendingStaple = (staple: Pick<Staple, 'id'>) =>
  staple.id.startsWith('pending:');

/**
 * Add, edit and remove Staples. Add and remove show in the cache at once and are taken back if
 * the server refuses; add and remove refresh the Staples and the suggestions once they settle.
 */
export function useStapleMutations() {
  const queryClient = useQueryClient();
  const key = staplesQueryKey;
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: staplesQueryKey }),
      queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
    ]);

  const patchCachedStaples = (change: (staples: Staple[]) => Staple[]) => {
    const current = queryClient.getQueryData<Staple[]>(key);
    if (current) queryClient.setQueryData<Staple[]>(key, change(current));
  };

  const add = useMutation({
    mutationFn: ({ ingredientId, quantity, unit }: NewStaple) =>
      apiRequest<Staple>('/staples', {
        method: 'POST',
        body: { ingredientId, quantity, unit } satisfies StapleDraft,
      }),
    onMutate: async ({ ingredientId, name, quantity, unit }) => {
      await queryClient.cancelQueries({ queryKey: staplesQueryKey });
      patchCachedStaples((staples) =>
        staples.some((s) => s.ingredientId === ingredientId)
          ? staples
          : [
              ...staples,
              {
                id: placeholderId(ingredientId),
                ingredientId,
                name: name ?? '',
                quantity: quantity ?? null,
                unit: unit ?? null,
                aisle: null,
              },
            ],
      );
    },
    // Only this add's placeholder goes: changes made meanwhile stay.
    onError: (_error, { ingredientId }) =>
      patchCachedStaples((staples) =>
        staples.filter((s) => s.id !== placeholderId(ingredientId)),
      ),
    onSettled: refresh,
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
      apiRequest<Staple>(`/staples/${id}`, {
        method: 'PATCH',
        body: { quantity, unit },
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/staples/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: staplesQueryKey });
      const staples = queryClient.getQueryData<Staple[]>(key) ?? [];
      const index = staples.findIndex((s) => s.id === id);
      patchCachedStaples((current) => current.filter((s) => s.id !== id));
      return index === -1 ? undefined : { staple: staples[index], index };
    },
    // Put it back where it was, unless it is back already.
    onError: (_error, _id, removed) => {
      if (!removed) return;
      patchCachedStaples((staples) =>
        staples.some((s) => s.id === removed.staple.id)
          ? staples
          : [
              ...staples.slice(0, removed.index),
              removed.staple,
              ...staples.slice(removed.index),
            ],
      );
    },
    onSettled: refresh,
  });
  return { add, update, remove };
}
