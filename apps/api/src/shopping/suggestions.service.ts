import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, sql } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  batches,
  ingredientStockHistory,
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

/**
 * Suggestions are derived on read and never stored. Each group is a key of the
 * result, so the Used Up group can join `staples` without changing the shape.
 */
@Injectable()
export class SuggestionsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async list(
    memberId: string,
    locale: CatalogLocale,
    today: string = utcToday(),
  ): Promise<SuggestionsView> {
    const familyId = await this.settings.familyIdOf(memberId);
    return {
      staples: await this.missingStaples(familyId, locale, today),
      usedUp: await this.usedUp(familyId, locale),
    };
  }

  /**
   * Hides the Suggestion for the whole Family until a Batch of the Ingredient is
   * created and it then goes missing or Used Up again. A Used Up Suggestion is
   * dismissed by clearing `used_up_at` (ADR 0005); a Staple's by a dismissal row.
   * A Staple is Used Up never, so one row or the other is enough; the row is only
   * written for a Staple, so it cannot hide the Ingredient if it becomes one later.
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
      if (!staple) return;
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
  ): Promise<SuggestionView[]> {
    const since = new Date(Date.now() - USED_UP_WINDOW_MS);
    const rows = await this.database
      .select({ ingredientId: ingredientStockHistory.ingredientId })
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
  ): Promise<SuggestionView[]> {
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
      }))
      .sort(byShopOrder);
  }
}
