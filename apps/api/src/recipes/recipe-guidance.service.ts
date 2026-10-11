import { Inject, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { hasPgCode, pgConstraint } from '../database/pg-errors';
import { recipeNotFound } from './recipe-errors';
import type { GuidanceBody } from './recipe-guidance.schemas';
import { writeGuidance } from './recipe-guidance-write';
import { lockCatalogRecipe } from './recipe-locks';
import { loadAdminDetail } from './recipe-view';
import type { AdminRecipeDetail } from './recipes.schemas';

/**
 * Catalog Recipe guidance (Pairings, Nutrition Note, Eating Moment uses),
 * replaced as a whole through its own endpoint. The translations of guidance
 * text are written with the other Recipe translations.
 */
@Injectable()
export class RecipeGuidanceService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async set(recipeId: string, body: GuidanceBody): Promise<AdminRecipeDetail> {
    try {
      await this.database.transaction(async (tx) => {
        const recipe = await lockCatalogRecipe(tx, recipeId);
        await writeGuidance(tx, recipe, body);
      });
    } catch (error) {
      // The Recipe lock serialises writers; this is the backstop for the unique index.
      if (
        hasPgCode(error, '23505') &&
        pgConstraint(error) === 'recipe_eating_moments_recipe_moment_idx'
      ) {
        throw new ApiException(400, 'recipes.eating_moment_duplicate');
      }
      throw error;
    }
    const detail = await loadAdminDetail(this.database, recipeId);
    if (!detail) throw recipeNotFound();
    return detail;
  }
}
