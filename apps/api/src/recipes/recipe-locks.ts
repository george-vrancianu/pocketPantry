import { and, eq, isNull } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { family, recipes } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { recipeNotFound } from './recipe-errors';

/**
 * Locks the Recipe row for the transaction and returns it; 404 when it is not
 * one (FOR NO KEY UPDATE: exclusive between writers, but it does not conflict
 * with the KEY SHARE of a Pairing link's foreign-key check, so two Recipes
 * linking each other cannot deadlock). `familyId` null means a Catalog Recipe, else a Recipe of that Family:
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
    .for('no key update');
  if (!row) throw recipeNotFound();
  return row;
}

/** Locks the Catalog Recipe row for the transaction and returns it; 404 when it is not one. */
export const lockCatalogRecipe = (tx: Tx, id: string) =>
  lockRecipe(tx, id, null);

/**
 * Takes the locks of a write on a Recipe in the one order every writer uses:
 * the Family row first (Family Recipes only), then the Recipe row. A Family
 * deleted in the meantime is a 404, not a foreign key error.
 */
export async function lockRecipeForWrite(
  tx: Tx,
  id: string,
  familyId: string | null,
) {
  if (familyId !== null) await lockFamilyRow(tx, familyId);
  return lockRecipe(tx, id, familyId);
}

/** Locks the Family row; 404 `recipes.not_found` when the Family is gone. */
export async function lockFamilyRow(tx: Tx, familyId: string) {
  await lockFamilies(tx, [familyId]);
  const [row] = await tx
    .select({ id: family.id })
    .from(family)
    .where(eq(family.id, familyId));
  if (!row) throw recipeNotFound();
}
