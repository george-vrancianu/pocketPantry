import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

/** How far outside the button's box the pointer must go to arm cancel, px (72 pt in the handoff). */
export const CANCEL_DISTANCE = 72;
/** A click this soon after a pointer or key release is the tail of that press, not an assistive activation. */
const CLICK_TAIL_MS = 500;

type Press = {
  /** A Voice Note is being recorded, or the press is waiting for the microphone. */
  active: boolean;
  /** Start recording (the button went down). */
  start: () => void;
  /** Let go: send, or treat as a tap if too quick. */
  send: () => void;
  /** Throw the recording away and say so. */
  cancel: () => void;
};

/** A short buzz where the device has one. */
export function haptic(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Some browsers refuse without a user gesture: it is only a nicety.
  }
}

/**
 * Turns pointer, keyboard and assistive-technology input on the Voice Note button into
 * start / send / cancel:
 * - pointer: down starts, up sends, up (or a pointer cancel) while armed cancels. Cancel arms
 *   when the pointer is more than 72 px outside the button's box and disarms when it is back;
 * - keyboard: Space or Enter down starts, up sends, Escape cancels;
 * - a click with no press before it (a screen reader's activation) toggles: start, then send.
 *   No platform or user-agent detection.
 */
export function usePressGesture({ active, start, send, cancel }: Press) {
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);
  const pointerDown = useRef(false);
  const lastRelease = useRef(Number.NEGATIVE_INFINITY);

  const arm = useCallback((value: boolean) => {
    if (armedRef.current === value) return;
    armedRef.current = value;
    setArmed(value);
    haptic(6);
  }, []);

  const disarm = useCallback(() => {
    armedRef.current = false;
    setArmed(false);
  }, []);

  // The note ended some other way (60 s, a failed start): nothing is armed any more.
  useEffect(() => {
    if (!active) disarm();
  }, [active, disarm]);

  // Escape cancels wherever focus is, as the screen-reader toggle leaves the pointer out of it.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, cancel]);

  const isKey = (event: KeyboardEvent) =>
    event.key === ' ' || event.key === 'Enter';

  const buttonProps = {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // No active pointer to capture (e.g. a synthetic event).
      }
      pointerDown.current = true;
      disarm();
      start();
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (!pointerDown.current) return;
      arm(outsideBy(event) > CANCEL_DISTANCE);
    },
    onPointerUp() {
      if (!pointerDown.current) return;
      pointerDown.current = false;
      lastRelease.current = Date.now();
      if (armedRef.current) {
        disarm();
        cancel();
      } else send();
    },
    onPointerCancel() {
      pointerDown.current = false;
      lastRelease.current = Date.now();
      disarm();
      cancel();
    },
    onKeyDown(event: KeyboardEvent) {
      if (!isKey(event)) return;
      // Keep the browser from also clicking.
      event.preventDefault();
      if (!event.repeat) start();
    },
    onKeyUp(event: KeyboardEvent) {
      if (!isKey(event)) return;
      event.preventDefault();
      lastRelease.current = Date.now();
      send();
    },
    onClick() {
      if (
        pointerDown.current ||
        Date.now() - lastRelease.current < CLICK_TAIL_MS
      )
        return;
      if (active) send();
      else start();
    },
    onContextMenu(event: { preventDefault(): void }) {
      event.preventDefault();
    },
  };

  return { armed, buttonProps };
}

/** How far the pointer is outside the button's box, px (0 inside it). */
function outsideBy(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return 0;
  const dx = Math.max(box.left - event.clientX, event.clientX - box.right, 0);
  const dy = Math.max(box.top - event.clientY, event.clientY - box.bottom, 0);
  return Math.max(dx, dy);
}
