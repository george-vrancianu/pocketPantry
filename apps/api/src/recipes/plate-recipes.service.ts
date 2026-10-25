import { Inject, Injectable } from '@nestjs/common';
import { and, inArray, isNull } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { recipeIngredientLines, recipes } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { FamilyRecipesService } from './family-recipes.service';
import { rankPlateMatches, type PlateCandidate } from './plate-matches';
import {
  loadAllergyWarnings,
  loadViewerAllergyContext,
} from './recipe-allergens';
import { liveCopiesOf, recipeTitles } from './recipe-view';
import type {
  FamilyRecipeEdit,
  FromPlateBody,
  PlateMatches,
  PlateMatchesBody,
} from './recipes.schemas';

/** Saving a Plate Scan dish as a Family Recipe, and finding its closest Catalog base. */
@Injectable()
export class PlateRecipesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly family: FamilyRecipesService,
    private readonly settings: SettingsService,
  ) {}

  /** Live Catalog Base Recipes ranked against the dish; a pure ranking over their lines and titles. */
  // Scanning the whole Catalog is intentional: it is small (tens of Base Recipes), so no index or pre-filter yet.
  async closestBases(
    memberId: string,
    body: PlateMatchesBody,
  ): Promise<PlateMatches> {
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
    if (bases.length === 0) return { matches: [], hiddenByAllergiesCount: 0 };
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
    const familyId = await this.settings.familyIdOf(memberId);
    // Hiding (#359) takes Recipes out before the closest five are picked, so the list fills up
    // from the next best; the count is how many of the five the override would restore.
    const { allergies, hides } = await loadViewerAllergyContext(
      this.database,
      this.settings,
      memberId,
      familyId,
      body.showHidden,
    );
    const scope = catalogScope(familyId);
    const closest = rankPlateMatches(body, candidates);
    // Hiding needs every base judged; otherwise only the five shown need a warning.
    const { warnings, hidden } = await loadAllergyWarnings(
      this.database,
      scope,
      hides ? bases.map((r) => r.id) : closest.map((m) => m.id),
      body.locale,
      allergies,
    );
    const ranked = hides
      ? rankPlateMatches(
          body,
          candidates.filter((c) => !hidden.has(c.id)),
        )
      : closest;
    const copies = await liveCopiesOf(
      this.database,
      familyId,
      ranked.map((m) => m.id),
    );
    return {
      matches: ranked.map((m) => ({
        ...m,
        familyCopyId: copies.get(m.id) ?? null,
        allergyWarning: warnings.get(m.id) ?? null,
      })),
      hiddenByAllergiesCount: hides
        ? closest.filter((m) => hidden.has(m.id)).length
        : 0,
    };
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
