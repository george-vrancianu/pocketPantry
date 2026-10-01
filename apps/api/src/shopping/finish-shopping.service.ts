import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  resolveCatalogDefaults,
  resolveExpiryDays,
} from '../catalog/catalog-defaults';
import {
  FALLBACK_LOCALE,
  type CatalogLocale,
} from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { seedId } from '../catalog/seed/seed-catalog';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  batches,
  ingredients,
  leafCategories,
  parentCategories,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
  user,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { recordUnmatched } from '../unmatched/unmatched-entries';
import type {
  FinishProposal,
  FinishResult,
  FinishShoppingBody,
} from './finish-shopping.schemas';

const FALLBACK_LOCATION = 'cupboard' as const;
const TOP_LEVEL_OTHER_PARENT_ID = seedId.parent('other');

function addDays(from: string, days: number): string {
  const result = new Date(Date.parse(`${from}T00:00:00Z`) + days * 86_400_000);
  return result.toISOString().slice(0, 10);
}

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];
type Executor = Database | Tx;

type CheckedRow = {
  id: string;
  ingredientId: string | null;
  typedName: string | null;
  quantity: string | null;
  unit: (typeof shoppingItems.$inferSelect)['unit'];
  canonicalName: string | null;
  defaultUnit: (typeof ingredients.$inferSelect)['defaultUnit'] | null;
  leaf: typeof leafCategories.$inferSelect | null;
  parent: typeof parentCategories.$inferSelect | null;
};

