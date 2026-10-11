import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  batches,
  ingredients,
  shoppingItems,
  shoppingLists,
  staples,
  suggestionDismissals,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { byShopOrder, loadIngredientPlacements } from './ingredient-placement';
import type { SuggestionView, SuggestionsView } from './staples.schemas';

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
    today: string = new Date().toISOString().slice(0, 10),
  ): Promise<SuggestionsView> {
    const familyId = await this.settings.familyIdOf(memberId);
    return { staples: await this.missingStaples(familyId, locale, today) };
  }

  /** Hides the Suggestion for the whole Family until a Batch of the Ingredient is created. */
  async dismiss(memberId: string, ingredientId: string): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    const [found] = await this.database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId));
    if (!found) throw new ApiException(404, 'suggestions.ingredient_not_found');
    await this.database
      .insert(suggestionDismissals)
      .values({ familyId, ingredientId })
      .onConflictDoNothing();
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
          sql`NOT EXISTS (SELECT 1 FROM ${batches} WHERE ${batches.familyId} = ${familyId} AND ${batches.ingredientId} = ${staples.ingredientId} AND (${batches.expiryDate} IS NULL OR ${batches.expiryDate} >= ${today}))`,
          sql`NOT EXISTS (SELECT 1 FROM ${suggestionDismissals} WHERE ${suggestionDismissals.familyId} = ${familyId} AND ${suggestionDismissals.ingredientId} = ${staples.ingredientId})`,
          sql`NOT EXISTS (SELECT 1 FROM ${shoppingItems} INNER JOIN ${shoppingLists} ON ${shoppingLists.id} = ${shoppingItems.listId} WHERE ${shoppingLists.familyId} = ${familyId} AND ${shoppingLists.status} = 'active' AND ${shoppingItems.ingredientId} = ${staples.ingredientId})`,
        ),
      );
    const placements = await loadIngredientPlacements(
      this.database,
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
