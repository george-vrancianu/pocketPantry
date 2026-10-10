export const DOUBLE_TAP_MS = 320;
export const DOUBLE_TAP_DISTANCE = 60;

/** A tap that ends this soon after a dial drag is the drag's tail, not a tap. */
export const AFTER_DRAG_MS = 320;

export type Tap = { x: number; y: number; t: number };

/**
 * Whether `next` completes a double-tap after `previous`: within 320 ms and 60 pt. A tap soon after
 * a dial drag ended (`lastDragEndAt`) is never part of one.
 */
export function isDoubleTap(
  previous: Tap | null,
  next: Tap,
  lastDragEndAt: number | null,
): boolean {
  if (!previous) return false;
  if (lastDragEndAt != null && next.t - lastDragEndAt <= AFTER_DRAG_MS) {
    return false;
  }
  return (
    next.t - previous.t <= DOUBLE_TAP_MS &&
    Math.hypot(next.x - previous.x, next.y - previous.y) <= DOUBLE_TAP_DISTANCE
  );
}