/** Finish Shopping: propose Batches for the checked items, then commit the reviewed result atomically. */
@Injectable()
export class FinishShoppingService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async propose(
    memberId: string,
    locale: CatalogLocale,
    today: string = new Date().toISOString().slice(0, 10),
  ): Promise<FinishProposal> {
    const { listId, familyId } = await this.activeList(this.database, memberId);
    const overrides = await this.settings.expiryOverridesOf(familyId);
    const rows = await this.checkedRows(this.database, listId);
    const other = await this.otherTarget(this.database);
    const names = await loadDisplayNames(
      this.database,
      locale,
      rows.flatMap((row) => (row.ingredientId ? [row.ingredientId] : [])),
    );

    return {
      listId,
      lines: rows.map((row) => {
        const leaf = row.leaf ?? other.leaf;
        const parent = row.parent ?? other.parent;
        const defaults = resolveCatalogDefaults(leaf, parent);
        const expiryDays = resolveExpiryDays(leaf, parent, overrides);
        const quantity = row.quantity === null ? null : Number(row.quantity);
        return {
          itemId: row.id,
          name: row.ingredientId
            ? names.pick(
                'ingredient',
                row.ingredientId,
                row.canonicalName ?? row.typedName ?? '',
              )
            : (row.typedName ?? ''),
          unmatched: row.ingredientId === null,
          quantity,
          // A Batch needs a unit whenever it has a quantity.
          unit:
            row.unit ?? (quantity === null ? null : (row.defaultUnit ?? 'pcs')),
          location: defaults.location ?? FALLBACK_LOCATION,
          expiryDate: expiryDays === null ? null : addDays(today, expiryDays),
        };
      }),
    };
  }

  /**
   * One transaction: create the Batches, archive the list, start a new one and
   * carry the unchecked items over. Any failure rolls all of it back.
   */
  async finish(
    memberId: string,
    body: FinishShoppingBody,
  ): Promise<FinishResult> {
    return this.database.transaction(async (tx) => {
      const { listId, familyId } = await this.activeList(tx, memberId);
      // Serialise against concurrent adds and double submits on one list.
      await tx.execute(
        sql`SELECT 1 FROM ${shoppingLists} WHERE ${shoppingLists.id} = ${listId} FOR UPDATE`,
      );
      const [locked] = await tx
        .select({ status: shoppingLists.status })
        .from(shoppingLists)
        .where(eq(shoppingLists.id, listId));
      if (locked?.status !== 'active' || body.listId !== listId) {
        throw new ApiException(409, 'shopping.list_changed');
      }

      const rows = await this.checkedRows(tx, listId);
      const accounted = [
        ...body.lines.map((line) => line.itemId),
        ...body.droppedItemIds,
      ];
      const checkedIds = new Set(rows.map((row) => row.id));
      if (rows.length === 0)
        throw new ApiException(409, 'shopping.nothing_checked');
      if (
        new Set(accounted).size !== accounted.length ||
        accounted.length !== checkedIds.size ||
        accounted.some((id) => !checkedIds.has(id))
      ) {
        // Someone checked or unchecked an item since the Review was built.
        throw new ApiException(409, 'shopping.list_changed');
      }

      const other = await this.otherTarget(tx);
      const byId = new Map(rows.map((row) => [row.id, row]));
      if (body.lines.length > 0) {
        const inserted = await tx
          .insert(batches)
          .values(
            body.lines.map((line) => {
              const row = byId.get(line.itemId) as CheckedRow;
              const unmatched = row.ingredientId === null;
              return {
                familyId,
                ingredientId: row.ingredientId,
                leafCategoryId: (row.leaf ?? other.leaf).id,
                unmatched,
                rawName: unmatched ? row.typedName : null,
                quantity: line.quantity,
                unit: line.unit,
                location: line.location,
                expiryDate: line.expiryDate,
                productDescription: line.productDescription || null,
              };
            }),
          )
          .returning({ id: batches.id, rawName: batches.rawName });
        await this.queueUnmatchedBatches(tx, body, inserted);
      }

      // The partial unique index allows one active list per Family: archive first.
      await tx
        .update(shoppingLists)
        .set({ status: 'archived' })
        .where(eq(shoppingLists.id, listId));
      const [fresh] = await tx
        .insert(shoppingLists)
        .values({ familyId })
        .returning({ id: shoppingLists.id });
      // Moving the rows keeps their Source Recipes.
      await tx
        .update(shoppingItems)
        .set({ listId: fresh.id })
        .where(
          and(
            eq(shoppingItems.listId, listId),
            eq(shoppingItems.checked, false),
          ),
        );

      return { listId: fresh.id, batchCount: body.lines.length };
    });
  }

  /**
   * Unmatched Shopping Items become Unmatched Batches: queue the Batches too,
   * in the locale the name was first saved in (the Shopping Item's entry).
   */
  private async queueUnmatchedBatches(
    tx: Tx,
    body: FinishShoppingBody,
    inserted: Array<{ id: string; rawName: string | null }>,
  ): Promise<void> {
    const unmatched = inserted.flatMap((batch, index) =>
      batch.rawName === null
        ? []
        : [{ batch, itemId: body.lines[index].itemId }],
    );
    if (unmatched.length === 0) return;
    const locales = await tx
      .select({
        itemId: unmatchedEntries.shoppingItemId,
        locale: unmatchedEntries.locale,
      })
      .from(unmatchedEntries)
      .where(
        inArray(
          unmatchedEntries.shoppingItemId,
          unmatched.map((entry) => entry.itemId),
        ),
      );
    const localeOf = new Map(locales.map((row) => [row.itemId, row.locale]));
    await recordUnmatched(
      tx,
      unmatched.map(({ batch, itemId }) => ({
        rawName: batch.rawName ?? '',
        locale: localeOf.get(itemId) ?? FALLBACK_LOCALE,
        source: 'finish_shopping' as const,
        batchId: batch.id,
      })),
    );
  }

  private async activeList(executor: Executor, memberId: string) {
    const [member] = await executor
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!member) throw new ApiException(401, 'auth.unauthenticated');
    const [list] = await executor
      .select({ id: shoppingLists.id })
      .from(shoppingLists)
      .where(
        and(
          eq(shoppingLists.familyId, member.familyId),
          eq(shoppingLists.status, 'active'),
        ),
      );
    // No active list yet means nothing was ever checked.
    if (!list) throw new ApiException(409, 'shopping.nothing_checked');
    return { listId: list.id, familyId: member.familyId };
  }

  private checkedRows(
    executor: Executor,
    listId: string,
  ): Promise<CheckedRow[]> {
    return executor
      .select({
        id: shoppingItems.id,
        ingredientId: shoppingItems.ingredientId,
        typedName: shoppingItems.name,
        quantity: shoppingItems.quantity,
        unit: shoppingItems.unit,
        canonicalName: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        leaf: leafCategories,
        parent: parentCategories,
      })
      .from(shoppingItems)
      .leftJoin(ingredients, eq(shoppingItems.ingredientId, ingredients.id))
      .leftJoin(
        leafCategories,
        eq(ingredients.leafCategoryId, leafCategories.id),
      )
      .leftJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .where(
        and(eq(shoppingItems.listId, listId), eq(shoppingItems.checked, true)),
      )
      .orderBy(shoppingItems.createdAt, shoppingItems.id);
  }

  /** Unmatched items go under the top-level "Other" Parent's "Other" Leaf (fixed seed id). */
  private async otherTarget(executor: Executor) {
    const [row] = await executor
      .select({ leaf: leafCategories, parent: parentCategories })
      .from(parentCategories)
      .innerJoin(
        leafCategories,
        and(
          eq(leafCategories.parentId, parentCategories.id),
          eq(leafCategories.isOther, true),
        ),
      )
      .where(eq(parentCategories.id, TOP_LEVEL_OTHER_PARENT_ID))
      .limit(1);
    if (!row) throw new ApiException(422, 'pantry.other_leaf_missing');
    return row;
  }
}
