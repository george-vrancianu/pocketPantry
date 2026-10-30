import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
// Not imported from create-test-app or admin-session: that would load AppModule before the limits are set.
const TEST_ORIGIN = 'http://localhost:5173';

const USER_LIMIT = 3;
const IP_LIMIT = 5;

describe('Promo Code redemption rate limit (integration)', () => {
  let app: NestFastifyApplication;
  const saved = {
    user: process.env.PROMO_CODE_LIMIT_PER_USER,
    ip: process.env.PROMO_CODE_LIMIT_PER_IP,
  };

  beforeAll(async () => {
    process.env.PROMO_CODE_LIMIT_PER_USER = String(USER_LIMIT);
    process.env.PROMO_CODE_LIMIT_PER_IP = String(IP_LIMIT);
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

  it('blocks a Member after too many failed attempts, then the IP across Members', async () => {
    const stamp = Date.now();
    const guess = async (n: number) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('origin', TEST_ORIGIN)
        .set('x-forwarded-for', `10.8.${n}.${Math.floor(Math.random() * 250)}`)
        .send({
          name: 'Guesser',
          email: `promo-rl-${stamp}-${randomUUID()}@example.com`,
          password: 'correct-horse-battery-staple',
        })
        .expect(200);
      const cookie = [res.headers['set-cookie'] ?? []]
        .flat()
        .map((c) => c.split(';')[0])
        .join('; ');
      return {
        post: (path: string, body: object) =>
          request(app.getHttpServer())
            .post(`/api/credits${path}`)
            .set('origin', TEST_ORIGIN)
            .set('cookie', cookie)
            .send(body),
      };
    };
    const first = await guess(1);
    for (let i = 0; i < USER_LIMIT; i++) {
      await first.post('/promo-code', { code: 'ZZZZZ-ZZZZZ' }).expect(404);
    }
    const blocked = await first
      .post('/promo-code', { code: 'ZZZZZ-ZZZZZ' })
      .expect(429);
    expect((blocked.body as { code: string }).code).toBe(
      'promo_code.rate_limited',
    );
    expect(blocked.headers['retry-after']).toBeDefined();

    // The IP has used USER_LIMIT of IP_LIMIT; a second Member gets the rest.
    const second = await guess(2);
    for (let i = 0; i < IP_LIMIT - USER_LIMIT; i++) {
      await second.post('/promo-code', { code: 'ZZZZZ-ZZZZZ' }).expect(404);
    }
    await second.post('/promo-code', { code: 'ZZZZZ-ZZZZZ' }).expect(429);
  });
});
