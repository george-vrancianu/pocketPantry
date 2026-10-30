import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  familyCount,
  familyToJoin,
  footprint,
  membersOf,
  newPromoCode,
  promoRow,
  rawSignUp,
} from './support/signup-spec-helpers';

// AppModule validates env at import time, so the flag is set before it is loaded.
describe('Join a Family at signup, SIGNUP_REQUIRES_PROMO_CODE on (integration)', () => {
  let app: NestFastifyApplication;
  const saved = process.env.SIGNUP_REQUIRES_PROMO_CODE;
  beforeAll(async () => {
    process.env.SIGNUP_REQUIRES_PROMO_CODE = 'true';
    const modulePath = './support/create-test-app';
    const { createTestApp } = (await import(
      modulePath
    )) as typeof import('./support/create-test-app');
    app = await createTestApp();
  });
  afterAll(async () => {
    if (saved === undefined) delete process.env.SIGNUP_REQUIRES_PROMO_CODE;
    else process.env.SIGNUP_REQUIRES_PROMO_CODE = saved;
    await app.close();
  });

  async function owner() {
    const code = await newPromoCode(app, 10);
    const { res, email } = await rawSignUp(app, { promoCode: code });
    expect(res.status).toBe(200);
    const { families } = await footprint(app, email);
    return { familyId: families[0].id, inviteCode: families[0].inviteCode };
  }

  it('needs no Promo Code and gives no Welcome Grant', async () => {
    const target = await owner();
    const families = await familyCount(app);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: target.inviteCode,
    });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.familyId).toBe(target.familyId);
    expect(left.member?.familyRole).toBe('member');
    expect(left.member?.welcomeGrantAt).toBeNull();
    expect(left.entries.map((e) => e.kind)).toEqual(['promo_code']);
    expect(await familyCount(app)).toBe(families);
    expect((await membersOf(app, target.familyId)).length).toBe(2);
  });

  it('redeems a Promo Code sent anyway into the joined Family, naming the new Member', async () => {
    const target = await owner();
    const code = await newPromoCode(app, 40);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: target.inviteCode,
      promoCode: code,
    });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    const promos = left.entries.filter((e) => e.kind === 'promo_code');
    expect(promos.map((e) => e.amount).sort()).toEqual([10, 40]);
    expect(promos.find((e) => e.amount === 40)?.memberId).toBe(left.member?.id);
    expect((await promoRow(app, code)).redeemedByEmail).toBe(email);
  });

  it('refuses a wrong Invite Code even with a valid Promo Code, leaving the code unspent', async () => {
    await familyToJoin(app).catch(() => undefined);
    const code = await newPromoCode(app, 40);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: 'ZZZZZZZZ',
      promoCode: code,
    });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      code: 'family.invite_code_invalid',
      params: {},
    });
    expect((await footprint(app, email)).member).toBeUndefined();
    expect((await promoRow(app, code)).redeemedAt).toBeNull();
  });
});
