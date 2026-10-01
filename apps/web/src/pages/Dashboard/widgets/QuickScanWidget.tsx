import {
  Box,
  IngredientsScanIcon,
  PlateScanIcon,
  ProductScanIcon,
  ReceiptScanIcon,
  tokens,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { WidgetCard } from './WidgetCard';
import type { WidgetProps } from './types';

const SCAN_MODES: Array<{ mode: string; icon: ReactNode }> = [
  { mode: 'product', icon: <ProductScanIcon /> },
  { mode: 'receipt', icon: <ReceiptScanIcon /> },
  { mode: 'plate', icon: <PlateScanIcon /> },
  { mode: 'ingredients', icon: <IngredientsScanIcon /> },
];

/** Four tiles, each deep-linking to one Scan Mode. */
export function QuickScanWidget({ size }: WidgetProps) {
  const { t } = useTranslation('dashboard');
  return (
    <WidgetCard label={t('widgets.quickScan.title')} size={size} padding="12px">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {SCAN_MODES.map(({ mode, icon }) => (
          <Box
            key={mode}
            component={Link}
            to={`/scan?mode=${mode}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              minHeight: 44,
              pt: '10px',
              pb: '8px',
              borderRadius: '16px',
              bgcolor: tokens.color.bg,
              color: tokens.color.ink,
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {icon}
            {t(`widgets.quickScan.modes.${mode}`)}
          </Box>
        ))}
      </Box>
    </WidgetCard>
  );
}
