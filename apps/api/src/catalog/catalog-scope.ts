import { eq, isNull, or } from 'drizzle-orm';
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
 * The only way to read Ingredients and Catalog translations (ADR 0011).
 * Each method returns a subquery with the table's columns, to use wherever the
 * table would be: `.from(scope.ingredients(db))`, a join, or a raw-SQL source.
 * Callers never filter by owner themselves, so forgetting the scope is the one
 * mistake that could leak one Family's names to another.
 *
 * A Family reader gets shared rows plus its own Family Ingredients; `SHARED_ONLY`
 * gets shared rows only. Family Synonyms add their predicate here too.
 * Inserts, updates and deletes still target the tables directly.
 */
export type CatalogScope = {
  ingredients(executor: Executor): ReturnType<typeof scopedIngredients>;
  translations(executor: Executor): ReturnType<typeof scopedTranslations>;
};

function scopedIngredients(executor: Executor, reader: CatalogReader) {
  const rows = executor.select().from(ingredients);
  return (
    reader === SHARED_ONLY
      ? rows.where(isNull(ingredients.ownerFamilyId))
      : rows.where(
          or(
            isNull(ingredients.ownerFamilyId),
            eq(ingredients.ownerFamilyId, reader),
          ),
        )
  ).as('ingredients');
}

function scopedTranslations(executor: Executor) {
  return executor.select().from(catalogTranslations).as('catalog_translations');
}

export function catalogScope(reader: CatalogReader): CatalogScope {
  return {
    ingredients: (executor) => scopedIngredients(executor, reader),
    translations: scopedTranslations,
  };
}
