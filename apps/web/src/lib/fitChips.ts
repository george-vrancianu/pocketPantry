export type FitChipsInput = {
  /** Each chip's natural width, in priority order. */
  widths: readonly number[];
  /** The width the chips must fit in. */
  rowWidth: number;
  /** The index of the chip that must stay (the one matching the current value), if any. */
  pinned?: number | null;
  /** The space between chips. */
  gap?: number;
};

/**
 * Which chips the row keeps: the pinned one first, then the rest in priority order while the
 * running total (with gaps) fits the row, stopping at the first that does not. Returns the kept
 * indexes in priority order.
 */
export function fitChips({
  widths,
  rowWidth,
  pinned = null,
  gap = 6,
}: FitChipsInput): number[] {
  const kept: number[] = [];
  let total = 0;
  const place = (index: number) => {
    total += (kept.length > 0 ? gap : 0) + widths[index];
    kept.push(index);
  };

  if (pinned !== null && pinned >= 0 && pinned < widths.length) place(pinned);
  for (let index = 0; index < widths.length; index++) {
    if (index === pinned) continue;
    const next = total + (kept.length > 0 ? gap : 0) + widths[index];
    if (next > rowWidth) break;
    place(index);
  }
  return kept.sort((a, b) => a - b);
}
