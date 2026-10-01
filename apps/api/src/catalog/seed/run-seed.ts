// CLI entry: `npm run db:seed -w @pocket-pantry/api` (needs DATABASE_URL).
// Seeds the Catalog; outside production it also adds the local test accounts.
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { parseAdminEmails } from '../../auth/admin-emails';
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

    const env = validateEnv(process.env);
    if (env.NODE_ENV === 'production') return;
    const created = await seedTestAccounts(database, {
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      clientOrigin: env.CLIENT_ORIGIN,
      adminEmails: parseAdminEmails(env.ADMIN_EMAILS),
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
