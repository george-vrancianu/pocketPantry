import {
  Box,
  displayType,
  GatorImage,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { canMakeCards, type CookTonightCard } from '../../../lib/cookTonight';
import { useGatorAlt } from '../../../lib/useGatorAlt';

/**
 * The Cook Tonight card on the Recipes page: chef Gator, how many Base Recipes the Family Can
 * Make and how many of them use something Expiring Soon. The whole card links to the Cook
 * Tonight page. Renders nothing when nothing can be made.
 */
export function CookTonightCardLink({ cards }: { cards: CookTonightCard[] }) {
  const { t } = useTranslation('recipes');
  const gatorAlt = useGatorAlt();
  // One card per Base Recipe, so Variants never count separately.
  const canMake = canMakeCards(cards);
  if (canMake.length === 0) return null;
  const expiring = canMake.filter((card) => card.expiringCount > 0).length;
  const title = t('cookTonight.title');
  const line = t('cookTonight.canMake', { count: canMake.length });
  const expiringLine =
    expiring > 0 ? t('cookTonight.expiring', { count: expiring }) : null;
  return (
    <Box
      component={Link}
      to="/recipes/cook-tonight"
      // Block children carry no spaces for a screen reader, so name the link explicitly.
      aria-label={[title, line, expiringLine].filter(Boolean).join(', ')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: 110,
        p: '14px 6px 14px 18px',
        borderRadius: radius.card,
        bgcolor: tokens.color.accentTint,
        color: tokens.color.accentOnTint,
        textDecoration: 'none',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ ...displayType, fontSize: 22 }}>{title}</Box>
        <Box sx={{ fontSize: 15, fontWeight: 700, mt: '2px' }}>{line}</Box>
        {expiringLine ? (
          <Box sx={{ fontSize: 14, mt: '2px' }}>{expiringLine}</Box>
        ) : null}
      </Box>
      <GatorImage mood="chef" size={104} alt={gatorAlt('chef')} />
    </Box>
  );
}
