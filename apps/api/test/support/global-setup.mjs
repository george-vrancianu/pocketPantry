// Runs once before all integration workers. Migrates and seeds a template
// database, then clones it per Jest worker so workers never share mutable state.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { baseUrl, urlFor, workerDatabases } from './test-db.mjs';

export default async function globalSetup(globalConfig) {
  // pid keeps concurrent runs against one server from colliding.
  const prefix = `${new URL(baseUrl).pathname.slice(1)}_${process.pid}`;
  const template = `${prefix}_template`;
  process.env.TEST_DB_PREFIX = prefix;

  const admin = new pg.Pool({ connectionString: baseUrl });
  try {
    await admin.query(`create database "${template}"`);
  } finally {
    await admin.end();
  }

  const pool = new pg.Pool({ connectionString: urlFor(template) });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: resolve(process.cwd(), 'drizzle'),
    });
  } finally {
    await pool.end();
  }
  // Seed the starter Catalog once, into the template, so every clone has it.
  execFileSync('npx', ['tsx', 'src/catalog/seed/run-seed.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: urlFor(template) },
  });

  const clone = new pg.Pool({ connectionString: baseUrl });
  try {
    for (const name of workerDatabases(prefix, globalConfig.maxWorkers)) {
      await clone.query(`create database "${name}" template "${template}"`);
    }
  } finally {
    await clone.end();
  }
}
