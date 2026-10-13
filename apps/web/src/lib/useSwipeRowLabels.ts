import type { SwipeRowLabels } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** What the removal confirmation says it removes the item from; the keys are `common:row.context.*`. */
export type RowContext = 'list' | 'pantry';

/**
 * The strings a `SwipeRow` shows, for the item called `name`. A row you can also hold to edit
 * (`{ hold: true }`) is described as such to assistive technology.
 */
export function useSwipeRowLabels(
  name: string,
  context: RowContext,
  { hold = false }: { hold?: boolean } = {},
): SwipeRowLabels {
  const { t } = useTranslation('common');
  return {
    question: t('row.removeQuestion', { name }),
    context: t(`row.context.${context}`),
    keep: t('row.keep'),
    remove: t('row.remove'),
    releaseToDelete: t('row.releaseToDelete'),
    pressed: t('row.ticked'),
    hint: hold ? t('row.hint') : undefined,
  };
}
