import { Alert, Box, Typography, tokens, radius } from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recipeReads } from '../../../lib/recipeReads';
import {
  dispatchScanSession,
  type SessionScan,
} from '../../../lib/scanSession';

const buttonSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  minHeight: 44,
  px: 1.5,
  borderRadius: radius.control,
  border: `1px solid ${tokens.color.line}`,
  backgroundColor: tokens.color.surface,
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.accentMid}`,
    outlineOffset: 2,
  },
} as const;

export const cardId = (id: string) => `review-card-${id}`;

/**
 * A read Plate Scan's dish guesses, most likely first, and nothing else to review (ADR 0035).
 * Picking one leaves the Scan Session: the dish is handed to the recipe-reads holder, which has the
 * server write it as a Recipe Draft while the Member keeps scanning. A full holder keeps the card.
 */
export function PlateChoice({ scan }: { scan: SessionScan }) {
  const { t } = useTranslation('review');
  const headingId = useId();
  const [full, setFull] = useState(false);

  const pick = (title: string) => {
    const outcome = recipeReads.add({
      kind: 'plate',
      title,
      token: scan.plateToken ?? '',
    });
    if (outcome === 'full') {
      setFull(true);
      return;
    }
    dispatchScanSession({ type: 'remove', id: scan.id });
  };

  return (
    <Box sx={{ mt: 0.5 }}>
      <Typography id={headingId} sx={{ fontWeight: 700 }}>
        {t('overview.pickDish')}
      </Typography>
      <Box
        role="group"
        aria-labelledby={headingId}
        sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {(scan.dishes ?? []).map((dish) => {
          const percent = Math.round(dish.confidence * 100);
          return (
            <Box
              key={dish.title}
              component="button"
              type="button"
              aria-label={t('overview.dishOption', {
                title: dish.title,
                percent,
              })}
              onClick={() => pick(dish.title)}
              sx={buttonSx}
            >
              <span>{dish.title}</span>
              <span aria-hidden="true">{percent}%</span>
            </Box>
          );
        })}
      </Box>
      {full ? (
        <Box sx={{ mt: 1 }}>
          <Alert>{t('overview.readsFull')}</Alert>
        </Box>
      ) : null}
    </Box>
  );
}
