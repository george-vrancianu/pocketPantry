import { and, eq, inArray, notExists } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import {
  batches,
  ingredientStockHistory,
  runningLow,
} from '../database/schema';

const unique = (ids: Array<string | null>): string[] => [
  ...new Set(ids.filter((id): id is string => id !== null)),
];

/**
 * A new Batch of an Ingredient means the Family has restocked: clear its
 * "Running low" flag. Call in the same transaction as the Batch insert.
 */
export async function clearRunningLowOnRestock(
  executor: Executor,
  familyId: string,
  ingredientIds: Array<string | null>,
): Promise<void> {
  const ids = unique(ingredientIds);
  if (ids.length === 0) return;
  await executor
    .delete(runningLow)
    .where(
      and(
        eq(runningLow.familyId, familyId),
        inArray(runningLow.ingredientId, ids),
      ),
    );
}

/**
 * Batches were just deleted: clear the "Running low" flag of each Ingredient the
 * Family has no Batches of left. Call after the delete, in the same transaction.
 * Editing a Batch never calls this.
 */
export async function clearRunningLowWhenGone(
  executor: Executor,
  familyId: string,
  removedIngredientIds: Array<string | null>,
): Promise<void> {
  const ids = unique(removedIngredientIds);
  if (ids.length === 0) return;
  // Two deletes of the last Batches must not both miss each other's uncommitted
  // delete: lock the history rows in a fixed order first, as recordRemoved does.
  await executor
    .select({ ingredientId: ingredientStockHistory.ingredientId })
    .from(ingredientStockHistory)
    .where(
      and(
        eq(ingredientStockHistory.familyId, familyId),
        inArray(ingredientStockHistory.ingredientId, ids),
      ),
    )
    .orderBy(ingredientStockHistory.ingredientId)
    .for('update');
  await executor.delete(runningLow).where(
    and(
      eq(runningLow.familyId, familyId),
      inArray(runningLow.ingredientId, ids),
      notExists(
        executor
          .select({ id: batches.id })
          .from(batches)
          .where(
            and(
              eq(batches.familyId, familyId),
              eq(batches.ingredientId, runningLow.ingredientId),
            ),
          ),
      ),
    ),
  );
}
