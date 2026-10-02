import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import {
  aisles,
  ingredients,
  leafCategories,
  parentCategories,
  shoppingItems,
  shoppingLists,
  user,
} from '../database/schema';
import { recordUnmatched } from '../unmatched/unmatched-entries';
import type {
  AddShoppingItemBody,
  ShoppingGroupView,
  ShoppingItemView,
  ShoppingListView,
} from './shopping.schemas';

/**
 * Merge rule: lines for the same Ingredient (or the same Unmatched name) with
 * the same unit collapse into one and their quantities add up. Different units
 * stay on separate lines. A missing quantity adds nothing.
 */
export function sumQuantities(
  existing: number | null,
  added: number | null,
): number | null {
  if (existing === null) return added;
  if (added === null) return existing;
  return Math.round((existing + added) * 1000) / 1000;
}

const itemNotFound = () => new ApiException(404, 'shopping.item_not_found');

@Injectable()
export class ShoppingService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getList(
    memberId: string,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    const listId = await this.activeListId(this.database, memberId);
    return this.view(this.database, listId, locale);
  }

  async addItem(
    memberId: string,
    body: AddShoppingItemBody,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    return this.addItems(memberId, [body], locale);
  }

  /** Adds every item with the merge rules, in one transaction: all of them or none. */
  async addItems(
    memberId: string,
    bodies: AddShoppingItemBody[],
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    return this.database.transaction(async (tx) => {
      // Serialises with concurrent adds (merges never duplicate a line) and with Finish.
      const listId = await this.lockActiveList(tx, memberId);
      for (const body of bodies) await this.mergeItem(tx, listId, body, locale);
      return this.view(tx, listId, locale);
    });
  }

  private async mergeItem(
    tx: Tx,
    listId: string,
    body: AddShoppingItemBody,
    locale: CatalogLocale,
  ): Promise<void> {
    const unit = body.unit ?? null;
    const quantity = body.quantity ?? null;
    let identity;
    let insertValues:
      { ingredientId: string } | { name: string; normalizedName: string };
    if (body.ingredientId !== undefined) {
      const [found] = await tx
        .select({ id: ingredients.id })
        .from(ingredients)
        .where(eq(ingredients.id, body.ingredientId));
      if (!found) {
        throw new ApiException(404, 'shopping.ingredient_not_found');
      }
      identity = eq(shoppingItems.ingredientId, found.id);
      insertValues = { ingredientId: found.id };
    } else {
      const name = (body.name ?? '').trim();
      const normalizedName = normalizeName(name);
      if (!normalizedName) throw new ApiException(400, 'validation_failed');
      identity = and(
        isNull(shoppingItems.ingredientId),
        eq(shoppingItems.normalizedName, normalizedName),
      );
      insertValues = { name, normalizedName };
    }

    const [existing] = await tx
      .select({ id: shoppingItems.id, quantity: shoppingItems.quantity })
      .from(shoppingItems)
      .where(
        and(
          eq(shoppingItems.listId, listId),
          identity,
          unit === null
            ? isNull(shoppingItems.unit)
            : eq(shoppingItems.unit, unit),
        ),
      )
      .limit(1);

    if (existing) {
      const merged = sumQuantities(
        existing.quantity === null ? null : Number(existing.quantity),
        quantity,
      );
      // Adding something already bought means it is wanted again.
      await tx
        .update(shoppingItems)
        .set({
          quantity: merged === null ? null : String(merged),
          checked: false,
        })
        .where(eq(shoppingItems.id, existing.id));
    } else {
      const [inserted] = await tx
        .insert(shoppingItems)
        .values({
          listId,
          ...insertValues,
          quantity: quantity === null ? null : String(quantity),
          unit,
        })
        .returning({ id: shoppingItems.id });
      // Only newly inserted Unmatched names are queued; merges add no entry.
      if ('name' in insertValues) {
        await recordUnmatched(tx, [
          {
            rawName: insertValues.name,
            locale,
            source: body.source ?? 'manual',
            shoppingItemId: inserted.id,
          },
        ]);
      }
    }
  }

  /** Ids of unchecked Shopping Items on the Family's active list for any of these Ingredients. */
  async uncheckedItemIdsFor(
    memberId: string,
    ingredientIds: string[],
  ): Promise<string[]> {
    if (ingredientIds.length === 0) return [];
    const listId = await this.activeListId(this.database, memberId);
    const rows = await this.database
      .select({ id: shoppingItems.id })
      .from(shoppingItems)
      .where(
        and(
          eq(shoppingItems.listId, listId),
          eq(shoppingItems.checked, false),
          inArray(shoppingItems.ingredientId, ingredientIds),
        ),
      )
      .orderBy(asc(shoppingItems.createdAt), asc(shoppingItems.id));
    return rows.map((row) => row.id);
  }

  async setChecked(
    memberId: string,
    itemId: string,
    checked: boolean,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    return this.database.transaction(async (tx) => {
      const listId = await this.lockActiveList(tx, memberId);
      const updated = await tx
        .update(shoppingItems)
        .set({ checked })
        .where(
          and(eq(shoppingItems.id, itemId), eq(shoppingItems.listId, listId)),
        )
        .returning({ id: shoppingItems.id });
      if (updated.length === 0) throw itemNotFound();
      return this.view(tx, listId, locale);
    });
  }

  async removeItem(
    memberId: string,
    itemId: string,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    return this.database.transaction(async (tx) => {
      const listId = await this.lockActiveList(tx, memberId);
      const removed = await tx
        .delete(shoppingItems)
        .where(
          and(eq(shoppingItems.id, itemId), eq(shoppingItems.listId, listId)),
        )
        .returning({ id: shoppingItems.id });
      if (removed.length === 0) throw itemNotFound();
      return this.view(tx, listId, locale);
    });
  }

  /**
   * The Family's active list, row-locked until the transaction ends, so every
   * mutation serialises with Finish Shopping. If a Finish commits while we
   * wait, Postgres rechecks the predicate and the archived row drops out (no
   * row); a fresh statement then sees the new active list.
   */
  private async lockActiveList(tx: Tx, memberId: string): Promise<string> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const listId = await this.activeListId(tx, memberId);
      const locked = await tx.execute<{ id: string }>(
        sql`SELECT ${shoppingLists.id} AS id FROM ${shoppingLists} WHERE ${shoppingLists.id} = ${listId} AND ${shoppingLists.status} = 'active' FOR UPDATE`,
      );
      if (locked.rows.length > 0) return listId;
    }
    throw new ApiException(409, 'shopping.list_changed');
  }

  /** The Family's active list, created on first use. */
  private async activeListId(
    executor: Executor,
    memberId: string,
  ): Promise<string> {
    const [member] = await executor
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!member) throw new ApiException(401, 'auth.unauthenticated');

    await executor
      .insert(shoppingLists)
      .values({ familyId: member.familyId })
      .onConflictDoNothing();
    const [list] = await executor
      .select({ id: shoppingLists.id })
      .from(shoppingLists)
      .where(
        and(
          eq(shoppingLists.familyId, member.familyId),
          eq(shoppingLists.status, 'active'),
        ),
      );
    return list.id;
  }

  private async view(
    executor: Executor,
    listId: string,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    const rows = await executor
      .select({
        id: shoppingItems.id,
        ingredientId: shoppingItems.ingredientId,
        typedName: shoppingItems.name,
        canonicalName: ingredients.name,
        quantity: shoppingItems.quantity,
        unit: shoppingItems.unit,
        checked: shoppingItems.checked,
        aisleId: aisles.id,
        aisleName: aisles.name,
        aisleSortOrder: aisles.sortOrder,
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
      .leftJoin(aisles, eq(parentCategories.aisleId, aisles.id))
      .where(eq(shoppingItems.listId, listId))
      .orderBy(asc(shoppingItems.createdAt), asc(shoppingItems.id));

    const { pick: display } = await loadDisplayNames(
      executor,
      locale,
      rows
        .flatMap((row) => [row.ingredientId, row.aisleId])
        .filter((id) => id !== null),
    );

    const groups = new Map<string, ShoppingGroupView>();
    const unmatchedItems: ShoppingItemView[] = [];
    for (const row of rows) {
      const item: ShoppingItemView = {
        id: row.id,
        name:
          row.ingredientId !== null
            ? display(
                'ingredient',
                row.ingredientId,
                row.canonicalName ?? row.typedName ?? '',
              )
            : (row.typedName ?? ''),
        quantity: row.quantity === null ? null : Number(row.quantity),
        unit: row.unit,
        checked: row.checked,
        unmatched: row.ingredientId === null,
      };
      if (row.aisleId === null || row.aisleName === null) {
        unmatchedItems.push(item);
        continue;
      }
      const group = groups.get(row.aisleId) ?? {
        aisle: {
          id: row.aisleId,
          name: display('aisle', row.aisleId, row.aisleName),
          sortOrder: row.aisleSortOrder ?? 0,
        },
        items: [],
      };
      group.items.push(item);
      groups.set(row.aisleId, group);
    }

    const ordered = [...groups.values()].sort(
      (a, b) => (a.aisle?.sortOrder ?? 0) - (b.aisle?.sortOrder ?? 0),
    );
    if (unmatchedItems.length > 0) {
      ordered.push({ aisle: null, items: unmatchedItems });
    }
    const checked = rows.filter((row) => row.checked).length;
    return {
      id: listId,
      groups: ordered,
      summary: { remaining: rows.length - checked, checked },
    };
  }
}
