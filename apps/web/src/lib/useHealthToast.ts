import type { ToastOptions } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { pantryHealth, type HealthInput } from './health';
import { UNDO_WINDOW_MS } from './useDeferredRemoval';

/**
 * What every Health fix toast shares (spec 323): the message with the score the fix leads to, and an
 * Undo toast of the standard window in the polite live region.
 */
export function useHealthToast() {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');

  /** `message` (already translated) with the score of `after`, or alone while the Pantry is not scored. */
  const messageWithScore = (after: HealthInput, message: string) => {
    const health = pantryHealth(after);
    return health.scored
      ? t('health.toast.withScore', { message, score: health.total })
      : message;
  };

  const undoOptions = (onUndo: () => void): ToastOptions => ({
    duration: UNDO_WINDOW_MS,
    polite: true,
    action: { label: tCommon('row.undo'), onClick: onUndo },
  });

  return { messageWithScore, undoOptions };
}
