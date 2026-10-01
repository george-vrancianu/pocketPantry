import type { TFunction } from 'i18next';
import { ApiError } from '../lib/api';

/**
 * Map an API error code to localised copy. Codes are dotted (`auth.invalid_email_or_password`)
 * and resolve against the nested `errors` namespace. English is the fallback locale;
 * unknown codes get the generic message.
 */
export function translateApiError(t: TFunction, error: unknown): string {
  const fallback = t('errors:unknown');
  if (!(error instanceof ApiError)) return fallback;
  return t(`errors:${error.code}`, { ...error.params, defaultValue: fallback });
}
