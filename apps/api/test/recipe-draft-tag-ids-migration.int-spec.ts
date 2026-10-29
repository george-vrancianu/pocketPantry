import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Migration 0050 (#709, expand step of ADR 0033) rewrites stored Recipe Draft content: the Cuisine
// and Method ids become a `tagIds` list and the old keys stay. The schema is already migrated on the
// test database, so each test inserts old-shape drafts inside a transaction that is rolled back and
// replays the file's statements on them.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0050_recipe_draft_tag_ids.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) =>
    statement
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim(),
  )
  .filter((statement) => statement !== '');

const id = (n: number) =>
  `00000000-0000-4000-8000-0000000050${String(n).padStart(2, '0')}`;
const ids = {
  family: id(1),
  group: id(2),
  cuisine: id(3),
  method: id(4),
  gone: id(5),
};
const draftIds = {
  both: id(10),
  cuisineOnly: id(11),
  none: id(12),
  stale: id(13),
  already: id(14),
};

describe('Migration 0050: Recipe Draft content gets tagIds (integration)', () => {
  let client: pg.Client;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  });
  afterAll(async () => {
    await client.end();
  });
  beforeEach(async () => {
    await client.query('BEGIN');
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at) values ($1, 'mig-0050', now())`,
      [ids.family],
    );
    await client.query(
      `insert into "user" (id, name, email, family_id) values ('mig-0050-user', 'Mig', 'mig-0050@example.com', $1)`,
      [ids.family],
    );
    await client.query(
      `insert into tag_groups (id, name, normalized_name, position) values ($1, 'Zgroup 0050', 'zgroup 0050', 900)`,
      [ids.group],
    );
    await client.query(
      `insert into tags (id, name, normalized_name, group_id) values
         ($1, 'Zcuisine 0050', 'zcuisine 0050', $3), ($2, 'Zmethod 0050', 'zmethod 0050', $3)`,
      [ids.cuisine, ids.method, ids.group],
    );
    const draft = (draftId: string, content: Record<string, unknown>) =>
      client.query(
        `insert into recipe_drafts (id, member_id, family_id, kind, content)
         values ($1, 'mig-0050-user', $2, 'new_recipe', $3::jsonb)`,
        [draftId, ids.family, JSON.stringify({ title: 'T', ...content })],
      );
    await draft(draftIds.both, {
      cuisineId: ids.cuisine,
      methodId: ids.method,
    });
    await draft(draftIds.cuisineOnly, { cuisineId: ids.cuisine, methodId: '' });
    await draft(draftIds.none, { cuisineId: '', methodId: '' });
    await draft(draftIds.stale, { cuisineId: ids.gone, methodId: ids.method });
    await draft(draftIds.already, {
      cuisineId: ids.cuisine,
      methodId: '',
      tagIds: ['kept'],
    });
  });
  afterEach(() => client.query('ROLLBACK'));

  const contentOf = async (draftId: string) =>
    (
      await client.query<{ content: Record<string, unknown> }>(
        `select content from recipe_drafts where id = $1`,
        [draftId],
      )
    ).rows[0].content;
  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };

  it('turns the Cuisine and Method ids into tagIds, Cuisine first, keeping the old keys', async () => {
    await migrate();
    expect(await contentOf(draftIds.both)).toEqual({
      title: 'T',
      cuisineId: ids.cuisine,
      methodId: ids.method,
      tagIds: [ids.cuisine, ids.method],
    });
    expect((await contentOf(draftIds.cuisineOnly)).tagIds).toEqual([
      ids.cuisine,
    ]);
  });

  it('gives a draft with neither an empty list, and drops an id whose Tag is gone', async () => {
    await migrate();
    expect((await contentOf(draftIds.none)).tagIds).toEqual([]);
    expect((await contentOf(draftIds.stale)).tagIds).toEqual([ids.method]);
  });

  it('leaves a draft that already has tagIds alone, and is safe to run twice', async () => {
    await migrate();
    await migrate();
    expect((await contentOf(draftIds.already)).tagIds).toEqual(['kept']);
    expect((await contentOf(draftIds.both)).tagIds).toEqual([
      ids.cuisine,
      ids.method,
    ]);
  });
});
