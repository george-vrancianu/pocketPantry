import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

/** Row gesture numbers from the handoff (docs/handoffs/row-gestures/handoff.md, section 3). */
export const REVEAL_PT = 92;
export const DELETE_FRACTION = 2 / 3;
/** The delete line is tested at 98.5 % of its distance. */
const DELETE_LINE_SLACK = 0.985;
export const MOVE_TOLERANCE_PT = 8;
const RIGHT_RUBBER_BAND = 0.25;
const PAST_LINE_RUBBER_BAND = 0.4;
/** How long after a drag the click that follows it is still swallowed. */
const CLICK_GUARD_MS = 350;

const HAPTIC_REVEAL = 10;
const HAPTIC_DELETE_LINE = [14, 40, 22];
const HAPTIC_FLY_OFF = [10, 30, 30];

/** 0: the tab is sliding in, 1: the tab is fully in view, 2: past the delete line. */
export type SwipeZone = 0 | 1 | 2;

export type RowGestureOptions = {
  /** Release in zone 1: the row asks for confirmation. */
  onAsk: () => void;
  /** Release in zone 2: the row flies off and is removed. */
  onDelete: () => void;
  /** Ignore pointers, e.g. while the row is confirming or leaving. */
  disabled?: boolean;
  /** Width of the trash tab, the zone 1 distance. */
  reveal?: number;
  /** Fraction of the row width that starts zone 2. */
  deleteFraction?: number;
  /** Movement before a drag starts. */
  moveTolerance?: number;
};

type Tuning = Required<
  Pick<RowGestureOptions, 'reveal' | 'deleteFraction' | 'moveTolerance'>
>;

const DEFAULTS: Tuning = {
  reveal: REVEAL_PT,
  deleteFraction: DELETE_FRACTION,
  moveTolerance: MOVE_TOLERANCE_PT,
};

const deleteLine = (width: number, fraction: number) =>
  width * fraction * DELETE_LINE_SLACK;

/** Where the row sits for a finger that moved `dx` (negative is left). */
export function swipeOffset(
  dx: number,
  width: number,
  { deleteFraction } = DEFAULTS,
): number {
  if (dx >= 0) return dx * RIGHT_RUBBER_BAND;
  const line = deleteLine(width, deleteFraction);
  const drag = -dx;
  if (drag <= line) return dx;
  return -(line + (drag - line) * PAST_LINE_RUBBER_BAND);
}

/** The release zone for a finger that moved `dx`. */
export function swipeZone(
  dx: number,
  width: number,
  { reveal, deleteFraction } = DEFAULTS,
): SwipeZone {
  const drag = -dx;
  if (drag >= deleteLine(width, deleteFraction)) return 2;
  return drag >= reveal ? 1 : 0;
}

/** Buzz where the browser can; a nicety, never an error. */
export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Haptics are a nicety.
  }
}

type Press = {
  id: number;
  x: number;
  y: number;
  width: number;
  dragging: boolean;
  zone: SwipeZone;
  dx: number;
};

export type RowGestureBind = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
};

export type RowGestures = {
  /** Spread onto the moving layer. */
  bind: RowGestureBind;
  /** Horizontal offset of the row in pt; follows the finger while `dragging`. */
  x: number;
  zone: SwipeZone;
  dragging: boolean;
};

/**
 * The pointer logic of a swipeable row: a drag starts after 8 pt of mostly horizontal movement,
 * and the release zone decides between springing back, asking, and deleting.
 * Pointer capture is taken only once the drag starts, so taps reach the row's children.
 */
export function useRowGestures(options: RowGestureOptions): RowGestures {
  const tuning: Tuning = {
    reveal: options.reveal ?? DEFAULTS.reveal,
    deleteFraction: options.deleteFraction ?? DEFAULTS.deleteFraction,
    moveTolerance: options.moveTolerance ?? DEFAULTS.moveTolerance,
  };
  const latest = useRef({ options, tuning });
  latest.current = { options, tuning };

  const [view, setView] = useState({
    x: 0,
    zone: 0 as SwipeZone,
    dragging: false,
  });
  const press = useRef<Press | null>(null);
  const swallowClick = useRef(false);
  const guardTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(guardTimer.current), []);

  const rest = useCallback(() => {
    press.current = null;
    setView({ x: 0, zone: 0, dragging: false });
  }, []);

  const swallowNextClick = () => {
    swallowClick.current = true;
    clearTimeout(guardTimer.current);
    guardTimer.current = setTimeout(() => {
      swallowClick.current = false;
    }, CLICK_GUARD_MS);
  };

  const bind: RowGestureBind = {
    onPointerDown: (event) => {
      const { options: o } = latest.current;
      if (o.disabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      swallowClick.current = false;
      press.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        width: event.currentTarget.getBoundingClientRect().width,
        dragging: false,
        zone: 0,
        dx: 0,
      };
    },
    onPointerMove: (event) => {
      const current = press.current;
      if (!current || event.pointerId !== current.id) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      const { tuning: t } = latest.current;
      if (!current.dragging) {
        if (Math.abs(dy) > t.moveTolerance && Math.abs(dy) >= Math.abs(dx)) {
          // Vertical: the scroll view's.
          press.current = null;
          return;
        }
        if (Math.abs(dx) <= t.moveTolerance || Math.abs(dx) <= Math.abs(dy)) {
          return;
        }
        current.dragging = true;
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId);
        } catch {
          // The pointer may already be gone.
        }
      }
      const zone = swipeZone(dx, current.width, t);
      if (zone !== current.zone) {
        if (zone === 1 && current.zone === 0) vibrate(HAPTIC_REVEAL);
        if (zone === 2) vibrate(HAPTIC_DELETE_LINE);
        current.zone = zone;
      }
      current.dx = dx;
      setView({ x: swipeOffset(dx, current.width, t), zone, dragging: true });
    },
    onPointerUp: (event) => {
      const current = press.current;
      if (!current || event.pointerId !== current.id) return;
      press.current = null;
      if (!current.dragging) return;
      swallowNextClick();
      const { options: o } = latest.current;
      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {
        // Already released.
      }
      if (current.zone === 2) {
        setView((v) => ({ ...v, dragging: false }));
        vibrate(HAPTIC_FLY_OFF);
        o.onDelete();
        return;
      }
      setView({ x: 0, zone: 0, dragging: false });
      if (current.zone === 1) o.onAsk();
    },
    onPointerCancel: (event) => {
      const current = press.current;
      if (!current || event.pointerId !== current.id) return;
      if (current.dragging) swallowNextClick();
      rest();
    },
    onClickCapture: (event) => {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onContextMenu: (event) => event.preventDefault(),
  };

  return { bind, ...view };
}
