import {
  Box,
  displayType,
  tokens,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { MIN_BATCHES_FOR_SCORE, type PantryHealth } from '../../lib/health';
import { SCORE_ANIMATION_MS, SCORE_EASING, VERDICT_COLOR } from './healthStyle';

/** The number counting to `target` over 700 ms (ease-out cubic); with reduced motion it jumps. */
function useAnimatedNumber(target: number, jump: boolean): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (jump) {
      current.current = target;
      return;
    }
    const from = current.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - start) / SCORE_ANIMATION_MS);
      current.current = from + (target - from) * (1 - (1 - progress) ** 3);
      setShown(Math.round(current.current));
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, jump]);
  return jump ? target : shown;
}

type Props = {
  /** Where the arc ends, 0 to 100. */
  percent: number;
  /** Shown in the middle; counts to a new value. */
  label: number;
  color: string;
  size: number;
  stroke: number;
};

/**
 * A ring that fills clockwise from 12 o'clock with a number in the middle. Decorative: the text beside it, or
 * the card's name, says the same. The arc and the number animate to a new value.
 */
export function HealthRing({ percent, label, color, size, stroke }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const shown = useAnimatedNumber(label, reduceMotion);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const centre = size / 2;
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        position: 'relative',
        display: 'block',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke={tokens.color.chipNeutral}
          strokeWidth={stroke}
        />
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${centre} ${centre})`}
          style={{
            transition: reduceMotion
              ? 'none'
              : `stroke-dashoffset ${SCORE_ANIMATION_MS}ms ${SCORE_EASING}, stroke 250ms`,
          }}
        />
      </svg>
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...displayType,
          fontSize: size >= 56 ? 20 : 17,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {shown}
      </Box>
    </Box>
  );
}

/** The ring of a Pantry's health: the score in the verdict's colour, or the progress towards getting one. */
export function ScoreRing({
  health,
  batchCount,
  size,
}: {
  health: PantryHealth;
  batchCount: number;
  size: number;
}) {
  return health.scored ? (
    <HealthRing
      percent={health.total}
      label={health.total}
      color={VERDICT_COLOR[health.verdict]}
      size={size}
      stroke={6}
    />
  ) : (
    <HealthRing
      percent={(batchCount / MIN_BATCHES_FOR_SCORE) * 100}
      label={batchCount}
      color={tokens.color.muted}
      size={size}
      stroke={6}
    />
  );
}
