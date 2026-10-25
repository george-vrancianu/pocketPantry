import {
  Box,
  Gator,
  radius,
  tokens,
  usePrefersReducedMotion,
  warmGatorLoops,
  type AnimatedGatorMood,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keyframesSx } from '../../lib/keyframesSx';
import type { HealthTodo, PantryHealth } from '../../lib/health';
import { useGatorAlt } from '../../lib/useGatorAlt';
import { expiringSoonDay, todoTitle } from './todoText';

const FADE_MS = 300;
const BAND_MOOD = {
  curious: 'health-curious',
  good: 'health-dapper',
  some: 'health-hmm',
  attention: 'worried',
} as const satisfies Record<string, AnimatedGatorMood>;
const HEALTH_MOODS: AnimatedGatorMood[] = Object.values(BAND_MOOD);

/** Gator's face for a Pantry Health band: curious below ten Batches, then dapper, hmm or worried by verdict. */
export function healthMood(health: PantryHealth): AnimatedGatorMood {
  if (!health.scored) return BAND_MOOD.curious;
  return health.verdict === 'good'
    ? BAND_MOOD.good
    : health.verdict === 'some'
      ? BAND_MOOD.some
      : BAND_MOOD.attention;
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
  tapSignal,
  entrance = false,
}: {
  health: PantryHealth;
  size: number;
  /** A parent that is already pressable bumps this to start Gator's Tap. */
  tapSignal?: number;
  /** Play the Entrance when first shown (not on a band change). */
  entrance?: boolean;
}) {
  const mood = healthMood(health);
  const gatorAlt = useGatorAlt();
  const reduceMotion = usePrefersReducedMotion();
  // After a band change the face never plays an Entrance, even if the band comes back.
  const [changed, setChanged] = useState(false);
  // Warm every band's loop, so the incoming face isn't blank while the old one fades out.
  useEffect(() => {
    warmGatorLoops(HEALTH_MOODS, 'idle');
  }, []);
  const [previous, setPrevious] = useState(mood);
  const [leaving, setLeaving] = useState<AnimatedGatorMood | null>(null);
  if (previous !== mood) {
    setPrevious(mood);
    setChanged(true);
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
          <Gator mood={leaving} size={size} entrance={false} decorative />
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
        <Gator
          mood={mood}
          size={size}
          entrance={entrance && !changed}
          tapSignal={tapSignal}
          alt={gatorAlt(mood)}
        />
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
        ...(tint
          ? { ...tint, borderRadius: radius.control, p: '6px 10px' }
          : {}),
        ...sx,
      }}
    >
      {line}
    </Box>
  );
}
