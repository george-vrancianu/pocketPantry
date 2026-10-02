import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';
import type { Database } from '../src/database/database.types';
import { DATABASE } from '../src/database/database.constants';
import { family, user } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type FamilyBody = {
  id: string;
  inviteCode: string;
  inviteCodeExpiresAt: string;
  members: Array<{ id: string; name: string; isOwner: boolean }>;
  currentMemberIsOwner: boolean;
};

describe('Household of One and the Family (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  const password = 'correct-horse-battery-staple';
  let counter = 0;

  async function signUp(name: string) {
    const email = `family-${Date.now()}-${++counter}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      // Distinct client IP per call so sign-up rate limiting never couples tests.
      .set(
        'x-forwarded-for',
        `10.0.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({ name, email, password })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    const userId = (response.body as { user: { id: string } }).user.id;
    return { cookie, userId };
  }

  const getFamily = (cookie: string) =>
    request(app.getHttpServer())
      .get('/api/family')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const regenerate = (cookie: string) =>
    request(app.getHttpServer())
      .post('/api/family/invite-code/regenerate')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send({});

  it('creates a Household of One with the new Member as Owner at signup', async () => {
    const { cookie, userId } = await signUp('Ana');

    const body = (await getFamily(cookie).expect(200)).body as FamilyBody;
    expect(body.members).toEqual([{ id: userId, name: 'Ana', isOwner: true }]);
    expect(body.currentMemberIsOwner).toBe(true);
    expect(body.inviteCode).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);

    const days =
      (new Date(body.inviteCodeExpiresAt).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThanOrEqual(7);

    const [row] = await database.select().from(user).where(eq(user.id, userId));
    expect(row.familyId).toBe(body.id);
  });

  it('gives each Member their own Family', async () => {
    const a = await signUp('A');
    const b = await signUp('B');
    const familyA = (await getFamily(a.cookie).expect(200)).body as FamilyBody;
    const familyB = (await getFamily(b.cookie).expect(200)).body as FamilyBody;
    expect(familyA.id).not.toBe(familyB.id);
    expect(familyA.inviteCode).not.toBe(familyB.inviteCode);
  });

  it('lets the Owner regenerate the Invite Code, revoking the old one', async () => {
    const { cookie } = await signUp('Owner');
    const before = (await getFamily(cookie).expect(200)).body as FamilyBody;

    const after = (await regenerate(cookie).expect(201)).body as FamilyBody;
    expect(after.inviteCode).not.toBe(before.inviteCode);

    const stale = await database
      .select()
      .from(family)
      .where(eq(family.inviteCode, before.inviteCode));
    expect(stale).toHaveLength(0);
    const current = (await getFamily(cookie).expect(200)).body as FamilyBody;
    expect(current.inviteCode).toBe(after.inviteCode);
  });

  it('shows the code to a non-Owner but refuses to regenerate it', async () => {
    const owner = await signUp('Owner');
    const member = await signUp('Member');
    const ownerFamily = (await getFamily(owner.cookie).expect(200))
      .body as FamilyBody;

    // Redeeming is a later ticket; place the second Member in the Family directly.
    await database
      .update(user)
      .set({ familyId: ownerFamily.id, familyRole: 'member' })
      .where(eq(user.id, member.userId));

    const seen = (await getFamily(member.cookie).expect(200))
      .body as FamilyBody;
    expect(seen.inviteCode).toBe(ownerFamily.inviteCode);
    expect(seen.currentMemberIsOwner).toBe(false);
    expect(seen.members.map((m) => [m.name, m.isOwner])).toEqual([
      ['Owner', true],
      ['Member', false],
    ]);

    const denied = await regenerate(member.cookie).expect(403);
    expect(denied.body).toEqual({ code: 'family.owner_required', params: {} });
    const unchanged = (await getFamily(owner.cookie).expect(200))
      .body as FamilyBody;
    expect(unchanged.inviteCode).toBe(ownerFamily.inviteCode);
  });

  it('requires a session', async () => {
    await request(app.getHttpServer()).get('/api/family').expect(401);
    await request(app.getHttpServer())
      .post('/api/family/invite-code/regenerate')
      .send({})
      .expect(401);
  });

  it('has no nullable family reference: a Member cannot be left without a Family', async () => {
    const { userId } = await signUp('Solo');
    await expect(
      database.execute(
        sql`update "user" set family_id = null where id = ${userId}`,
      ),
    ).rejects.toThrow();
  });

  it('leaves no Family behind when the Member insert fails during sign-up', async () => {
    // Only Families created during this test count: earlier specs in this
    // worker may leave Families without Members.
    const startedAt = (
      (await database.execute(sql`select now() as t`)).rows[0] as { t: Date }
    ).t;
    const countNewOrphans = async () => {
      const result = await database.execute(
        sql`select count(*)::int as n from family
            where created_at >= ${startedAt}
              and id not in (select family_id from "user")`,
      );
      return (result.rows[0] as { n: number }).n;
    };
    const email = `doomed-${Date.now()}@example.com`;
    // Fails only the user insert (after the Family is created), for this email.
    await database.execute(sql`
      create or replace function pp_test_reject_user() returns trigger as $$
      begin
        if new.email like 'doomed-%' then raise exception 'forced user insert failure'; end if;
        return new;
      end $$ language plpgsql`);
    await database.execute(
      sql`drop trigger if exists pp_test_reject_user on "user"`,
    );
    await database.execute(
      sql`create trigger pp_test_reject_user before insert on "user" for each row execute function pp_test_reject_user()`,
    );
    try {
      const failed = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('origin', TEST_ORIGIN)
        .set('x-forwarded-for', '10.9.9.9')
        .send({ name: 'Doomed', email, password });
      expect(failed.status).toBe(422);
      expect(await countNewOrphans()).toBe(0);
    } finally {
      await database.execute(
        sql`drop trigger if exists pp_test_reject_user on "user"`,
      );
      await database.execute(
        sql`drop function if exists pp_test_reject_user()`,
      );
    }
  });
});
