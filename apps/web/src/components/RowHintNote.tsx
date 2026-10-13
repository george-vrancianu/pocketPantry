import { RowHintPill } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RowHint } from '../lib/useRowHint';

/** The first-use gesture pill under a list's header; renders nothing until the hint shows. */
export function RowHintNote({ hint }: { hint: RowHint }) {
  const { t } = useTranslation('common');
  if (!hint.showPill) return null;
  return <RowHintPill open={hint.pillOpen}>{t('row.hint')}</RowHintPill>;
}
