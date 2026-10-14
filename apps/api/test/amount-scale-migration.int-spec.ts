import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { amountScaleForParent } from '../src/catalog/amount-scale';
import { seedId } from '../src/catalog/seed/seed-ids';
import {
  SEED_INGREDIENTS,
  SEED_LEAVES,
} from '../src/catalog/seed/catalog-seed-data';

// Migration 0021 adds the Amount Scale column and backfills it from each
// Ingredient's Parent Category. Each test takes the column away, plays the
// whole migration again inside a transaction that is rolled back, and checks
// what it wrote.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0021_amount_scale.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '');

const ids = {
  stray: '00000000-0000-4000-8000-000000001901',
};

describe('Migration 0021: Amount Scale backfill (integration)', () => {
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
    await client.query('ALTER TABLE ingredients DROP COLUMN amount_scale');
    await client.query('DROP TYPE amount_scale');
  });
  afterEach(() => client.query('ROLLBACK'));

  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };

  const scaleOf = async (id: string) =>
    (
      await client.query<{ scale: string | null }>(
        'select amount_scale as scale from ingredients where id = $1',
        [id],
      )
    ).rows[0]?.scale;

  it('gives each seeded Ingredient the scale of its Parent Category, and medium when unmapped', async () => {
    // Insert a stray Ingredient under the top-level Other Leaf: no mapping, so medium.
    await client.query(
      `insert into ingredients (id, leaf_category_id, name, normalized_name, default_unit)
       values ($1, $2, 'Stray thing', 'stray thing', 'pcs')`,
      [ids.stray, seedId.leaf('other-other')],
    );

    await migrate();

    expect(await scaleOf(seedId.ingredient('paprika'))).toBe('low');
    expect(await scaleOf(seedId.ingredient('potato'))).toBe('large');
    expect(await scaleOf(seedId.ingredient('parmesan'))).toBe('medium');
    expect(await scaleOf(seedId.ingredient('basil'))).toBe('medium');
    expect(await scaleOf(ids.stray)).toBe('medium');
  });

  it('backfills every seeded Ingredient to the scale the TypeScript mapping gives its Parent', async () => {
    await migrate();

    // Each seed Ingredient's Leaf names its Parent slug; the TypeScript mapping
    // is keyed by the Parent's id, which is how the migration's SQL keys it too.
    const parentSlugOfLeaf = new Map(
      SEED_LEAVES.map((leaf) => [leaf.slug, leaf.parent]),
    );
    const stored = await client.query<{ id: string; scale: string | null }>(
      'select id, amount_scale as scale from ingredients where id = any($1::uuid[])',
      [SEED_INGREDIENTS.map((item) => seedId.ingredient(item.slug))],
    );
    expect(stored.rows).toHaveLength(SEED_INGREDIENTS.length);

    const expected = new Map(
      SEED_INGREDIENTS.map((item) => {
        const parent = parentSlugOfLeaf.get(item.leaf) ?? '';
        return [
          seedId.ingredient(item.slug),
          amountScaleForParent(seedId.parent(parent)),
        ];
      }),
    );
    for (const row of stored.rows) {
      expect({ id: row.id, scale: row.scale }).toEqual({
        id: row.id,
        scale: expected.get(row.id),
      });
    }
  });

  it('leaves no Ingredient without a scale after the backfill', async () => {
    await migrate();

    const missing = await client.query<{ count: string }>(
      'select count(*) as count from ingredients where amount_scale is null',
    );
    expect(missing.rows[0].count).toBe('0');
  });
});
