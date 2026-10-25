import { Box, displayType, Gator, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CookTonightCard } from '../lib/cookTonight';
import { cookTonightPanelState } from '../lib/cookTonightPanel';
import { useGatorAlt } from '../lib/useGatorAlt';
import { useGatorTapLink } from '../lib/useGatorTapLink';
import { GatorBubblePanel } from './GatorBubblePanel';

/**
 * The Cook Tonight card on the Recipes page: Gator's bubble panel, one link in every state (see
 * `cookTonightPanelState`). Pressing it plays Gator's Tap, then navigates; with reduced motion it
 * navigates at once.
 */
export function CookTonightCardLink({ cards }: { cards: CookTonightCard[] }) {
  const { t } = useTranslation('recipes');
  const gatorAlt = useGatorAlt();
  // The card is hidden when the Family has no Recipes, so that state never reaches it.
  const { mood, to, lines } = cookTonightPanelState(cards, false, t);
  const { taps, onClick } = useGatorTapLink(to);
  if (!to) return null;
  const title = t('cookTonight.title');
  const [line, ...rest] = lines;

  return (
    <GatorBubblePanel
      to={to}
      // Block children carry no spaces for a screen reader, so name the link explicitly.
      label={[title, ...lines].join(', ')}
      onClick={onClick}
      gator={
        <Gator
          mood={mood}
          size={170}
          loop="signature"
          tapSignal={taps}
          alt={gatorAlt(mood)}
        />
      }
    >
      <Box sx={{ ...displayType, fontSize: 18 }}>{title}</Box>
      <Box sx={{ fontWeight: 700, mt: '4px' }}>{line}</Box>
      {rest.map((text, i) => (
        <Box
          key={i}
          sx={{ fontSize: 13, mt: '2px', color: tokens.color.accentOnTint }}
        >
          {text}
        </Box>
      ))}
    </GatorBubblePanel>
  );
}
