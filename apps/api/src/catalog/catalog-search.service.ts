import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  aisles,
  catalogTranslations,
  ingredients,
  leafCategories,
  parentCategories,
} from '../database/schema';
import {
  type CatalogLocale,
  type CatalogSearchResult,
} from './catalog.schemas';
import { loadDisplayNames } from './display-names';
import { resolveCatalogDefaults } from './catalog-defaults';
import { normalizeName } from './normalize';

@Injectable()
export class CatalogSearchService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /**
   * Matching stage one: the normalised query is looked up against canonical
   * names, display names, and Synonyms in every locale. Exact hits rank first,
   * then prefixes, then word-prefixes. Names come back in `locale`, falling
   * back to English.
   */
  async search(
    query: string,
    locale: CatalogLocale,
    limit: number,
  ): Promise<CatalogSearchResult[]> {
    const key = normalizeName(query);
    if (!key) return [];

    // `key` contains only letters, digits, and spaces, so it is LIKE-safe.
    const prefix = `${key}%`;
    const wordPrefix = `% ${key}%`;
    const ranked = await this.database.execute<{ id: string }>(sql`
      WITH candidates AS (
        SELECT ${ingredients.id} AS id, ${ingredients.normalizedName} AS key
        FROM ${ingredients}
        UNION ALL
        SELECT ${catalogTranslations.entityId}, ${catalogTranslations.normalizedValue}
        FROM ${catalogTranslations}
        WHERE ${catalogTranslations.entityType} = 'ingredient'
      )
      SELECT c.id
      FROM candidates c
      JOIN ${ingredients} i ON i.id = c.id
      WHERE c.key = ${key} OR c.key LIKE ${prefix} OR c.key LIKE ${wordPrefix}
      GROUP BY c.id, i.normalized_name
      ORDER BY MIN(CASE WHEN c.key = ${key} THEN 0 WHEN c.key LIKE ${prefix} THEN 1 ELSE 2 END),
               i.normalized_name,
               c.id
      LIMIT ${limit}
    `);
    return this.findByIds(
      ranked.rows.map((row) => row.id),
      locale,
    );
  }

  /** Ingredients by id, in the order given, shaped like a search result. Unknown ids are skipped. */
  async findByIds(
    ids: string[],
    locale: CatalogLocale,
  ): Promise<CatalogSearchResult[]> {
    if (ids.length === 0) return [];

    const rows = await this.database
      .select({
        id: ingredients.id,
        name: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        leafId: leafCategories.id,
        leafName: leafCategories.name,
        leafExpiry: leafCategories.defaultExpiryDays,
        leafLocation: leafCategories.defaultLocation,
        parentExpiry: parentCategories.defaultExpiryDays,
        parentLocation: parentCategories.defaultLocation,
        parentId: parentCategories.id,
        parentName: parentCategories.name,
        aisleId: aisles.id,
        aisleName: aisles.name,
      })
      .from(ingredients)
      .innerJoin(
        leafCategories,
        eq(ingredients.leafCategoryId, leafCategories.id),
      )
      .innerJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .innerJoin(aisles, eq(parentCategories.aisleId, aisles.id))
      .where(inArray(ingredients.id, ids));
    const byId = new Map(rows.map((row) => [row.id, row]));

    const names = await loadDisplayNames(
      this.database,
      locale,
      rows.flatMap((row) => [row.id, row.leafId, row.parentId, row.aisleId]),
    );
    const display = names.pick;

    return ids.flatMap((id) => {
      const row = byId.get(id);
      if (!row) return [];
      return [
        {
          id: row.id,
          name: display('ingredient', row.id, row.name),
          defaultUnit: row.defaultUnit,
          leafCategory: {
            id: row.leafId,
            name: display('leaf_category', row.leafId, row.leafName),
          },
          parentCategory: {
            id: row.parentId,
            name: display('parent_category', row.parentId, row.parentName),
            aisle: display('aisle', row.aisleId, row.aisleName),
          },
          defaults: resolveCatalogDefaults(
            {
              defaultExpiryDays: row.leafExpiry,
              defaultLocation: row.leafLocation,
            },
            {
              defaultExpiryDays: row.parentExpiry,
              defaultLocation: row.parentLocation,
            },
          ),
        },
      ];
    });
  }
}
