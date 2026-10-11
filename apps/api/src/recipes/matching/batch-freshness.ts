import { addDays } from '../../common/dates';

/**
 * Batch freshness against a Member's `today`, as ISO `YYYY-MM-DD` strings.
 * The caller uses these to drop expired Batches before matching and to flag
 * Expiring Soon ones, keeping `matchRecipe` itself free of dates.
 */

/** No expiry date counts as unexpired; a Batch expiring today still counts. */
export function isUnexpired(expiryDate: string | null, today: string): boolean {
  return expiryDate === null || expiryDate >= today;
}

/** Unexpired and expiring within the Family's stale threshold, inclusive. */
export function isExpiringSoon(
  expiryDate: string | null,
  today: string,
  staleThresholdDays: number,
): boolean {
  if (expiryDate === null || !isUnexpired(expiryDate, today)) return false;
  return expiryDate <= addDays(today, staleThresholdDays);
}
