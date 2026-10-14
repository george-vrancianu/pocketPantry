import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { catalogScope, SHARED_ONLY } from '../catalog/catalog-scope';
import { ApiException } from '../common/api-exception';
import {
  ConcurrentMove,
  lockFamilies,
  runLocked,
} from '../family/family-locks';
import { normalizeName } from '../catalog/normalize';
import { relinkUnmatched } from '../catalog/relink-unmatched';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
  recipeIngredientLines,
  recipes,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
} from '../database/schema';
import { hasPgCode } from '../database/pg-errors';
import { AdminCatalogService } from './admin-catalog.service';
import {
  encodeCursor,
  type UnmatchedListQuery,
  type UnmatchedQueuePage,
  type UnmatchedResolution,
  type UnmatchedResolveBody,
} from './unmatched-queue.schemas';

type EntryRow = typeof unmatchedEntries.$inferSelect;

const MAX_REFERENCES = 20;
const MAX_LOCK_ATTEMPTS = 5;

// The Unmatched queue is Admin curation: it reads shared Catalog rows only (ADR 0011).
const adminScope = catalogScope(SHARED_ONLY);

const notInQueue = () => new ApiException(404, 'unmatched.not_found');

/**
 * Admin curation of the Unmatched queue. Entries are grouped by normalised raw
 * name; resolving a group is one transaction (relink every Batch and Shopping
 * Item carrying the name, add the Synonym, clear the entries).
 *
 * Lock order, every time: the per-name advisory lock (serialises Admins
 * working the same name), then the Family rows involved in ascending id (as
 * family-locks.ts requires everywhere), then Shopping List rows in ascending
 * id, then Shopping Item, Batch and Recipe Ingredient Line rows in ascending id. The other advisory
 * lock holders (catalog adds and renames) take only the name lock and never a
 * Family lock first, so they cannot invert with this order. Resolve takes every
 * name lock it needs up front, sorted.
 */
