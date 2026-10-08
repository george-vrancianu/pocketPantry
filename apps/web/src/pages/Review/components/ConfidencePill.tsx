import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RowStatus } from '../../../lib/review';

const TONE: Record<RowStatus, { bgcolor: string; color: string }> = {
  low: { bgcolor: tokens.color.urgentBg, color: tokens.color.urgentFg },
  qty: { bgcolor: tokens.color.soonBg, color: tokens.color.soonFg },
  ok: { bgcolor: tokens.color.accentTint, color: tokens.color.accent },
};

/** The tablet's Încredere column: the status as words, beside the status icon, so colour is never the only signal. */
export function ConfidencePill({ status }: { status: RowStatus }) {
  const { t } = useTranslation('review');
  return (
    <Box
      component="span"
      sx={{
        justifySelf: 'start',
        px: '10px',
        py: '3px',
        borderRadius: `${tokens.radius.chip}px`,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        ...TONE[status],
      }}
    >
      {t(`confidence.${status}`)}
    </Box>
  );
}
