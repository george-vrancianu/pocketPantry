import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  catalogTranslations,
  ingredients as ingredientsTable,
} from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import type { ExpiryOverride } from './catalog-defaults';
import { catalogScope, FAMILY_TIER, nameClaims } from './catalog-scope';
import { CatalogSearchService } from './catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
  FamilySynonymBody,
} from './catalog.schemas';
import { normalizeName } from './normalize';
import { relinkFamilyUnmatched } from './relink-family-unmatched';

/** Family Synonyms: a typed name that means an existing Ingredient for one Family (#273). */
@Injectable()
export class FamilySynonymsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly search: CatalogSearchService,
    private readonly scanCatalog: IngredientCatalogService,
  ) {}

  /**
   * Declares `body.name` another name for `body.ingredientId`, for the Family.
   * Rejected (409, with the Ingredient that already has the name) when the name
   * already is the target's name or Synonym, or a name or Synonym the Family
   * itself gave another Ingredient (that would leave Scans Unmatched). Another
   * Ingredient's shared name or Synonym is allowed: the Family's choice wins.
   */
  async create(
    family: { id: string },
    body: FamilySynonymBody,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[],
  ): Promise<CatalogSearchResult> {
    const scope = catalogScope(family.id);
    const key = normalizeName(body.name);
    if (!key) throw new ApiException(400, 'validation_failed');
    const [target] = await this.search.findByIds(
      scope,
      [body.ingredientId],
      locale,
      overrides,
    );
    if (!target) {
      throw new ApiException(404, 'catalog.not_found', {
        entity: 'ingredient',
      });
    }

    const exists = (existing: CatalogSearchResult) =>
      new ApiException(409, 'catalog.family_synonym_exists', { existing });
    await this.database.transaction(async (tx) => {
      // Family lock first, as everywhere (family-locks.ts).
      await lockFamilies(tx, [family.id]);
      // The target may have been merged away while this waited for the lock.
      const [still] = await tx
        .select({ id: ingredientsTable.id })
        .from(ingredientsTable)
        .where(eq(ingredientsTable.id, target.id))
        .for('key share');
      if (!still) {
        throw new ApiException(404, 'catalog.not_found', {
          entity: 'ingredient',
        });
      }
      const hits = await tx.execute<{ id: string; tier: number }>(sql`
        SELECT c.id, c.tier
        FROM ${nameClaims(scope, tx)} c
        WHERE c.key = ${key}
        ORDER BY c.id
      `);
      // The target first; then the Family's own names on another Ingredient.
      const clashId =
        hits.rows.find((hit) => hit.id === target.id)?.id ??
        hits.rows.find((hit) => hit.tier === FAMILY_TIER)?.id;
      if (clashId) {
        const [existing] = await this.search.findByIds(
          scope,
          [clashId],
          locale,
          overrides,
        );
        throw exists(existing);
      }

      await tx.insert(catalogTranslations).values({
        id: randomUUID(),
        entityType: 'ingredient',
        entityId: target.id,
        locale,
        kind: 'synonym',
        value: body.name,
        normalizedValue: key,
        ownerFamilyId: family.id,
      });
      await relinkFamilyUnmatched(tx, family.id, key, {
        id: target.id,
        leafCategoryId: target.leafCategory.id,
      });
    });
    // The Family's next Scan matches the new name.
    this.scanCatalog.invalidate(family.id);
    return target;
  }
}
