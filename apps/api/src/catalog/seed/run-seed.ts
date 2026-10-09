// CLI entry: `npm run db:seed -w @pocket-pantry/api` (needs DATABASE_URL).
// Seeds the Catalog; with NODE_ENV=development it also adds the local test accounts.
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  seedTestAccounts,
  TEST_ACCOUNT_PASSWORD,
} from '../../auth/seed-test-accounts';
import { validateEnv } from '../../config/env';
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
    const database = drizzle(pool, { schema });
    await seedCatalog(database);
    console.log('Catalog seeded.');

    // Opt-in on an explicit development env (as in .env.example), so CI,
    // tests, and any env that forgets NODE_ENV never get known credentials.
    if (process.env.NODE_ENV !== 'development') return;
    const env = validateEnv(process.env);
    const created = await seedTestAccounts(database, {
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      clientOrigin: env.CLIENT_ORIGIN,
    });
    console.log(
      created.length
        ? `Test accounts created (password ${TEST_ACCOUNT_PASSWORD}): ${created.join(', ')}`
        : 'Test accounts already exist.',
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
