import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

// Migration 0052 (Promo Codes) adds the `promo_code` value to `credit_entry_kind` and then uses it in a
// CHECK. Drizzle runs every pending migration in one transaction, and Postgres refuses to use an enum value
// added in the same transaction unless the enum itself is new, so a from-empty run (what the test setup does)
// passes while an existing database fails. This applies 0052 onto a database that already has 0051.
describe('Migration 0052: Promo Codes apply to an existing database (integration)', () => {
  const name = `promo_migration_${process.pid}`;
  let admin: pg.Client;
  let dir: string;
  let url: string;

  beforeAll(async () => {
    const base = new URL(process.env.DATABASE_URL as string);
    admin = new pg.Client({ connectionString: base.toString() });
    await admin.connect();
    await admin.query(`drop database if exists "${name}" with (force)`);
    await admin.query(`create database "${name}"`);
    base.pathname = `/${name}`;
    url = base.toString();
    dir = mkdtempSync(join(tmpdir(), 'promo-migrations-'));
  });
  afterAll(async () => {
    rmSync(dir, { recursive: true, force: true });
    await admin.query(`drop database if exists "${name}" with (force)`);
    await admin.end();
  });

  it('migrates a database at 0051 up to 0052', async () => {
    const source = resolve(process.cwd(), 'drizzle');
    cpSync(source, dir, { recursive: true });
    const journalPath = join(dir, 'meta/_journal.json');
    const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
      entries: { tag: string }[];
    };
    writeFileSync(
      journalPath,
      JSON.stringify({
        ...journal,
        entries: journal.entries.filter(
          (entry) => entry.tag < '0052_promo_codes',
        ),
      }),
    );
    const pool = new pg.Pool({ connectionString: url });
    try {
      await migrate(drizzle(pool), { migrationsFolder: dir });
      await migrate(drizzle(pool), { migrationsFolder: source });
      const { rows } = await pool.query<{ t: string | null }>(
        `select to_regclass('promo_code') as t`,
      );
      expect(rows[0].t).toBe('promo_code');
    } finally {
      await pool.end();
    }
  });
});
