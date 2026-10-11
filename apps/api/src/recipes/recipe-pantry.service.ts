import { Injectable, Inject } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { normalizeName } from '../catalog/normalize';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  recipeIngredientLines,
  shoppingItems,
  shoppingLists,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { utcToday } from '../shopping/batch-presence';
import { PantryMatchingService } from './matching/pantry-matching.service';
import type {
  PantryLineView,
  PantryMatchQuery,
  PantryMatchView,
} from './recipe-pantry.schemas';

/** A Member's view of a Recipe against their Family's Pantry. */
@Injectable()
export class RecipePantryService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly matching: PantryMatchingService,
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
