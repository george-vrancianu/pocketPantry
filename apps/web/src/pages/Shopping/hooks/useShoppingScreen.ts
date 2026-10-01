import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useShoppingList,
  useShoppingMutations,
  type NewShoppingItem,
} from '../../../lib/shopping';

export function useShoppingScreen() {
  const { t, i18n } = useTranslation();
  const list = useShoppingList(i18n.language);
  const { add, setChecked, remove } = useShoppingMutations(i18n.language);

  const error = list.error ?? add.error ?? setChecked.error ?? remove.error;

  return {
    list: list.data,
    isLoading: list.isPending,
    error: error ? translateApiError(t, error) : null,
    adding: add.isPending,
    /** Resolves true when added; the error itself is shown by the page. */
    add: (item: NewShoppingItem) =>
      add.mutateAsync(item).then(
        () => true,
        () => false,
      ),
    toggle: (id: string, checked: boolean) =>
      setChecked.mutate({ id, checked }),
    remove: (id: string) => remove.mutate(id),
    retry: () => void list.refetch(),
  };
}
