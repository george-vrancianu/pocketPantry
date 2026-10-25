import {
  Box,
  displayType,
  Gator,
  tokens,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { CookTonightCard } from '../../../lib/cookTonight';
import { cookTonightPanelState } from '../../../lib/cookTonightPanel';
import { TAP_BEFORE_NEXT_MS } from '../../../lib/gatorTap';
import { useGatorAlt } from '../../../lib/useGatorAlt';
import { GatorBubblePanel } from './GatorBubblePanel';

/**
 * The Cook Tonight card on the Recipes page: Gator's bubble panel, one link in every state (see
 * `cookTonightPanelState`). Pressing it plays Gator's Tap, then navigates; with reduced motion it
 * navigates at once.
 */
export function CookTonightCardLink({ cards }: { cards: CookTonightCard[] }) {
  const { t } = useTranslation('recipes');
  const gatorAlt = useGatorAlt();
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();
  const [taps, setTaps] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // The card is hidden when the Family has no Recipes, so that state never reaches it.
  const { mood, to, lines } = cookTonightPanelState(cards, false, t);
  if (!to) return null;
  const title = t('cookTonight.title');
  const [line, ...rest] = lines;

  const onClick = (event: MouseEvent<HTMLElement>) => {
    const plain =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    if (reduceMotion || !plain) return;
    event.preventDefault();
    if (timer.current) return;
    setTaps((n) => n + 1);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      navigate(to);
    }, TAP_BEFORE_NEXT_MS);
  };

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
      {rest.map((text) => (
        <Box
          key={text}
          sx={{ fontSize: 13, mt: '2px', color: tokens.color.accentOnTint }}
        >
          {text}
        </Box>
      ))}
    </GatorBubblePanel>
  );
}
