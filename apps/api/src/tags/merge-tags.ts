import { inArray, sql } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { recipeDrafts, recipeTags, tags } from '../database/schema';

/**
 * Folds the Tags `fromIds` into `survivorId`: every Recipe that carried one of them gets the
 * survivor (no duplicate link where it already had it), the `tagIds` of stored Recipe Drafts follow
 * the same way (in place, once each), and the folded Tags are deleted. The caller has locked the
 * rows it is about to fold.
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
  // A draft keeps its place in the Member's list and its version: only the list of ids changes.
  const folded = sql.join(
    fromIds.map((id) => sql`${id}`),
    sql`, `,
  );
  await tx.execute(
    sql`UPDATE ${recipeDrafts} d
        SET content = jsonb_set(d.content, '{tagIds}', (
          SELECT COALESCE(jsonb_agg(m.id ORDER BY m.first), '[]'::jsonb)
          FROM (
            SELECT mapped.id, min(mapped.ord) AS first
            FROM (
              SELECT CASE WHEN e.id IN (${folded}) THEN ${survivorId} ELSE e.id END AS id, e.ord
              FROM jsonb_array_elements_text(d.content->'tagIds') WITH ORDINALITY AS e(id, ord)
            ) mapped
            GROUP BY mapped.id
          ) m
        ))
        WHERE jsonb_typeof(d.content->'tagIds') = 'array'
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(d.content->'tagIds') AS e(id)
            WHERE e.id IN (${folded})
          )`,
  );
  await tx.delete(tags).where(inArray(tags.id, [...fromIds]));
}
