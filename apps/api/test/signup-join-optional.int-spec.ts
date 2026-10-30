import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { family } from '../src/database/schema';
import { createTestApp } from './support/create-test-app';
import {
  familyCount,
  familyToJoin,
  footprint,
  membersOf,
  newPromoCode,
  promoRow,
  rawSignUp,
} from './support/signup-spec-helpers';

describe('Join a Family at signup, SIGNUP_REQUIRES_PROMO_CODE off (integration)', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('puts the Member in that Family with no Household of One, and the Welcome Grant goes there', async () => {
    const target = await familyToJoin(app);
    const families = await familyCount(app);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: ` ${target.inviteCode.toLowerCase()} `,
    });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.familyId).toBe(target.familyId);
    expect(left.member?.familyRole).toBe('member');
    expect(left.member?.welcomeGrantAt).not.toBeNull();
    expect(await familyCount(app)).toBe(families);
    expect((await membersOf(app, target.familyId)).length).toBe(2);
    expect(left.entries.map((e) => [e.kind, e.amount]).sort()).toEqual([
      ['grant', 100],
      ['welcome_grant', 100],
    ]);
  });

  it('redeems a Promo Code sent with the join into the joined Family', async () => {
    const target = await familyToJoin(app);
    const code = await newPromoCode(app, 25);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: target.inviteCode,
      promoCode: code,
    });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.familyId).toBe(target.familyId);
    const promo = left.entries.find((e) => e.kind === 'promo_code');
    expect(promo?.amount).toBe(25);
    expect(promo?.memberId).toBe(left.member?.id);
    expect((await promoRow(app, code)).redeemedByEmail).toBe(email);
  });

  it('refuses a wrong, expired or Promo-Code-shaped code and writes nothing', async () => {
    const target = await familyToJoin(app);
    const expired = await familyToJoin(app);
    const db = app.get<Database>(DATABASE);
    await db
      .update(family)
      .set({ inviteCodeExpiresAt: new Date(Date.now() - 1000) })
      .where(eq(family.id, expired.familyId));
    const promo = await newPromoCode(app, 5);
    const cases: [string, number, string][] = [
      ['ZZZZZZZZ', 404, 'family.invite_code_invalid'],
      [expired.inviteCode, 410, 'family.invite_code_expired'],
      [promo, 400, 'family.invite_code_is_promo_code'],
    ];
    for (const [joinInviteCode, status, code] of cases) {
      const families = await familyCount(app);
      const { res, email } = await rawSignUp(app, { joinInviteCode });
      expect(res.status).toBe(status);
      expect(res.body).toEqual({ code, params: {} });
      expect((await footprint(app, email)).member).toBeUndefined();
      expect(await familyCount(app)).toBe(families);
    }
    expect((await membersOf(app, target.familyId)).length).toBe(1);
    expect((await promoRow(app, promo)).redeemedAt).toBeNull();
  });

  it('rolls back the join and Welcome Grant when a Promo Code sent with it is bad', async () => {
    const target = await familyToJoin(app);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: target.inviteCode,
      promoCode: 'ZZZZZ-ZZZZZ',
    });
    expect(res.status).toBe(404);
    expect((await footprint(app, email)).member).toBeUndefined();
    expect((await membersOf(app, target.familyId)).length).toBe(1);
    const left = await footprint(app, target.owner.email);
    expect(left.entries).toHaveLength(1);
  });
});
