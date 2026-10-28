import type { TextFieldPaste } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The strings a `TextField`'s Paste button shows (`common:paste.*`). */
export function usePasteLabels(): TextFieldPaste {
  const { t } = useTranslation('common');
  return { label: t('paste.label'), emptyMessage: t('paste.empty') };
}
