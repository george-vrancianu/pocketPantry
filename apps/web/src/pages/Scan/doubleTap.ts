export const DOUBLE_TAP_MS = 320;
export const DOUBLE_TAP_DISTANCE = 60;

export type Tap = { x: number; y: number; t: number };

/** Stub: implemented in #112. */
export function isDoubleTap(
  _previous: Tap | null,
  _next: Tap,
  _lastDragEndAt?: number | null,
): boolean {
  return false;
}
