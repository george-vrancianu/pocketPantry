import { Box, ProgressBar, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

export type SummaryCardProps = { remaining: number; checked: number };

/** Items left to buy and how far the basket is, as in the handoff. */
export function SummaryCard({ remaining, checked }: SummaryCardProps) {
  const { t } = useTranslation('shopping');
  const total = remaining + checked;
  return (
    <Box
      sx={{
        p: '14px 16px',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '20px',
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
        {t('summary.toBuy', { count: remaining })}
      </Typography>
      <Typography variant="meta" color="text.secondary" sx={{ mb: 1 }}>
        {t('summary.inBasket', { checked, total })}
      </Typography>
      <ProgressBar label={t('summary.progress')} value={checked} max={total} />
    </Box>
  );
}
