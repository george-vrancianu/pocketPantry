import type { SwipeRowLabels } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RowList } from './useRowHint';

/**
 * The strings a `SwipeRow` shows, for the item called `name` in `list` (the confirmation says it removes it from there; the keys are `common:row.context.*`). The Family catalog rows build their own labels (their context is the item's usage), so `familyCatalog` is not accepted. A row you can also hold to edit
 * (`{ hold: true }`) is described as such to assistive technology.
 */
export function useSwipeRowLabels(
  name: string,
  list: Exclude<RowList, 'familyCatalog'>,
  { hold = false }: { hold?: boolean } = {},
): SwipeRowLabels {
  const { t } = useTranslation('common');
  return {
    question: t('row.removeQuestion', { name }),
    context: t(`row.context.${list}`),
    keep: t('row.keep'),
    remove: t('row.remove'),
    releaseToDelete: t('row.releaseToDelete'),
    pressed: t('row.ticked'),
    hint: hold ? t('row.a11yHint') : undefined,
    editAction: hold ? t('row.actions.edit', { name }) : undefined,
    removeAction: t('row.actions.remove', { name }),
  };
}
