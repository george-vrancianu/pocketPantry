// Drops the template and per-worker databases created by global setup.
import pg from 'pg';
import { baseUrl, workerDatabases } from './test-db.mjs';

export default async function globalTeardown(globalConfig) {
  const prefix = process.env.TEST_DB_PREFIX;
  const pool = new pg.Pool({ connectionString: baseUrl });
  try {
    for (const name of [
      `${prefix}_template`,
      ...workerDatabases(prefix, globalConfig.maxWorkers),
    ]) {
      await pool.query(`drop database if exists "${name}" with (force)`);
    }
  } finally {
    await pool.end();
  }
}
