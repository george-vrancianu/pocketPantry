import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { popularToStartIds } from '../src/catalog/popular-to-start';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { storeLanguages } from './support/stored-language';

describe('Popular to start (integration)', () => {
  let app: NestFastifyApplication;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp() {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.8.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({
        name: 'Popular',
        email: `popular-${Date.now()}-${++counter}@example.com`,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const popular = (cookie: string, query = '') =>
    request(app.getHttpServer())
      .get(`/api/catalog/popular-to-start${query}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  type Body = { ingredients: { id: string; name: string }[] };

  it("lists the locale's fixed Ingredients in order, with names in the Catalog Language", async () => {
    const cookie = await signUp();
    await storeLanguages(app, cookie, { catalogLanguage: 'ro' });

    const body = (await popular(cookie, '?locale=ro').expect(200)).body as Body;

    expect(body.ingredients.map((i) => i.id)).toEqual(popularToStartIds('ro'));
    expect(body.ingredients[0].name).toBe('Lapte');
  });

  it('defaults to the English list', async () => {
    const cookie = await signUp();

    const body = (await popular(cookie).expect(200)).body as Body;

    expect(body.ingredients.map((i) => i.id)).toEqual(popularToStartIds('en'));
    expect(body.ingredients[0].name).toBe('Milk');
  });

  it('rejects an unknown locale', async () => {
    const cookie = await signUp();
    await popular(cookie, '?locale=xx').expect(400);
  });

  it('requires a signed-in Member', async () => {
    await request(app.getHttpServer())
      .get('/api/catalog/popular-to-start')
      .set('origin', TEST_ORIGIN)
      .expect(401);
  });
});
