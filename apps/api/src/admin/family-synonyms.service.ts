import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { catalogScope, SHARED_ONLY } from '../catalog/catalog-scope';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { catalogTranslations, ingredients } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { AdminCatalogService } from './admin-catalog.service';
import {
  encodeSynonymCursor,
  type FamilySynonymPromoteBody,
  type FamilySynonymsListQuery,
  type FamilySynonymsPage,
  type PromotedFamilySynonym,
} from './family-synonyms.schemas';

const notFound = () => new ApiException(404, 'family_synonyms.not_found');

/**
 * Admin curation of Family Synonyms (ADR 0011): the candidate queue across
 * Families and adding one as a shared Synonym. Locks as the Family Ingredient
 * promote: the name lock, then the owning Family rows.
 */
@Injectable()
export class FamilySynonymsAdminService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly catalog: AdminCatalogService,
    private readonly scanCatalog: IngredientCatalogService,
  ) {}

  async list(query: FamilySynonymsListQuery): Promise<FamilySynonymsPage> {
    const rows = catalogTranslations;
    const count = sql`count(distinct ${rows.ownerFamilyId})`;
    const name = sql`${rows.normalizedValue} collate "C"`;
    const cursor = query.cursor;
    const after = cursor
      ? sql`${count} < ${cursor.count}
        or (${count} = ${cursor.count} and ${name} > ${cursor.name} collate "C")
        or (${count} = ${cursor.count} and ${name} = ${cursor.name} collate "C" and ${rows.entityId} > ${cursor.id}::uuid)`
      : sql`true`;
    const groups = await this.database
      .select({
        normalizedName: rows.normalizedValue,
        ingredientId: rows.entityId,
        ingredientName: sql<string>`min(${ingredients.name})`,
        familyCount: sql<number>`count(distinct ${rows.ownerFamilyId})::int`,
        name: sql<string>`(array_agg(${rows.value} order by ${rows.createdAt}, ${rows.id}))[1]`,
      })
      .from(rows)
      .innerJoin(ingredients, eq(ingredients.id, rows.entityId))
      .where(
        and(
          eq(rows.entityType, 'ingredient'),
          eq(rows.kind, 'synonym'),
          isNotNull(rows.ownerFamilyId),
          isNull(ingredients.ownerFamilyId),
        ),
      )
      .groupBy(rows.normalizedValue, rows.entityId)
      .having(after)
      .orderBy(sql`${count} desc`, name, rows.entityId)
      .limit(query.limit + 1);
    const page = groups.slice(0, query.limit);
    const last = page.at(-1);
    return {
      candidates: page.map((group) => ({
        normalizedName: group.normalizedName,
        name: group.name,
        ingredient: { id: group.ingredientId, name: group.ingredientName },
        familyCount: group.familyCount,
      })),
      nextCursor:
        groups.length > query.limit && last
          ? encodeSynonymCursor({
              count: last.familyCount,
              name: last.normalizedName,
              id: last.ingredientId,
            })
          : null,
    };
  }

  /**
   * Adds the candidate as a shared Synonym and removes every Family Synonym
   * with that name on the Ingredient.
   */
  async promote(
    body: FamilySynonymPromoteBody,
  ): Promise<PromotedFamilySynonym> {
    const key = body.normalizedName;
    const result = await this.database.transaction(async (tx) => {
      await this.catalog.lockName(tx, key);
      const matching = and(
        eq(catalogTranslations.entityType, 'ingredient'),
        eq(catalogTranslations.entityId, body.ingredientId),
        eq(catalogTranslations.kind, 'synonym'),
        eq(catalogTranslations.normalizedValue, key),
        isNotNull(catalogTranslations.ownerFamilyId),
      );
      const found = await tx
        .select({
          id: catalogTranslations.id,
          value: catalogTranslations.value,
          ownerFamilyId: catalogTranslations.ownerFamilyId,
        })
        .from(catalogTranslations)
        .innerJoin(
          ingredients,
          and(
            eq(ingredients.id, catalogTranslations.entityId),
            isNull(ingredients.ownerFamilyId),
          ),
        )
        .where(matching)
        .orderBy(catalogTranslations.createdAt, catalogTranslations.id);
      if (found.length === 0) throw notFound();

      // Another Ingredient's shared name (any locale) or shared Synonym.
      const shared = catalogScope(SHARED_ONLY);
      const sharedIngredients = shared.ingredients(tx);
      const sharedTranslations = shared.translations(tx);
      const hits = await tx.execute<{ id: string }>(sql`
        SELECT c.id FROM (
          SELECT ${sharedIngredients.id} AS id, ${sharedIngredients.normalizedName} AS key
          FROM ${sharedIngredients}
          UNION ALL
          SELECT ${sharedTranslations.entityId}, ${sharedTranslations.normalizedValue}
          FROM ${sharedTranslations}
          WHERE ${sharedTranslations.entityType} = 'ingredient'
        ) c
        WHERE c.key = ${key} AND c.id <> ${body.ingredientId}::uuid
        ORDER BY c.id LIMIT 1`);
      if (hits.rows[0]) {
        throw new ApiException(409, 'family_synonyms.shared_name_exists', {
          ingredientId: hits.rows[0].id,
        });
      }

      await lockFamilies(
        tx,
        found.map((row) => row.ownerFamilyId as string),
      );
      const name = found[0].value;
      // A no-op when the Ingredient already answers to the name in that locale.
      await tx
        .insert(catalogTranslations)
        .values({
          id: randomUUID(),
          entityType: 'ingredient',
          entityId: body.ingredientId,
          locale: body.locale,
          kind: 'synonym',
          value: name,
          normalizedValue: key,
          ownerFamilyId: null,
        })
        .onConflictDoNothing();
      await tx.delete(catalogTranslations).where(matching);
      return { ingredientId: body.ingredientId, name, locale: body.locale };
    });
    // Every Family now finds the shared Synonym, and the owners lost theirs.
    this.scanCatalog.invalidate();
    return result;
  }
}
