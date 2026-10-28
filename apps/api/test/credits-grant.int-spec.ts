import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { runGrant } from '../src/credits/grant/run-grant';
import type { Database } from '../src/database/database.types';
import * as schema from '../src/database/schema';
import { creditEntry, family } from '../src/database/schema';

describe('Credit Grant by hand (integration)', () => {
  let pool: pg.Pool;
  let db: Database;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  });
  afterAll(async () => {
    await pool.end();
  });

  async function newFamily(): Promise<string> {
    const [row] = await db
      .insert(family)
      .values({
        inviteCode: `grant-${randomUUID()}`,
        inviteCodeExpiresAt: new Date(Date.now() + 86_400_000),
      })
      .returning({ id: family.id });
    return row.id;
  }
  const entries = (familyId: string) =>
    db.select().from(creditEntry).where(eq(creditEntry.familyId, familyId));
  const grant = (family: string, amount: string, reason: string) =>
    runGrant(['--family', family, '--amount', amount, '--reason', reason], db);

  it('raises the Credit Balance and keeps the reason on a grant entry', async () => {
    const id = await newFamily();
    const result = await grant(id, '50', 'Beta tester');
    expect(result.code).toBe(0);
    expect(result.message).toContain('New Credit Balance: 50');
    const rows = await entries(id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: 'grant',
      reason: 'Beta tester',
      amount: 50,
      memberId: null,
    });
    expect((await grant(id, '25', 'More')).message).toContain(
      'New Credit Balance: 75',
    );
  });

  it('refuses an unknown Family and writes nothing', async () => {
    const unknown = randomUUID();
    const result = await grant(unknown, '50', 'x');
    expect(result.code).toBe(1);
    expect(result.message).toMatch(/No Family/);
    expect(await entries(unknown)).toHaveLength(0);
  });

  it.each([
    ['0', 'why'],
    ['-5', 'why'],
    ['1.5', 'why'],
    ['abc', 'why'],
    ['50', ''],
    ['50', '   '],
  ])(
    'refuses amount %j with reason %j and writes nothing',
    async (amount, reason) => {
      const id = await newFamily();
      const result = await grant(id, amount, reason);
      expect(result.code).toBe(1);
      expect(await entries(id)).toHaveLength(0);
    },
  );

  it('refuses a missing reason flag', async () => {
    const id = await newFamily();
    const result = await runGrant(['--family', id, '--amount', '5'], db);
    expect(result.code).toBe(1);
    expect(await entries(id)).toHaveLength(0);
  });
});
