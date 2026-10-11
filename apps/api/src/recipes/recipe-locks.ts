import { and, eq, isNull } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { recipes } from '../database/schema';
import { recipeNotFound } from './recipe-errors';

/**
 * Locks the Recipe row for the transaction and returns it; 404 when it is not
 * one. `familyId` null means a Catalog Recipe, else a Recipe of that Family:
 * the Admin and Member paths never reach each other's Recipes.
 */
export async function lockRecipe(tx: Tx, id: string, familyId: string | null) {
  const [row] = await tx
    .select()
    .from(recipes)
    .where(
      and(
        eq(recipes.id, id),
        familyId === null
          ? isNull(recipes.familyId)
          : eq(recipes.familyId, familyId),
      ),
    )
    .for('update');
  if (!row) throw recipeNotFound();
  return row;
}

/** Locks the Catalog Recipe row for the transaction and returns it; 404 when it is not one. */
export const lockCatalogRecipe = (tx: Tx, id: string) =>
  lockRecipe(tx, id, null);
