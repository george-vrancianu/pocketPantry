import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { exceedsMaxQuantity } from '../common/quantity';
import { quantityInUnit, unitsMerge } from '../recipes/matching/units';
import type { Tx } from '../database/database.types';
import { clearRunningLowOnRestock } from '../pantry/running-low-flags';
import { recordStocked } from '../pantry/stock-history';
import {
  batches,
  ingredients,
  knownBarcodes,
  recipeIngredientLines,
  shoppingItemSourceRecipes,
  shoppingItems,
  shoppingLists,
  shoppingTemplateLines,
  shoppingTemplates,
} from '../database/schema';
import { sumQuantities } from '../shopping/shopping.service';

export type UnmatchedRelinkCounts = {
  relinkedBatches: number;
  relinkedShoppingItems: number;
  relinkedTemplateLines: number;
  relinkedRecipeLines: number;
};

/**
 * Relinks Unmatched rows to an Ingredient: the one rule behind both the Admin
 * resolve and a Member adding a Family Ingredient (ADR 0011). The caller has
 * locked the rows and passes the ids of its Unmatched entries; it deletes the
 * entries itself. Template lines carry no entry, so they are found by the
 * matching `key`, limited to `familyId`'s Templates when given.
 *
 * Batches move from their "Other" Leaf to the Ingredient's own Leaf Category
 * and record stock history (ADR 0005), as a new Batch of it would.
 */
export async function relinkUnmatched(
  tx: Tx,
  input: {
    key: string;
    target: Pick<typeof ingredients.$inferSelect, 'id' | 'leafCategoryId'>;
    itemIds: string[];
    batchIds: string[];
    lineIds: string[];
    familyId?: string;
  },
): Promise<UnmatchedRelinkCounts> {
  const { key, target, itemIds, batchIds, lineIds, familyId } = input;
  const relinkedShoppingItems = await relinkShoppingItems(
    tx,
    itemIds,
    target.id,
  );
  // Unmatched Template lines carry the same matching key; they have no queue entry of their own.
  const relinkedTemplateLines = await tx
    .update(shoppingTemplateLines)
    .set({ ingredientId: target.id, name: null, normalizedName: null })
    .where(
      and(
        eq(shoppingTemplateLines.normalizedName, key),
        isNull(shoppingTemplateLines.ingredientId),
        familyId === undefined
          ? undefined
          : inArray(
              shoppingTemplateLines.templateId,
              tx
                .select({ id: shoppingTemplates.id })
                .from(shoppingTemplates)
                .where(eq(shoppingTemplates.familyId, familyId)),
            ),
      ),
    )
    .returning({ id: shoppingTemplateLines.id });
  const relinkedBatchRows =
    batchIds.length === 0
      ? []
      : await tx
          .update(batches)
          .set({
            ingredientId: target.id,
            // Under the Ingredient's own Leaf Category, no longer an "Other" Leaf.
            leafCategoryId: target.leafCategoryId,
            unmatched: false,
            rawName: null,
          })
          .where(
            and(inArray(batches.id, batchIds), eq(batches.unmatched, true)),
          )
          .returning({ id: batches.id, familyId: batches.familyId });
  // A relinked Batch is a new Batch of the Ingredient: the Family has restocked
  // it (stock history, its dismissal ends, Running Low clears).
  for (const owner of new Set(relinkedBatchRows.map((row) => row.familyId))) {
    await recordStocked(tx, owner, [target.id]);
    await clearRunningLowOnRestock(tx, owner, [target.id]);
  }

  // Known Barcodes saved under the typed name follow it to the Ingredient: the Family's own
  // for a Family create, every Family's for an Admin resolve.
  await tx
    .update(knownBarcodes)
    .set({ ingredientId: target.id, rawName: null, normalizedName: null })
    .where(
      and(
        eq(knownBarcodes.normalizedName, key),
        isNull(knownBarcodes.ingredientId),
        familyId === undefined
          ? undefined
          : eq(knownBarcodes.familyId, familyId),
      ),
    );

  // Family Recipe lines: the line keeps its quantity, unit, note and position.
  const relinkedLines =
    lineIds.length === 0
      ? []
      : await tx
          .update(recipeIngredientLines)
          .set({
            ingredientId: target.id,
            rawName: null,
            normalizedName: null,
          })
          .where(
            and(
              inArray(recipeIngredientLines.id, lineIds),
              isNull(recipeIngredientLines.ingredientId),
            ),
          )
          .returning({ id: recipeIngredientLines.id });

  return {
    relinkedBatches: relinkedBatchRows.length,
    relinkedShoppingItems,
    relinkedTemplateLines: relinkedTemplateLines.length,
    relinkedRecipeLines: relinkedLines.length,
  };
}

