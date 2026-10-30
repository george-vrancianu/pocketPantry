import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import {
  familyCount,
  footprint,
  newPromoCode,
  promoRow,
  rawSignUp,
} from './support/signup-spec-helpers';

describe('Signup with SIGNUP_REQUIRES_PROMO_CODE off (integration)', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('reports that no Promo Code is required, without a session', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/signup-config')
      .expect(200);
    expect(res.body).toEqual({ promoCodeRequired: false });
  });

  it('gives the Welcome Grant when no code is sent', async () => {
    const { res, email } = await rawSignUp(app);
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.welcomeGrantAt).not.toBeNull();
    expect(left.entries.map((e) => [e.kind, e.amount])).toEqual([
      ['welcome_grant', 100],
    ]);
  });

  it('adds the code Credits on top of the Welcome Grant', async () => {
    const code = await newPromoCode(app, 25);
    const { res, email } = await rawSignUp(app, { promoCode: code });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.welcomeGrantAt).not.toBeNull();
    expect(left.entries.map((e) => [e.kind, e.amount]).sort()).toEqual([
      ['promo_code', 25],
      ['welcome_grant', 100],
    ]);
    expect((await promoRow(app, code)).redeemedByEmail).toBe(email);
  });

  it('treats an empty code as none', async () => {
    const { res } = await rawSignUp(app, { promoCode: '' });
    expect(res.status).toBe(200);
  });

  it('refuses the whole signup on a bad code, leaving no user, Family, grant or spent code', async () => {
    const revoked = await newPromoCode(app, 10, 'revoked');
    const used = await newPromoCode(app, 10);
    await rawSignUp(app, { promoCode: used });
    const cases: [string, number, string][] = [
      ['ZZZZZ-ZZZZZ', 404, 'promo_code.not_found'],
      [revoked, 409, 'promo_code.revoked'],
      [used, 409, 'promo_code.already_redeemed'],
      ['ABCDEFGH', 400, 'promo_code.is_invite_code'],
    ];
    for (const [promoCode, status, code] of cases) {
      const families = await familyCount(app);
      const { res, email } = await rawSignUp(app, { promoCode });
      expect(res.status).toBe(status);
      expect(res.body).toEqual({ code, params: {} });
      expect((await footprint(app, email)).member).toBeUndefined();
      expect(await familyCount(app)).toBe(families);
    }
    expect((await promoRow(app, revoked)).redeemedAt).toBeNull();
  });
});
