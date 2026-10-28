import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Migration 0049 (#708, expand step of ADR 0033) turns every Cuisine and Method into a Catalog Tag
// with its translations and tags every Recipe with them. The schema half of the file has already run
// on the test database, so each test clears the tag rows and replays only the data statements
// (the INSERTs) inside a transaction that is rolled back.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0049_tags.sql'),
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
  .filter((statement) => /^INSERT /i.test(statement));

const id = (n: number) =>
  `00000000-0000-4000-8000-0000000049${String(n).padStart(2, '0')}`;
const ids = {
  italian: id(1),
  rolled: id(2),
  tagged: id(3),
  both: id(4),
  untagged: id(5),
  synonym: id(6),
};

describe('Migration 0049: Cuisines and Methods become Catalog Tags (integration)', () => {
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
    await client.query('delete from recipe_tags');
    await client.query('delete from tags');
    await client.query('delete from tag_groups');
    await client.query(
      `delete from catalog_translations where entity_type in ('tag', 'tag_group')`,
    );
  });
  afterEach(() => client.query('ROLLBACK'));

  const rows = async <T extends pg.QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ) => (await client.query<T>(sql, params)).rows;
  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };

  async function seedOldWorld() {
    await client.query(
      `insert into cuisines (id, name, normalized_name) values ($1, 'Zorbian', 'zorbian')`,
      [ids.italian],
    );
    await client.query(
      `insert into methods (id, name, normalized_name) values ($1, 'Zorbian rolled', 'zorbian rolled')`,
      [ids.rolled],
    );
    await client.query(
      `insert into catalog_translations (id, entity_type, entity_id, locale, kind, value, normalized_value)
       values (gen_random_uuid(), 'cuisine', $1, 'en', 'name', 'Zorbian', 'zorbian'),
              (gen_random_uuid(), 'cuisine', $1, 'ro', 'name', 'Zorbiană', 'zorbiana'),
              (gen_random_uuid(), 'cuisine', $1, 'da', 'name', 'Zorbisk', 'zorbisk'),
              (gen_random_uuid(), 'cuisine', $1, 'ro', 'synonym', 'zorbiească', 'zorbieasca'),
              (gen_random_uuid(), 'method', $2, 'en', 'name', 'Zorbian rolled', 'zorbian rolled'),
              (gen_random_uuid(), 'method', $2, 'ro', 'name', 'Rulată zorbiană', 'rulata zorbiana')`,
      [ids.italian, ids.rolled],
    );
    await client.query(
      `insert into recipes (id, title, servings, cuisine_id, method_id) values
         ($1, 'Pasta', 2, $4, null),
         ($2, 'Omelette', 2, $4, $5),
         ($3, 'Plain', 2, null, null)`,
      [ids.tagged, ids.both, ids.untagged, ids.italian, ids.rolled],
    );
  }

  it('creates the Cuisine and Method Tag Groups, after Meal and Diet', async () => {
    await migrate();
    expect(
      await rows(
        `select g.name, g.position, t.locale, t.value from tag_groups g
         join catalog_translations t on t.entity_type = 'tag_group' and t.entity_id = g.id and t.kind = 'name'
         order by g.position, t.locale`,
      ),
    ).toEqual([
      { name: 'Cuisine', position: 3, locale: 'da', value: 'Køkken' },
      { name: 'Cuisine', position: 3, locale: 'en', value: 'Cuisine' },
      { name: 'Cuisine', position: 3, locale: 'ro', value: 'Bucătărie' },
      { name: 'Method', position: 4, locale: 'da', value: 'Metode' },
      { name: 'Method', position: 4, locale: 'en', value: 'Method' },
      { name: 'Method', position: 4, locale: 'ro', value: 'Metodă' },
    ]);
  });

  it('turns each Cuisine and Method into a Catalog Tag in its group, keeping its id', async () => {
    await seedOldWorld();
    await migrate();
    expect(
      await rows(
        `select t.id, t.name, t.family_id, g.name as group_name from tags t
         join tag_groups g on g.id = t.group_id where t.id = any($1) order by t.name`,
        [[ids.italian, ids.rolled]],
      ),
    ).toEqual([
      {
        id: ids.italian,
        name: 'Zorbian',
        family_id: null,
        group_name: 'Cuisine',
      },
      {
        id: ids.rolled,
        name: 'Zorbian rolled',
        family_id: null,
        group_name: 'Method',
      },
    ]);
  });

  it('carries the translations and Synonyms across', async () => {
    await seedOldWorld();
    await migrate();
    expect(
      await rows(
        `select entity_id, locale, kind, value from catalog_translations
         where entity_type = 'tag' and entity_id = any($1) order by entity_id, kind, locale`,
        [[ids.italian, ids.rolled]],
      ),
    ).toEqual([
      {
        entity_id: ids.italian,
        locale: 'da',
        kind: 'name',
        value: 'Zorbisk',
      },
      { entity_id: ids.italian, locale: 'en', kind: 'name', value: 'Zorbian' },
      { entity_id: ids.italian, locale: 'ro', kind: 'name', value: 'Zorbiană' },
      {
        entity_id: ids.italian,
        locale: 'ro',
        kind: 'synonym',
        value: 'zorbiească',
      },
      {
        entity_id: ids.rolled,
        locale: 'en',
        kind: 'name',
        value: 'Zorbian rolled',
      },
      {
        entity_id: ids.rolled,
        locale: 'ro',
        kind: 'name',
        value: 'Rulată zorbiană',
      },
    ]);
    // The old translations stay for the contract migration to drop.
    expect(
      await rows(
        `select count(*)::int as n from catalog_translations where entity_type = 'cuisine' and entity_id = $1`,
        [ids.italian],
      ),
    ).toEqual([{ n: 4 }]);
  });

  it('tags every Recipe with its Cuisine and Method, and leaves the old columns alone', async () => {
    await seedOldWorld();
    await migrate();
    expect(
      await rows(
        `select recipe_id, tag_id from recipe_tags where recipe_id = any($1) order by recipe_id, tag_id`,
        [[ids.tagged, ids.both, ids.untagged]],
      ),
    ).toEqual(
      [
        { recipe_id: ids.tagged, tag_id: ids.italian },
        { recipe_id: ids.both, tag_id: ids.italian },
        { recipe_id: ids.both, tag_id: ids.rolled },
      ].sort((a, b) =>
        `${a.recipe_id}${a.tag_id}`.localeCompare(`${b.recipe_id}${b.tag_id}`),
      ),
    );
    expect(
      await rows(`select cuisine_id from recipes where id = $1`, [ids.tagged]),
    ).toEqual([{ cuisine_id: ids.italian }]);
  });
});
