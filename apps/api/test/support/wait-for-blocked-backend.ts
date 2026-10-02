import type pg from 'pg';

/** Polls until some backend is waiting on a lock held by the backend with pid `holder`. */
export async function waitForBlockedBackend(pool: pg.Pool, holder: number) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const { rows } = await pool.query(
      `SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))`,
      [holder],
    );
    if (rows.length > 0) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('no backend ever blocked on a lock');
}
