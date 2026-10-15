import { useToast } from '@pocket-pantry/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../i18n/translateApiError';
import { apiRequest } from './api';
import {
  flipOnList,
  mealWindowQueryKey,
  type AddedMissing,
  type AddMissingScope,
  type MealWindow,
} from './mealPlan';
import type { IsoDate } from './pantry';
import { shoppingListQueryKey, useShoppingMutations } from './shopping';
import { mealPlanQueryKey, shoppingListChangeQueryKeys } from './queryKeys';
import { useHealthToast } from './useHealthToast';

/**
 * Add missing from the Meal plan Widget: one call with only the scope, the "On list" flip straight away
 * (put back if the add fails), a toast "{n} added to the Shopping List" whose Undo deletes exactly the
 * Shopping Items the add created, and a refetch of the Shopping List and the Widget.
 */
export function useAddMissing(locale: string, today: IsoDate) {
  const { t } = useTranslation('dashboard');
  const { undoOptions } = useHealthToast();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { remove } = useShoppingMutations(locale);
  const windowKey = [...mealWindowQueryKey, locale, today];

  const refetch = () =>
    Promise.all(
      [
        shoppingListQueryKey,
        mealPlanQueryKey,
        ...shoppingListChangeQueryKeys,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );

  const undo = async (createdIds: string[]) => {
    try {
      // One at a time: each delete answers with the whole list, and parallel answers could cache a stale one.
      for (const id of new Set(createdIds)) await remove.mutateAsync(id);
    } catch (error) {
      toast.show(translateApiError(t, error));
    } finally {
      await refetch();
    }
  };

  const mutation = useMutation({
    mutationFn: (scope: AddMissingScope) =>
      apiRequest<AddedMissing>(
        `/meal-plans/add-missing?${new URLSearchParams({ locale, today })}`,
        { method: 'POST', body: scope },
      ),
    onMutate: async (scope) => {
      await queryClient.cancelQueries({ queryKey: mealWindowQueryKey });
      const previous = queryClient.getQueryData<MealWindow>(windowKey);
      if (previous) {
        queryClient.setQueryData(windowKey, flipOnList(previous, scope));
      }
      return { previous };
    },
    onError: (error, _scope, context) => {
      if (context?.previous) {
        queryClient.setQueryData(windowKey, context.previous);
      }
      toast.show(translateApiError(t, error));
    },
    onSuccess: ({ createdIds, count }) => {
      if (count === 0) return;
      toast.show(
        t('mealPlan.toast.added', { count }),
        undoOptions(() => void undo(createdIds)),
      );
    },
    onSettled: refetch,
  });

  return {
    isPending: mutation.isPending,
    add: (scope: AddMissingScope) => mutation.mutate(scope),
  };
}
