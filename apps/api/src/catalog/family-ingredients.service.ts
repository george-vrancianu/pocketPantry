import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { hasPgCode } from '../database/pg-errors';
import { ingredients, leafCategories } from '../database/schema';
import { amountScaleForParent } from './amount-scale';
import type { ExpiryOverride } from './catalog-defaults';
import { catalogScope } from './catalog-scope';
import { CatalogSearchService } from './catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
  FamilyIngredientBody,
} from './catalog.schemas';
import { normalizeName } from './normalize';

const UNIQUE_VIOLATION = '23505';

/** Family Ingredients: Ingredients owned by one Family, added from search (ADR 0011). */
@Injectable()
export class FamilyIngredientsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly search: CatalogSearchService,
  ) {}

  /**
   * Adds `body.name` as the Family's own Ingredient. A name equal to a shared
   * name, a shared Synonym or one of the Family's own names answers 409 with the
   * Ingredient already there, so the caller can pick it instead.
   */
  async create(
    family: { id: string; memberId: string },
    body: FamilyIngredientBody,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[],
  ): Promise<CatalogSearchResult> {
    const scope = catalogScope(family.id);
    const [leaf] = await this.database
      .select({ parentId: leafCategories.parentId })
      .from(leafCategories)
      .where(eq(leafCategories.id, body.leafCategoryId));
    if (!leaf) {
      throw new ApiException(404, 'catalog.not_found', {
        entity: 'leaf_category',
      });
    }
    const key = normalizeName(body.name);
    if (!key) {
      throw new ApiException(400, 'validation_failed');
    }
    const clash = async () => {
      const existingId = await this.search.findIdByName(scope, key);
      if (!existingId) return null;
      const [existing] = await this.search.findByIds(
        scope,
        [existingId],
        locale,
        overrides,
      );
      return existing ?? null;
    };
    const exists = (existing: CatalogSearchResult) =>
      new ApiException(409, 'catalog.family_ingredient_exists', { existing });

    const found = await clash();
    if (found) throw exists(found);

    const id = randomUUID();
    try {
      await this.database.insert(ingredients).values({
        id,
        leafCategoryId: body.leafCategoryId,
        name: body.name,
        normalizedName: key,
        defaultUnit: body.defaultUnit,
        amountScale: amountScaleForParent(leaf.parentId),
        ownerFamilyId: family.id,
        createdByUserId: family.memberId,
        nameLocale: locale,
      });
    } catch (error) {
      // A concurrent request added the same name first.
      if (hasPgCode(error, UNIQUE_VIOLATION)) {
        const raced = await clash();
        if (raced) throw exists(raced);
      }
      throw error;
    }
    const [created] = await this.search.findByIds(
      scope,
      [id],
      locale,
      overrides,
    );
    return created;
  }
}
