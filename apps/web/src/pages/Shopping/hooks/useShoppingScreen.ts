import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useShoppingList,
  useShoppingMutations,
  withoutItems,
  type NewShoppingItem,
} from '../../../lib/shopping';
import { localIso } from '../../../lib/pantry';
import { useSuggestions } from '../../../lib/suggestions';
import { useDeferredRemoval } from '../../../lib/useDeferredRemoval';

export function useShoppingScreen() {
  const { t, i18n } = useTranslation();
  const list = useShoppingList(i18n.language);
  const { add, setChecked, remove } = useShoppingMutations(i18n.language);
  const removal = useDeferredRemoval(remove.mutateAsync);
  // A removed item stays out of the list, refetches included, until its delete has settled.
  const visible = useMemo(
    () => withoutItems(list.data, removal.hiddenIds),
    [list.data, removal.hiddenIds],
  );
  // A failed Suggestions request just hides the section; the list still works.
  const suggestions = useSuggestions(i18n.language, localIso(new Date()));

  // A failed add is shown by the Add sheet, next to what was typed.
  const error = list.error ?? setChecked.error;

  return {
    list: visible,
    staples: suggestions.data?.staples ?? [],
    usedUp: suggestions.data?.usedUp ?? [],
    isLoading: list.isPending,
    error: error ? translateApiError(t, error) : null,
    adding: add.isPending,
    addError: add.error ? translateApiError(t, add.error) : null,
    /** Forget a failed add, e.g. when the sheet opens. */
    resetAddError: () => add.reset(),
    /** Resolves true when added; on false, `addError` says why. */
    add: (item: NewShoppingItem) =>
      add.mutateAsync(item).then(
        () => true,
        () => false,
      ),
    toggle: (id: string, checked: boolean) =>
      setChecked.mutate({ id, checked }),
    remove: removal.remove,
    retry: () => void list.refetch(),
  };
}
