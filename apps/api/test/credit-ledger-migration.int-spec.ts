import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Migration 0047 adds the Credit ledger and ends with the rollout: one Welcome Grant for every existing
// Family, attributed to its Owner, and every existing Member marked as having received theirs. The test
// plays those steps inside a transaction that is rolled back.
const rollout = readFileSync(
  resolve(process.cwd(), 'drizzle/0047_credit_ledger_welcome_grant.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '')
  .slice(-2);

const ids = {
  family: '00000000-0000-4000-8000-000000004701',
  granted: '00000000-0000-4000-8000-000000004702',
};

describe('Migration 0047: Credit ledger rollout (integration)', () => {
  let client: pg.Client;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  });
  afterAll(async () => {
    await client.end();
  });
  beforeEach(() => client.query('BEGIN'));
  afterEach(() => client.query('ROLLBACK'));

  const makeFamily = (id: string, code: string) =>
    client.query(
      `insert into family (id, invite_code, invite_code_expires_at) values ($1, $2, now())`,
      [id, code],
    );
  const makeMember = (id: string, familyId: string, role: string) =>
    client.query(
      `insert into "user" (id, name, email, family_id, family_role) values ($1, $1, $2, $3, $4)`,
      [id, `${id}@example.com`, familyId, role],
    );
  const runRollout = async () => {
    for (const statement of rollout) await client.query(statement);
  };
  const entries = async (familyId: string) =>
    (
      await client.query<{ member_id: string | null; amount: number }>(
        `select member_id, amount from credit_entry where family_id = $1 and kind = 'welcome_grant'`,
        [familyId],
      )
    ).rows;
  const marked = async (memberId: string) =>
    (
      await client.query<{ welcome_grant_at: Date | null }>(
        'select welcome_grant_at from "user" where id = $1',
        [memberId],
      )
    ).rows[0].welcome_grant_at !== null;

  it('gives each existing Family 100 attributed to its Owner and marks every Member, and running it again changes nothing', async () => {
    await makeFamily(ids.family, 'MIG0047A');
    await makeMember('mig-0047-owner', ids.family, 'owner');
    await makeMember('mig-0047-member', ids.family, 'member');

    await runRollout();
    await runRollout();

    expect(await entries(ids.family)).toEqual([
      { member_id: 'mig-0047-owner', amount: 100 },
    ]);
    expect(await marked('mig-0047-owner')).toBe(true);
    expect(await marked('mig-0047-member')).toBe(true);
  });

  it('does not double a Family that already has its Welcome Grant', async () => {
    await makeFamily(ids.granted, 'MIG0047B');
    await makeMember('mig-0047-granted', ids.granted, 'owner');
    await client.query(
      `insert into credit_entry (family_id, kind, amount) values ($1, 'welcome_grant', 100)`,
      [ids.granted],
    );

    await runRollout();

    expect(await entries(ids.granted)).toHaveLength(1);
  });

  it('refuses a second Welcome Grant for a Family', async () => {
    await makeFamily(ids.family, 'MIG0047A');
    await makeMember('mig-0047-owner', ids.family, 'owner');
    await runRollout();
    await expect(
      client.query(
        `insert into credit_entry (family_id, kind, amount) values ($1, 'welcome_grant', 100)`,
        [ids.family],
      ),
    ).rejects.toThrow(/credit_entry_welcome_grant_idx/);
  });
});
