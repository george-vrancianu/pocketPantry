import {
  Box,
  displayType,
  GatorImage,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useGatorAlt } from '../../../lib/useGatorAlt';

/**
 * "Cook tonight": how many Recipes the Family Can Make that use something Expiring Soon, with Gator
 * cooking. "See them" is for the parent to wire to the "You can make this" strip.
 */
export function CookTonightPrompt({
  count,
  onSeeThem,
}: {
  count: number;
  onSeeThem: () => void;
}) {
  const { t } = useTranslation('recipes');
  const gatorAlt = useGatorAlt();
  return (
    <Box
      component="section"
      aria-label={t('cookTonight.title')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: 110,
        p: '14px 6px 14px 18px',
        borderRadius: radius.card,
        bgcolor: tokens.color.accentTint,
        color: tokens.color.accentOnTint,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ ...displayType, fontSize: 22 }}>
          {t('cookTonight.title')}
        </Box>
        <Box sx={{ fontSize: 14, mt: '2px' }}>
          {t('cookTonight.line', { count })}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onSeeThem}
          sx={{
            mt: '6px',
            p: 0,
            border: 0,
            background: 'none',
            color: 'inherit',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {t('cookTonight.seeThem')}
        </Box>
      </Box>
      <GatorImage mood="chef" size={104} alt={gatorAlt('chef')} />
    </Box>
  );
}
