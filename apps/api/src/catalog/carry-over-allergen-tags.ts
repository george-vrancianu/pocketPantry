import { eq, inArray } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { ingredientAllergens, ingredients } from '../database/schema';

/**
 * Carries Members' Allergen tags from Family Ingredients onto the Ingredient an Admin promotes
 * or merges them into (ADR 0011, 0014). Call it before `mergeIngredients`, which deletes the
 * sources and their tags. The caller holds the locks.
 *
 * Only a checked copy speaks: a Member tagged it, or ticked "None". An Unchecked copy adds
 * nothing and never marks anything checked.
 *
 * - `promote`: `targetId` is the promoted copy, every Family copy of the name is in the
 *   union. The result is checked when any copy was, so a "None" or a tag survives; when no
 *   copy was checked it stays Unchecked (a shared row would otherwise read as "contains
 *   none"). Either way it is flagged for the Admin to review.
 * - `merge`: `targetId` is a shared Ingredient the Admin already curates. Its tags are kept and
 *   the copies' tags are added (a union). It is flagged only when a tag was actually added,
 *   as only then did the Family's entry change what the Admin curated.
 */
export async function carryOverAllergenTags(
  tx: Tx,
  targetId: string,
  sourceIds: readonly string[],
  kind: 'promote' | 'merge',
): Promise<void> {
  const copyIds =
    kind === 'promote' ? [targetId, ...sourceIds] : [...sourceIds];
  if (copyIds.length === 0) return;
  const copies = await tx
    .select({ id: ingredients.id, checked: ingredients.allergensChecked })
    .from(ingredients)
    .where(inArray(ingredients.id, copyIds));
  const checkedIds = copies
    .filter((copy) => copy.checked)
    .map((copy) => copy.id);
  const carried = checkedIds.length
    ? [
        ...new Set(
          (
            await tx
              .select({ allergenId: ingredientAllergens.allergenId })
              .from(ingredientAllergens)
              .where(inArray(ingredientAllergens.ingredientId, checkedIds))
          ).map((row) => row.allergenId),
        ),
      ]
    : [];
  const has = new Set(
    (
      await tx
        .select({ allergenId: ingredientAllergens.allergenId })
        .from(ingredientAllergens)
        .where(eq(ingredientAllergens.ingredientId, targetId))
    ).map((row) => row.allergenId),
  );
  const added = carried.filter((allergenId) => !has.has(allergenId));
  if (added.length) {
    await tx
      .insert(ingredientAllergens)
      .values(
        added.map((allergenId) => ({ ingredientId: targetId, allergenId })),
      )
      .onConflictDoNothing();
  }
  if (kind === 'promote') {
    await tx
      .update(ingredients)
      .set({
        allergensChecked: checkedIds.length > 0,
        allergensReviewPending: true,
      })
      .where(eq(ingredients.id, targetId));
  } else if (added.length) {
    await tx
      .update(ingredients)
      .set({ allergensReviewPending: true })
      .where(eq(ingredients.id, targetId));
  }
}
