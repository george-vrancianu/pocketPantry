import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createAuth } from '../src/auth/create-auth';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  familyCount,
  footprint,
  newPromoCode,
  promoRow,
  rawSignUp,
  sessionCookie,
} from './support/signup-spec-helpers';

// AppModule validates env at import time, so the flag is set before it is loaded.
const TEST_ORIGIN = 'http://localhost:5173';

describe('Signup with SIGNUP_REQUIRES_PROMO_CODE on (integration)', () => {
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

  /** A refused signup leaves no user, Family, Credit entry. */
  async function expectRefused(
    promoCode: string | undefined,
    status: number,
    code: string,
  ) {
    const families = await familyCount(app);
    const { res, email } = await rawSignUp(app, { promoCode });
    expect(res.status).toBe(status);
    expect(res.body).toEqual({ code, params: {} });
    const left = await footprint(app, email);
    expect(left.member).toBeUndefined();
    expect(await familyCount(app)).toBe(families);
  }

  it('reports that a Promo Code is required, without a session', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/signup-config')
      .expect(200);
    expect(res.body).toEqual({ promoCodeRequired: true });
  });

  it('starts the Family with the code Credits and no Welcome Grant', async () => {
    const code = await newPromoCode(app, 40);
    const { res, email } = await rawSignUp(app, { promoCode: code });
    expect(res.status).toBe(200);
    const left = await footprint(app, email);
    expect(left.member?.welcomeGrantAt).toBeNull();
    expect(left.member?.familyRole).toBe('owner');
    expect(left.entries.map((e) => [e.kind, e.amount])).toEqual([
      ['promo_code', 40],
    ]);
    const row = await promoRow(app, code);
    expect(row.redeemedFamilyId).toBe(left.member?.familyId);
    expect(row.redeemedByEmail).toBe(email);

    // The history does not call the redeemer a former Member.
    const history = await request(app.getHttpServer())
      .get('/api/credits')
      .set('origin', TEST_ORIGIN)
      .set('cookie', sessionCookie(res))
      .expect(200);
    expect(history.body).toMatchObject({
      balance: 40,
      history: [
        {
          kind: 'promo_code',
          amount: 40,
          memberName: 'New Member',
          formerMember: false,
        },
      ],
    });
  });

  it('accepts a code typed with spaces, lower case and no dash', async () => {
    const code = await newPromoCode(app, 5);
    const typed = ` ${code.slice(0, 5).toLowerCase()} ${code.slice(5)} `;
    const { res } = await rawSignUp(app, { promoCode: typed });
    expect(res.status).toBe(200);
  });

  it('refuses a missing code and leaves nothing behind', async () => {
    await expectRefused(undefined, 400, 'promo_code.required');
    await expectRefused('   ', 400, 'promo_code.required');
  });

  it('refuses an unknown code', async () => {
    await expectRefused('ZZZZZ-ZZZZZ', 404, 'promo_code.not_found');
  });

  it('refuses a revoked code and leaves it revoked', async () => {
    const code = await newPromoCode(app, 10, 'revoked');
    await expectRefused(code, 409, 'promo_code.revoked');
    const row = await promoRow(app, code);
    expect(row.redeemedAt).toBeNull();
    expect(row.revokedAt).not.toBeNull();
  });

  it('refuses a used code, and leaves the first redemption intact', async () => {
    const code = await newPromoCode(app, 10);
    const first = await rawSignUp(app, { promoCode: code });
    expect(first.res.status).toBe(200);
    await expectRefused(code, 409, 'promo_code.already_redeemed');
    const row = await promoRow(app, code);
    expect(row.redeemedByEmail).toBe(first.email);
  });

  it('rolls back a redemption that succeeded when the signup fails afterwards', async () => {
    const db = app.get<Database>(DATABASE);
    const failing = createAuth(db, {
      baseURL: 'http://localhost:3000',
      secret: 'test-secret-that-is-at-least-32-characters-long',
      clientOrigin: TEST_ORIGIN,
      signup: {
        requiresPromoCode: true,
        // Called right after the redemption succeeded.
        reserveIp: () => () => {
          throw new Error('boom');
        },
      },
    });
    const code = await newPromoCode(app, 10);
    const email = `rollback-${Date.now()}@example.com`;
    const families = await familyCount(app);
    // Held in a variable: `promoCode` is our own extra, unknown to Better Auth's body type.
    const body = {
      name: 'Nope',
      email,
      password: 'correct-horse-battery-staple',
      promoCode: code,
    };
    await expect(failing.api.signUpEmail({ body })).rejects.toBeDefined();
    const row = await promoRow(app, code);
    expect(row.redeemedAt).toBeNull();
    expect(row.redeemedFamilyId).toBeNull();
    expect((await footprint(app, email)).member).toBeUndefined();
    expect(await familyCount(app)).toBe(families);
  });

  it('refuses Invite-Code-shaped input', async () => {
    await expectRefused('ABCDEFGH', 400, 'promo_code.is_invite_code');
  });
});
