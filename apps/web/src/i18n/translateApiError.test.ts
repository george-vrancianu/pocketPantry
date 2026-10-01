import { describe, expect, it } from 'vitest';
import { ApiError } from '../lib/api';
import { createI18n } from './index';
import { translateApiError } from './translateApiError';

describe('translateApiError', () => {
  it('translates a namespaced API error code', () => {
    const i18n = createI18n('en');
    const error = new ApiError('auth.invalid_email_or_password', 401);
    expect(translateApiError(i18n.t, error)).toBe('Wrong email or password.');
  });

  it('follows the active locale', async () => {
    const i18n = createI18n('ro');
    const error = new ApiError('auth.invalid_email_or_password', 401);
    expect(translateApiError(i18n.t, error)).toBe('E-mail sau parolă greșită.');
  });

  it('translates top-level codes and client-side network errors', () => {
    const i18n = createI18n('en');
    expect(translateApiError(i18n.t, new ApiError('not_found', 404))).toBe(
      'We could not find that.',
    );
    expect(translateApiError(i18n.t, new ApiError('network_error', 0))).toMatch(
      /could not reach the server/,
    );
  });

  it('falls back to a generic message for codes with no copy', () => {
    const i18n = createI18n('en');
    const error = new ApiError('auth.something_new', 400);
    expect(translateApiError(i18n.t, error)).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('falls back to a generic message for non-API errors', () => {
    const i18n = createI18n('ro');
    expect(translateApiError(i18n.t, new Error('boom'))).toBe(
      'Ceva nu a mers bine. Încearcă din nou.',
    );
  });
});
