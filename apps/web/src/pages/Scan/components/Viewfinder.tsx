import { Box, tokens } from '@pocket-pantry/ui';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanMode } from '../../../lib/scan';
import { GUIDE_CENTER_Y, SCAN_GUIDES } from '../../../lib/scanGuides';
import { isDoubleTap, type Tap } from '../../../lib/doubleTap';

const ARMED_MS = 320;
const PULSE_MS = 360;
const FLASH_MS = 420;
const HAPTIC_MS = 12;
/** Pointer travel between press and release that still counts as a tap. */
const TAP_SLOP = 10;
const noMotion = {
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
};
const noAnimation = {
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};
const CORNERS = [
  ['Top', 'Left'],
  ['Top', 'Right'],
  ['Bottom', 'Left'],
  ['Bottom', 'Right'],
] as const;

type Props = {
  mode: ScanMode;
  /** Show the one-line instruction under the guide; it goes away after the first Scan. */
  hintShown: boolean;
  /** Double-tap (or Enter / Space) on the guide. */
  onScan: () => void;
  disabled: boolean;
  /** When the mode dial last finished a drag, so the tail of a drag is not read as a tap. */
  dragEndedAt: MutableRefObject<number | null>;
};

/**
 * The guide brackets that follow the Scan Mode, centred over the full-screen feed. Double-tapping
 * the guide takes the Scan, with a white flash and a pulse.
 */
export function Viewfinder({
  mode,
  hintShown,
  onScan,
  disabled,
  dragEndedAt,
}: Props) {
  const { t } = useTranslation('scan');
  const { width, height } = SCAN_GUIDES[mode];
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const [pulse, setPulse] = useState(false);
  const [flash, setFlash] = useState(false);
  const timers = useRef<number[]>([]);
  const lastTap = useRef<Tap | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  /** The press that may become the next tap: primary pointer, started inside the guide. */
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => {
    const pending = timers.current;
    // A press that starts or ends outside the guide breaks the pairing of taps.
    const outside = (event: globalThis.PointerEvent) => {
      if (guideRef.current?.contains(event.target as Node)) return;
      press.current = null;
      if (event.type === 'pointerup') lastTap.current = null;
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('pointerup', outside);
    return () => {
      window.clearTimeout(timer.current);
      pending.forEach(window.clearTimeout);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('pointerup', outside);
    };
  }, []);
  const arm = () => {
    setArmed(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setArmed(false), ARMED_MS);
  };
  const scan = () => {
    if (disabled) return;
    onScan();
    navigator.vibrate?.(HAPTIC_MS);
    setPulse(true);
    setFlash(true);
    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setPulse(false), PULSE_MS),
      window.setTimeout(() => setFlash(false), FLASH_MS),
    ];
  };
  const onPointerDown = (event: PointerEvent) => {
    arm();
    press.current =
      event.isPrimary && event.button === 0
        ? { id: event.pointerId, x: event.clientX, y: event.clientY }
        : null;
  };
  const onPointerUp = (event: PointerEvent) => {
    const down = press.current;
    press.current = null;
    if (
      !down ||
      down.id !== event.pointerId ||
      Math.hypot(event.clientX - down.x, event.clientY - down.y) > TAP_SLOP
    ) {
      lastTap.current = null;
      return;
    }
    const tap = { x: event.clientX, y: event.clientY, t: performance.now() };
    if (isDoubleTap(lastTap.current, tap, dragEndedAt.current)) {
      lastTap.current = null;
      scan();
    } else {
      lastTap.current = tap;
    }
  };
  // Screen readers activate a button with a click that has no pointer behind it.
  const onClick = (event: MouseEvent) => {
    if (event.detail === 0) scan();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget || event.repeat) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    scan();
  };
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {flash ? (
        <Box
          data-testid="scan-flash"
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: 0,
            animation: 'pp-scan-flash 280ms ease-out',
            '@keyframes pp-scan-flash': {
              from: { opacity: 0.55 },
              to: { opacity: 0 },
            },
            ...noAnimation,
          }}
        />
      ) : null}
      <Box
        data-testid="scan-guide"
        data-armed={armed ? 'true' : undefined}
        data-pulse={pulse ? 'true' : undefined}
        role="button"
        tabIndex={0}
        aria-label={t('guide.scan')}
        aria-disabled={disabled || undefined}
        ref={guideRef}
        onPointerDown={onPointerDown}
        onClick={onClick}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        sx={{
          position: 'absolute',
          left: '50%',
          top: `${GUIDE_CENTER_Y * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          transition: `width 400ms cubic-bezier(.2,.8,.2,1), height 400ms cubic-bezier(.2,.8,.2,1)`,
          ...noMotion,
          '&:focus-visible': {
            outline: `2px solid ${tokens.color.camAccent}`,
            outlineOffset: 8,
          },
          ...(pulse && {
            animation: `pp-scan-pulse ${PULSE_MS}ms ease-out`,
            '@keyframes pp-scan-pulse': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
              '40%': { transform: 'translate(-50%, -50%) scale(0.965)' },
            },
          }),
          // Nested so it is its own rule next to the transition's.
          '&': noAnimation,
        }}
      >
        {flash ? (
          <Box
            data-testid="scan-guide-fill"
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#FFFFFF',
              opacity: 0,
              animation: `pp-scan-fill ${FLASH_MS}ms ease-out`,
              '@keyframes pp-scan-fill': {
                from: { opacity: 0.85 },
                to: { opacity: 0 },
              },
              ...noAnimation,
            }}
          />
        ) : null}
        {CORNERS.map(([v, h]) => (
          <Box
            key={v + h}
            data-testid="scan-guide-corner"
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: 30,
              height: 30,
              boxSizing: 'border-box',
              [v.toLowerCase()]: -2,
              [h.toLowerCase()]: -2,
              [`border${v}`]: `${flash ? 6 : 3.5}px solid`,
              [`border${h}`]: `${flash ? 6 : 3.5}px solid`,
              [`border${v}${h}Radius`]: '10px',
              borderColor:
                armed && !flash ? tokens.color.camAccent : tokens.color.camFg,
              filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.5))',
              transition: 'border-color 200ms',
              ...noMotion,
            }}
          />
        ))}
        {hintShown ? (
          <Box
            data-testid="scan-hint"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              mt: '14px',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 12.5,
              fontWeight: 600,
              color: tokens.color.camDim,
              backgroundColor: tokens.color.camGlass,
              backdropFilter: 'blur(10px)',
              px: '11px',
              py: '5px',
              borderRadius: '999px',
            }}
          >
            {t(`guideHint.${mode}`)}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
