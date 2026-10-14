import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import { hasPgCode } from '../database/pg-errors';
import {
  batches,
  ingredients,
  leafCategories,
  recipeIngredientLines,
  recipes,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
} from '../database/schema';
import { lockFamilies } from '../family/family-locks';
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
import { relinkUnmatched } from './relink-unmatched';

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
      // The Family's Unmatched items of this name are relinked in the same
      // transaction as the insert. Family lock first, as everywhere (family-locks.ts).
      await this.database.transaction(async (tx) => {
        await lockFamilies(tx, [family.id]);
        await tx.insert(ingredients).values({
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
        await this.relinkFamilyUnmatched(tx, family.id, key, {
          id,
          leafCategoryId: body.leafCategoryId,
        });
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

  /**
   * The Admin resolve, limited to one Family: that Family's Unmatched Batches,
   * Shopping Items, Template lines and Recipe lines with this normalised name
   * get the Ingredient, and their Unmatched entries go (ADR 0011).
   */
  private async relinkFamilyUnmatched(
    tx: Tx,
    familyId: string,
    key: string,
    target: { id: string; leafCategoryId: string },
  ): Promise<void> {
    // Accepted race: a Pantry save or Shopping List add that matched the old
    // Catalog and commits after this read stays Unmatched (and in the Admin queue).
    const named = eq(unmatchedEntries.normalizedName, key);
    const batchEntries = await tx
      .select({ id: unmatchedEntries.id, rowId: batches.id })
      .from(unmatchedEntries)
      .innerJoin(batches, eq(batches.id, unmatchedEntries.batchId))
      .where(and(named, eq(batches.familyId, familyId)));
    const itemEntries = await tx
      .select({ id: unmatchedEntries.id, rowId: shoppingItems.id })
      .from(unmatchedEntries)
      .innerJoin(
        shoppingItems,
        eq(shoppingItems.id, unmatchedEntries.shoppingItemId),
      )
      .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
      .where(and(named, eq(shoppingLists.familyId, familyId)));
    const lineEntries = await tx
      .select({ id: unmatchedEntries.id, rowId: recipeIngredientLines.id })
      .from(unmatchedEntries)
      .innerJoin(
        recipeIngredientLines,
        eq(recipeIngredientLines.id, unmatchedEntries.ingredientLineId),
      )
      .innerJoin(recipes, eq(recipes.id, recipeIngredientLines.recipeId))
      .where(and(named, eq(recipes.familyId, familyId)));

    const batchIds = batchEntries.map((e) => e.rowId).sort();
    const itemIds = itemEntries.map((e) => e.rowId).sort();
    const lineIds = lineEntries.map((e) => e.rowId).sort();
    // Row locks in ascending id, as the Admin resolve takes them.
    if (itemIds.length > 0) {
      await tx
        .select({ id: shoppingItems.id })
        .from(shoppingItems)
        .where(inArray(shoppingItems.id, itemIds))
        .orderBy(shoppingItems.id)
        .for('update');
    }
    if (batchIds.length > 0) {
      await tx
        .select({ id: batches.id })
        .from(batches)
        .where(inArray(batches.id, batchIds))
        .orderBy(batches.id)
        .for('update');
    }
    if (lineIds.length > 0) {
      await tx
        .select({ id: recipeIngredientLines.id })
        .from(recipeIngredientLines)
        .where(inArray(recipeIngredientLines.id, lineIds))
        .orderBy(recipeIngredientLines.id)
        .for('update');
    }

    await relinkUnmatched(tx, {
      key,
      target,
      itemIds,
      batchIds,
      lineIds,
      familyId,
    });
    const entryIds = [...batchEntries, ...itemEntries, ...lineEntries].map(
      (e) => e.id,
    );
    if (entryIds.length > 0) {
      await tx
        .delete(unmatchedEntries)
        .where(inArray(unmatchedEntries.id, entryIds));
    }
  }
}
