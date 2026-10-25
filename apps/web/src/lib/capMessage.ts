import type { TFunction } from 'i18next';
import { dateLocale } from './pantry';

/**
 * A daily cap message that names when the cap lifts: the API sends the next UTC midnight as
 * `resetsAt`, shown here in the Member's own time. A missing or unreadable one says "tomorrow",
 * and a missing count leaves the number out. `prefix` is the i18n key prefix holding
 * `cap_reached`, `cap_reached_no_time` and `cap_reached_unknown` (e.g. `errors:link`).
 */
export function capMessage(
  t: TFunction,
  language: string,
  params: Record<string, unknown>,
  prefix: string,
): string {
  const cap = Number(params.cap);
  const count = Number.isInteger(cap) && cap > 0 ? cap : undefined;
  const resetsAt = Date.parse(
    typeof params.resetsAt === 'string' ? params.resetsAt : '',
  );
  if (count === undefined) return t(`${prefix}.cap_reached_unknown`);
  if (Number.isNaN(resetsAt)) {
    return t(`${prefix}.cap_reached_no_time`, { count });
  }
  const when = new Intl.DateTimeFormat(dateLocale(language), {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(resetsAt);
  return t(`${prefix}.cap_reached`, { count, when });
}
