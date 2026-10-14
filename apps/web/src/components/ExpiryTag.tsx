import { AlertIcon, Box, tokens, visuallyHidden } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ExpiryTagState } from '../lib/pantry';
import { radius } from '../lib/themeVars';

const TONES = {
  urgent: { bg: tokens.color.urgentBg, fg: tokens.color.urgentFg },
  soon: { bg: tokens.color.soonBg, fg: tokens.color.soonFg },
  ok: { bg: tokens.color.okBg, fg: tokens.color.okFg },
} as const;

type Props = {
  tag: ExpiryTagState;
  /** Hide the tag from assistive tech, where the text beside it already says the same. */
  decorative?: boolean;
};

/** The days-left tag (Expired / Today / Tomorrow / N d left / N d), or a dashed "No expiry". Never a date. */
export function ExpiryTag({ tag, decorative = false }: Props) {
  const { t } = useTranslation('pantry');

  let label: string;
  // The abbreviation is for the eye; a screen reader gets the whole, pluralised words.
  let spoken: string | null = null;
  switch (tag.kind) {
    case 'none':
    case 'expired':
    case 'today':
    case 'tomorrow':
      label = t(`expiry.${tag.kind}`);
      break;
    case 'daysLeft':
      label = t('expiry.daysLeft', { count: tag.days });
      spoken = t('expiry.daysLeftLong', { count: tag.days });
      break;
    case 'days':
      label = t('expiry.days', { count: tag.days });
      spoken = t('expiry.daysLong', { count: tag.days });
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
      aria-hidden={decorative ? true : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 12,
        fontWeight: 700,
        px: '10px',
        py: '4px',
        borderRadius: radius.pill,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...colours,
      }}
    >
      {tag.kind === 'expired' ? (
        <AlertIcon size={12} strokeWidth={2.2} />
      ) : null}
      {spoken === null ? (
        label
      ) : (
        <>
          <span aria-hidden="true">{label}</span>
          <Box component="span" sx={visuallyHidden}>
            {spoken}
          </Box>
        </>
      )}
    </Box>
  );
}
