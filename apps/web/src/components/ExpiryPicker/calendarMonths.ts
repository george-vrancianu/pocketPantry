import { fromIso, localIso } from '../../lib/pantry';

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

/** How many days a month has; `monthIndex` is 0-based. */
export const daysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

function weeksOf(year: number, monthIndex: number): (string | null)[][] {
  const first = new Date(year, monthIndex, 1);
  // Weeks start on Monday in every locale.
  const lead = (first.getDay() + 6) % 7;
  const length = daysInMonth(year, monthIndex);
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
 * value is earlier or later.
 */
export function calendarMonths(
  today: Date,
  value: string | null,
): CalendarMonth[] {
  const oneBefore = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twelveAhead = monthKey(
    localIso(new Date(today.getFullYear(), today.getMonth() + 12, 1)),
  );
  const valueMonth = value === null ? null : monthKey(value);
  const start =
    valueMonth !== null && valueMonth < monthKey(localIso(oneBefore))
      ? fromIso(`${valueMonth}-01`)
      : oneBefore;
  const last =
    valueMonth !== null && valueMonth > twelveAhead ? valueMonth : twelveAhead;
  const months: CalendarMonth[] = [];
  for (let offset = 0; ; offset += 1) {
    const first = new Date(start.getFullYear(), start.getMonth() + offset, 1);
    const key = monthKey(localIso(first));
    if (key > last) return months;
    months.push({
      key,
      first,
      weeks: weeksOf(first.getFullYear(), first.getMonth()),
    });
  }
}
