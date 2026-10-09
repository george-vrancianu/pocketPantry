import { sql } from 'drizzle-orm';
import type { Executor } from '../database/database.types';

/**
 * Transaction-scoped advisory lock on the set of Aisles and their shop order.
 * Everything that adds, removes or renumbers Aisles takes it (Admin create,
 * reorder and delete, and the seed), so a reorder's "is this every Aisle?"
 * check and its writes never interleave with another change to the set.
 */
export async function lockAisleOrder(
  executor: Pick<Executor, 'execute'>,
): Promise<void> {
  await executor.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended('catalog-aisle-order', 0))`,
  );
}
