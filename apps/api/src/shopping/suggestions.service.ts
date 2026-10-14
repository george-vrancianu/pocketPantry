import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNotNull, sql } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import {
  batches,
  ingredientStockHistory,
  runningLow,
  shoppingItems,
  shoppingLists,
  staples,
  suggestionDismissals,
} from '../database/schema';
import { USED_UP_WINDOW_MS } from '../pantry/stock-history';
import { lockFamilies } from '../family/family-locks';
import { SettingsService } from '../settings/settings.service';
import { unexpiredBatch, utcToday } from './batch-presence';
import {
  byShopOrder,
  loadIngredientPlacements,
} from '../catalog/ingredient-placement';
import type { SuggestionView, SuggestionsView } from './suggestions.schemas';

/** A Suggestion before its search result is attached. */
type Suggestion = Omit<SuggestionView, 'ingredient'>;

/**
 * Suggestions are derived on read and never stored. Each group is a key of the
 * result, so the Used Up group can join `staples` without changing the shape.
 */
@Injectable()
export class SuggestionsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly search: CatalogSearchService,
  ) {}

  async list(
    memberId: string,
    locale: CatalogLocale,
    today: string = utcToday(),
  ): Promise<SuggestionsView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const groups = {
      staples: await this.missingStaples(familyId, locale, today),
      usedUp: await this.usedUp(familyId, locale),
      runningLow: await this.runningLowGroup(familyId, locale),
      expired: await this.expired(familyId, locale, today),
    };
    const ids = Object.values(groups).flatMap((group) =>
      group.map((entry) => entry.ingredientId),
    );
    const found = new Map(
      (
        await this.search.findByIds(
          catalogScope(familyId),
          [...new Set(ids)],
          locale,
          await this.settings.expiryOverridesOf(familyId),
        )
      ).map((result) => [result.id, result]),
    );
    // An Ingredient the Family can no longer see in the Catalog has no result to select, so it is left out.
    const withResult = (group: Suggestion[]): SuggestionView[] =>
      group.flatMap((entry) => {
        const ingredient = found.get(entry.ingredientId);
        return ingredient ? [{ ...entry, ingredient }] : [];
      });
    return {
      staples: withResult(groups.staples),
      usedUp: withResult(groups.usedUp),
      runningLow: withResult(groups.runningLow),
      expired: withResult(groups.expired),
    };
  }

  /**
   * Hides the Suggestion for the whole Family until a Batch of the Ingredient is
   * created and it then goes missing or Used Up again. A Used Up Suggestion is
   * dismissed by clearing `used_up_at` (ADR 0005); a Staple's by a dismissal row.
   * A Staple is Used Up never, so one row or the other is enough. The row is written
   * for a Staple or an Ingredient with Batches (an expired one); a row left on an
   * expired Ingredient also hides it if it later becomes a Staple, until it is restocked.
   */
  async dismiss(memberId: string, ingredientId: string): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    const ingredients = catalogScope(familyId).ingredients(this.database);
    const [found] = await this.database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId));
    if (!found) throw new ApiException(404, 'shopping.ingredient_not_found');
    await this.database.transaction(async (tx) => {
      await lockFamilies(tx, [familyId]);
      await tx
        .update(ingredientStockHistory)
        .set({ usedUpAt: null, updatedAt: sql`now()` })
        .where(
          and(
            eq(ingredientStockHistory.familyId, familyId),
            eq(ingredientStockHistory.ingredientId, ingredientId),
          ),
        );
      const [staple] = await tx
        .select({ id: staples.id })
        .from(staples)
        .where(
          and(
            eq(staples.familyId, familyId),
            eq(staples.ingredientId, ingredientId),
          ),
        );
      if (!staple && !(await this.hasBatches(tx, familyId, ingredientId))) {
        return;
      }
      await tx
        .insert(suggestionDismissals)
        .values({ familyId, ingredientId })
        .onConflictDoNothing();
    });
  }

  /**
   * Used Up: the last Batch was removed within the past 30 days and none has come
   * since. Hidden while a Staple (it is missing instead) or on the active list.
   */
  private async usedUp(
    familyId: string,
    locale: CatalogLocale,
  ): Promise<Suggestion[]> {
    const since = new Date(Date.now() - USED_UP_WINDOW_MS);
    const rows = await this.database
      .select({
        ingredientId: ingredientStockHistory.ingredientId,
        usedUpAt: ingredientStockHistory.usedUpAt,
      })
      .from(ingredientStockHistory)
      .where(
        and(
          eq(ingredientStockHistory.familyId, familyId),
          gt(ingredientStockHistory.usedUpAt, since),
          sql`NOT EXISTS (SELECT 1 FROM ${batches} WHERE ${batches.familyId} = ${familyId} AND ${batches.ingredientId} = ${ingredientStockHistory.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${staples} WHERE ${staples.familyId} = ${familyId} AND ${staples.ingredientId} = ${ingredientStockHistory.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${shoppingItems} INNER JOIN ${shoppingLists} ON ${shoppingLists.id} = ${shoppingItems.listId} WHERE ${shoppingLists.familyId} = ${familyId} AND ${shoppingLists.status} = 'active' AND ${shoppingItems.ingredientId} = ${ingredientStockHistory.ingredientId})`,
        ),
      );
    const placements = await loadIngredientPlacements(
      this.database,
      catalogScope(familyId),
      locale,
      rows.map((row) => row.ingredientId),
    );
    return rows
      .map((row) => ({
        ingredientId: row.ingredientId,
        name: placements.get(row.ingredientId)?.name ?? '',
        quantity: null,
        unit: null,
        aisle: placements.get(row.ingredientId)?.aisle ?? null,
        since: row.usedUpAt?.toISOString() ?? null,
      }))
      .sort(byShopOrder);
  }

  private async hasBatches(
    executor: Executor,
    familyId: string,
    ingredientId: string,
  ): Promise<boolean> {
    const [batch] = await executor
      .select({ id: batches.id })
      .from(batches)
      .where(
        and(
          eq(batches.familyId, familyId),
          eq(batches.ingredientId, ingredientId),
        ),
      )
      .limit(1);
    return Boolean(batch);
  }

  /**
   * Expired: at least one Batch and every one expired before `today` (an Expiring
   * Soon Batch, or one with no expiry date, still counts as present). A Staple is
   * missing instead, so it is left out here. Hidden while dismissed or on the
   * active list; a new Batch ends the dismissal.
   */
  private async expired(
    familyId: string,
    locale: CatalogLocale,
    today: string,
  ): Promise<Suggestion[]> {
    const rows = await this.database
      .select({
        ingredientId: batches.ingredientId,
        latestExpiry: sql<string>`max(${batches.expiryDate})::text`,
      })
      .from(batches)
      .where(
        and(eq(batches.familyId, familyId), isNotNull(batches.ingredientId)),
      )
      .groupBy(batches.ingredientId)
      .having(
        and(
          sql`bool_and(${batches.expiryDate} IS NOT NULL AND ${batches.expiryDate} < ${today})`,
          sql`NOT EXISTS (SELECT 1 FROM ${staples} WHERE ${staples.familyId} = ${familyId} AND ${staples.ingredientId} = ${batches.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${suggestionDismissals} WHERE ${suggestionDismissals.familyId} = ${familyId} AND ${suggestionDismissals.ingredientId} = ${batches.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${shoppingItems} INNER JOIN ${shoppingLists} ON ${shoppingLists.id} = ${shoppingItems.listId} WHERE ${shoppingLists.familyId} = ${familyId} AND ${shoppingLists.status} = 'active' AND ${shoppingItems.ingredientId} = ${batches.ingredientId})`,
        ),
      );
    const ids = rows.flatMap((row) =>
      row.ingredientId ? [row.ingredientId] : [],
    );
    const placements = await loadIngredientPlacements(
      this.database,
      catalogScope(familyId),
      locale,
      ids,
    );
    return rows
      .flatMap((row) =>
        row.ingredientId ? [{ ...row, ingredientId: row.ingredientId }] : [],
      )
      .map((row) => ({
        ingredientId: row.ingredientId,
        name: placements.get(row.ingredientId)?.name ?? '',
        quantity: null,
        unit: null,
        aisle: placements.get(row.ingredientId)?.aisle ?? null,
        since: row.latestExpiry,
      }))
      .sort(byShopOrder);
  }

  /**
   * Running low: the Family has flagged the Ingredient, it has at least one Batch
   * (expired or not), and it is not on the active list. Derived on read; turning
   * the flag off is the only dismissal.
   */
  private async runningLowGroup(
    familyId: string,
    locale: CatalogLocale,
  ): Promise<Suggestion[]> {
    const rows = await this.database
      .select({ ingredientId: runningLow.ingredientId })
      .from(runningLow)
      .where(
        and(
          eq(runningLow.familyId, familyId),
          sql`EXISTS (SELECT 1 FROM ${batches} WHERE ${batches.familyId} = ${familyId} AND ${batches.ingredientId} = ${runningLow.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${shoppingItems} INNER JOIN ${shoppingLists} ON ${shoppingLists.id} = ${shoppingItems.listId} WHERE ${shoppingLists.familyId} = ${familyId} AND ${shoppingLists.status} = 'active' AND ${shoppingItems.ingredientId} = ${runningLow.ingredientId})`,
        ),
      );
    const placements = await loadIngredientPlacements(
      this.database,
      catalogScope(familyId),
      locale,
      rows.map((row) => row.ingredientId),
    );
    return rows
      .map((row) => ({
        ingredientId: row.ingredientId,
        name: placements.get(row.ingredientId)?.name ?? '',
        quantity: null,
        unit: null,
        aisle: placements.get(row.ingredientId)?.aisle ?? null,
        since: null,
      }))
      .sort(byShopOrder);
  }

  /**
   * Missing: no unexpired Batch (an Expiring Soon Batch still counts as present,
   * quantity is ignored). Hidden while dismissed or on the active list, checked or not.
   */
  private async missingStaples(
    familyId: string,
    locale: CatalogLocale,
    today: string,
  ): Promise<Suggestion[]> {
    const rows = await this.database
      .select({
        ingredientId: staples.ingredientId,
        quantity: staples.quantity,
        unit: staples.unit,
      })
      .from(staples)
      .where(
        and(
          eq(staples.familyId, familyId),
          sql`NOT EXISTS (SELECT 1 FROM ${batches} WHERE ${batches.familyId} = ${familyId} AND ${batches.ingredientId} = ${staples.ingredientId} AND ${unexpiredBatch(today)})`,
          sql`NOT EXISTS (SELECT 1 FROM ${suggestionDismissals} WHERE ${suggestionDismissals.familyId} = ${familyId} AND ${suggestionDismissals.ingredientId} = ${staples.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${shoppingItems} INNER JOIN ${shoppingLists} ON ${shoppingLists.id} = ${shoppingItems.listId} WHERE ${shoppingLists.familyId} = ${familyId} AND ${shoppingLists.status} = 'active' AND ${shoppingItems.ingredientId} = ${staples.ingredientId})`,
        ),
      );
    const placements = await loadIngredientPlacements(
      this.database,
      catalogScope(familyId),
      locale,
      rows.map((row) => row.ingredientId),
    );
    return rows
      .map((row) => ({
        ingredientId: row.ingredientId,
        name: placements.get(row.ingredientId)?.name ?? '',
        quantity: row.quantity,
        unit: row.unit,
        aisle: placements.get(row.ingredientId)?.aisle ?? null,
        since: null,
      }))
      .sort(byShopOrder);
  }
}
