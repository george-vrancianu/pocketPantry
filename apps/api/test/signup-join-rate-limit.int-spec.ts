import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  familyToJoin,
  footprint,
  rawSignUp,
} from './support/signup-spec-helpers';

// AppModule validates env at import time, so the limit is set before it is loaded.
const IP_LIMIT = 3;

describe('Invite Code signup rate limit (integration)', () => {
  let app: NestFastifyApplication;
  const saved = process.env.INVITE_CODE_LIMIT_PER_IP;
  beforeAll(async () => {
    process.env.INVITE_CODE_LIMIT_PER_IP = String(IP_LIMIT);
    const modulePath = './support/create-test-app';
    const { createTestApp } = (await import(
      modulePath
    )) as typeof import('./support/create-test-app');
    app = await createTestApp();
  });
  afterAll(async () => {
    process.env.INVITE_CODE_LIMIT_PER_IP = saved;
    await app.close();
  });

  it('blocks an IP after too many failed Invite Codes, and good ones do not spend the budget', async () => {
    const target = await familyToJoin(app);
    for (let i = 0; i < IP_LIMIT + 1; i++) {
      const ok = await rawSignUp(app, { joinInviteCode: target.inviteCode });
      expect(ok.res.status).toBe(200);
    }
    for (let i = 0; i < IP_LIMIT; i++) {
      const { res } = await rawSignUp(app, { joinInviteCode: 'ZZZZZZZZ' });
      expect(res.status).toBe(404);
    }
    const blocked = await rawSignUp(app, { joinInviteCode: 'ZZZZZZZZ' });
    expect(blocked.res.status).toBe(429);
    expect(Number(blocked.res.headers['retry-after'])).toBeGreaterThan(0);
    expect(blocked.res.body).toEqual({
      code: 'family.rate_limited',
      params: {},
    });
    expect((await footprint(app, blocked.email)).member).toBeUndefined();
    // A plain signup is not limited.
    expect((await rawSignUp(app)).res.status).toBe(200);
  });
});
