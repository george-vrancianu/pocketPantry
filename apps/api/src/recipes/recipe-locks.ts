import { and, eq, isNull } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import { recipes } from '../database/schema';
import { recipeNotFound } from './recipe-errors';

/**
 * Locks the Catalog Recipe row for the transaction (FOR NO KEY UPDATE: still exclusive between
 * writers, but it does not conflict with the KEY SHARE of a Pairing link's foreign-key check, so
 * two Recipes linking each other cannot deadlock) and returns it; 404 when it is not one. */
export async function lockCatalogRecipe(tx: Tx, id: string) {
  const [row] = await tx
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), isNull(recipes.familyId)))
    .for('no key update');
  if (!row) throw recipeNotFound();
  return row;
}
