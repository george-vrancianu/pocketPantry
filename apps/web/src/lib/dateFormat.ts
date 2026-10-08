/**
 * Dates as the Review screen shows and takes them: always day-first
 * (`dd.MM.yyyy`, or `dd.MM.yy` where space is tight) whatever the language,
 * because month-first dates are ambiguous for Romanian Members. State stays
 * ISO (`YYYY-MM-DD`).
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date in `YYYY-MM-DD` form. */
export function isIsoDate(text: string): boolean {
  const parts = ISO.exec(text);
  if (!parts) return false;
  const [year, month, day] = parts.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function dayFirst(iso: string, yearDigits: 2 | 4): string {
  if (!isIsoDate(iso)) return '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year.slice(4 - yearDigits)}`;
}

/** `2027-10-08` → `08.10.2027`; empty for anything that is not a date. */
export const formatDate = (iso: string) => dayFirst(iso, 4);

/** `2027-10-08` → `08.10.27`; empty for anything that is not a date. */
export const formatShortDate = (iso: string) => dayFirst(iso, 2);

/** Keep up to 8 digits and put the dots in as the Member types: `081020` → `08.10.20`. */
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter((part) => part !== '')
    .join('.');
}

/** A complete `dd.MM.yyyy` that is a real date, as ISO; otherwise null. */
export function parseDateInput(text: string): string | null {
  const parts = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
  if (!parts) return null;
  const iso = `${parts[3]}-${parts[2]}-${parts[1]}`;
  return isIsoDate(iso) ? iso : null;
}
