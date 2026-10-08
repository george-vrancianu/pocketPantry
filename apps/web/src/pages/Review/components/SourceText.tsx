import { Typography, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ScanMode } from '../../../lib/scan';

type Props = {
  /** What the Scan read for the line; renders nothing when null. */
  text: string | null;
  mode: ScanMode;
};

/** The text the Scan actually read, one muted line that ellipsises, so a wrong Match is easy to spot. */
export function SourceText({ text, mode }: Props) {
  const { t } = useTranslation('review');
  if (text === null) return null;
  return (
    <Typography
      noWrap
      title={text}
      sx={{ fontSize: 12, color: tokens.color.muted }}
    >
      {t(mode === 'receipt' ? 'row.receiptPrefix' : 'row.readPrefix', { text })}
    </Typography>
  );
}
