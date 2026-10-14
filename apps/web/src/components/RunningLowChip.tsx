import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The "Running low" chip, in the expiry tag's chip style. The caller shows it while the Ingredient is flagged. */
export function RunningLowChip() {
  const { t } = useTranslation('pantry');

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: 700,
        px: '10px',
        py: '4px',
        borderRadius: `${tokens.radius.chip}px`,
        whiteSpace: 'nowrap',
        bgcolor: tokens.color.soonBg,
        color: tokens.color.soonFg,
      }}
    >
      {t('runningLow.chip')}
    </Box>
  );
}
