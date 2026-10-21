import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { GTIN_FIXTURES } from '../src/barcode/gtin.fixtures';
import { freshBarcode, freshUpcE } from './support/fresh-barcode';

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

const wrongCheckDigit = (code: string) =>
  `${code.slice(0, -1)}${(Number(code.at(-1)) + 1) % 10}`;

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

  it.each(GTIN_FIXTURES)(
    'agrees with normalizeBarcode: %s',
    async (_label, raw, canonical) => {
      await migrate();
      // The migration's temp functions live for this session: ask them directly.
      const { rows } = await client.query<{ gtin13: string | null }>(
        'select pg_temp.pp_gtin13($1) as gtin13',
        [raw],
      );
      expect(rows[0].gtin13).toBe(canonical);
    },
  );

  it('moves UPC-A and UPC-E Known Barcodes to GTIN-13 and leaves EAN-13, EAN-8 alone', async () => {
    const upcA = freshBarcode(12);
    const { upcE, gtin13 } = freshUpcE();
    const ean13 = freshBarcode(13);
    const ean8 = freshBarcode(8);
    await known(familyA, upcA, 'upc-a', '2026-01-01');
    await known(familyA, upcE, 'upc-e', '2026-01-01');
    await known(familyA, ean13, 'ean-13', '2026-01-01');
    await known(familyA, ean8, 'ean-8', '2026-01-01');

    await migrate();

    expect(
      (await knownRows(familyA)).sort((x, y) =>
        x.description.localeCompare(y.description),
      ),
    ).toEqual([
      { barcode: ean13, description: 'ean-13' },
      { barcode: ean8, description: 'ean-8' },
      { barcode: `0${upcA}`, description: 'upc-a' },
      { barcode: gtin13, description: 'upc-e' },
    ]);
  });

  it('keeps the most recently updated row when a UPC-A and its EAN-13 form collapse, per Family', async () => {
    const upcA = freshBarcode(12);
    await known(familyA, upcA, 'newer upc-a', '2026-03-01');
    await known(familyA, `0${upcA}`, 'older ean-13', '2026-02-01');
    await known(familyB, upcA, 'b older upc-a', '2026-01-01');
    await known(familyB, `0${upcA}`, 'b newer ean-13', '2026-02-01');

    await migrate();

    expect(await knownRows(familyA)).toEqual([
      { barcode: `0${upcA}`, description: 'newer upc-a' },
    ]);
    expect(await knownRows(familyB)).toEqual([
      { barcode: `0${upcA}`, description: 'b newer ean-13' },
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
    const upcA = freshBarcode(12);
    const { upcE, gtin13 } = freshUpcE();
    const bad = wrongCheckDigit(freshBarcode(12));
    await cache(upcA, 'upc-a old', '2026-01-01');
    await cache(`0${upcA}`, 'ean-13 new', '2026-02-01');
    await cache(upcE, 'upc-e only', '2026-01-01');
    await cache(bad, 'bad check digit', '2026-01-01');

    await migrate();

    expect(await cacheRows([upcA, `0${upcA}`, upcE, gtin13, bad])).toEqual(
      [
        { barcode: `0${upcA}`, name: 'ean-13 new' },
        { barcode: gtin13, name: 'upc-e only' },
        { barcode: bad, name: 'bad check digit' },
      ].sort((x, y) => x.barcode.localeCompare(y.barcode)),
    );
  });
});
