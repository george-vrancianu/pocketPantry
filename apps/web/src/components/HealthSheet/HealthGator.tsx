import {
  Box,
  GatorImage,
  tokens,
  usePrefersReducedMotion,
  type GatorMood,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keyframesSx } from '../../lib/keyframesSx';
import type { HealthTodo, PantryHealth } from '../../lib/health';
import { useGatorAlt } from '../../lib/useGatorAlt';
import { expiringSoonDay, todoTitle } from './todoText';

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
 * Gator's line for the band, or null when Health has nothing true to add. It only describes real
 * Health To-dos: "Splendid" needs a score of 85 or more and no Health To-do left, and the hmm and
 * worried notes name the first To-do. No score gain is ever promised.
 */
export function useHealthGatorLine(
  health: PantryHealth,
  todos: HealthTodo[],
  staleThresholdDays: number,
  today: Date,
): string | null {
  const { t, i18n } = useTranslation('dashboard');
  if (!health.scored) return t('health.gator.curious');
  if (health.verdict === 'good') {
    return todos.length === 0 ? t('health.gator.dapper') : null;
  }
  const first = todos[0];
  if (!first) return null;
  const title = todoTitle(
    t,
    first,
    expiringSoonDay(today, staleThresholdDays, i18n.language),
  );
  return t(
    health.verdict === 'some' ? 'health.gator.hmm' : 'health.gator.worried',
    { title },
  );
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

/**
 * Gator's line under the score. The hmm note sits on the soon tint and the worried note on the urgent
 * tint; the other bands stay plain.
 */
export function HealthGatorNote({
  health,
  line,
  sx,
}: {
  health: PantryHealth;
  line: string;
  sx?: Record<string, unknown>;
}) {
  const tint =
    health.scored && health.verdict === 'some'
      ? { bgcolor: tokens.color.soonBg, color: tokens.color.soonFg }
      : health.scored && health.verdict === 'attention'
        ? { bgcolor: tokens.color.urgentBg, color: tokens.color.urgentFg }
        : null;
  return (
    <Box
      component="span"
      data-testid="health-gator-note"
      sx={{
        display: 'block',
        fontSize: 12.5,
        lineHeight: 1.4,
        ...(tint ? { ...tint, borderRadius: '8px', p: '6px 10px' } : {}),
        ...sx,
      }}
    >
      {line}
    </Box>
  );
}
