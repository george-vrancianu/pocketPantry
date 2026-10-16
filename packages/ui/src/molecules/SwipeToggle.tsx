import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Box } from '../atoms/Layout';
import { BatteryLowIcon } from '../atoms/icons';
import { color } from '../theme/themeVars';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';
import { REVEAL_PT, useRowGestures, vibrate } from './useRowGestures';

/** The release in the zone that flips the flag. */
const HAPTIC_TOGGLE = 14;
const SPRING_MS = 300;
/** Width of the Running low rail on the row's right edge. */
const RAIL_PX = 4;

export type SwipeToggleProps = {
  /** What the release will do, on the tab, e.g. "Running low" or "Not low". */
  label: string;
  /** A swipe was released inside the zone. Every release springs back; the caller flips its flag. */
  onToggle: () => void;
  /** The flag is set: a butter rail and glow stay on the row's right edge. Changes snap. */
  on: boolean;
  /** No swipe: the content stays put and taps go through as usual. */
  disabled?: boolean;
  /** The row's content, in practice its header button. Gets an opaque card background to cover the band. */
  children: ReactNode;
};

/**
 * A row you swipe left to toggle a flag (Pantry batches handoff, section 6). A butter band shows behind
 * the row with a tab at its trailing edge; the row has one zone at 92 pt, and a release inside it calls
 * `onToggle`. Every release springs back. It is a wrapper, not a list item: the caller owns the element
 * that takes focus and its keyboard equivalent.
 */
export function SwipeToggle({
  label,
  onToggle,
  on,
  disabled = false,
  children,
}: SwipeToggleProps) {
  const reduceMotion = usePrefersReducedMotion();
  const gestures = useRowGestures({
    mode: 'toggle',
    disabled,
    onToggle: () => {
      vibrate(HAPTIC_TOGGLE);
      onToggle();
    },
  });
  const { x, zone, dragging } = gestures;
  const inZone = zone === 1;
  const progress = Math.min(1, Math.max(0, -x / REVEAL_PT));
  const motion = (value: string) => (reduceMotion ? 'none' : value);

  // The band is only there while the row moves: during a drag and its spring back.
  const [settling, setSettling] = useState(false);
  const wasDragging = useRef(false);
  useEffect(() => {
    const ended = wasDragging.current && !dragging;
    wasDragging.current = dragging;
    if (!ended || reduceMotion) return;
    setSettling(true);
    const timer = setTimeout(() => setSettling(false), SPRING_MS);
    return () => clearTimeout(timer);
  }, [dragging, reduceMotion]);
  const moving = dragging || settling;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {moving ? (
        <Box
          aria-hidden="true"
          data-swipe-toggle-band=""
          style={{ opacity: inZone ? 1 : 0.35 + 0.65 * progress }}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            bgcolor: tokens.color.butter,
            pointerEvents: 'none',
            transition: motion('opacity 120ms'),
          }}
        >
          <Box
            data-swipe-toggle-tab=""
            style={{
              opacity: 0.3 + 0.7 * progress,
              transform: `scale(${0.86 + 0.14 * progress})`,
            }}
            sx={{
              width: REVEAL_PT,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: tokens.color.butterInk,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.01em',
              whiteSpace: 'nowrap',
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'flex',
                transform: inZone ? 'scale(1.15)' : 'none',
                transition: motion('transform 300ms cubic-bezier(.2,.7,.3,1)'),
              }}
            >
              <BatteryLowIcon size={22} strokeWidth={2.2} />
            </Box>
            {label}
          </Box>
        </Box>
      ) : null}
      <Box
        {...gestures.bind}
        data-swipe-toggle-content=""
        style={{ transform: `translateX(${x}px)` }}
        sx={{
          position: 'relative',
          bgcolor: color.cardBg,
          transition: dragging
            ? 'none'
            : motion(`transform ${SPRING_MS}ms cubic-bezier(.25,1.35,.45,1)`),
        }}
      >
        {on ? (
          <Box
            aria-hidden="true"
            data-swipe-toggle-tint=""
            sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <Box
              data-swipe-toggle-glow=""
              sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to left, color-mix(in srgb, ${tokens.color.butter} 38%, transparent), transparent 27%)`,
              }}
            />
            <Box
              data-swipe-toggle-rail=""
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: RAIL_PX,
                bgcolor: tokens.color.butter,
              }}
            />
          </Box>
        ) : null}
        <Box
          data-swipe-toggle-dim=""
          style={{ opacity: inZone ? 0.7 : 1 }}
          sx={{ position: 'relative', transition: motion('opacity 150ms') }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
