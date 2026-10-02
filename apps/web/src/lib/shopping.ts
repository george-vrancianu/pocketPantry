import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  checked: boolean;
  /** The typed name never matched a Catalog Ingredient. */
  unmatched: boolean;
};

export type ShoppingGroup = {
  /** Null for the trailing group of Unmatched Shopping Items. */
  aisle: { id: string; name: string; sortOrder: number } | null;
  items: ShoppingItem[];
};

export type ShoppingList = {
  id: string;
  groups: ShoppingGroup[];
  summary: { remaining: number; checked: number };
};

export type NewShoppingItem = {
  ingredientId?: string;
  name?: string;
  quantity?: number;
  unit?: Unit;
};

/** How often the list refetches, so other Members' changes show up without a reload. */
export const SHOPPING_POLL_INTERVAL_MS = 10_000;

const listKey = (locale: string) => ['shopping-list', locale] as const;
const path = (locale: string, suffix = '') =>
  `/shopping-list${suffix}?${new URLSearchParams({ locale })}`;

/** The Family's Shopping List, refreshed on an interval and whenever the window regains focus. */
export function useShoppingList(locale: string) {
  return useQuery({
    queryKey: listKey(locale),
    queryFn: () => apiRequest<ShoppingList>(path(locale)),
    refetchInterval: SHOPPING_POLL_INTERVAL_MS,
    refetchOnWindowFocus: 'always',
  });
}

/** Mutations answer with the whole updated list, which replaces the cached one. */
export function useShoppingMutations(locale: string) {
  const queryClient = useQueryClient();
  const onSuccess = (list: ShoppingList) =>
    queryClient.setQueryData(listKey(locale), list);

  const add = useMutation({
    mutationFn: (item: NewShoppingItem) =>
      apiRequest<ShoppingList>(path(locale, '/items'), {
        method: 'POST',
        body: item,
      }),
    onSuccess,
  });
  const setChecked = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      apiRequest<ShoppingList>(path(locale, `/items/${id}`), {
        method: 'PATCH',
        body: { checked },
      }),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest<ShoppingList>(path(locale, `/items/${id}`), {
        method: 'DELETE',
      }),
    onSuccess,
  });
  return { add, setChecked, remove };
}
