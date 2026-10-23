/** Spacing used for the label centres until the real ones are measured (and where nothing can be measured). */
export const FALLBACK_LABEL_PITCH = 84;

/** Travel before a press becomes a drag. */
const DRAG_START_PX = 10;
/** A drag is mostly sideways when |dx| is more than this times |dy|. */
const HORIZONTAL_RATIO = 1.3;
/** Past either end the strip follows the finger at this fraction. */
const OVERSHOOT = 0.35;
/** A flick is a release within this long ... */
const FLICK_MAX_MS = 250;
/** ... after travelling at least this far ... */
const FLICK_MIN_PT = 18;
/** ... and at most this far. */
const FLICK_MAX_PT = 80;

/**
 * The label centres of an evenly spaced strip, from the first label's centre at 0. Used before
 * the labels have been measured, and where the browser can report no layout.
 */
export function uniformCentres(
  count: number,
  pitch = FALLBACK_LABEL_PITCH,
): number[] {
  return Array.from({ length: count }, (_, index) => index * pitch);
}

/** A drag becomes a slider drag after more than 10 pt, mostly sideways (|dx| > 1.3 x |dy|). */
export function startsHorizontalDrag(dx: number, dy: number): boolean {
  return (
    Math.abs(dx) > DRAG_START_PX &&
    Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO
  );
}

/** Strip offset between `min` (first label centred) and `max` (last): 1:1 inside, 35 % of the finger beyond. */
export function rubberBand(offset: number, min: number, max: number): number {
  if (offset < min) return min + (offset - min) * OVERSHOOT;
  if (offset > max) return max + (offset - max) * OVERSHOOT;
  return offset;
}

/** The strip offset while a finger has moved `dx` since it went down on label `startIndex`. */
export function dragOffset(
  startIndex: number,
  dx: number,
  centres: readonly number[],
): number {
  return rubberBand(
    centres[startIndex] - dx,
    centres[0],
    centres[centres.length - 1],
  );
}

/** The label whose centre is nearest the strip `offset`. */
export function nearestIndex(offset: number, centres: readonly number[]) {
  let best = 0;
  centres.forEach((centre, index) => {
    if (Math.abs(centre - offset) < Math.abs(centres[best] - offset)) {
      best = index;
    }
  });
  return best;
}

/** Label to settle on: the nearest centre, or exactly one step for a quick short flick. */
export function releaseTarget({
  offset,
  dx,
  dt,
  index,
  centres,
}: {
  offset: number;
  dx: number;
  dt: number;
  index: number;
  centres: readonly number[];
}): number {
  const flick =
    dt < FLICK_MAX_MS &&
    Math.abs(dx) >= FLICK_MIN_PT &&
    Math.abs(dx) <= FLICK_MAX_PT;
  const target = flick
    ? index + (dx < 0 ? 1 : -1)
    : nearestIndex(offset, centres);
  return Math.min(centres.length - 1, Math.max(0, target));
}
