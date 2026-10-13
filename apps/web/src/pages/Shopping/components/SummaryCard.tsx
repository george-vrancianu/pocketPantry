import {
  Box,
  Button,
  PantryIcon,
  ProgressBar,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

export type SummaryCardProps = {
  remaining: number;
  checked: number;
  /** Opens the Finish Shopping Review. */
  onFinish: () => void;
};

/** Items left to buy, how far the basket is, and Finish Shopping. */
export function SummaryCard({
  remaining,
  checked,
  onFinish,
}: SummaryCardProps) {
  const { t } = useTranslation('shopping');
  const total = remaining + checked;
  return (
    <Box
      sx={{
        p: '14px 14px 14px 16px',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '20px',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {t('summary.toBuy', { count: remaining })}
      </Typography>
      <Typography
        sx={{ fontSize: 13, fontWeight: 500, mb: '9px' }}
        color="text.secondary"
      >
        {t('summary.inBasket', { checked, total })}
      </Typography>
      <ProgressBar
        label={t('summary.progress')}
        value={checked}
        max={total}
        size="large"
      />
      {checked > 0 ? (
        <Box
          sx={{
            mt: 1.75,
            pt: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="meta" color="text.secondary">
            {t('summary.tickedOff', { count: checked })}
          </Typography>
          <Button
            variant="secondary"
            onClick={onFinish}
            startIcon={<PantryIcon size={16} />}
            sx={{
              minHeight: 36,
              borderRadius: 999,
              px: 1.75,
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            {t('summary.moveToPantry', { count: checked })}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
