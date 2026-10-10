// Stub: implemented in #110.
export const DIAL_ITEM_WIDTH = 84;
export function startsHorizontalDrag(_dx: number, _dy: number): boolean {
  return false;
}
export function rubberBand(offset: number, _max: number): number {
  return offset;
}
export function releaseTarget(_input: {
  offset: number;
  dx: number;
  dt: number;
  index: number;
  count: number;
}): number {
  return 0;
}
