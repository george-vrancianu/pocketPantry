// CLI entry: `npm run credits:grant -w apps/api -- --family <id> --amount <n> --reason "<why>"`
// (needs DATABASE_URL). Grants Credits to a Family by hand.
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../database/schema';
import { GRANT_USAGE, parseGrantArgs } from './grant-args';
import { runGrant } from './run-grant';

try {
  process.loadEnvFile(resolve(process.cwd(), '../../.env'));
} catch {
  // No root .env: rely on the environment (CI, containers).
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  // Refuse bad arguments before opening a connection.
  const parsed = parseGrantArgs(argv);
  if (!parsed.ok) {
    console.error(`${parsed.message}\n${GRANT_USAGE}`);
    return 1;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required to grant Credits.');
    return 1;
  }
  const pool = new Pool({ connectionString });
  try {
    const result = await runGrant(argv, drizzle(pool, { schema }));
    (result.code === 0 ? console.log : console.error)(result.message);
    return result.code;
  } finally {
    await pool.end();
  }
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
