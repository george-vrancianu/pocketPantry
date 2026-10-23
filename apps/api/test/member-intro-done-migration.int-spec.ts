import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Migration 0038 adds user.intro_done_at and ends with a step that marks every
// existing Member as done with the Intro. The test plays that step again inside a
// transaction that is rolled back.
const backfill = readFileSync(
  resolve(process.cwd(), 'drizzle/0038_member_intro_done.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '')
  .at(-1) as string;

const familyId = '00000000-0000-4000-8000-000000003801';

describe('Migration 0038: Intro-done backfill (integration)', () => {
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

  const member = (id: string, createdAt: string) =>
    client.query(
      `insert into "user" (id, name, email, family_id, created_at)
       values ($1, $1, $2, $3, $4)`,
      [id, `${id}@example.com`, familyId, createdAt],
    );

  const introDoneAt = async (id: string) =>
    (
      await client.query<{ intro_done_at: Date | null }>(
        'select intro_done_at from "user" where id = $1',
        [id],
      )
    ).rows[0].intro_done_at;

  it('marks every existing Member as done at their sign-up time, and a Member added later starts not done', async () => {
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at)
       values ($1, 'MIG0038', now())`,
      [familyId],
    );
    await member('mig-0038-old', '2026-01-02T03:04:05Z');
    await member('mig-0038-other', '2026-02-03T04:05:06Z');

    await client.query(backfill);

    expect(await introDoneAt('mig-0038-old')).toEqual(
      new Date('2026-01-02T03:04:05Z'),
    );
    expect(await introDoneAt('mig-0038-other')).toEqual(
      new Date('2026-02-03T04:05:06Z'),
    );

    await member('mig-0038-new', '2026-10-01T00:00:00Z');
    expect(await introDoneAt('mig-0038-new')).toBeNull();
  });

  it('keeps a timestamp that is already set', async () => {
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at)
       values ($1, 'MIG0038', now())`,
      [familyId],
    );
    await member('mig-0038-set', '2026-01-02T03:04:05Z');
    await client.query(
      `update "user" set intro_done_at = '2026-05-05T05:05:05Z' where id = 'mig-0038-set'`,
    );
    await client.query(backfill);
    expect(await introDoneAt('mig-0038-set')).toEqual(
      new Date('2026-05-05T05:05:05Z'),
    );
  });
});
