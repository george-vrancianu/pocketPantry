export const DIAL_ITEM_WIDTH = 84;

const DRAG_START_PT = 10;
const OVERSHOOT = 0.35;
const FLICK_SPEED = 0.45;
const FLICK_MAX_TRAVEL = 0.6;

/** A drag becomes a dial drag after more than 10 pt, mostly sideways. */
export function startsHorizontalDrag(dx: number, dy: number): boolean {
  return Math.abs(dx) > DRAG_START_PT && Math.abs(dx) > Math.abs(dy);
}

/** Strip offset (0 = first item centred, max = last): 1:1 inside, 35 % of the finger beyond. */
export function rubberBand(offset: number, max: number): number {
  if (offset < 0) return offset * OVERSHOOT;
  if (offset > max) return max + (offset - max) * OVERSHOOT;
  return offset;
}

/** Item index to settle on: nearest item, or one step for a quick short flick. */
export function releaseTarget({
  offset,
  dx,
  dt,
  index,
  count,
}: {
  offset: number;
  dx: number;
  dt: number;
  index: number;
  count: number;
}): number {
  const flick =
    Math.abs(dx / dt) > FLICK_SPEED &&
    Math.abs(dx) < DIAL_ITEM_WIDTH * FLICK_MAX_TRAVEL;
  const target = flick
    ? index + (dx < 0 ? 1 : -1)
    : Math.round(offset / DIAL_ITEM_WIDTH);
  return Math.min(count - 1, Math.max(0, target));
}
