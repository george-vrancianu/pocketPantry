import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { seedId } from './seed/seed-ids';
import { aisles, leafCategories, parentCategories } from '../database/schema';
import {
  ingredientTier,
  SHARED_TIER,
  type CatalogScope,
} from './catalog-scope';
import {
  AISLE_LISTING_LIMIT,
  type CatalogAisle,
  type CatalogCategory,
  type CatalogLocale,
  type CatalogParent,
  type CatalogSearchResult,
} from './catalog.schemas';
import { loadDisplayNames } from './display-names';
import {
  resolveCatalogDefaults,
  resolveExpiryDays,
  type ExpiryOverride,
} from './catalog-defaults';
import { normalizeName } from './normalize';
import { readAmountScale } from './amount-scale';

const TOP_LEVEL_OTHER_PARENT_ID = seedId.parent('other');

/** Restricts a search to an Aisle, and within it to one Parent Category. */
export type SearchWithin = { aisleId?: string; parentCategoryId?: string };

@Injectable()
export class CatalogSearchService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /**
   * Matching stage one: the normalised query is looked up against canonical
   * names, display names, and Synonyms in every locale. Exact hits rank first,
   * then prefixes, then word-prefixes. Names come back in `locale`, falling
   * back to English. `within` restricts it to an Aisle (and a Parent
   * Category); an empty query with an Aisle lists its Ingredients A to Z.
   */
  async search(
    scope: CatalogScope,
    query: string,
    locale: CatalogLocale,
    limit: number,
    overrides: readonly ExpiryOverride[] = [],
    within: SearchWithin = {},
  ): Promise<CatalogSearchResult[]> {
    const key = normalizeName(query);
    if (!key) {
      return within.aisleId
        ? this.listAisle(
            scope,
            within.aisleId,
            within.parentCategoryId,
            locale,
            overrides,
          )
        : [];
    }
    const ingredients = scope.ingredients(this.database);
    const catalogTranslations = scope.translations(this.database);
    const placed = within.aisleId || within.parentCategoryId;
    const placement = placed
      ? sql`JOIN ${leafCategories} ON ${leafCategories.id} = ${ingredients.leafCategoryId}
            JOIN ${parentCategories} ON ${parentCategories.id} = ${leafCategories.parentId}`
      : sql``;
    const inAisle = [
      within.aisleId
        ? sql`${parentCategories.aisleId} = ${within.aisleId}`
        : null,
      within.parentCategoryId
        ? sql`${parentCategories.id} = ${within.parentCategoryId}`
        : null,
    ].flatMap((condition) => (condition ? [sql` AND ${condition}`] : []));

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
      JOIN ${ingredients} ON ${ingredients.id} = c.id
      ${placement}
      WHERE (c.key = ${key} OR c.key LIKE ${prefix} OR c.key LIKE ${wordPrefix})${sql.join(inAisle)}
      GROUP BY c.id, ${ingredients.normalizedName}
      ORDER BY MIN(CASE WHEN c.key = ${key} THEN 0 WHEN c.key LIKE ${prefix} THEN 1 ELSE 2 END),
               ${ingredients.normalizedName},
               c.id
      LIMIT ${limit}
    `);
    return this.findByIds(
      scope,
      ranked.rows.map((row) => row.id),
      locale,
      overrides,
    );
  }

  /** An Aisle's Ingredients (optionally one Parent Category's) by name in `locale`, A to Z, up to the listing limit. */
  private async listAisle(
    scope: CatalogScope,
    aisleId: string,
    parentCategoryId: string | undefined,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[],
  ): Promise<CatalogSearchResult[]> {
    const ingredients = scope.ingredients(this.database);
    const rows = await this.database
      .select({ id: ingredients.id })
      .from(ingredients)
      .innerJoin(
        leafCategories,
        eq(ingredients.leafCategoryId, leafCategories.id),
      )
      .innerJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .where(
        and(
          eq(parentCategories.aisleId, aisleId),
          parentCategoryId
            ? eq(parentCategories.id, parentCategoryId)
            : undefined,
        ),
      );
    const found = await this.findByIds(
      scope,
      rows.map((row) => row.id),
      locale,
      overrides,
    );
    return found
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name, locale) || a.id.localeCompare(b.id),
      )
      .slice(0, AISLE_LISTING_LIMIT);
  }

  /** The Aisles in shop order, each with its Parent Categories, named in `locale`. */
  async listAisles(
    scope: CatalogScope,
    locale: CatalogLocale,
  ): Promise<CatalogAisle[]> {
    const aisleRows = await this.database
      .select({ id: aisles.id, name: aisles.name })
      .from(aisles)
      .orderBy(asc(aisles.sortOrder));
    const parentRows = await this.database
      .select({
        id: parentCategories.id,
        name: parentCategories.name,
        aisleId: parentCategories.aisleId,
      })
      .from(parentCategories);
    const { pick } = await loadDisplayNames(this.database, scope, locale, [
      ...aisleRows.map((row) => row.id),
      ...parentRows.map((row) => row.id),
    ]);
    return aisleRows.map((aisle) => ({
      id: aisle.id,
      name: pick('aisle', aisle.id, aisle.name),
      parentCategories: parentRows
        .filter((parent) => parent.aisleId === aisle.id)
        .map((parent) => ({
          id: parent.id,
          name: pick('parent_category', parent.id, parent.name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    }));
  }

  /**
   * Exact matching only, for many names in one query: each name is normalised
   * and looked up against canonical names, display names, and Synonyms in every
   * locale. Returns the Ingredient per input name (keyed by the name as given);
   * a name with no exact hit, or one that is exactly the name of more than one
   * Ingredient, is left out so the caller keeps it Unmatched.
   */
  async findExact(
    scope: CatalogScope,
    names: string[],
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[] = [],
  ): Promise<Map<string, CatalogSearchResult>> {
    const keyOf = new Map(
      names.flatMap((name) => {
        const key = normalizeName(name);
        return key ? [[name, key] as const] : [];
      }),
    );
    const keys = [...new Set(keyOf.values())];
    if (keys.length === 0) return new Map();
    const ingredients = scope.ingredients(this.database);
    const catalogTranslations = scope.translations(this.database);

    const keyList = sql.join(
      keys.map((key) => sql`${key}`),
      sql`, `,
    );
    const hits = await this.database.execute<{
      id: string;
      key: string;
      tier: number;
    }>(sql`
      SELECT DISTINCT c.id, c.key, c.tier
      FROM (
        SELECT ${ingredients.id} AS id, ${ingredients.normalizedName} AS key,
          ${ingredientTier(ingredients)} AS tier
        FROM ${ingredients}
        UNION ALL
        SELECT ${catalogTranslations.entityId}, ${catalogTranslations.normalizedValue},
          ${SHARED_TIER}
        FROM ${catalogTranslations}
        WHERE ${catalogTranslations.entityType} = 'ingredient'
      ) c
      WHERE c.key = ANY(ARRAY[${keyList}]::text[])
    `);
    // Per name, only the best tier that claims it counts; one Ingredient there
    // is a hit, several are a clash and stay Unmatched.
    const claims = new Map<string, { tier: number; ids: Set<string> }>();
    for (const { id, key, tier } of hits.rows) {
      const claim = claims.get(key);
      if (!claim || tier < claim.tier) {
        claims.set(key, { tier, ids: new Set([id]) });
      } else if (tier === claim.tier) {
        claim.ids.add(id);
      }
    }
    const idsByKey = new Map(
      [...claims].map(([key, claim]) => [key, [...claim.ids]]),
    );
    const unique = [...idsByKey.values()].flatMap((ids) =>
      ids.length === 1 ? ids : [],
    );
    const found = await this.mapByIds(
      scope,
      [...new Set(unique)],
      locale,
      overrides,
    );
    const result = new Map<string, CatalogSearchResult>();
    for (const [name, key] of keyOf) {
      const ids = idsByKey.get(key);
      const match = ids?.length === 1 ? found.get(ids[0]) : undefined;
      if (match) result.set(name, match);
    }
    return result;
  }

  /**
   * Leaf Categories a Family Ingredient can be filed under, named in `locale`.
   * An empty query offers only the top-level "Other" Leaf. Otherwise ranks
   * Leaf starts with, Leaf contains, Parent contains, Aisle contains, then A to Z.
   */
  async listCategories(
    scope: CatalogScope,
    query: string,
    locale: CatalogLocale,
    limit: number,
    overrides: readonly ExpiryOverride[],
  ): Promise<CatalogCategory[]> {
    const key = normalizeName(query);
    const rows = await this.database
      .select({
        leafId: leafCategories.id,
        leafName: leafCategories.name,
        leafExpiry: leafCategories.defaultExpiryDays,
        leafLocation: leafCategories.defaultLocation,
        isOther: leafCategories.isOther,
        parentId: parentCategories.id,
        parentName: parentCategories.name,
        parentExpiry: parentCategories.defaultExpiryDays,
        parentLocation: parentCategories.defaultLocation,
        aisleId: aisles.id,
        aisleName: aisles.name,
      })
      .from(leafCategories)
      .innerJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .innerJoin(aisles, eq(parentCategories.aisleId, aisles.id))
      .where(
        key
          ? undefined
          : and(
              eq(leafCategories.isOther, true),
              eq(parentCategories.id, TOP_LEVEL_OTHER_PARENT_ID),
            ),
      );
    const { pick } = await loadDisplayNames(
      this.database,
      scope,
      locale,
      rows.flatMap((row) => [row.leafId, row.parentId, row.aisleId]),
    );
    const named = rows.map((row) => ({
      row,
      leaf: pick('leaf_category', row.leafId, row.leafName),
      parent: pick('parent_category', row.parentId, row.parentName),
      aisle: pick('aisle', row.aisleId, row.aisleName),
    }));
    const tierOf = (entry: (typeof named)[number]): number => {
      if (!key) return 0;
      const leaf = normalizeName(entry.leaf);
      if (leaf.startsWith(key)) return 0;
      if (leaf.includes(key)) return 1;
      if (normalizeName(entry.parent).includes(key)) return 2;
      if (normalizeName(entry.aisle).includes(key)) return 3;
      return 4;
    };
    return named
      .map((entry) => ({ entry, tier: tierOf(entry) }))
      .filter(({ tier }) => tier < 4)
      .sort(
        (a, b) =>
          a.tier - b.tier ||
          a.entry.leaf.localeCompare(b.entry.leaf, locale) ||
          a.entry.row.leafId.localeCompare(b.entry.row.leafId),
      )
      .slice(0, limit)
      .map(({ entry: { row, leaf, parent, aisle } }) => ({
        id: row.leafId,
        name: leaf,
        parentCategory: { id: row.parentId, name: parent },
        aisle: { id: row.aisleId, name: aisle },
        defaults: {
          ...resolveCatalogDefaults(
            {
              defaultExpiryDays: row.leafExpiry,
              defaultLocation: row.leafLocation,
            },
            {
              defaultExpiryDays: row.parentExpiry,
              defaultLocation: row.parentLocation,
            },
          ),
          expiryDays: resolveExpiryDays(
            { id: row.leafId, defaultExpiryDays: row.leafExpiry },
            { id: row.parentId, defaultExpiryDays: row.parentExpiry },
            overrides,
          ),
        },
      }));
  }

  /**
   * The Ingredient (visible to `scope`) whose canonical name, display name in
   * any locale, or Synonym equals `key` (a normalised name), if any. Shared
   * rows win over the Family's own.
   */
  async findIdByName(scope: CatalogScope, key: string): Promise<string | null> {
    const ingredients = scope.ingredients(this.database);
    const catalogTranslations = scope.translations(this.database);
    const hits = await this.database.execute<{ id: string }>(sql`
      SELECT c.id
      FROM (
        SELECT ${ingredients.id} AS id, ${ingredients.normalizedName} AS key
        FROM ${ingredients}
        UNION ALL
        SELECT ${catalogTranslations.entityId}, ${catalogTranslations.normalizedValue}
        FROM ${catalogTranslations}
        WHERE ${catalogTranslations.entityType} = 'ingredient'
      ) c
      JOIN ${ingredients} ON ${ingredients.id} = c.id
      WHERE c.key = ${key}
      ORDER BY (${ingredients.ownerFamilyId} IS NOT NULL), c.id
      LIMIT 1
    `);
    return hits.rows[0]?.id ?? null;
  }

  /** Every Parent Category with its name in `locale`, sorted by that name. */
  async listParents(
    scope: CatalogScope,
    locale: CatalogLocale,
  ): Promise<CatalogParent[]> {
    const rows = await this.database
      .select({ id: parentCategories.id, name: parentCategories.name })
      .from(parentCategories);
    const { pick } = await loadDisplayNames(
      this.database,
      scope,
      locale,
      rows.map((row) => row.id),
    );
    return rows
      .map((row) => ({
        id: row.id,
        name: pick('parent_category', row.id, row.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }

  /** `findByIds` keyed by Ingredient id, for callers that join the results to their own rows. */
  async mapByIds(
    scope: CatalogScope,
    ids: string[],
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[] = [],
  ): Promise<Map<string, CatalogSearchResult>> {
    const found = await this.findByIds(scope, ids, locale, overrides);
    return new Map(found.map((result) => [result.id, result]));
  }

  /** Ingredients by id, in the order given, shaped like a search result. Unknown ids are skipped. */
  async findByIds(
    scope: CatalogScope,
    ids: string[],
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[] = [],
  ): Promise<CatalogSearchResult[]> {
    if (ids.length === 0) return [];

    const ingredients = scope.ingredients(this.database);
    const rows = await this.database
      .select({
        id: ingredients.id,
        name: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        amountScale: ingredients.amountScale,
        ownerFamilyId: ingredients.ownerFamilyId,
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
      scope,
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
          owner: row.ownerFamilyId ? ('family' as const) : ('catalog' as const),
          defaultUnit: row.defaultUnit,
          amountScale: readAmountScale(row.amountScale),
          leafCategory: {
            id: row.leafId,
            name: display('leaf_category', row.leafId, row.leafName),
          },
          parentCategory: {
            id: row.parentId,
            name: display('parent_category', row.parentId, row.parentName),
            aisle: {
              id: row.aisleId,
              name: display('aisle', row.aisleId, row.aisleName),
            },
          },
          defaults: {
            ...resolveCatalogDefaults(
              {
                defaultExpiryDays: row.leafExpiry,
                defaultLocation: row.leafLocation,
              },
              {
                defaultExpiryDays: row.parentExpiry,
                defaultLocation: row.parentLocation,
              },
            ),
            // The Family's Default Expiry override wins over the Catalog defaults.
            expiryDays: resolveExpiryDays(
              { id: row.leafId, defaultExpiryDays: row.leafExpiry },
              { id: row.parentId, defaultExpiryDays: row.parentExpiry },
              overrides,
            ),
          },
        },
      ];
    });
  }
}
