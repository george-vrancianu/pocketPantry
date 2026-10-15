import { eq, isNotNull, isNull, or, sql } from 'drizzle-orm';
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
 * gets shared rows only. Translations follow the same rule through their own
 * owner (Family Synonyms, #273).
 * Inserts, updates and deletes still target the tables directly.
 */
export type CatalogScope = {
  ingredients(executor: Executor): ReturnType<typeof scopedIngredients>;
  translations(executor: Executor): ReturnType<typeof scopedTranslations>;
};

/**
 * Exact-name tiers: a Family's own names (rank 0) win over shared ones (rank 1)
 * when both claim a name. Family Synonyms are rank 0 too (#273).
 */
export const FAMILY_TIER = 0;
export const SHARED_TIER = 1;

/** The tier of each row of a scoped `ingredients` source, as an SQL expression. */
export function ingredientTier(
  scoped: ReturnType<CatalogScope['ingredients']>,
) {
  return sql<number>`CASE WHEN ${scoped.ownerFamilyId} IS NULL THEN ${SHARED_TIER}::int ELSE ${FAMILY_TIER}::int END`;
}

/** The tier of each row of a scoped `translations` source: a Family Synonym is the Family's own. */
export function translationTier(
  scoped: ReturnType<CatalogScope['translations']>,
) {
  return sql<number>`CASE WHEN ${scoped.ownerFamilyId} IS NULL THEN ${SHARED_TIER}::int ELSE ${FAMILY_TIER}::int END`;
}

/** True for translations every Family sees (names and shared Synonyms), for writes that must leave Family Synonyms alone. */
export const sharedTranslation = isNull(catalogTranslations.ownerFamilyId);

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

function scopedTranslations(executor: Executor, reader: CatalogReader) {
  const rows = executor.select().from(catalogTranslations);
  return (
    reader === SHARED_ONLY
      ? rows.where(isNull(catalogTranslations.ownerFamilyId))
      : rows.where(
          or(
            isNull(catalogTranslations.ownerFamilyId),
            eq(catalogTranslations.ownerFamilyId, reader),
          ),
        )
  ).as('catalog_translations');
}

export function catalogScope(reader: CatalogReader): CatalogScope {
  return {
    ingredients: (executor) => scopedIngredients(executor, reader),
    translations: (executor) => scopedTranslations(executor, reader),
  };
}

/**
 * Family Ingredients of every Family, for the Admin curation queue only (#275).
 * The one deliberate read across Families: callers must never expose which
 * Family owns a row.
 */
export function familyOwnedIngredients(executor: Executor) {
  return executor
    .select()
    .from(ingredients)
    .where(isNotNull(ingredients.ownerFamilyId))
    .as('ingredients');
}
