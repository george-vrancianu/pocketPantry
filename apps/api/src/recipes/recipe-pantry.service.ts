import { Injectable, Inject } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { exceedsMaxQuantity } from '../common/quantity';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  recipeIngredientLines,
  shoppingItems,
  shoppingLists,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { utcToday } from '../shopping/batch-presence';
import type { ShoppingListView } from '../shopping/shopping.schemas';
import {
  ShoppingService,
  type MergeItemInput,
} from '../shopping/shopping.service';
import { PantryMatchingService } from './matching/pantry-matching.service';
import type {
  AddMissingBody,
  PantryLineView,
  PantryMatchQuery,
  PantryMatchView,
} from './recipe-pantry.schemas';

/** A Member's view of a Recipe against their Family's Pantry, and "add missing to the Shopping List". */
@Injectable()
export class RecipePantryService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly matching: PantryMatchingService,
    private readonly shopping: ShoppingService,
  ) {}

  async match(
    memberId: string,
    recipeId: string,
    query: PantryMatchQuery,
  ): Promise<PantryMatchView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const match = await this.matching.matchRecipeFor(familyId, recipeId, {
      today: query.today ?? utcToday(),
      servings: query.servings,
    });
    const lines = await this.linesOf(recipeId);
    const onList = await this.onShoppingList(familyId);
    const lineViews: PantryLineView[] = match.lines.map((line) => {
      const source = lines.get(line.lineId);
      const listed =
        source?.ingredientId != null
          ? onList.ingredientIds.has(source.ingredientId)
          : source?.normalizedName != null &&
            onList.names.has(normalizeName(source.normalizedName));
      return { ...line, onShoppingList: listed };
    });
    return { ...match, lines: lineViews };
  }

  /**
   * Adds what the Pantry lacks for the Recipe, at the Servings asked for:
   * the shortfall of a short line, the whole quantity of a missing line, a
   * quantity-less item for a quantity-less line. Pantry Basics, optional and
   * covered lines are skipped. Returns the updated Shopping List.
   */
  async addMissing(
    memberId: string,
    recipeId: string,
    body: AddMissingBody,
    locale: CatalogLocale,
  ): Promise<ShoppingListView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const match = await this.matching.matchRecipeFor(familyId, recipeId, {
      today: body.today ?? utcToday(),
      servings: body.servings,
    });
    const lines = await this.linesOf(recipeId);
    const items: MergeItemInput[] = [];
    for (const line of match.lines) {
      const source = lines.get(line.lineId);
      if (!source) continue;
      if (line.optional || line.pantryBasic || line.status === 'covered') {
        continue;
      }
      // A short line adds the shortfall; a missing line the whole quantity.
      const amount =
        line.status === 'short' && line.shortfall
          ? line.shortfall
          : line.quantity !== null && line.unit !== null
            ? { quantity: line.quantity, unit: line.unit }
            : null;
      if (amount && exceedsMaxQuantity(amount.quantity)) {
        throw new ApiException(400, 'shopping.quantity_too_large');
      }
      items.push({
        ...(source.ingredientId !== null
          ? { ingredientId: source.ingredientId }
          : { name: source.rawName ?? '', source: 'recipe' as const }),
        ...(amount ?? {}),
      });
    }
    return this.shopping.addItemsFromRecipe(memberId, recipeId, items, locale);
  }

  private async linesOf(recipeId: string) {
    const rows = await this.database
      .select({
        id: recipeIngredientLines.id,
        ingredientId: recipeIngredientLines.ingredientId,
        rawName: recipeIngredientLines.rawName,
        normalizedName: recipeIngredientLines.normalizedName,
      })
      .from(recipeIngredientLines)
      .where(eq(recipeIngredientLines.recipeId, recipeId))
      .orderBy(asc(recipeIngredientLines.position));
    return new Map(rows.map((row) => [row.id, row]));
  }

  /** The Family's unchecked Shopping Items, by Ingredient and by Unmatched name. No list is created. */
  private async onShoppingList(familyId: string) {
    const rows = await this.database
      .select({
        ingredientId: shoppingItems.ingredientId,
        normalizedName: shoppingItems.normalizedName,
      })
      .from(shoppingItems)
      .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
      .where(
        and(
          eq(shoppingLists.familyId, familyId),
          eq(shoppingLists.status, 'active'),
          eq(shoppingItems.checked, false),
        ),
      );
    const ingredientIds = new Set<string>();
    const names = new Set<string>();
    for (const row of rows) {
      if (row.ingredientId !== null) ingredientIds.add(row.ingredientId);
      else if (row.normalizedName !== null) names.add(row.normalizedName);
    }
    return { ingredientIds, names };
  }
}
