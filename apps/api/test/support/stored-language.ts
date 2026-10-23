import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { TEST_ORIGIN } from './create-test-app';

type StoredLanguages = {
  locale?: string;
  catalogLanguage?: string | null;
  scanLanguage?: string | null;
  spokenLanguage?: string | null;
};

/**
 * Saves a signed-in Member's language Preferences through the real endpoint.
 * A signed-in request's `?locale=` no longer picks a language (ADR 0022), so a
 * test that wants Danish or Romanian names stores that Preference first.
 */
export async function storeLanguages(
  app: NestFastifyApplication,
  cookie: string,
  languages: StoredLanguages,
): Promise<void> {
  await request(app.getHttpServer())
    .put('/api/settings/preferences')
    .set('origin', TEST_ORIGIN)
    .set('cookie', cookie)
    .send(languages)
    .expect(200);
}

/** Shorthand for the UI Language, which the other roles fall back to. */
export const storeUiLanguage = (
  app: NestFastifyApplication,
  cookie: string,
  locale: string,
) => storeLanguages(app, cookie, { locale });