/**
 * Relinks Unmatched Shopping Items to the Ingredient. On the active list a
 * Shopping Item merges into an existing one for the same Ingredient and
 * a compatible unit (the same, or g/kg, ml/l, converted into the existing
 * line's unit; the list's "adding an item for an Ingredient already on it merges"
 * rule); archived lists are history, so there it only relinks, and so does a
 * merge that would pass the quantity cap.
 */
async function relinkShoppingItems(
  tx: Tx,
  itemIds: string[],
  ingredientId: string,
): Promise<number> {
  if (itemIds.length === 0) return 0;
  const rows = await tx
    .select({
      id: shoppingItems.id,
      listId: shoppingItems.listId,
      unit: shoppingItems.unit,
      quantity: shoppingItems.quantity,
      checked: shoppingItems.checked,
      status: shoppingLists.status,
    })
    .from(shoppingItems)
    .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
    .where(
      and(
        inArray(shoppingItems.id, itemIds),
        isNull(shoppingItems.ingredientId),
      ),
    )
    .orderBy(shoppingItems.id);
  for (const row of rows) {
    const candidates =
      row.status === 'active'
        ? await tx
            .select({
              id: shoppingItems.id,
              quantity: shoppingItems.quantity,
              unit: shoppingItems.unit,
              checked: shoppingItems.checked,
            })
            .from(shoppingItems)
            .where(
              and(
                eq(shoppingItems.listId, row.listId),
                eq(shoppingItems.ingredientId, ingredientId),
              ),
            )
            .orderBy(asc(shoppingItems.createdAt), asc(shoppingItems.id))
            .for('update')
        : [];
    // The same rule as adding: the oldest line with a compatible unit (the same, or g/kg, ml/l).
    const twin = candidates.find((c) => unitsMerge(c.unit, row.unit));
    const rowQuantity = twin
      ? quantityInUnit(
          row.quantity === null ? null : Number(row.quantity),
          row.unit,
          twin.unit,
        )
      : null;
    const merged = twin
      ? sumQuantities(
          twin.quantity === null ? null : Number(twin.quantity),
          rowQuantity,
        )
      : null;
    // A merge past the cap is neither rejected nor clamped: an Admin cannot
    // fix a Family's quantities, and clamping would lose some. The Shopping
    // Item stays separate, relinked.
    if (twin && !exceedsMaxQuantity(merged)) {
      await tx
        .update(shoppingItems)
        .set({
          quantity: merged === null ? null : String(merged),
          // Still wanted if either Shopping Item was.
          checked: twin.checked && row.checked,
        })
        .where(eq(shoppingItems.id, twin.id));
      // Its Source Recipes move to the twin first, or the delete would
      // cascade them away.
      const sources = await tx
        .select({ recipeId: shoppingItemSourceRecipes.recipeId })
        .from(shoppingItemSourceRecipes)
        .where(eq(shoppingItemSourceRecipes.shoppingItemId, row.id));
      if (sources.length > 0) {
        await tx
          .insert(shoppingItemSourceRecipes)
          .values(
            sources.map(({ recipeId }) => ({
              shoppingItemId: twin.id,
              recipeId,
            })),
          )
          .onConflictDoNothing();
      }
      // Its queue entry goes with it (cascade) and is also deleted by id.
      await tx.delete(shoppingItems).where(eq(shoppingItems.id, row.id));
    } else {
      await tx
        .update(shoppingItems)
        .set({ ingredientId, name: null, normalizedName: null })
        .where(eq(shoppingItems.id, row.id));
    }
  }
  return rows.length;
}
