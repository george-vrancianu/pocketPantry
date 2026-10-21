import type { TFunction } from 'i18next';
import { ApiError } from '../lib/api';

/**
 * Map an API error code to localised copy. Codes are dotted (`auth.invalid_email_or_password`)
 * and resolve against the nested `errors` namespace. English is the fallback locale;
 * unknown codes get the generic message.
 */
export function translateApiError(t: TFunction, error: unknown): string {
  if (!(error instanceof ApiError)) return t('errors:unknown');
  return translateErrorCode(t, error.code, error.params);
}

/** The same for an error kept as its raw code and parameters. */
export function translateErrorCode(
  t: TFunction,
  code: string,
  params: Record<string, unknown>,
): string {
  return t(`errors:${code}`, {
    ...params,
    defaultValue: t('errors:unknown'),
  });
}
