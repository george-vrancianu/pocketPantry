import {
  Box,
  GatorImage,
  usePrefersReducedMotion,
  type GatorMood,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keyframesSx } from '../../lib/keyframesSx';
import type { PantryHealth } from '../../lib/health';
import { useGatorAlt } from '../../lib/useGatorAlt';

const FADE_MS = 300;

/** Gator's face for a Pantry Health band: curious below ten Batches, then dapper, hmm or worried by verdict. */
export function healthMood(health: PantryHealth): GatorMood {
  if (!health.scored) return 'health-curious';
  return health.verdict === 'good'
    ? 'health-dapper'
    : health.verdict === 'some'
      ? 'health-hmm'
      : 'worried';
}

/**
 * Gator's line for the band, or null when Health has nothing true to add beside the to-do count. It
 * only describes real Health To-dos: "Splendid" needs a score of 85 or more and no Health To-do left.
 */
export function useHealthGatorLine(
  health: PantryHealth,
  todoCount: number,
): string | null {
  const { t } = useTranslation('dashboard');
  if (!health.scored) return t('health.gator.curious');
  if (health.verdict === 'good' && todoCount === 0)
    return t('health.gator.dapper');
  return null;
}

/**
 * Gator's mood for the Pantry Health band. A new mood fades in over the old one; with reduced motion
 * it simply swaps. Alt names the mood.
 */
export function HealthGator({
  health,
  size,
}: {
  health: PantryHealth;
  size: number;
}) {
  const mood = healthMood(health);
  const gatorAlt = useGatorAlt();
  const reduceMotion = usePrefersReducedMotion();
  const [previous, setPrevious] = useState(mood);
  const [leaving, setLeaving] = useState<GatorMood | null>(null);
  if (previous !== mood) {
    setPrevious(mood);
    setLeaving(reduceMotion ? null : previous);
  }
  // The old face goes once its fade has run, however the browser reports it.
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: size,
      }}
    >
      {leaving ? (
        <Box
          component="span"
          data-testid="health-gator-leaving"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0,
            ...keyframesSx('pp-gator-fade-out', `${FADE_MS}ms ease-out`, {
              from: { opacity: 1 },
              to: { opacity: 0 },
            }),
          }}
        >
          <GatorImage mood={leaving} size={size} decorative />
        </Box>
      ) : null}
      <Box
        component="span"
        key={mood}
        sx={{
          display: 'block',
          ...(leaving
            ? keyframesSx('pp-gator-fade-in', `${FADE_MS}ms ease-in`, {
                from: { opacity: 0 },
                to: { opacity: 1 },
              })
            : {}),
        }}
      >
        <GatorImage mood={mood} size={size} alt={gatorAlt(mood)} />
      </Box>
    </Box>
  );
}
