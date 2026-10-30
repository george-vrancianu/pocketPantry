import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { newPromoCode, rawSignUp } from './support/signup-spec-helpers';

// AppModule validates env at import time, so the limit is set before it is loaded.
const IP_LIMIT = 3;

describe('Promo Code signup rate limit (integration)', () => {
  let app: NestFastifyApplication;
  const saved = process.env.PROMO_CODE_LIMIT_PER_IP;
  beforeAll(async () => {
    process.env.PROMO_CODE_LIMIT_PER_IP = String(IP_LIMIT);
    const modulePath = './support/create-test-app';
    const { createTestApp } = (await import(
      modulePath
    )) as typeof import('./support/create-test-app');
    app = await createTestApp();
  });
  afterAll(async () => {
    process.env.PROMO_CODE_LIMIT_PER_IP = saved;
    await app.close();
  });

  it('blocks an IP after too many failed codes, and good codes do not spend the budget', async () => {
    // Successful signups first: they must not count.
    for (let i = 0; i < IP_LIMIT + 1; i++) {
      const code = await newPromoCode(app, 1);
      expect((await rawSignUp(app, { promoCode: code })).res.status).toBe(200);
    }
    for (let i = 0; i < IP_LIMIT; i++) {
      const { res } = await rawSignUp(app, { promoCode: 'ZZZZZ-ZZZZZ' });
      expect(res.status).toBe(404);
    }
    const blocked = await rawSignUp(app, { promoCode: 'ZZZZZ-ZZZZZ' });
    expect(blocked.res.status).toBe(429);
    expect(blocked.res.body).toEqual({
      code: 'promo_code.rate_limited',
      params: {},
    });
    // Even a valid code is refused while the IP is blocked; a signup without a code is not limited.
    const code = await newPromoCode(app, 1);
    expect((await rawSignUp(app, { promoCode: code })).res.status).toBe(429);
    expect((await rawSignUp(app)).res.status).toBe(200);
  });
});
