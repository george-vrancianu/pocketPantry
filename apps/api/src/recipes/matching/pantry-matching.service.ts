import { catalogScope } from '../../catalog/catalog-scope';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { batches, recipeIngredientLines, recipes } from '../../database/schema';
import { unexpiredBatch } from '../../shopping/batch-presence';
import { SettingsService } from '../../settings/settings.service';
import { recipeNotFound } from '../recipe-errors';
import { visibleTo } from '../recipe-view';
import { isExpiringSoon } from './batch-freshness';
import {
  indexStock,
  matchRecipe,
  type MatchBatch,
  type MatchLine,
  type RecipeMatch,
} from './pantry-match';

export type MatchOptions = {
  /** The Member's local date (YYYY-MM-DD): Batches expired before it are ignored. */
  today: string;
  /** Applied to every requested Recipe; each Recipe's own Servings when omitted. */
  servings?: number;
};

/** A Recipe's match plus the Servings it was worked out for. */
export type PantryRecipeMatch = RecipeMatch & { servings: number };

/**
 * Matches Recipes against a Family's Pantry, working from the stored Batches
 * and Ingredient Lines (ADR 0007). Built for Cook Tonight: it loads the
 * Family's stock and stale threshold once however many Recipes are asked for.
 */
@Injectable()
export class PantryMatchingService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  /**
   * One match per requested Recipe, keyed by Recipe id. Ids the Family cannot
   * see are left out of the map, not an error: only Catalog Recipes and the
   * Family's own are visible. Archived Recipes still match (they open by id);
   * leaving them out of a candidate list (Cook Tonight) is the caller's job.
   */
  async matchRecipes(
    familyId: string,
    recipeIds: readonly string[],
    options: MatchOptions,
  ): Promise<Map<string, PantryRecipeMatch>> {
    const ids = [...new Set(recipeIds)];
    const result = new Map<string, PantryRecipeMatch>();
    if (ids.length === 0) return result;

    const recipeRows = await this.database
      .select({ id: recipes.id, servings: recipes.servings })
      .from(recipes)
      .where(and(inArray(recipes.id, ids), visibleTo(familyId)));
    if (recipeRows.length === 0) return result;
    const visibleIds = recipeRows.map((row) => row.id);

    const ingredients = catalogScope(familyId).ingredients(this.database);
    const lineRows = await this.database
      .select({
        id: recipeIngredientLines.id,
        recipeId: recipeIngredientLines.recipeId,
        ingredientId: recipeIngredientLines.ingredientId,
        name: recipeIngredientLines.rawName,
        quantity: recipeIngredientLines.quantity,
        unit: recipeIngredientLines.unit,
        optional: recipeIngredientLines.optional,
        pantryBasic: ingredients.pantryBasic,
      })
      .from(recipeIngredientLines)
      .leftJoin(
        ingredients,
        eq(ingredients.id, recipeIngredientLines.ingredientId),
      )
      .where(inArray(recipeIngredientLines.recipeId, visibleIds))
      .orderBy(recipeIngredientLines.position);
    const linesOf = new Map<string, MatchLine[]>();
    for (const row of lineRows) {
      const list = linesOf.get(row.recipeId) ?? [];
      list.push({
        id: row.id,
        ingredientId: row.ingredientId,
        name: row.name,
        quantity: row.quantity,
        unit: row.unit,
        optional: row.optional,
        pantryBasic: row.pantryBasic ?? false,
      });
      linesOf.set(row.recipeId, list);
    }

    const stock = indexStock(await this.stockOf(familyId, options.today));
    for (const recipe of recipeRows) {
      const requested = options.servings ?? recipe.servings;
      result.set(recipe.id, {
        ...matchRecipe({
          lines: linesOf.get(recipe.id) ?? [],
          recipeServings: recipe.servings,
          requestedServings: requested,
          stock,
        }),
        servings: requested,
      });
    }
    return result;
  }

  /** `matchRecipes` for one Recipe; `recipes.not_found` when the Family cannot see it. */
  async matchRecipeFor(
    familyId: string,
    recipeId: string,
    options: MatchOptions,
  ): Promise<PantryRecipeMatch> {
    const matches = await this.matchRecipes(familyId, [recipeId], options);
    const match = matches.get(recipeId);
    if (!match) throw recipeNotFound();
    return match;
  }

  /** The Family's unexpired Batches, flagged Expiring Soon by its stale threshold. */
  private async stockOf(
    familyId: string,
    today: string,
  ): Promise<MatchBatch[]> {
    const threshold = await this.settings.staleThresholdOf(familyId);
    const rows = await this.database
      .select({
        ingredientId: batches.ingredientId,
        rawName: batches.rawName,
        quantity: batches.quantity,
        unit: batches.unit,
        expiryDate: batches.expiryDate,
      })
      .from(batches)
      .where(and(eq(batches.familyId, familyId), unexpiredBatch(today)));
    return rows.map((row) => ({
      ingredientId: row.ingredientId,
      name: row.rawName,
      quantity: row.quantity,
      unit: row.unit,
      expiringSoon: isExpiringSoon(row.expiryDate, today, threshold),
    }));
  }
}
