import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { exceedsMaxQuantity } from '../common/quantity';
import { sumQuantities } from '../shopping/shopping.service';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
} from '../database/schema';
import { hasPgCode } from '../database/pg-errors';
import { AdminCatalogService } from './admin-catalog.service';
import type {
  UnmatchedQueueEntry,
  UnmatchedResolution,
  UnmatchedResolveBody,
} from './unmatched-queue.schemas';

type EntryRow = typeof unmatchedEntries.$inferSelect;

const MAX_REFERENCES = 20;
const MAX_LOCK_ATTEMPTS = 5;

const notInQueue = () => new ApiException(404, 'unmatched.not_found');

/**
 * Admin curation of the Unmatched queue. Entries are grouped by normalised raw
 * name; resolving a group is one transaction (relink every Batch and Shopping
 * Item carrying the name, add the Synonym, clear the entries).
 *
 * Lock order, every time: the per-name advisory lock (serialises Admins
 * working the same name), then Shopping List rows in ascending id (the same
 * list-first order Finish Shopping and list edits use), then Shopping Item and
 * Batch rows in ascending id. Nothing here ever waits on a Family row, and no
 * other code path takes the advisory lock, so no ordering can invert.
 */
@Injectable()
export class UnmatchedQueueService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly catalog: AdminCatalogService,
  ) {}

  /** Open groups have at least one row not yet dismissed; dismissed groups are all dismissed. */
  async list(status: 'open' | 'dismissed'): Promise<UnmatchedQueueEntry[]> {
    const rows = await this.database
      .select()
      .from(unmatchedEntries)
      .orderBy(desc(unmatchedEntries.createdAt), desc(unmatchedEntries.id));
    const groups = new Map<string, EntryRow[]>();
    for (const row of rows) {
      const group = groups.get(row.normalizedName) ?? [];
      group.push(row);
      groups.set(row.normalizedName, group);
    }
    return [...groups.values()]
      .map((group) => this.toQueueEntry(group))
      .filter((entry) => entry.dismissed === (status === 'dismissed'))
      .sort(
        (a, b) =>
          b.count - a.count || a.normalizedName.localeCompare(b.normalizedName),
      );
  }

  async dismiss(normalizedName: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.lockName(tx, normalizedName);
      const rows = await tx
        .select({ id: unmatchedEntries.id })
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.normalizedName, normalizedName));
      if (rows.length === 0) throw notInQueue();
      // The Batches and Shopping Items stay Unmatched; only the queue entry is set aside.
      await tx
        .update(unmatchedEntries)
        .set({ dismissedAt: new Date() })
        .where(
          and(
            eq(unmatchedEntries.normalizedName, normalizedName),
            isNull(unmatchedEntries.dismissedAt),
          ),
        );
    });
  }

  async resolve(body: UnmatchedResolveBody): Promise<UnmatchedResolution> {
    try {
      return await this.database.transaction((tx) => this.resolveIn(tx, body));
    } catch (error) {
      if (hasPgCode(error, '23505')) {
        throw new ApiException(409, 'catalog.name_taken');
      }
      // The target Ingredient was deleted between the check and the relink.
      if (hasPgCode(error, '23503') && !body.newIngredient) {
        throw new ApiException(404, 'catalog.not_found', {
          entity: 'ingredient',
        });
      }
      // Rare: deleting a Household of One on join cascades over its Batches
      // and Shopping Lists (and their entries) in an order we cannot control,
      // so it can deadlock with a resolve touching the same rows. Postgres
      // aborts one side; the Admin just retries.
      if (hasPgCode(error, '40P01')) {
        throw new ApiException(409, 'unmatched.concurrent_change');
      }
      throw error;
    }
  }

  private async resolveIn(
    tx: Tx,
    body: UnmatchedResolveBody,
  ): Promise<UnmatchedResolution> {
    const key = body.normalizedName;
    await this.lockName(tx, key);

    const entries = await this.lockEntries(tx, key);
    if (entries.length === 0) throw notInQueue();
    const latest = entries[0];
    const locale = body.locale ?? latest.locale;

    await this.assertNameFree(tx, key, body.ingredientId);

    const target = body.newIngredient
      ? await this.catalog.createIngredientIn(tx, body.newIngredient)
      : await this.requireIngredient(tx, body.ingredientId as string);

    const itemIds = entries.flatMap((e) =>
      e.shoppingItemId ? [e.shoppingItemId] : [],
    );
    const batchIds = entries.flatMap((e) => (e.batchId ? [e.batchId] : []));
    const relinkedShoppingItems = await this.relinkShoppingItems(
      tx,
      itemIds,
      target.id,
    );
    const relinkedBatches =
      batchIds.length === 0
        ? 0
        : (
            await tx
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
              .returning({ id: batches.id })
          ).length;

    const synonymAdded = await this.addSynonym(
      tx,
      target,
      latest.rawName,
      key,
      locale,
    );
    // Only the entries relinked above: one saved after our read stays queued.
    await tx.delete(unmatchedEntries).where(
      inArray(
        unmatchedEntries.id,
        entries.map((e) => e.id),
      ),
    );

    return {
      ingredientId: target.id,
      locale,
      relinkedBatches,
      relinkedShoppingItems,
      synonymAdded,
    };
  }

  /**
   * Locks everything the name's entries point at, then returns the entries as
   * read AFTER the locks. Entries committed while we waited (a Batch saved
   * under a Shopping List we were blocked on) are picked up by re-reading;
   * we loop until the entry set no longer grows. Relinking and deleting only
   * the returned entries means an entry committed after the final read stays
   * queued rather than being deleted unrelinked.
   */
  private async lockEntries(tx: Tx, key: string): Promise<EntryRow[]> {
    const read = () =>
      tx
        .select()
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.normalizedName, key))
        .orderBy(desc(unmatchedEntries.createdAt), desc(unmatchedEntries.id));
    let entries = await read();
    const lockedItems = new Set<string>();
    const lockedBatches = new Set<string>();
    for (let attempt = 0; attempt < MAX_LOCK_ATTEMPTS; attempt++) {
      const itemIds = entries.flatMap((e) =>
        e.shoppingItemId ? [e.shoppingItemId] : [],
      );
      const batchIds = entries.flatMap((e) => (e.batchId ? [e.batchId] : []));
      await this.lockShoppingLists(tx, itemIds);
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
      itemIds.forEach((id) => lockedItems.add(id));
      batchIds.forEach((id) => lockedBatches.add(id));
      entries = await read();
      const covered = entries.every((e) =>
        e.batchId
          ? lockedBatches.has(e.batchId)
          : lockedItems.has(e.shoppingItemId as string),
      );
      if (covered) return entries;
    }
    throw new ApiException(409, 'unmatched.concurrent_change');
  }

  /**
   * Relinks Unmatched Shopping Items to the Ingredient. On the active list an
   * item merges into an existing line for the same Ingredient and unit (the
   * list's "adding an item for an Ingredient already on it merges" rule);
   * archived lists are history, so there it only relinks, and so does a merge
   * that would pass the quantity cap.
   */
  private async relinkShoppingItems(
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
      const [twin] =
        row.status === 'active'
          ? await tx
              .select({
                id: shoppingItems.id,
                quantity: shoppingItems.quantity,
                checked: shoppingItems.checked,
              })
              .from(shoppingItems)
              .where(
                and(
                  eq(shoppingItems.listId, row.listId),
                  eq(shoppingItems.ingredientId, ingredientId),
                  row.unit === null
                    ? isNull(shoppingItems.unit)
                    : eq(shoppingItems.unit, row.unit),
                ),
              )
              .limit(1)
              .for('update')
          : [];
      const merged = twin
        ? sumQuantities(
            twin.quantity === null ? null : Number(twin.quantity),
            row.quantity === null ? null : Number(row.quantity),
          )
        : null;
      // A merge past the cap is not possible, and an Admin cannot fix a
      // Family's quantities: keep the line as its own, relinked.
      if (twin && !exceedsMaxQuantity(merged)) {
        await tx
          .update(shoppingItems)
          .set({
            quantity: merged === null ? null : String(merged),
            // Still wanted if either line was.
            checked: twin.checked && row.checked,
          })
          .where(eq(shoppingItems.id, twin.id));
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

  /** Per-name advisory lock held to the end of the transaction. */
  private async lockName(tx: Tx, normalizedName: string): Promise<void> {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${`unmatched:${normalizedName}`}, 0))`,
    );
  }

  /**
   * Locks the Shopping Lists the items sit on, ascending id. Finish Shopping
   * can move unchecked items to a new list while we wait, so re-read after
   * locking and retry until the items are all on locked lists.
   */
  private async lockShoppingLists(tx: Tx, itemIds: string[]): Promise<void> {
    if (itemIds.length === 0) return;
    const listsOf = async () =>
      [
        ...new Set(
          (
            await tx
              .select({ listId: shoppingItems.listId })
              .from(shoppingItems)
              .where(inArray(shoppingItems.id, itemIds))
          ).map((row) => row.listId),
        ),
      ].sort();
    const locked = new Set<string>();
    for (let attempt = 0; attempt < MAX_LOCK_ATTEMPTS; attempt++) {
      const wanted = await listsOf();
      const missing = wanted.filter((id) => !locked.has(id));
      if (missing.length === 0) return;
      // Ascending within a pass. A retry only happens after a Finish moved
      // items; the rare cross-name deadlock that could follow is reported as
      // `unmatched.concurrent_change` (Postgres aborts one side).
      await tx
        .select({ id: shoppingLists.id })
        .from(shoppingLists)
        .where(inArray(shoppingLists.id, missing))
        .orderBy(shoppingLists.id)
        .for('update');
      for (const id of missing) locked.add(id);
    }
    throw new ApiException(409, 'unmatched.concurrent_change');
  }

  private async requireIngredient(tx: Tx, id: string) {
    const [row] = await tx
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, id))
      // Blocks a concurrent delete of the Ingredient until we commit.
      .for('key share');
    if (!row)
      throw new ApiException(404, 'catalog.not_found', {
        entity: 'ingredient',
      });
    return row;
  }

  /** Stage one must stay deterministic: the key may only belong to one Ingredient. */
  private async assertNameFree(
    tx: Tx,
    key: string,
    ingredientId: string | undefined,
  ): Promise<void> {
    const owners = await tx
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.normalizedName, key));
    const translated = await tx
      .select({ id: catalogTranslations.entityId })
      .from(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, 'ingredient'),
          eq(catalogTranslations.normalizedValue, key),
        ),
      );
    const others = [...owners, ...translated].filter(
      (owner) => owner.id !== ingredientId,
    );
    if (others.length > 0) throw new ApiException(409, 'unmatched.name_taken');
  }

  /** Adds the raw text as a Synonym unless the Ingredient already answers to it. */
  private async addSynonym(
    tx: Tx,
    target: typeof ingredients.$inferSelect,
    rawName: string,
    key: string,
    locale: string,
  ): Promise<boolean> {
    if (target.normalizedName === key) return false;
    const [existing] = await tx
      .select({ id: catalogTranslations.id })
      .from(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, 'ingredient'),
          eq(catalogTranslations.entityId, target.id),
          eq(catalogTranslations.normalizedValue, key),
        ),
      )
      .limit(1);
    if (existing) return false;
    await tx.insert(catalogTranslations).values({
      id: randomUUID(),
      entityType: 'ingredient',
      entityId: target.id,
      locale,
      kind: 'synonym',
      value: rawName,
      normalizedValue: key,
    });
    return true;
  }

  private toQueueEntry(group: EntryRow[]): UnmatchedQueueEntry {
    const [latest] = group;
    return {
      normalizedName: latest.normalizedName,
      rawName: latest.rawName,
      count: group.length,
      locale: latest.locale,
      locales: [...new Set(group.map((row) => row.locale))].sort(),
      sources: [...new Set(group.map((row) => row.source))].sort(),
      dismissed: group.every((row) => row.dismissedAt !== null),
      references: group.slice(0, MAX_REFERENCES).map((row) => ({
        type: row.batchId ? 'batch' : 'shopping_item',
        id: (row.batchId ?? row.shoppingItemId) as string,
        source: row.source,
        locale: row.locale,
        rawName: row.rawName,
      })),
    };
  }
}
