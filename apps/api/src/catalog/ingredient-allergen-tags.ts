import { eq, inArray } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Tx } from '../database/database.types';
import {
  allergens,
  ingredientAllergens,
  ingredients,
} from '../database/schema';

/**
 * Replaces an Ingredient's Allergen tags with exactly `allergenIds` (empty = contains none)
 * and marks it checked, for shared and Family Ingredients alike (ADR 0014). It also clears
 * the review flag a promote or merge sets: whoever tags it has reviewed the tags.
 *
 * The caller has locked the Ingredient row. A retired Allergen cannot be newly tagged (409
 * `catalog.allergen_retired`), but one the Ingredient already has may stay; an unknown
 * Allergen is a 404.
 */
export async function replaceIngredientAllergenTags(
  tx: Tx,
  ingredientId: string,
  allergenIds: readonly string[],
): Promise<void> {
  const known = allergenIds.length
    ? await tx
        .select({ id: allergens.id, archivedAt: allergens.archivedAt })
        .from(allergens)
        .where(inArray(allergens.id, [...allergenIds]))
    : [];
  if (known.length !== new Set(allergenIds).size) {
    throw new ApiException(404, 'catalog.not_found', { entity: 'allergen' });
  }
  const current = new Set(
    (
      await tx
        .select({ allergenId: ingredientAllergens.allergenId })
        .from(ingredientAllergens)
        .where(eq(ingredientAllergens.ingredientId, ingredientId))
    ).map((row) => row.allergenId),
  );
  if (known.some((row) => row.archivedAt && !current.has(row.id))) {
    throw new ApiException(409, 'catalog.allergen_retired');
  }
  await tx
    .delete(ingredientAllergens)
    .where(eq(ingredientAllergens.ingredientId, ingredientId));
  if (allergenIds.length) {
    await tx.insert(ingredientAllergens).values(
      [...new Set(allergenIds)].map((allergenId) => ({
        ingredientId,
        allergenId,
      })),
    );
  }
  await tx
    .update(ingredients)
    .set({ allergensChecked: true, allergensReviewPending: false })
    .where(eq(ingredients.id, ingredientId));
}
