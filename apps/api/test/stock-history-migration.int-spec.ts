import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { seedId } from '../src/catalog/seed/seed-catalog';

// Migration 0015 ends with a step that fills the stock history from current
// Batches. The test plays that step again inside a transaction that is rolled back.
const backfill = readFileSync(
  resolve(process.cwd(), 'drizzle/0015_stock_history.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '')
  .at(-1) as string;

const familyId = '00000000-0000-4000-8000-000000001501';

describe('Migration 0015: stock history backfill (integration)', () => {
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

  const batch = (
    ingredient: string | null,
    createdAt: string,
    unmatched = false,
  ) =>
    client.query(
      `insert into batches
         (family_id, ingredient_id, leaf_category_id, unmatched, raw_name, location, created_at)
       values ($1, $2, (select leaf_category_id from ingredients where id = $3), $4, $5, 'fridge', $6)`,
      [
        familyId,
        ingredient,
        ingredient ?? seedId.ingredient('milk'),
        unmatched,
        unmatched ? 'Mystery' : null,
        createdAt,
      ],
    );

  it('records the newest Batch date per Ingredient, never used up, and skips Unmatched Batches', async () => {
    const milk = seedId.ingredient('milk');
    const parmesan = seedId.ingredient('parmesan');
    await client.query(
      `insert into family (id, invite_code, invite_code_expires_at)
       values ($1, 'MIG0015', now())`,
      [familyId],
    );
    await batch(milk, '2026-01-01T10:00:00Z');
    await batch(milk, '2026-02-03T10:00:00Z');
    await batch(parmesan, '2026-01-15T10:00:00Z');
    await batch(null, '2026-03-01T10:00:00Z', true);

    // Rows other specs left behind would collide; the rollback restores them.
    await client.query('delete from ingredient_stock_history');
    await client.query(backfill);

    const { rows } = await client.query<{
      ingredient_id: string;
      last_stocked_at: Date;
      used_up_at: Date | null;
    }>(
      `select ingredient_id, last_stocked_at, used_up_at
       from ingredient_stock_history where family_id = $1`,
      [familyId],
    );
    expect(
      rows
        .map((r) => [
          r.ingredient_id,
          r.last_stocked_at.toISOString(),
          r.used_up_at,
        ])
        .sort(),
    ).toEqual(
      [
        [milk, '2026-02-03T10:00:00.000Z', null],
        [parmesan, '2026-01-15T10:00:00.000Z', null],
      ].sort(),
    );
  });
});
