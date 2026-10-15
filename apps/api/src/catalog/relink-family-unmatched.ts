import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import {
  batches,
  recipeIngredientLines,
  recipes,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
} from '../database/schema';
import { normalizeName } from './normalize';
import { relinkUnmatched } from './relink-unmatched';

/**
 * The Admin resolve, limited to one Family: that Family's Unmatched Batches,
 * Shopping Items, Template lines and Recipe lines with this normalised name
 * get the Ingredient, and their Unmatched entries go (ADR 0011). Items a
 * Family Ingredient delete left Unmatched have no entry, so they are found by
 * name within the Family as well.
 */
export async function relinkFamilyUnmatched(
  tx: Tx,
  familyId: string,
  key: string,
  target: { id: string; leafCategoryId: string },
): Promise<void> {
  // Accepted race: a Pantry save or Shopping List add that matched the old
  // Catalog and commits after this read stays Unmatched (and in the Admin queue).
  const named = eq(unmatchedEntries.normalizedName, key);
  const batchEntries = await tx
    .select({ id: unmatchedEntries.id, rowId: batches.id })
    .from(unmatchedEntries)
    .innerJoin(batches, eq(batches.id, unmatchedEntries.batchId))
    .where(and(named, eq(batches.familyId, familyId)));
  const itemEntries = await tx
    .select({ id: unmatchedEntries.id, rowId: shoppingItems.id })
    .from(unmatchedEntries)
    .innerJoin(
      shoppingItems,
      eq(shoppingItems.id, unmatchedEntries.shoppingItemId),
    )
    .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
    .where(and(named, eq(shoppingLists.familyId, familyId)));
  const lineEntries = await tx
    .select({ id: unmatchedEntries.id, rowId: recipeIngredientLines.id })
    .from(unmatchedEntries)
    .innerJoin(
      recipeIngredientLines,
      eq(recipeIngredientLines.id, unmatchedEntries.ingredientLineId),
    )
    .innerJoin(recipes, eq(recipes.id, recipeIngredientLines.recipeId))
    .where(and(named, eq(recipes.familyId, familyId)));

  // Unmatched rows with no entry: a Family Ingredient delete leaves these.
  const unqueuedItems = await tx
    .select({ id: shoppingItems.id })
    .from(shoppingItems)
    .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
    .where(
      and(
        eq(shoppingItems.normalizedName, key),
        isNull(shoppingItems.ingredientId),
        eq(shoppingLists.familyId, familyId),
      ),
    );
  const unqueuedLines = await tx
    .select({ id: recipeIngredientLines.id })
    .from(recipeIngredientLines)
    .innerJoin(recipes, eq(recipes.id, recipeIngredientLines.recipeId))
    .where(
      and(
        eq(recipeIngredientLines.normalizedName, key),
        isNull(recipeIngredientLines.ingredientId),
        eq(recipes.familyId, familyId),
      ),
    );
  // Batches keep no normalised name; one Family's Unmatched Batches are few.
  const familyUnmatchedBatches = await tx
    .select({ id: batches.id, rawName: batches.rawName })
    .from(batches)
    .where(and(eq(batches.familyId, familyId), eq(batches.unmatched, true)));
  const unqueuedBatches = familyUnmatchedBatches.filter(
    (row) => row.rawName !== null && normalizeName(row.rawName) === key,
  );

  const distinct = (ids: string[]) => [...new Set(ids)].sort();
  const batchIds = distinct([
    ...batchEntries.map((e) => e.rowId),
    ...unqueuedBatches.map((row) => row.id),
  ]);
  const itemIds = distinct([
    ...itemEntries.map((e) => e.rowId),
    ...unqueuedItems.map((row) => row.id),
  ]);
  const lineIds = distinct([
    ...lineEntries.map((e) => e.rowId),
    ...unqueuedLines.map((row) => row.id),
  ]);
  // Row locks in ascending id, as the Admin resolve takes them.
  if (itemIds.length > 0) {
    await tx
      .select({ id: shoppingItems.id })
      .from(shoppingItems)
      .where(inArray(shoppingItems.id, itemIds))
      .orderBy(shoppingItems.id)
      .for('update');
  }
  if (batchIds.length > 0) {
    await tx
      .select({ id: batches.id })
      .from(batches)
      .where(inArray(batches.id, batchIds))
      .orderBy(batches.id)
      .for('update');
  }
  if (lineIds.length > 0) {
    await tx
      .select({ id: recipeIngredientLines.id })
      .from(recipeIngredientLines)
      .where(inArray(recipeIngredientLines.id, lineIds))
      .orderBy(recipeIngredientLines.id)
      .for('update');
  }

  await relinkUnmatched(tx, {
    key,
    target,
    itemIds,
    batchIds,
    lineIds,
    familyId,
  });
  const entryIds = [...batchEntries, ...itemEntries, ...lineEntries].map(
    (e) => e.id,
  );
  if (entryIds.length > 0) {
    await tx
      .delete(unmatchedEntries)
      .where(inArray(unmatchedEntries.id, entryIds));
  }
}
