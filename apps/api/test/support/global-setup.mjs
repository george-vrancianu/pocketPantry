// Runs once before all integration workers. Migrates and seeds a template
// database, then clones it per Jest worker so workers never share mutable state.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { baseUrl, urlFor, workerDatabases } from './test-db.mjs';

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== 'ESRCH';
  }
}

export default async function globalSetup(globalConfig) {
  const name = new URL(baseUrl).pathname.slice(1);
  // pid keeps concurrent runs against one server from colliding.
  const prefix = `${name}_${process.pid}`;
  const template = `${prefix}_template`;
  process.env.TEST_DB_PREFIX = prefix;
  process.env.TEST_DB_URL_BASE = urlFor(prefix);

  const admin = new pg.Pool({ connectionString: baseUrl });
  try {
    // Teardown never runs after Ctrl-C or a failed setup: sweep dead runs' databases.
    const { rows } = await admin.query(
      'select datname from pg_database where starts_with(datname, $1)',
      [`${name}_`],
    );
    for (const { datname } of rows) {
      const pid = Number(datname.slice(name.length + 1).split('_')[0]);
      if (Number.isInteger(pid) && !isAlive(pid)) {
        await admin.query(`drop database if exists "${datname}" with (force)`);
      }
    }

    await admin.query(`create database "${template}"`);

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

    for (const worker of workerDatabases(prefix, globalConfig.maxWorkers)) {
      await admin.query(`create database "${worker}" template "${template}"`);
    }
  } finally {
    await admin.end();
  }
}
