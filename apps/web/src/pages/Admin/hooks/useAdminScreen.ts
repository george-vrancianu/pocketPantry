import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  localName,
  useAdminCatalog,
  type AdminLeafCategory,
  type AdminParentCategory,
  type CategoryKind,
} from '../../../lib/admin';

export type AdminTab = 'ingredients' | 'categories' | 'unmatched';
export type Editing =
  | { type: 'ingredient'; id: string | null }
  | { type: 'category'; kind: CategoryKind; id: string | null };

/** State of the Admin screen: loaded Catalog, tab, Ingredient filter, and which editor is open. */
export function useAdminScreen() {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const query = useAdminCatalog();
  const [tab, setTab] = useState<AdminTab>('ingredients');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const catalog = query.data;

  const ingredients = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return (catalog?.ingredients ?? []).filter(
      (item) =>
        needle === '' ||
        localName(item, i18n.language).toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle),
    );
  }, [catalog, filter, i18n.language]);

  const editedIngredient =
    editing?.type === 'ingredient'
      ? catalog?.ingredients.find((item) => item.id === editing.id)
      : undefined;
  let editedCategory: AdminParentCategory | AdminLeafCategory | undefined;
  if (editing?.type === 'category' && catalog) {
    const list: Array<AdminParentCategory | AdminLeafCategory> =
      editing.kind === 'parent'
        ? catalog.parentCategories
        : catalog.leafCategories;
    editedCategory = list.find((item) => item.id === editing.id);
  }

  return {
    catalog,
    isLoading: query.isPending,
    error: query.error ? translateApiError(t, query.error) : null,
    tab,
    setTab,
    filter,
    setFilter,
    ingredients,
    editing,
    editedIngredient,
    editedCategory,
    edit: setEditing,
    close: () => setEditing(null),
  };
}
