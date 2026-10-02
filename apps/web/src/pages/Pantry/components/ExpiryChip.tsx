import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ExpiryChip as ExpiryChipValue } from '../../../lib/pantry';

const TONES = {
  urgent: { bg: tokens.color.urgentBg, fg: tokens.color.urgentFg },
  soon: { bg: tokens.color.soonBg, fg: tokens.color.soonFg },
  ok: { bg: tokens.color.okBg, fg: tokens.color.okFg },
} as const;

type Props = { chip: ExpiryChipValue };

/** Today / 1 to 3 days / later, coloured per the handoff's ExpiryChip. */
export function ExpiryChip({ chip }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const tone = TONES[chip.tone];

  let label: string;
  if (chip.kind === 'date') {
    label = new Intl.DateTimeFormat(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${chip.expiryDate}T00:00:00`));
  } else if (chip.kind === 'days') {
    label = t('expiry.days', { count: chip.days });
  } else if (chip.kind === 'today') label = t('expiry.today');
  else label = t('expiry.expired');

  return (
    <Box
      component="span"
      sx={{
        fontSize: 12,
        fontWeight: 700,
        px: '10px',
        py: '4px',
        borderRadius: `${tokens.radius.chip}px`,
        bgcolor: tone.bg,
        color: tone.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}