@Injectable()
export class UnmatchedQueueService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly catalog: AdminCatalogService,
  ) {}

  /**
   * One page of groups, most frequent first (count, then name ascending).
   * Open groups have at least one row not yet dismissed; dismissed groups are
   * all dismissed. The cursor encodes the last group's count and name: keyset
   * paging, so ties on count break on the unique name. Both sides compare the
   * name with the "C" collation so the order and the comparison agree. Counts
   * can change between pages, so a name may occasionally repeat or be skipped
   * until the next refetch.
   */
  async list(query: UnmatchedListQuery): Promise<UnmatchedQueuePage> {
    const dismissed = query.status === 'dismissed';
    const count = sql`count(*)`;
    const name = sql`${unmatchedEntries.normalizedName} collate "C"`;
    const after = query.cursor
      ? sql`and (${count} < ${query.cursor.count} or (${count} = ${query.cursor.count} and ${name} > ${query.cursor.name} collate "C"))`
      : sql``;
    const groups = await this.database
      .select({
        normalizedName: unmatchedEntries.normalizedName,
        count: sql<number>`count(*)::int`,
        locales: sql<
          string[]
        >`array_agg(distinct ${unmatchedEntries.locale} order by ${unmatchedEntries.locale})`,
        sources: sql<
          string[]
        >`array_agg(distinct ${unmatchedEntries.source}::text order by ${unmatchedEntries.source}::text)`,
      })
      .from(unmatchedEntries)
      .groupBy(unmatchedEntries.normalizedName)
      .having(
        sql`bool_and(${unmatchedEntries.dismissedAt} is not null) = ${dismissed} ${after}`,
      )
      .orderBy(desc(count), name)
      .limit(query.limit + 1);
    const page = groups.slice(0, query.limit);
    const last = page.at(-1);

    // References for this page only: each group's newest MAX_REFERENCES rows.
    const { rows } =
      page.length === 0
        ? { rows: [] }
        : await this.database.execute<EntryRow>(sql`
            select u.id, u.normalized_name as "normalizedName", u.raw_name as "rawName",
              u.locale, u.source, u.batch_id as "batchId", u.shopping_item_id as "shoppingItemId", u.ingredient_line_id as "ingredientLineId",
              u.source_text as "sourceText", u.source_language as "sourceLanguage"
            from unnest(array[${sql.join(
              page.map((group) => sql`${group.normalizedName}`),
              sql`, `,
            )}]::text[]) as n(name)
            cross join lateral (
              select * from unmatched_entries e
              where e.normalized_name = n.name
              order by e.created_at desc, e.id desc
              limit ${MAX_REFERENCES}
            ) u
            order by u.created_at desc, u.id desc`);
    const rowsOf = new Map<string, EntryRow[]>();
    for (const row of rows) {
      rowsOf.set(row.normalizedName, [
        ...(rowsOf.get(row.normalizedName) ?? []),
        row,
      ]);
    }
    return {
      entries: page.flatMap((group) => {
        const references = rowsOf.get(group.normalizedName);
        // Resolved between the two reads: gone from the queue.
        if (!references) return [];
        const printed = references.find((row) => row.sourceText);
        return [
          {
            normalizedName: group.normalizedName,
            rawName: references[0].rawName,
            count: group.count,
            locale: references[0].locale,
            locales: group.locales,
            sourceText: printed?.sourceText ?? null,
            sourceLanguage: printed?.sourceLanguage ?? null,
            sources: group.sources,
            dismissed,
            references: references.map((row) => ({
              type: row.batchId
                ? 'batch'
                : row.shoppingItemId
                  ? 'shopping_item'
                  : 'recipe_line',
              id: (row.batchId ??
                row.shoppingItemId ??
                row.ingredientLineId) as string,
              source: row.source,
              locale: row.locale,
              rawName: row.rawName,
              sourceText: row.sourceText,
              sourceLanguage: row.sourceLanguage,
            })),
          },
        ];
      }),
      nextCursor:
        groups.length > query.limit && last
          ? encodeCursor({ count: last.count, name: last.normalizedName })
          : null,
    };
  }

  dismiss(normalizedName: string): Promise<void> {
    return this.setDismissed(normalizedName, new Date());
  }

  undismiss(normalizedName: string): Promise<void> {
    return this.setDismissed(normalizedName, null);
  }

  /** The Batches and Shopping Items stay Unmatched either way; only the queue entry moves between tabs. */
  private async setDismissed(
    normalizedName: string,
    dismissedAt: Date | null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.catalog.lockName(tx, normalizedName);
      const rows = await tx
        .select({ id: unmatchedEntries.id })
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.normalizedName, normalizedName));
      if (rows.length === 0) throw notInQueue();
      await tx
        .update(unmatchedEntries)
        .set({ dismissedAt })
        .where(
          and(
            eq(unmatchedEntries.normalizedName, normalizedName),
            dismissedAt
              ? isNull(unmatchedEntries.dismissedAt)
              : isNotNull(unmatchedEntries.dismissedAt),
          ),
        );
    });
  }

  async resolve(body: UnmatchedResolveBody): Promise<UnmatchedResolution> {
    try {
      return await runLocked(this.database, (tx) => this.resolveIn(tx, body));
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
      // Rare: two resolves of different names re-locking after an entry set
      // grew can still cross; Postgres aborts one side and the Admin retries.
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
    // Every name lock up front, sorted: createIngredientIn would otherwise
    // take the new Ingredient's name lock after the row locks below.
    const names = new Set([key]);
    if (body.newIngredient) names.add(normalizeName(body.newIngredient.name));
    // The printed text may become a Synonym too: its name lock is taken here
    // with the others. One that only appears after the row locks is locked late.
    if (body.sourceSynonym) {
      for (const name of await this.printedKeys(tx, key)) names.add(name);
    }
    for (const name of [...names].sort()) {
      await this.catalog.lockName(tx, name);
    }

    const entries = await this.lockEntries(tx, key);
    if (entries.length === 0) throw notInQueue();
    const latest = entries[0];
    const locale = body.locale ?? latest.locale;

    if (!(await this.catalog.isNameFree(tx, key, body.ingredientId))) {
      throw new ApiException(409, 'unmatched.name_taken');
    }

    const target = body.newIngredient
      ? await this.catalog.createIngredientIn(tx, body.newIngredient)
      : await this.requireIngredient(tx, body.ingredientId as string);

    const itemIds = entries.flatMap((e) =>
      e.shoppingItemId ? [e.shoppingItemId] : [],
    );
    const batchIds = entries.flatMap((e) => (e.batchId ? [e.batchId] : []));
    const lineIds = entries.flatMap((e) =>
      e.ingredientLineId ? [e.ingredientLineId] : [],
    );
    const relinked = await relinkUnmatched(tx, {
      key,
      target,
      itemIds,
      batchIds,
      lineIds,
    });

    const synonymAdded = await this.addSynonym(
      tx,
      target,
      latest.rawName,
      key,
      locale,
    );
    // The printed text, in the Scan Language it was read in. A name another
    // Ingredient already answers to is skipped, never an error.
    const printed = body.sourceSynonym
      ? entries.find((e) => e.sourceText && e.sourceLanguage)
      : undefined;
    const printedKey = printed?.sourceText
      ? normalizeName(printed.sourceText)
      : '';
    let sourceSynonymAdded = false;
    let sourceSynonymSkipped: UnmatchedResolution['sourceSynonymSkipped'] =
      null;
    if (body.sourceSynonym) {
      if (printedKey && !names.has(printedKey)) {
        await this.catalog.lockName(tx, printedKey);
      }
      if (!printed?.sourceText || !printed.sourceLanguage || !printedKey) {
        sourceSynonymSkipped = 'none';
      } else if (!(await this.catalog.isNameFree(tx, printedKey, target.id))) {
        sourceSynonymSkipped = 'taken';
      } else {
        sourceSynonymAdded = await this.addSynonym(
          tx,
          target,
          printed.sourceText,
          printedKey,
          printed.sourceLanguage,
        );
        if (!sourceSynonymAdded) sourceSynonymSkipped = 'exists';
      }
    }
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
      ...relinked,
      synonymAdded,
      sourceSynonymAdded,
      sourceSynonymSkipped,
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
    const lockedLines = new Set<string>();
    const lockedFamilies = new Set<string>();
    for (let attempt = 0; attempt < MAX_LOCK_ATTEMPTS; attempt++) {
      const itemIds = entries.flatMap((e) =>
        e.shoppingItemId ? [e.shoppingItemId] : [],
      );
      const batchIds = entries.flatMap((e) => (e.batchId ? [e.batchId] : []));
      const lineIds = entries.flatMap((e) =>
        e.ingredientLineId ? [e.ingredientLineId] : [],
      );
      await this.lockFamiliesOf(tx, itemIds, batchIds, lineIds, lockedFamilies);
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
      if (lineIds.length > 0) {
        await tx
          .select({ id: recipeIngredientLines.id })
          .from(recipeIngredientLines)
          .where(inArray(recipeIngredientLines.id, lineIds))
          .orderBy(recipeIngredientLines.id)
          .for('update');
      }
      lineIds.forEach((id) => lockedLines.add(id));
      itemIds.forEach((id) => lockedItems.add(id));
      batchIds.forEach((id) => lockedBatches.add(id));
      entries = await read();
      const covered = entries.every((e) =>
        e.batchId
          ? lockedBatches.has(e.batchId)
          : e.ingredientLineId
            ? lockedLines.has(e.ingredientLineId)
            : lockedItems.has(e.shoppingItemId as string),
      );
      if (covered) return entries;
    }
    throw new ApiException(409, 'unmatched.concurrent_change');
  }

  /**
   * Locks the Families owning the rows, ascending id, before anything else
   * of theirs: the order deleteFamily and Finish Shopping use
   * (family-locks.ts), so the cascade cannot deadlock with a relink.
   */
  private async lockFamiliesOf(
    tx: Tx,
    itemIds: string[],
    batchIds: string[],
    lineIds: string[],
    locked: Set<string>,
  ): Promise<void> {
    const ofBatches =
      batchIds.length === 0
        ? []
        : await tx
            .select({ id: batches.familyId })
            .from(batches)
            .where(inArray(batches.id, batchIds));
    const ofItems =
      itemIds.length === 0
        ? []
        : await tx
            .select({ id: shoppingLists.familyId })
            .from(shoppingItems)
            .innerJoin(
              shoppingLists,
              eq(shoppingLists.id, shoppingItems.listId),
            )
            .where(inArray(shoppingItems.id, itemIds));
    // Family Recipes only: Catalog Recipes have no Family and no Unmatched lines.
    const ofLines =
      lineIds.length === 0
        ? []
        : await tx
            .select({ id: recipes.familyId })
            .from(recipeIngredientLines)
            .innerJoin(recipes, eq(recipes.id, recipeIngredientLines.recipeId))
            .where(inArray(recipeIngredientLines.id, lineIds));
    const missing = [
      ...new Set(
        [...ofBatches, ...ofItems, ...ofLines].flatMap((row) =>
          row.id ? [row.id] : [],
        ),
      ),
    ].filter((id) => !locked.has(id));
    // A Family found after others are held may sort below them: restart so
    // every Family is locked in ascending order from scratch (runLocked).
    if (locked.size > 0 && missing.length > 0) throw new ConcurrentMove();
    await lockFamilies(tx, missing);
    missing.forEach((id) => locked.add(id));
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

  /** Normalised printed texts of the name's entries, read before any lock. */
  private async printedKeys(tx: Tx, key: string): Promise<string[]> {
    const rows = await tx
      .selectDistinct({ sourceText: unmatchedEntries.sourceText })
      .from(unmatchedEntries)
      .where(
        and(
          eq(unmatchedEntries.normalizedName, key),
          isNotNull(unmatchedEntries.sourceText),
          isNotNull(unmatchedEntries.sourceLanguage),
        ),
      );
    return rows.flatMap((row) => {
      const printed = row.sourceText ? normalizeName(row.sourceText) : '';
      return printed ? [printed] : [];
    });
  }

  private async requireIngredient(tx: Tx, id: string) {
    const shared = adminScope.ingredients(tx);
    const [row] = await tx
      .select()
      .from(shared)
      .where(eq(shared.id, id))
      // Blocks a concurrent delete of the Ingredient until we commit.
      .for('key share');
    if (!row)
      throw new ApiException(404, 'catalog.not_found', {
        entity: 'ingredient',
      });
    return row;
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
    const translations = adminScope.translations(tx);
    const [existing] = await tx
      .select({ id: translations.id })
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'ingredient'),
          eq(translations.entityId, target.id),
          eq(translations.normalizedValue, key),
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
}
