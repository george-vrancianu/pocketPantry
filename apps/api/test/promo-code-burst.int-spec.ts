import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
// Not imported statically from create-test-app or admin-session: that would load AppModule before the limits are set.
const TEST_ORIGIN = 'http://localhost:5173';
const USER_LIMIT = 3;

/** Its own file, so its app (and the limiter's in-memory windows, and the socket IP's budget) is fresh. */
describe('Promo Code rate limit under a burst (integration)', () => {
  let app: NestFastifyApplication;
  const saved = {
    user: process.env.PROMO_CODE_LIMIT_PER_USER,
    ip: process.env.PROMO_CODE_LIMIT_PER_IP,
  };

  beforeAll(async () => {
    process.env.PROMO_CODE_LIMIT_PER_USER = String(USER_LIMIT);
    process.env.PROMO_CODE_LIMIT_PER_IP = '1000';
    const modulePath = './support/create-test-app';
    const { createTestApp } = (await import(
      modulePath
    )) as typeof import('./support/create-test-app');
    app = await createTestApp();
  });
  afterAll(async () => {
    process.env.PROMO_CODE_LIMIT_PER_USER = saved.user;
    process.env.PROMO_CODE_LIMIT_PER_IP = saved.ip;
    await app.close();
  });

  async function signUp(label: string) {
    const email = `promo-burst-${label}-${randomUUID()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.8.${Math.floor(Math.random() * 250)}.7`)
      .send({ name: label, email, password: 'correct-horse-battery-staple' })
      .expect(200);
    const cookie = [res.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie, email };
  }
  const post = (cookie: string, code: string) =>
    request(app.getHttpServer())
      .post('/api/credits/promo-code')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send({ code });

  it('lets exactly the Member limit of parallel guesses through', async () => {
    const { cookie } = await signUp('burst');
    const burst = await Promise.all(
      Array.from({ length: 10 }, () => post(cookie, 'YYYYY-YYYYY')),
    );
    expect(burst.filter((r) => r.status === 404)).toHaveLength(USER_LIMIT);
    expect(burst.filter((r) => r.status === 429)).toHaveLength(10 - USER_LIMIT);
  });

  it('does not charge successful redemptions to the budget', async () => {
    const modulePaths = [
      './support/admin-session',
      './support/promote-to-admin',
    ];
    const { client } = (await import(
      modulePaths[0]
    )) as typeof import('./support/admin-session');
    const { promoteToAdmin } = (await import(
      modulePaths[1]
    )) as typeof import('./support/promote-to-admin');
    const admin = await signUp('admin');
    await promoteToAdmin(app.get<Database>(DATABASE), admin.email);
    const minted = (
      await client(app, admin.cookie, '/api/admin/promo-codes')
        .post('', { count: USER_LIMIT + 2, credits: 1 })
        .expect(201)
    ).body as { codes: string[] };
    const { cookie } = await signUp('redeemer');
    for (const code of minted.codes) await post(cookie, code).expect(200);
    for (let i = 0; i < USER_LIMIT; i++) {
      await post(cookie, 'ZZZZZ-ZZZZZ').expect(404);
    }
    await post(cookie, 'ZZZZZ-ZZZZZ').expect(429);
  });
});
