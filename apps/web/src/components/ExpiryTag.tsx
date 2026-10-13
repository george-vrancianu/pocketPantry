import { AlertIcon, Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ExpiryTag as ExpiryTagValue } from '../lib/pantry';

const TONES = {
  urgent: { bg: tokens.color.urgentBg, fg: tokens.color.urgentFg },
  soon: { bg: tokens.color.soonBg, fg: tokens.color.soonFg },
  ok: { bg: tokens.color.okBg, fg: tokens.color.okFg },
} as const;

type Props = { tag: ExpiryTagValue };

/** The days-left tag (Expired / Today / Tomorrow / N d left / N d), or a dashed "No expiry". Never a date. */
export function ExpiryTag({ tag }: Props) {
  const { t } = useTranslation('pantry');

  let label: string;
  switch (tag.kind) {
    case 'none':
    case 'expired':
    case 'today':
    case 'tomorrow':
      label = t(`expiry.${tag.kind}`);
      break;
    case 'daysLeft':
      label = t('expiry.daysLeft', { count: tag.days });
      break;
    case 'days':
      label = t('expiry.days', { count: tag.days });
  }

  const colours =
    tag.tone === 'none'
      ? {
          bgcolor: 'transparent',
          color: tokens.color.muted,
          // Dashed, so a missing date reads as deliberate rather than broken.
          outline: `1px dashed ${tokens.color.muted}`,
          outlineOffset: '-1px',
        }
      : { bgcolor: TONES[tag.tone].bg, color: TONES[tag.tone].fg };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 12,
        fontWeight: 700,
        px: '10px',
        py: '4px',
        borderRadius: `${tokens.radius.chip}px`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...colours,
      }}
    >
      {tag.kind === 'expired' ? (
        <AlertIcon size={12} strokeWidth={2.2} />
      ) : null}
      {label}
    </Box>
  );
}
