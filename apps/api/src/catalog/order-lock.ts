import { sql } from 'drizzle-orm';
import type { Executor } from '../database/database.types';

/*
 * Transaction-scoped advisory locks on the ordered Catalog sets, one key each:
 * Aisles (their shop order) and Eating Moments (their order).
 */

/**
 * Locks the set of Aisles and their shop order. Everything that adds, removes or renumbers Aisles takes it (Admin create,
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

/**
 * Locks the set of Eating Moments and their order, under its own key so it
 * never blocks Aisle changes. Taken by Admin create, reorder and archive.
 */
export async function lockEatingMomentOrder(
  executor: Pick<Executor, 'execute'>,
): Promise<void> {
  await executor.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended('catalog-eating-moment-order', 0))`,
  );
}

/**
 * Locks the set of Allergens, under its own key. Admin create takes it so two new
 * Allergens never get the same place at the end of the list.
 */
export async function lockAllergenOrder(
  executor: Pick<Executor, 'execute'>,
): Promise<void> {
  await executor.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended('catalog-allergen-order', 0))`,
  );
}

/** Locks the set of Tag Groups and their order, under its own key. Taken by Admin create, reorder and delete. */
export async function lockTagGroupOrder(
  executor: Pick<Executor, 'execute'>,
): Promise<void> {
  await executor.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended('catalog-tag-group-order', 0))`,
  );
}
