import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredients, leafCategories } from '../database/schema';
import {
  type CatalogMatch,
  type IngredientCatalog,
  validateCatalogMatch,
} from './ingredient-catalog';

const CACHE_TTL_MS = 5 * 60 * 1_000;

@Injectable()
export class IngredientCatalogService {
  private cached?: { value: IngredientCatalog; expiresAt: number };
  private loading?: Promise<IngredientCatalog>;

  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getCatalog(): Promise<IngredientCatalog> {
    if (this.cached && this.cached.expiresAt > Date.now()) {
      return this.cached.value;
    }

    if (!this.loading) {
      this.loading = this.loadCatalog().finally(() => {
        this.loading = undefined;
      });
    }

    return this.loading;
  }

  invalidate(): void {
    this.cached = undefined;
  }

  toPrompt(catalog: IngredientCatalog): string {
    return JSON.stringify({
      categories: catalog.categories,
      ingredients: catalog.ingredients.map((ingredient) => [
        ingredient.id,
        ingredient.name,
        ingredient.category,
      ]),
    });
  }

  validateMatch(
    catalog: IngredientCatalog,
    candidate: {
      matchedIngredientId: string | null;
      matchedCategory: string | null;
      matchConfidence: number;
    },
  ): CatalogMatch {
    return validateCatalogMatch(catalog, candidate);
  }

  private async loadCatalog(): Promise<IngredientCatalog> {
    const [rows, categoryRows] = await Promise.all([
      this.database
        .select({
          id: ingredients.id,
          name: ingredients.name,
          defaultUnit: ingredients.defaultUnit,
          category: leafCategories.name,
        })
        .from(ingredients)
        .innerJoin(
          leafCategories,
          eq(ingredients.leafCategoryId, leafCategories.id),
        )
        .orderBy(leafCategories.name, ingredients.name),
      this.database
        .select({ name: leafCategories.name })
        .from(leafCategories)
        .orderBy(leafCategories.name),
    ]);

    const value = {
      categories: categoryRows.map((category) => category.name),
      ingredients: rows,
    };
    this.cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  }
}
