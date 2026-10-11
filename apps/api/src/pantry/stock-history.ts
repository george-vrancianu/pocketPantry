import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import { batches, ingredientStockHistory } from '../database/schema';
import { clearDismissals } from './suggestion-dismissals';

/** Deleting a Batch this soon after it was created is a mistaken entry, not a use. */
export const MISTAKEN_ENTRY_MS = 10 * 60_000;
/** An Ingredient stays Used Up for this long after its last Batch was removed. */
export const USED_UP_WINDOW_MS = 30 * 86_400_000;

const unique = (ids: Array<string | null>): string[] => [
  ...new Set(ids.filter((id): id is string => id !== null)),
];

/**
 * A Batch of each Ingredient now exists: record the stocking and end the Family's
 * dismissals of them. Unmatched Batches (null Ingredient) are not tracked.
 * `now` is read from `Date.now()` so tests can move the clock. See ADR 0005.
 */
export async function recordStocked(
  executor: Executor,
  familyId: string,
  ingredientIds: Array<string | null>,
  now: Date = new Date(Date.now()),
): Promise<void> {
  const ids = unique(ingredientIds);
  if (ids.length === 0) return;
  await executor
    .insert(ingredientStockHistory)
    .values(
      ids.map((ingredientId) => ({
        familyId,
        ingredientId,
        lastStockedAt: now,
        usedUpAt: null,
      })),
    )
    .onConflictDoUpdate({
      target: [
        ingredientStockHistory.familyId,
        ingredientStockHistory.ingredientId,
      ],
      set: {
        lastStockedAt: now,
        usedUpAt: null,
        updatedAt: sql`now()`,
      },
    });
  await clearDismissals(executor, familyId, ids);
}

/**
 * Batches were just deleted: mark each Ingredient left with no Batches as Used Up,
 * unless every deleted Batch of it was created under 10 minutes before `now`.
 * Call after the delete, in the same transaction.
 */
export async function recordRemoved(
  executor: Executor,
  familyId: string,
  removed: Array<{ ingredientId: string | null; createdAt: Date }>,
  now: Date = new Date(Date.now()),
): Promise<void> {
  const settled = unique(
    removed
      .filter(
        (batch) =>
          now.getTime() - batch.createdAt.getTime() >= MISTAKEN_ENTRY_MS,
      )
      .map((batch) => batch.ingredientId),
  );
  if (settled.length === 0) return;
  // Two deletes of the last Batches must not both see the other's uncommitted Batch:
  // lock the history rows, in a fixed order, so the second waits and then sees it gone.
  await executor
    .select({ ingredientId: ingredientStockHistory.ingredientId })
    .from(ingredientStockHistory)
    .where(
      and(
        eq(ingredientStockHistory.familyId, familyId),
        inArray(ingredientStockHistory.ingredientId, settled),
      ),
    )
    .orderBy(ingredientStockHistory.ingredientId)
    .for('update');
  const stillStocked = await executor
    .selectDistinct({ ingredientId: batches.ingredientId })
    .from(batches)
    .where(
      and(
        eq(batches.familyId, familyId),
        inArray(batches.ingredientId, settled),
      ),
    );
  const stocked = new Set(stillStocked.map((row) => row.ingredientId));
  const gone = settled.filter((id) => !stocked.has(id));
  if (gone.length === 0) return;
  await executor
    .update(ingredientStockHistory)
    .set({ usedUpAt: now, updatedAt: sql`now()` })
    .where(
      and(
        eq(ingredientStockHistory.familyId, familyId),
        inArray(ingredientStockHistory.ingredientId, gone),
      ),
    );
}
