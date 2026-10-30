import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import type { CreditsView } from '../src/credits/credits.schemas';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { user } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';
import { waitForBlockedBackend } from './support/wait-for-blocked-backend';

jest.setTimeout(30_000);

describe('Redeeming a Promo Code (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  const stamp = Date.now();
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `redeem-admin-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Promo Admin');
    await promoteToAdmin(database, email);
    admin = client(app, cookie, '/api/admin/promo-codes');
  });
  afterAll(async () => {
    await app.close();
  });

  type Who = { cookie: string; id: string; email: string; name: string };
  async function newMember(name = 'Redeemer'): Promise<Who> {
    const email = `redeem-${stamp}-${++counter}@example.com`;
    const cookie = await signUp(app, email, name);
    const [row] = await database
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    return { cookie, id: row.id, email, name };
  }
  const credits = (who: Who) => client(app, who.cookie, '/api/credits');
  const redeem = (who: Who, code: string) =>
    credits(who).post('/promo-code', { code });
  const view = async (who: Who) =>
    (await credits(who).get('').expect(200)).body as CreditsView;
  async function makeCode(amount: number, note = `secret note ${stamp}`) {
    const body = { count: 1, credits: amount, note };
    const res = await admin.post('', body).expect(201);
    return (res.body as { codes: string[] }).codes[0];
  }

  it('adds the Credits to the Family of any Member, once, and returns the balance', async () => {
    const who = await newMember();
    const before = (await view(who)).balance;
    const code = await makeCode(40);
    const res = await redeem(who, code).expect(200);
    expect(res.body).toEqual({ balance: before + 40, credits: 40 });
    expect((await view(who)).balance).toBe(before + 40);
    const second = await newMember();
    const again = await redeem(second, code).expect(409);
    expect((again.body as { code: string }).code).toBe(
      'promo_code.already_redeemed',
    );
  });

  it('works for a non-Owner Member of a shared Family', async () => {
    const owner = await newMember('Owner');
    const joiner = await newMember('Joiner');
    const invite = (
      (await client(app, owner.cookie, '/api/family').get('').expect(200))
        .body as { inviteCode: string }
    ).inviteCode;
    await client(app, joiner.cookie, '/api/family')
      .post('/join', { code: invite })
      .expect(201);
    const before = (await view(owner)).balance;
    await redeem(joiner, await makeCode(7)).expect(200);
    expect((await view(owner)).balance).toBe(before + 7);
  });

  it('accepts a typed code with lower case, spaces and no dash', async () => {
    const who = await newMember();
    const code = await makeCode(3);
    await redeem(who, ` ${code.replace('-', ' ').toLowerCase()} `).expect(200);
  });

  it('rejects unknown, revoked and Invite Code shaped input', async () => {
    const who = await newMember();
    const code = (r: { body: unknown }) => (r.body as { code: string }).code;
    expect(code(await redeem(who, 'ZZZZZ-ZZZZZ').expect(404))).toBe(
      'promo_code.not_found',
    );
    const revokedCode = await makeCode(5);
    const list = (await admin.get('?limit=100').expect(200)).body as {
      entries: { id: string; code: string }[];
    };
    const id = list.entries.find((e) => e.code === revokedCode)!.id;
    await admin.post(`/${id}/revoke`).expect(200);
    expect(code(await redeem(who, revokedCode).expect(409))).toBe(
      'promo_code.revoked',
    );
    expect(code(await redeem(who, 'abcd-efgh').expect(400))).toBe(
      'promo_code.is_invite_code',
    );
  });

  it('writes a history entry for a 0-Credit code', async () => {
    const who = await newMember();
    const before = (await view(who)).balance;
    await redeem(who, await makeCode(0)).expect(200);
    const after = await view(who);
    expect(after.balance).toBe(before);
    expect(after.history[0]).toMatchObject({ kind: 'promo_code', amount: 0 });
  });

  it('shows the redemption in the history with the Member but never the code or the note', async () => {
    const who = await newMember('Ana Redeemer');
    const code = await makeCode(12, `private note ${stamp}`);
    await redeem(who, code).expect(200);
    const { history } = await view(who);
    expect(history[0]).toMatchObject({
      kind: 'promo_code',
      amount: 12,
      memberName: 'Ana Redeemer',
    });
    const text = JSON.stringify(history);
    expect(text).not.toContain(code.replace('-', ''));
    expect(text).not.toContain('private note');
  });

  it('shows a redemption by a Member who has left as a former Member', async () => {
    const owner = await newMember('Owner');
    const leaver = await newMember('Leaver');
    const invite = (
      (await client(app, owner.cookie, '/api/family').get('').expect(200))
        .body as { inviteCode: string }
    ).inviteCode;
    const familyApi = client(app, leaver.cookie, '/api/family');
    await familyApi.post('/join', { code: invite }).expect(201);
    await redeem(leaver, await makeCode(6)).expect(200);
    await familyApi.post('/leave').expect(200);
    expect((await view(owner)).history[0]).toMatchObject({
      kind: 'promo_code',
      amount: 6,
      memberName: null,
      formerMember: true,
    });
  });

  it('shows the redemption on the Admin list', async () => {
    const who = await newMember('Listed Redeemer');
    const code = await makeCode(2);
    await redeem(who, code).expect(200);
    const list = (await admin.get('?limit=100').expect(200)).body as {
      entries: {
        code: string;
        status: string;
        redeemedByName: string;
        redeemedByEmail: string;
      }[];
    };
    expect(list.entries.find((e) => e.code === code)).toMatchObject({
      status: 'redeemed',
      redeemedByName: 'Listed Redeemer',
      redeemedByEmail: who.email,
    });
    const familyId = (
      (await client(app, who.cookie, '/api/family').get('').expect(200))
        .body as { id: string }
    ).id;
    expect(
      (
        (await admin.get('?limit=100').expect(200)).body as {
          entries: { code: string; redeemedFamilyId: string }[];
        }
      ).entries.find((e) => e.code === code)?.redeemedFamilyId,
    ).toBe(familyId);
  });

  it('reports the Credits the code added, whatever the balance does meanwhile', async () => {
    const who = await newMember();
    const res = await redeem(who, await makeCode(0)).expect(200);
    expect((res.body as { credits: number }).credits).toBe(0);
  });

  it('lets exactly one of two concurrent redemptions win', async () => {
    const a = await newMember();
    const b = await newMember();
    const code = await makeCode(9);
    const results = await Promise.all([redeem(a, code), redeem(b, code)]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const balances = await Promise.all([view(a), view(b)]);
    const gained = balances.filter((v) =>
      v.history.some((h) => h.kind === 'promo_code' && h.amount === 9),
    );
    expect(gained).toHaveLength(1);
  });

  it('credits the Family a Member joined while their redemption waited for the lock', async () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const owner = await newMember('Owner');
      const joiner = await newMember('Joiner');
      const familyOf = async (id: string) =>
        (
          await pool.query<{ family_id: string }>(
            'SELECT family_id FROM "user" WHERE id = $1',
            [id],
          )
        ).rows[0].family_id;
      const [target, old] = [
        await familyOf(owner.id),
        await familyOf(joiner.id),
      ];
      const code = await makeCode(31);
      const ownerBefore = (await view(owner)).balance;
      const holder = await pool.connect();
      try {
        // Hold the credits lock of the joiner's Household of One, start the redemption, and move
        // the Member while it waits: the Credits must land in the Family they are in by then.
        await holder.query('BEGIN');
        const { rows } = await holder.query<{ pid: number }>(
          'SELECT pg_backend_pid() AS pid',
        );
        await holder.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
          [`credits:${old}`],
        );
        const outcome = redeem(joiner, code).then((r) => r.status);
        await waitForBlockedBackend(pool, rows[0].pid);
        await holder.query(
          'UPDATE "user" SET family_id = $1, family_role = \'member\' WHERE id = $2',
          [target, joiner.id],
        );
        await holder.query('COMMIT');
        expect(await outcome).toBe(200);
      } finally {
        await holder.query('ROLLBACK').catch(() => undefined);
        holder.release();
      }
      expect((await view(owner)).balance).toBe(ownerBefore + 31);
    } finally {
      await pool.end();
    }
  });
});
