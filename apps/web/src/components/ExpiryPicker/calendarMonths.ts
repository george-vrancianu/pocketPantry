import { localIso } from '../../lib/pantry';

export type CalendarMonth = {
  /** `YYYY-MM`. */
  key: string;
  /** The 1st of the month, local midnight, for formatting its name. */
  first: Date;
  /** Monday-first weeks of `YYYY-MM-DD` days; `null` pads the first and last week. */
  weeks: (string | null)[][];
};

/** `YYYY-MM` of a `YYYY-MM-DD` date. */
export const monthKey = (iso: string) => iso.slice(0, 7);

function weeksOf(year: number, monthIndex: number): (string | null)[][] {
  const first = new Date(year, monthIndex, 1);
  // Weeks start on Monday in every locale.
  const lead = (first.getDay() + 6) % 7;
  const length = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= length; day += 1)
    cells.push(localIso(new Date(year, monthIndex, day)));
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) =>
    cells.slice(row * 7, row * 7 + 7),
  );
}

/**
 * The calendar's months: one month before `today` through twelve after, extended to the value's month when the
 * value is later.
 */
export function calendarMonths(
  today: Date,
  value: string | null,
): CalendarMonth[] {
  const twelveAhead = monthKey(
    localIso(new Date(today.getFullYear(), today.getMonth() + 12, 1)),
  );
  const last =
    value !== null && monthKey(value) > twelveAhead
      ? monthKey(value)
      : twelveAhead;
  const months: CalendarMonth[] = [];
  for (let offset = -1; ; offset += 1) {
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const key = monthKey(localIso(first));
    if (key > last) return months;
    months.push({
      key,
      first,
      weeks: weeksOf(first.getFullYear(), first.getMonth()),
    });
  }
}
