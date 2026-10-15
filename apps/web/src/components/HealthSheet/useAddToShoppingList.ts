import { useToast } from '@pocket-pantry/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../i18n/translateApiError';
import { pantryHealth, type HealthTodoKey } from '../../lib/health';
import { UNDO_WINDOW_MS } from '../../lib/useDeferredRemoval';
import {
  shoppingListQueryKey,
  useShoppingMutations,
  type NewShoppingItem,
} from '../../lib/shopping';
import type { PantryHealthState } from '../../lib/usePantryHealth';

export type ShoppingFix = {
  isPending: boolean;
  /** Puts the Ingredients (by id) of a missingStaples or runningLow Health To-do on the Shopping List. */
  add: (key: HealthTodoKey, ingredientIds: string[]) => Promise<void>;
};

/**
 * The Add fixes of the Health To-dos: one bulk-add, then a toast with the count and the new score
 * whose Undo deletes exactly the Shopping Items the add returned.
 */
export function useAddToShoppingList(state: PantryHealthState): ShoppingFix {
  const { t, i18n } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { addMany, remove } = useShoppingMutations(i18n.language);

  const itemsFor = (
    key: HealthTodoKey,
    ingredientIds: string[],
  ): NewShoppingItem[] =>
    ingredientIds.map((ingredientId) => {
      // A Staple brings its preferred amount; Running low carries none.
      const staple =
        key === 'missingStaples'
          ? state.staples.find((s) => s.ingredientId === ingredientId)
          : undefined;
      return staple?.quantity != null && staple.unit !== null
        ? { ingredientId, quantity: staple.quantity, unit: staple.unit }
        : { ingredientId };
    });

  const undo = async (createdIds: string[]) => {
    try {
      // One at a time: each delete answers with the whole list, and parallel answers could cache a stale one.
      for (const id of new Set(createdIds)) await remove.mutateAsync(id);
    } catch (error) {
      toast.show(translateApiError(t, error));
    } finally {
      await queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    }
  };

  // mutateAsync, not mutate: per-call callbacks are dropped if the sheet closes before the answer.
  const add = async (key: HealthTodoKey, ingredientIds: string[]) => {
    let createdIds: string[];
    try {
      ({ createdIds } = await addMany.mutateAsync(
        itemsFor(key, ingredientIds),
      ));
    } catch (error) {
      toast.show(translateApiError(t, error));
      return;
    }
    const after = pantryHealth({
      ...state.input,
      onShoppingList: new Set([
        ...state.input.onShoppingList,
        ...ingredientIds,
      ]),
    });
    // The count is Ingredients added; two of them may have merged into one line.
    const message = t('health.toast.added', { count: ingredientIds.length });
    toast.show(
      after.scored
        ? t('health.toast.withScore', { message, score: after.total })
        : message,
      {
        duration: UNDO_WINDOW_MS,
        action: {
          label: tCommon('row.undo'),
          onClick: () => void undo(createdIds),
        },
      },
    );
  };

  return { isPending: addMany.isPending, add };
}
