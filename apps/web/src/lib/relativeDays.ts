/** Whole calendar days (local time) from `since` to `now`, never negative. A plain `YYYY-MM-DD` date counts as that local day. */
export function daysSince(
  since: string | Date,
  now: Date = new Date(),
): number {
  const then =
    typeof since === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(since)
      ? new Date(`${since}T00:00:00`)
      : new Date(since);
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(0, Math.round((day(now) - day(then)) / 86_400_000));
}
