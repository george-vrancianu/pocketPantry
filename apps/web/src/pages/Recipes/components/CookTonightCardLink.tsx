import {
  Box,
  displayType,
  Gator,
  radius,
  tokens,
  type GatorMood,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { canMakeCards, type CookTonightCard } from '../../../lib/cookTonight';
import { useGatorAlt } from '../../../lib/useGatorAlt';

type CardState = { mood: GatorMood; to: string; lines: (string | null)[] };

/**
 * The Cook Tonight card on the Recipes page, one link in every state:
 * - something Can Make: chef Gator, how many Base Recipes and how many of them use what expires
 *   soon, to the Cook Tonight page;
 * - nothing, but some one ingredient short: the disappointed chef and how many, to the Cook
 *   Tonight page, where only that section shows;
 * - neither: the disappointed chef and a hint to add what you have, to the Pantry, so the
 *   Member never lands on an empty page.
 */
export function CookTonightCardLink({ cards }: { cards: CookTonightCard[] }) {
  const { t } = useTranslation('recipes');
  const gatorAlt = useGatorAlt();
  // One card per Base Recipe, so Variants never count separately.
  const canMake = canMakeCards(cards);
  const oneShort = cards.length - canMake.length;
  const expiring = canMake.filter((card) => card.expiringCount > 0).length;
  const { mood, to, lines }: CardState =
    canMake.length > 0
      ? {
          mood: 'chef',
          to: '/recipes/cook-tonight',
          lines: [
            t('cookTonight.canMake', { count: canMake.length }),
            expiring > 0
              ? t('cookTonight.expiring', { count: expiring })
              : null,
          ],
        }
      : oneShort > 0
        ? {
            mood: 'chef-flop',
            to: '/recipes/cook-tonight',
            lines: [
              t('cookTonight.nothingYet'),
              t('cookTonight.oneShort', { count: oneShort }),
            ],
          }
        : {
            mood: 'chef-flop',
            to: '/pantry',
            lines: [
              t('cookTonight.nothingInPantry'),
              t('cookTonight.addWhatYouHave'),
            ],
          };
  const title = t('cookTonight.title');
  const [line, secondLine] = lines;
  return (
    <Box
      component={Link}
      to={to}
      // Block children carry no spaces for a screen reader, so name the link explicitly.
      aria-label={[title, ...lines].filter(Boolean).join(', ')}
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
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ ...displayType, fontSize: 22 }}>{title}</Box>
        <Box sx={{ fontSize: 15, fontWeight: 700, mt: '2px' }}>{line}</Box>
        {secondLine ? (
          <Box sx={{ fontSize: 14, mt: '2px' }}>{secondLine}</Box>
        ) : null}
      </Box>
      <Gator mood={mood} size={104} alt={gatorAlt(mood)} />
    </Box>
  );
}
