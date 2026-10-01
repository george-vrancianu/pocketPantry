import { Box, ClockIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { soonestExpiring } from '../../../lib/dashboard';
import { expiryChipFor, useBatches } from '../../../lib/pantry';
import { ExpiryChip } from '../../Pantry/components/ExpiryChip';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/** The three soonest-expiring Batches with their ExpiryChips. */
export function UseSoonWidget({ size }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const batches = useBatches(i18n.language);
  const today = new Date();
  const soonest = soonestExpiring(batches.data ?? [], today);

  return (
    <WidgetCard
      label={t('widgets.useSoon.title')}
      size={size}
      isLoading={batches.isPending}
      error={batches.error ? translateApiError(t, batches.error) : null}
      padding="14px 16px 8px"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '4px',
        }}
      >
        <WidgetTitle icon={<ClockIcon size={16} />}>
          {t('widgets.useSoon.title')}
        </WidgetTitle>
        <Box
          component={Link}
          to="/pantry"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: tokens.color.accent,
            textDecoration: 'none',
          }}
        >
          {t('widgets.useSoon.seeAll')}
        </Box>
      </Box>
      {soonest.length === 0 ? (
        <Box sx={{ fontSize: 14, color: tokens.color.muted, py: '10px' }}>
          {t('widgets.useSoon.empty')}
        </Box>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {soonest.map((batch) => {
            const chip = expiryChipFor(batch.expiryDate, today);
            return (
              <Box
                component="li"
                key={batch.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  height: 36,
                  borderTop: `1px solid ${tokens.color.divider}`,
                  '&:first-of-type': { borderTop: 0 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: 15,
                    fontWeight: 500,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {batch.name}
                </Box>
                {chip && batch.expiryDate ? (
                  <ExpiryChip chip={chip} expiryDate={batch.expiryDate} />
                ) : null}
              </Box>
            );
          })}
        </Box>
      )}
    </WidgetCard>
  );
}
