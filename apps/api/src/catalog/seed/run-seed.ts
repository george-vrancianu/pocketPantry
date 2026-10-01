// CLI entry: `npm run db:seed -w @pocket-pantry/api` (needs DATABASE_URL).
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../database/schema';
import { seedCatalog } from './seed-catalog';

try {
  process.loadEnvFile(resolve(process.cwd(), '../../.env'));
} catch {
  // No root .env: rely on the environment (CI, containers).
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the Catalog');
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString });
  try {
    await seedCatalog(drizzle(pool, { schema }));
    console.log('Catalog seeded.');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
