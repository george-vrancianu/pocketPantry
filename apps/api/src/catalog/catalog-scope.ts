import type { Executor } from '../database/database.types';
import { catalogTranslations, ingredients } from '../database/schema';

/** Asks for shared Catalog rows only: Admin curation and Catalog Recipe editing. */
export const SHARED_ONLY = Symbol('catalog.shared-only');

/**
 * Who is reading the Catalog: a Member's Family (shared rows plus that
 * Family's own) or `SHARED_ONLY`.
 */
export type CatalogReader = string | typeof SHARED_ONLY;

/**
 * The only way to read Ingredients and Catalog translations (the Family Ingredients ADR, #270).
 * Each method returns a subquery with the table's columns, to use wherever the
 * table would be: `.from(scope.ingredients(db))`, a join, or a raw-SQL source.
 * Callers never filter by owner themselves, so forgetting the scope is the one
 * mistake that could leak one Family's names to another.
 *
 * Today every row is shared, so every scope yields the whole Catalog. Family
 * Ingredients and Family Synonyms add their owner predicate here and nowhere else.
 * Inserts, updates and deletes still target the tables directly.
 */
export type CatalogScope = {
  ingredients(executor: Executor): ReturnType<typeof scopedIngredients>;
  translations(executor: Executor): ReturnType<typeof scopedTranslations>;
};

function scopedIngredients(executor: Executor) {
  return executor.select().from(ingredients).as('ingredients');
}

function scopedTranslations(executor: Executor) {
  return executor.select().from(catalogTranslations).as('catalog_translations');
}

export function catalogScope(reader: CatalogReader): CatalogScope {
  void reader;
  return {
    ingredients: scopedIngredients,
    translations: scopedTranslations,
  };
}
