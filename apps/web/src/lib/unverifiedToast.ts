/** Router state a Review Save hands to /pantry or /shopping: how many saved lines were never verified. */
export type UnverifiedState = { unverified: number };

export const unverifiedState = (count: number): UnverifiedState | undefined =>
  count > 0 ? { unverified: count } : undefined;

/** The count carried by a location's state, or 0 when there is none. */
export function unverifiedCount(state: unknown): number {
  const value = (state as Partial<UnverifiedState> | null)?.unverified;
  return typeof value === 'number' && value > 0 ? value : 0;
}
