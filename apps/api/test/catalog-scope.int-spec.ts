import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

describe('Catalog scope (integration)', () => {
  let app: NestFastifyApplication;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    const signUp = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .send({
        name: 'Scope Member',
        email: `catalog-scope-${Date.now()}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    cookie = [signUp.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
  });

  afterAll(async () => {
    await app.close();
  });

  const search = (query: Record<string, string>) =>
    request(app.getHttpServer())
      .get('/api/catalog/search')
      .query({ q: 'milk', ...query })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  it('searches the Family scope by default and the shared scope on request', async () => {
    const family = (await search({}).expect(200)).body as {
      results: unknown[];
    };
    const shared = (await search({ scope: 'shared' }).expect(200)).body as {
      results: unknown[];
    };
    expect(family.results.length).toBeGreaterThan(0);
    expect(shared.results).toEqual(family.results);
  });

  it('rejects an unknown scope', async () => {
    await search({ scope: 'everyone' }).expect(400);
  });
});
