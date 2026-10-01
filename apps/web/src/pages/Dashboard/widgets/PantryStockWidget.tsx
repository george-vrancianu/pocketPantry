import { Box, PantryIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { stockByLocation } from '../../../lib/dashboard';
import { useBatches } from '../../../lib/pantry';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

const LOCATION_COLORS = {
  fridge: tokens.color.accent,
  freezer: tokens.color.accentMid,
  cupboard: '#CBD5C6',
  spices: tokens.color.butter,
} as const;

/** Total Batches and a stacked bar of how they split across Locations. */
export function PantryStockWidget({ size }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const batches = useBatches(i18n.language, new Date());
  const stock = stockByLocation(batches.data ?? []).filter(
    (entry) => entry.count > 0,
  );
  const total = batches.data?.length ?? 0;

  return (
    <WidgetCard
      label={t('widgets.pantryStock.title')}
      size={size}
      to="/pantry"
      isLoading={batches.isPending}
      error={batches.error ? translateApiError(t, batches.error) : null}
    >
      <WidgetTitle icon={<PantryIcon size={16} />}>
        {t('widgets.pantryStock.title')}
      </WidgetTitle>
      <Box
        component="p"
        sx={{
          m: 0,
          mt: '8px',
          fontFamily: tokens.font.display,
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {total}
      </Box>
      <Box
        component="p"
        sx={{ m: 0, mt: '2px', fontSize: 13, fontWeight: 600 }}
      >
        {t('widgets.pantryStock.itemsInStock', { count: total })}
      </Box>
      <Box
        role="img"
        aria-label={stock
          .map(
            ({ location, count }) =>
              `${t(`widgets.pantryStock.locations.${location}`)} ${count}`,
          )
          .join(', ')}
        sx={{
          display: 'flex',
          gap: '3px',
          height: 8,
          mt: 'auto',
          pt: 0,
        }}
      >
        {stock.map(({ location, count }) => (
          <Box
            key={location}
            component="span"
            sx={{
              flexGrow: count,
              bgcolor: LOCATION_COLORS[location],
              borderRadius: '4px',
            }}
          />
        ))}
      </Box>
      <Box
        component="p"
        sx={{ m: 0, mt: '6px', fontSize: 11, color: tokens.color.muted }}
      >
        {stock
          .map(
            ({ location, count }) =>
              `${t(`widgets.pantryStock.locations.${location}`)} ${count}`,
          )
          .join(' · ')}
      </Box>
    </WidgetCard>
  );
}
