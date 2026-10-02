import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
// Not imported from create-test-app: that would load AppModule before the limits are set.
const TEST_ORIGIN = 'http://localhost:5173';

const USER_LIMIT = 3;
const IP_LIMIT = 5;

describe('Invite Code redemption rate limit (integration)', () => {
  let app: NestFastifyApplication;
  const saved = {
    user: process.env.INVITE_CODE_LIMIT_PER_USER,
    ip: process.env.INVITE_CODE_LIMIT_PER_IP,
  };

  beforeAll(async () => {
    // Other suites run with the limits out of the way; lower them for this one.
    // AppModule reads env when first imported, so import it only now.
    process.env.INVITE_CODE_LIMIT_PER_USER = String(USER_LIMIT);
    process.env.INVITE_CODE_LIMIT_PER_IP = String(IP_LIMIT);
    const modulePath = './support/create-test-app'; // a variable: TS demands a .js extension on literal dynamic imports, Jest resolves the .ts
    const { createTestApp } = (await import(
      modulePath
    )) as typeof import('./support/create-test-app');
    app = await createTestApp();
  });

  afterAll(async () => {
    process.env.INVITE_CODE_LIMIT_PER_USER = saved.user;
    process.env.INVITE_CODE_LIMIT_PER_IP = saved.ip;
    await app.close();
  });

  async function signUp(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      )
      .send({
        name: 'Guesser',
        email: `rate-limit-${randomUUID()}@example.com`,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const preview = (cookie: string) =>
    request(app.getHttpServer())
      .get('/api/family/join-preview?code=ZZZZZZZZ')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);
  const join = (cookie: string) =>
    request(app.getHttpServer())
      .post('/api/family/join')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send({ code: 'ZZZZZZZZ' });

  // Both tests share one app and one IP (supertest's loopback), so the IP
  // budget carries over. Requests blocked by the per-user limit do not charge
  // the IP: the first test spends 3 of 5, the second the remaining 2.
  it('gives each user one budget shared by both routes, without touching others', async () => {
    const guesser = await signUp();
    await preview(guesser).expect(404);
    await join(guesser).expect(404);
    await preview(guesser).expect(404);
    const blocked = await join(guesser).expect(429);
    expect(blocked.body).toEqual({ code: 'family.rate_limited', params: {} });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    await preview(guesser).expect(429);
  });

  it('blocks an IP past the per-IP limit across users', async () => {
    const other = await signUp();
    await preview(other).expect(404);
    await join(other).expect(404);
    const third = await signUp();
    const res = await preview(third).expect(429);
    expect(res.body).toEqual({ code: 'family.rate_limited', params: {} });
  });
});
