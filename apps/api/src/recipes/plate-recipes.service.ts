import { Inject, Injectable } from '@nestjs/common';
import { and, inArray, isNull } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { recipeIngredientLines, recipes } from '../database/schema';
import { FamilyRecipesService } from './family-recipes.service';
import {
  rankPlateSuggestions,
  type PlateCandidate,
  type PlateSuggestion,
} from './plate-suggestions';
import { recipeTitles } from './recipe-view';
import type {
  FamilyRecipeEdit,
  FromPlateBody,
  PlateSuggestionsBody,
} from './recipes.schemas';

/** Saving a Plate Scan dish as a Family Recipe, and finding its closest Catalog base. */
@Injectable()
export class PlateRecipesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly family: FamilyRecipesService,
  ) {}

  /** Live Catalog Base Recipes ranked against the dish; a pure ranking over their lines and titles. */
  // Scanning the whole Catalog is intentional: it is small (tens of Base Recipes), so no index or pre-filter yet.
  async suggest(body: PlateSuggestionsBody): Promise<PlateSuggestion[]> {
    const bases = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          isNull(recipes.familyId),
          isNull(recipes.parentId),
          isNull(recipes.archivedAt),
        ),
      );
    if (bases.length === 0) return [];
    const lines = await this.database
      .select({
        recipeId: recipeIngredientLines.recipeId,
        ingredientId: recipeIngredientLines.ingredientId,
      })
      .from(recipeIngredientLines)
      .where(
        inArray(
          recipeIngredientLines.recipeId,
          bases.map((r) => r.id),
        ),
      );
    const titles = await recipeTitles(this.database, bases, body.locale);
    const ingredientsOf = new Map<string, string[]>();
    for (const l of lines) {
      if (!l.ingredientId) continue;
      ingredientsOf.set(l.recipeId, [
        ...(ingredientsOf.get(l.recipeId) ?? []),
        l.ingredientId,
      ]);
    }
    const candidates: PlateCandidate[] = bases.map((r) => ({
      id: r.id,
      titles: [...new Set([titles.get(r.id)!, r.title])],
      ingredientIds: ingredientsOf.get(r.id) ?? [],
    }));
    return rankPlateSuggestions(body, candidates);
  }

  /** One serving (GLOSSARY: Plate Scan is for one serving), ingredient lines only; parent rules are the Family editor's. */
  async save(memberId: string, body: FromPlateBody): Promise<FamilyRecipeEdit> {
    return this.family.create(
      memberId,
      {
        title: body.title,
        servings: 1,
        prepMinutes: null,
        cookMinutes: null,
        difficulty: null,
        cuisineId: null,
        methodId: null,
        parentId: body.parentId,
        lines: body.lines,
        steps: [],
      },
      body.locale,
    );
  }
}
