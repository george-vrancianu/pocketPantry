import { and, eq, inArray } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import { suggestionDismissals } from '../database/schema';

/**
 * A new Batch of an Ingredient ends its Family's dismissal of it. Called by every
 * path that creates a Batch: manual and Scan saves, Finish Shopping, and a relinked
 * Unmatched Batch.
 */
export async function clearDismissals(
  executor: Executor,
  familyId: string,
  ingredientIds: Array<string | null>,
): Promise<void> {
  const ids = [...new Set(ingredientIds.filter((id) => id !== null))];
  if (ids.length === 0) return;
  await executor
    .delete(suggestionDismissals)
    .where(
      and(
        eq(suggestionDismissals.familyId, familyId),
        inArray(suggestionDismissals.ingredientId, ids),
      ),
    );
}
