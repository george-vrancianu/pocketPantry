import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Migration 0032 moves stored barcodes to their canonical GTIN-13 form. Each test plays it
// again inside a transaction that is rolled back, against rows written the old way.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0032_canonical_barcodes.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '');

const familyA = '00000000-0000-4000-8000-000000003201';
const familyB = '00000000-0000-4000-8000-000000003202';

describe('Migration 0032: canonical barcodes (integration)', () => {
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
      `insert into family (id, invite_code, invite_code_expires_at)
       values ($1, 'MIG32A', now()), ($2, 'MIG32B', now())`,
      [familyA, familyB],
    );
  });
  afterEach(() => client.query('ROLLBACK'));

  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };

  const known = (
    family: string,
    barcode: string,
    description: string,
    updatedAt: string,
  ) =>
    client.query(
      `insert into known_barcodes
         (family_id, barcode, raw_name, normalized_name, product_description, updated_at)
       values ($1, $2, 'Thing', 'thing', $3, $4)`,
      [family, barcode, description, updatedAt],
    );

  const knownRows = async (family: string) =>
    (
      await client.query<{ barcode: string; description: string }>(
        `select barcode, product_description as description from known_barcodes
         where family_id = $1 order by barcode`,
        [family],
      )
    ).rows;

  const cache = (barcode: string, name: string, fetchedAt: string) =>
    client.query(
      `insert into open_food_facts_cache (barcode, product, fetched_at)
       values ($1, $2::jsonb, $3)`,
      [barcode, JSON.stringify({ productName: name }), fetchedAt],
    );

  const cacheRows = async (barcodes: string[]) =>
    (
      await client.query<{ barcode: string; name: string }>(
        `select barcode, product->>'productName' as name from open_food_facts_cache
         where barcode = any($1) order by barcode`,
        [barcodes],
      )
    ).rows;

  it('moves UPC-A and UPC-E Known Barcodes to GTIN-13 and leaves EAN-13, EAN-8 alone', async () => {
    await known(familyA, '036000291452', 'upc-a', '2026-01-01');
    await known(familyA, '04252614', 'upc-e', '2026-01-01');
    await known(familyA, '3017620422003', 'ean-13', '2026-01-01');
    await known(familyA, '96385074', 'ean-8', '2026-01-01');

    await migrate();

    expect(await knownRows(familyA)).toEqual([
      { barcode: '0036000291452', description: 'upc-a' },
      { barcode: '0042100005264', description: 'upc-e' },
      { barcode: '3017620422003', description: 'ean-13' },
      { barcode: '96385074', description: 'ean-8' },
    ]);
  });

  it('keeps the most recently updated row when a UPC-A and its EAN-13 form collapse, per Family', async () => {
    await known(familyA, '036000291452', 'newer upc-a', '2026-03-01');
    await known(familyA, '0036000291452', 'older ean-13', '2026-02-01');
    await known(familyB, '036000291452', 'b older upc-a', '2026-01-01');
    await known(familyB, '0036000291452', 'b newer ean-13', '2026-02-01');

    await migrate();

    expect(await knownRows(familyA)).toEqual([
      { barcode: '0036000291452', description: 'newer upc-a' },
    ]);
    expect(await knownRows(familyB)).toEqual([
      { barcode: '0036000291452', description: 'b newer ean-13' },
    ]);
  });

  it('leaves stored codes with a wrong check digit, or of another length, untouched', async () => {
    await known(familyA, '036000291453', 'bad upc-a', '2026-01-01');
    await known(familyA, '3017620422004', 'bad ean-13', '2026-01-01');
    await known(familyA, '12345', 'short', '2026-01-01');

    await migrate();

    expect((await knownRows(familyA)).map((row) => row.barcode).sort()).toEqual(
      ['036000291453', '12345', '3017620422004'],
    );
  });

  it('moves cache entries to GTIN-13 and keeps the most recently fetched one on a collapse', async () => {
    await cache('036000291452', 'upc-a old', '2026-01-01');
    await cache('0036000291452', 'ean-13 new', '2026-02-01');
    await cache('04252614', 'upc-e only', '2026-01-01');
    await cache('036000291453', 'bad check digit', '2026-01-01');

    await migrate();

    expect(
      await cacheRows([
        '036000291452',
        '0036000291452',
        '04252614',
        '0042100005264',
        '036000291453',
      ]),
    ).toEqual([
      { barcode: '0036000291452', name: 'ean-13 new' },
      { barcode: '0042100005264', name: 'upc-e only' },
      { barcode: '036000291453', name: 'bad check digit' },
    ]);
  });
});
