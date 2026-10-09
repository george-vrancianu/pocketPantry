import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { seedId } from '../src/catalog/seed/seed-catalog';

// Migration 0012 rewrites the matching keys stored before æ, ø and å were
// folded. Each test plays it again inside a transaction that is rolled back,
// against rows written with the old keys.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0012_fold_danish_letters.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '');

const ids = {
  aisle: '00000000-0000-4000-8000-000000001201',
  translation: (n: number) => `00000000-0000-4000-8000-00000000121${n}`,
  family: '00000000-0000-4000-8000-000000001221',
  list: '00000000-0000-4000-8000-000000001222',
  item: '00000000-0000-4000-8000-000000001223',
};

describe('Migration 0012: fold æ, ø and å in stored matching keys (integration)', () => {
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

  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };

  const translation = (
    n: number,
    entity: string,
    kind: 'name' | 'synonym',
    value: string,
    normalizedValue: string,
  ) =>
    client.query(
      `insert into catalog_translations
         (id, entity_type, entity_id, locale, kind, value, normalized_value)
       values ($1, 'ingredient', $2, 'da', $3, $4, $5)`,
      [ids.translation(n), entity, kind, value, normalizedValue],
    );

  const key = async (table: string, column: string, id: string) =>
    (
      await client.query<{ key: string }>(
        `select ${column} as key from ${table} where id = $1`,
        [id],
      )
    ).rows[0]?.key;

  it('rewrites every stored key that holds æ, ø or å, and leaves the rest alone', async () => {
    const carrot = seedId.ingredient('carrot');
    await client.query(
      `insert into aisles (id, name, normalized_name, sort_order)
       values ($1, 'Smør & Ål', 'smør al', 9001)`,
      [ids.aisle],
    );
    await translation(1, carrot, 'synonym', 'Små gulerødder', 'sma gulerødder');
    await translation(2, carrot, 'synonym', 'BLÅ ÆBLE-mos', 'bla æble mos');
    await translation(3, carrot, 'synonym', 'baby carrots!', 'baby carrots');
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at)
       values ($1, 'MIG0012', now())`,
      [ids.family],
    );
    await client.query(
      `insert into shopping_lists (id, family_id) values ($1, $2)`,
      [ids.list, ids.family],
    );
    await client.query(
      `insert into shopping_items (id, list_id, name, normalized_name)
       values ($1, $2, 'Rødkål', 'rødkal')`,
      [ids.item, ids.list],
    );
    const entry = await client.query<{ id: string }>(
      `insert into unmatched_entries
         (normalized_name, raw_name, locale, source, shopping_item_id)
       values ('rødkal', 'Rødkål', 'da', 'product', $1) returning id`,
      [ids.item],
    );

    await migrate();

    expect(await key('aisles', 'normalized_name', ids.aisle)).toBe('smoer aal');
    const value = (n: number) =>
      key('catalog_translations', 'normalized_value', ids.translation(n));
    expect(await value(1)).toBe('smaa guleroedder');
    expect(await value(2)).toBe('blaa aeble mos');
    expect(await value(3)).toBe('baby carrots');
    expect(await key('shopping_items', 'normalized_name', ids.item)).toBe(
      'roedkaal',
    );
    expect(
      await key('unmatched_entries', 'normalized_name', entry.rows[0].id),
    ).toBe('roedkaal');
    // The seeded Danish rows already carry folded keys and stay as they are.
    expect(
      (
        await client.query<{ key: string }>(
          `select normalized_value as key from catalog_translations
           where entity_id = $1 and locale = 'da' and kind = 'name'`,
          [seedId.ingredient('milk')],
        )
      ).rows,
    ).toEqual([{ key: 'maelk' }]);
  });

  it('fails loudly, naming both rows, when two keys that must be unique fold together', async () => {
    const carrot = seedId.ingredient('carrot');
    await translation(1, carrot, 'synonym', 'smørbolle', 'smørbolle');
    await translation(2, carrot, 'synonym', 'smoerbolle', 'smoerbolle');

    await expect(migrate()).rejects.toThrow(
      /catalog_translations.*smoerbolle.*smørbolle.*smoerbolle|catalog_translations.*smoerbolle.*smoerbolle.*smørbolle/s,
    );
  });

  it('refuses to guess when a stored key was not made from its text', async () => {
    await client.query(
      `insert into aisles (id, name, normalized_name, sort_order)
       values ($1, 'Smør', 'butter', 9001)`,
      [ids.aisle],
    );

    await expect(migrate()).rejects.toThrow(/aisles.*Smør.*butter/s);
  });
});
