import {
  Box,
  CloseIcon,
  displayType,
  IconButton,
  Sheet,
  tokens,
} from '@pocket-pantry/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FACTORS,
  MIN_BATCHES_FOR_SCORE,
  type PantryHealth,
} from '../../lib/health';
import { ScoreRing } from './HealthRing';

type Props = {
  open: boolean;
  onClose: () => void;
  health: PantryHealth;
  batchCount: number;
};

/** The Pantry health sheet. Its header carries the score; the Health To-dos come below. */
export function HealthSheet({ open, onClose, health, batchCount }: Props) {
  const { t } = useTranslation('dashboard');
  const closeButton = useRef<HTMLButtonElement>(null);
  const missing = MIN_BATCHES_FOR_SCORE - batchCount;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      onEntered={() => closeButton.current?.focus()}
      label={t('health.title')}
      header={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            p: '6px 18px 12px',
            borderBottom: `1px solid ${tokens.color.divider}`,
          }}
        >
          <ScoreRing health={health} batchCount={batchCount} size={52} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {health.scored ? (
              <>
                <Box sx={{ ...displayType, fontSize: 17 }}>
                  {t(`health.verdict.${health.verdict}`)}
                </Box>
                <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>
                  {FACTORS.map((factor) =>
                    t('health.factorValue', {
                      name: t(`health.factor.${factor}`),
                      value: health.factors[factor],
                    }),
                  ).join(' · ')}
                </Box>
              </>
            ) : (
              <Box sx={{ ...displayType, fontSize: 15 }}>
                {t('health.progress', { count: missing })}
              </Box>
            )}
          </Box>
          <IconButton
            ref={closeButton}
            label={t('health.close')}
            tone="neutral"
            size={34}
            onClick={onClose}
          >
            <CloseIcon size={16} />
          </IconButton>
        </Box>
      }
    >
      {null}
    </Sheet>
  );
}
