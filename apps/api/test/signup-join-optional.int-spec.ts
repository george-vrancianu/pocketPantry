import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { creditEntry, family } from '../src/database/schema';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import {
  familyCount,
  familyToJoin,
  footprint,
  membersOf,
  newPromoCode,
  promoRow,
  rawSignUp,
  sessionCookie,
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

  it("links only the joiner's own code and entry, never other Members' in that Family", async () => {
    const db = app.get<Database>(DATABASE);
    const ownerCode = await newPromoCode(app, 40);
    const { email: ownerEmail } = await rawSignUp(app, {
      promoCode: ownerCode,
    });
    const owner = await footprint(app, ownerEmail);
    const familyId = owner.member.familyId;
    // The entry of a Member who was deleted since: no Member to name.
    await db.insert(creditEntry).values({
      familyId,
      kind: 'promo_code',
      amount: 7,
    });
    const code = await newPromoCode(app, 25);
    const { res, email } = await rawSignUp(app, {
      joinInviteCode: owner.families[0].inviteCode,
      promoCode: code,
    });
    expect(res.status).toBe(200);
    const joiner = (await footprint(app, email)).member;
    expect((await promoRow(app, ownerCode)).redeemedBy).toBe(owner.member.id);
    expect((await promoRow(app, code)).redeemedBy).toBe(joiner.id);
    const promoEntries = (await footprint(app, email)).entries.filter(
      (e) => e.kind === 'promo_code',
    );
    const by = (amount: number) =>
      promoEntries.find((e) => e.amount === amount)?.memberId;
    expect(by(40)).toBe(owner.member.id);
    expect(by(7)).toBeNull();
    expect(by(25)).toBe(joiner.id);
  });

  it("shows a joiner's Welcome Grant as a Welcome Grant in the history, with no reason text", async () => {
    const target = await familyToJoin(app);
    const { res } = await rawSignUp(app, {
      joinInviteCode: target.inviteCode,
    });
    const history = await request(app.getHttpServer())
      .get('/api/credits')
      .set('cookie', sessionCookie(res));
    expect(history.status).toBe(200);
    const grants = (
      history.body as { history: { kind: string; reason: string | null }[] }
    ).history.filter((e) => e.kind === 'welcome_grant' || e.kind === 'grant');
    expect(grants).toEqual([
      expect.objectContaining({ kind: 'welcome_grant', reason: null }),
      expect.objectContaining({ kind: 'welcome_grant', reason: null }),
    ]);
  });
});
