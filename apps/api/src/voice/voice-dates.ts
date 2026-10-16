import { z } from 'zod';

const calendarDate = z.iso.date();

/** The last day of the range: five years on from `today`, clamping 29 February. */
function fiveYearsFrom(today: string): string {
  const [year, month, day] = today.split('-').map(Number);
  const target = year + 5;
  const clamped = month === 2 && day === 29 && !isLeap(target) ? 28 : day;
  return `${String(target).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
}

const isLeap = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Validates an expiry date the model resolved against the Member's local
 * `today`: it must be a real calendar date (2026-02-31 is not), not in the
 * past and no more than five years ahead. Anything else is dropped (null).
 */
export function resolveSpokenDate(
  date: string | null,
  today: string,
): string | null {
  if (!date || !calendarDate.safeParse(date).success) return null;
  return date >= today && date <= fiveYearsFrom(today) ? date : null;
}
