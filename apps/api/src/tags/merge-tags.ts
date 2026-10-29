import { inArray, sql } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { recipeTags, tags } from '../database/schema';

/**
 * Folds the Tags `fromIds` into `survivorId`: every Recipe that carried one of them gets the
 * survivor (no duplicate link where it already had it) and the folded Tags are deleted. The caller
 * has locked the rows it is about to fold.
 */
export async function foldTagsInto(
  tx: Tx,
  survivorId: string,
  fromIds: readonly string[],
): Promise<void> {
  if (fromIds.length === 0) return;
  await tx.execute(
    sql`INSERT INTO ${recipeTags} (recipe_id, tag_id)
        SELECT DISTINCT ${recipeTags.recipeId}, ${survivorId}::uuid FROM ${recipeTags}
        WHERE ${inArray(recipeTags.tagId, [...fromIds])}
        ON CONFLICT DO NOTHING`,
  );
  await tx.delete(tags).where(inArray(tags.id, [...fromIds]));
}
