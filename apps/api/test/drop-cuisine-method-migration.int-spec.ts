import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { restorePre0051Shape } from './support/pre-0051-shape';

// Migration 0051 (#715, contract step of ADR 0033) drops the Cuisine and Method tables, Recipe
// columns and indexes, their translations and the two `catalog_entity_type` values, and strips the
// leftover keys from stored Recipe Draft content. The schema is already migrated on the test
// database, so each test puts the old shape back inside a transaction, adds old-world rows and
// plays the file's statements on them. The transaction is rolled back.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0051_drop_cuisine_method.sql'),
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
  `00000000-0000-4000-8000-0000000051${String(n).padStart(2, '0')}`;
const ids = {
  family: id(1),
  group: id(2),
  cuisine: id(3),
  method: id(4),
  recipe: id(5),
  plain: id(6),
  aisle: id(7),
};
const draftIds = { legacy: id(10), onlyOne: id(11), clean: id(12) };

describe('Migration 0051: Cuisine and Method are dropped (integration)', () => {
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
    await restorePre0051Shape(client);
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at) values ($1, 'mig-0051', now())`,
      [ids.family],
    );
    await client.query(
      `insert into "user" (id, name, email, family_id) values ('mig-0051-user', 'Mig', 'mig-0051@example.com', $1)`,
      [ids.family],
    );
    await client.query(
      `insert into tag_groups (id, name, normalized_name, position) values ($1, 'Zgroup 0051', 'zgroup 0051', 900)`,
      [ids.group],
    );
    await client.query(
      `insert into cuisines (id, name, normalized_name) values ($1, 'Zcuisine 0051', 'zcuisine 0051')`,
      [ids.cuisine],
    );
    await client.query(
      `insert into methods (id, name, normalized_name) values ($1, 'Zmethod 0051', 'zmethod 0051')`,
      [ids.method],
    );
    // Each became a Catalog Tag with the same id (migration 0049).
    await client.query(
      `insert into tags (id, name, normalized_name, group_id) values
         ($1, 'Zcuisine 0051', 'zcuisine 0051', $3), ($2, 'Zmethod 0051', 'zmethod 0051', $3)`,
      [ids.cuisine, ids.method, ids.group],
    );
    await client.query(
      `insert into recipes (id, title, servings, cuisine_id, method_id) values
         ($1, 'Tagged 0051', 2, $2, $3), ($4, 'Plain 0051', 2, null, null)`,
      [ids.recipe, ids.cuisine, ids.method, ids.plain],
    );
    await client.query(
      `insert into recipe_tags (recipe_id, tag_id) values ($1, $2), ($1, $3)`,
      [ids.recipe, ids.cuisine, ids.method],
    );
    await client.query(
      `insert into catalog_translations (id, entity_type, entity_id, locale, kind, value, normalized_value)
       values (gen_random_uuid(), 'cuisine', $1, 'ro', 'name', 'Zcuisine ro 0051', 'zcuisine ro 0051'),
              (gen_random_uuid(), 'method', $2, 'ro', 'name', 'Zmethod ro 0051', 'zmethod ro 0051'),
              (gen_random_uuid(), 'tag', $1, 'ro', 'name', 'Ztag ro 0051', 'ztag ro 0051'),
              (gen_random_uuid(), 'aisle', $3, 'ro', 'name', 'Zaisle ro 0051', 'zaisle ro 0051')`,
      [ids.cuisine, ids.method, ids.aisle],
    );
    const draft = (draftId: string, content: Record<string, unknown>) =>
      client.query(
        `insert into recipe_drafts (id, member_id, family_id, kind, content)
         values ($1, 'mig-0051-user', $2, 'new_recipe', $3::jsonb)`,
        [draftId, ids.family, JSON.stringify({ title: 'T', ...content })],
      );
    await draft(draftIds.legacy, {
      cuisineId: ids.cuisine,
      methodId: ids.method,
      tagIds: [ids.cuisine, ids.method],
    });
    await draft(draftIds.onlyOne, { cuisineId: '', tagIds: [] });
    await draft(draftIds.clean, { tagIds: ['kept'] });
  });
  afterEach(() => client.query('ROLLBACK'));

  const rows = async <T extends pg.QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ) => (await client.query<T>(sql, params)).rows;
  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };
  const contentOf = async (draftId: string) =>
    (
      await rows<{ content: Record<string, unknown> }>(
        `select content from recipe_drafts where id = $1`,
        [draftId],
      )
    )[0].content;

  it('strips the leftover Cuisine and Method keys from Recipe Draft content and keeps the rest', async () => {
    await migrate();
    expect(await contentOf(draftIds.legacy)).toEqual({
      title: 'T',
      tagIds: [ids.cuisine, ids.method],
    });
    expect(await contentOf(draftIds.onlyOne)).toEqual({
      title: 'T',
      tagIds: [],
    });
    expect(await contentOf(draftIds.clean)).toEqual({
      title: 'T',
      tagIds: ['kept'],
    });
  });

  it('drops the Cuisine and Method translations and keeps every other', async () => {
    await migrate();
    expect(
      await rows(
        `select entity_type::text as entity_type, value from catalog_translations
         where entity_id = any($1) order by value`,
        [[ids.cuisine, ids.method, ids.aisle]],
      ),
    ).toEqual([
      { entity_type: 'aisle', value: 'Zaisle ro 0051' },
      { entity_type: 'tag', value: 'Ztag ro 0051' },
    ]);
  });

  it('drops the Recipe columns, their indexes and the two tables, keeping Recipes and their Tags', async () => {
    await migrate();
    expect(
      await rows(
        `select column_name from information_schema.columns
         where table_name = 'recipes' and column_name in ('cuisine_id', 'method_id')`,
      ),
    ).toEqual([]);
    expect(
      await rows(
        `select indexname from pg_indexes
         where indexname in ('recipes_cuisine_idx', 'recipes_method_idx',
                             'cuisines_normalized_name_idx', 'methods_normalized_name_idx')`,
      ),
    ).toEqual([]);
    expect(
      await rows(
        `select table_name from information_schema.tables
         where table_schema = 'public' and table_name in ('cuisines', 'methods')`,
      ),
    ).toEqual([]);
    expect(
      await rows(
        `select title from recipes where id = any($1) order by title`,
        [[ids.recipe, ids.plain]],
      ),
    ).toEqual([{ title: 'Plain 0051' }, { title: 'Tagged 0051' }]);
    expect(
      await rows(`select tag_id from recipe_tags where recipe_id = $1`, [
        ids.recipe,
      ]),
    ).toHaveLength(2);
    expect(
      await rows(`select id from tags where id = any($1)`, [
        [ids.cuisine, ids.method],
      ]),
    ).toHaveLength(2);
  });

  it('removes the cuisine and method enum values, keeping rows and the expiry check', async () => {
    await client.query(
      `insert into family_expiry_overrides (family_id, entity_type, entity_id, days)
       values ($1, 'parent_category', $2, 5)`,
      [ids.family, ids.aisle],
    );
    await migrate();
    expect(
      (
        await rows<{ value: string }>(
          `select unnest(enum_range(null::catalog_entity_type))::text as value`,
        )
      ).map((r) => r.value),
    ).toEqual([
      'aisle',
      'parent_category',
      'leaf_category',
      'ingredient',
      'eating_moment',
      'allergen',
      'tag_group',
      'tag',
    ]);
    expect(
      await rows(
        `select entity_type::text as entity_type, days from family_expiry_overrides where family_id = $1`,
        [ids.family],
      ),
    ).toEqual([{ entity_type: 'parent_category', days: 5 }]);
    await client.query('SAVEPOINT check_refuses');
    await expect(
      client.query(
        `insert into family_expiry_overrides (family_id, entity_type, entity_id, days)
         values ($1, 'ingredient', $2, 5)`,
        [ids.family, ids.aisle],
      ),
    ).rejects.toThrow(/family_expiry_overrides_category/);
    await client.query('ROLLBACK TO SAVEPOINT check_refuses');
    await expect(
      client.query(
        `insert into catalog_translations (id, entity_type, entity_id, locale, kind, value, normalized_value)
         values (gen_random_uuid(), 'cuisine', $1, 'en', 'name', 'X', 'x')`,
        [ids.aisle],
      ),
    ).rejects.toThrow(/invalid input value for enum/);
  });
});
