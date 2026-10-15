import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { catalogTranslations } from '../database/schema';
import type { MergedIngredient } from './merge-ingredients';
import { normalizeName } from './normalize';

/**
 * Keeps the names of Family Ingredients just merged into `targetId` as Family
 * Synonyms of their own Family, so that Family's typing and Scans still match
 * (#276, ADR 0011). One per Family and normalised value; the Family index makes
 * a repeat a no-op.
 *
 * With `skipSharedNames` (merge into an existing shared Ingredient), a name the
 * target already answers to in any locale is not kept, and so are the Family
 * Synonyms this merge moved onto it (`movedSynonymIds`, read before the merge)
 * that now repeat such a name. Synonyms the target already had are left alone.
 * A promote must not skip: the copies' names equal the promoted Ingredient's own.
 */
export async function keepFamilyNames(
  tx: Tx,
  targetId: string,
  merged: MergedIngredient[],
  {
    skipSharedNames,
    movedSynonymIds = [],
  }: { skipSharedNames: boolean; movedSynonymIds?: string[] },
): Promise<void> {
  const rows = merged.flatMap((copy) => {
    const key = normalizeName(copy.name);
    return copy.ownerFamilyId && key
      ? [
          {
            id: randomUUID(),
            entityType: 'ingredient' as const,
            entityId: targetId,
            ownerFamilyId: copy.ownerFamilyId,
            locale: copy.nameLocale ?? 'en',
            kind: 'synonym' as const,
            value: copy.name,
            normalizedValue: key,
          },
        ]
      : [];
  });
  const inserted =
    rows.length > 0
      ? await tx
          .insert(catalogTranslations)
          .values(rows)
          .onConflictDoNothing()
          .returning({ id: catalogTranslations.id })
      : [];
  if (!skipSharedNames) return;
  const ours = [...movedSynonymIds, ...inserted.map((row) => row.id)];
  if (ours.length === 0) return;
  await tx.execute(sql`
    DELETE FROM ${catalogTranslations} f
    WHERE f.id IN (${sql.join(
      ours.map((id) => sql`${id}::uuid`),
      sql`, `,
    )})
      AND (
        f.normalized_value = (SELECT i.normalized_name FROM ingredients i WHERE i.id = ${targetId}::uuid)
        OR EXISTS (
          SELECT 1 FROM ${catalogTranslations} s
          WHERE s.entity_type = 'ingredient' AND s.entity_id = ${targetId}::uuid
            AND s.owner_family_id IS NULL
            AND s.normalized_value = f.normalized_value))`);
}
