import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  catalogScope,
  type CatalogReader,
  SHARED_ONLY,
} from '../catalog/catalog-scope';
import {
  type CatalogLocale,
  FALLBACK_LOCALE,
} from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { leafCategories } from '../database/schema';
import {
  type CatalogMatch,
  type IngredientCatalog,
  validateCatalogMatch,
} from './ingredient-catalog';

const CACHE_TTL_MS = 5 * 60 * 1_000;

const cacheKey = (reader: CatalogReader) =>
  reader === SHARED_ONLY ? 'shared' : `family:${reader}`;

@Injectable()
export class IngredientCatalogService {
  // One snapshot per reader: a Family's Catalog differs from the shared one.
  private readonly cached = new Map<
    string,
    { value: IngredientCatalog; expiresAt: number }
  >();
  private readonly loading = new Map<string, Promise<IngredientCatalog>>();
  // Bumped by `invalidate`: a load that started before it must not re-cache.
  private readonly generations = new Map<string, number>();

  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getCatalog(reader: CatalogReader): Promise<IngredientCatalog> {
    const key = cacheKey(reader);
    const cached = this.cached.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    let loading = this.loading.get(key);
    if (!loading) {
      const started = (loading = this.loadCatalog(reader, key).finally(() => {
        if (this.loading.get(key) === started) this.loading.delete(key);
      }));
      this.loading.set(key, loading);
    }
    return loading;
  }

  /** The Catalog with Ingredient names in `locale` (English fallback), as handed to the model. */
  async getCatalogIn(
    reader: CatalogReader,
    locale: CatalogLocale,
  ): Promise<IngredientCatalog> {
    const catalog = await this.getCatalog(reader);
    if (locale === FALLBACK_LOCALE) return catalog;
    const names = await loadDisplayNames(
      this.database,
      catalogScope(reader),
      locale,
      catalog.ingredients.map((ingredient) => ingredient.id),
    );
    return {
      ...catalog,
      ingredients: catalog.ingredients.map((ingredient) => ({
        ...ingredient,
        name: names.pick('ingredient', ingredient.id, ingredient.name),
      })),
    };
  }

  /** Drops the snapshot of `reader`, or of every reader when none is given. */
  invalidate(reader?: CatalogReader): void {
    if (reader === undefined) {
      for (const key of new Set([
        ...this.cached.keys(),
        ...this.loading.keys(),
      ])) {
        this.bump(key);
      }
      this.cached.clear();
      this.loading.clear();
    } else {
      const key = cacheKey(reader);
      this.bump(key);
      this.cached.delete(key);
      this.loading.delete(key);
    }
  }

  private bump(key: string): void {
    this.generations.set(key, (this.generations.get(key) ?? 0) + 1);
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

  private async loadCatalog(
    reader: CatalogReader,
    key: string,
  ): Promise<IngredientCatalog> {
    const generation = this.generations.get(key) ?? 0;
    const ingredients = catalogScope(reader).ingredients(this.database);
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
    const now = Date.now();
    for (const [other, entry] of this.cached) {
      if (entry.expiresAt <= now) this.cached.delete(other);
    }
    if ((this.generations.get(key) ?? 0) === generation) {
      this.cached.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    }
    return value;
  }
}
