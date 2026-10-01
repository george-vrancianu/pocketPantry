// Runs once before all integration workers, so they never race to migrate an empty database.
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

export default async function globalSetup() {
  const pool = new pg.Pool({
    connectionString:
      process.env.TEST_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5433/pocket_pantry_test',
  });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: resolve(process.cwd(), 'drizzle'),
    });
  } finally {
    await pool.end();
  }
}
