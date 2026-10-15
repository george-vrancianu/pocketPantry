import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, inArray } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import { hasPgCode } from '../database/pg-errors';
import {
  allergens as allergensTable,
  batches,
  catalogTranslations,
  ingredientAllergens,
  ingredients as ingredientsTable,
  ingredientStockHistory,
  leafCategories,
  recipeIngredientLines,
  recipePairings,
  runningLow,
  shoppingItems,
  shoppingTemplateLines,
  staples,
  suggestionDismissals,
} from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { replaceIngredientAllergenTags } from './ingredient-allergen-tags';
import { amountScaleForParent } from './amount-scale';
import type { ExpiryOverride } from './catalog-defaults';
import {
  catalogScope,
  type CatalogScope,
  isFamilyOwned,
  ownedIngredient,
  ownedTranslation,
} from './catalog-scope';
import { CatalogSearchService } from './catalog-search.service';
import { loadDisplayNames } from './display-names';
import type {
  CatalogAllergen,
  CatalogLocale,
  CatalogSearchResult,
  FamilyCatalog,
  FamilyIngredientAllergens,
  FamilyIngredientPatchBody,
  FamilyIngredientUsage,
} from './catalog.schemas';
import { normalizeName } from './normalize';

const UNIQUE_VIOLATION = '23505';
const notFound = (entity: string) =>
  new ApiException(404, 'catalog.not_found', { entity });

/** The Family catalog in Family Settings: list, rename, recategorise and delete (ADR 0011). */
@Injectable()
export class FamilyCatalogService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly search: CatalogSearchService,
    private readonly scanCatalog: IngredientCatalogService,
  ) {}

  async list(
    familyId: string,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[],
  ): Promise<FamilyCatalog> {
    const scope = catalogScope(familyId);
    const scopedIngredients = scope.ingredients(this.database);
    const owned = await this.database
      .select({ id: scopedIngredients.id })
      .from(scopedIngredients)
      .where(isFamilyOwned(scopedIngredients));
    const rows = await this.search.findByIds(
      scope,
      owned.map((row) => row.id),
      locale,
      overrides,
    );
    const usage = await this.usageOf(rows.map((row) => row.id));
    const allergenState = await this.allergensOf(
      scope,
      locale,
      rows.map((row) => row.id),
    );

    const translations = scope.translations(this.database);
    const synonymRows = await this.database
      .select({
        id: translations.id,
        value: translations.value,
        ingredientId: translations.entityId,
      })
      .from(translations)
      .where(
        and(
          isFamilyOwned(translations),
          eq(translations.entityType, 'ingredient'),
          eq(translations.kind, 'synonym'),
        ),
      );
    const targets = new Map(
      (
        await this.search.findByIds(
          scope,
          [...new Set(synonymRows.map((row) => row.ingredientId))],
          locale,
          overrides,
        )
      ).map((target) => [target.id, target.name]),
    );
    const byName = (a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name, locale);
    return {
      ingredients: rows
        .map((row) => ({
          ...row,
          ...allergenState.get(row.id)!,
          usage: usage.get(row.id)!,
        }))
        .sort(byName),
      synonyms: synonymRows
        .filter((row) => targets.has(row.ingredientId))
        .map((row) => ({
          id: row.id,
          name: row.value,
          ingredient: {
            id: row.ingredientId,
            name: targets.get(row.ingredientId)!,
          },
        }))
        .sort(byName),
    };
  }

  /**
   * Replaces the Allergens a Family Ingredient contains (empty = "None") and marks it
   * checked. Only the Family's own Ingredients: another Family's, and shared ones, are 404.
   */
  async setAllergens(
    familyId: string,
    id: string,
    allergenIds: string[],
  ): Promise<{ id: string } & FamilyIngredientAllergens> {
    await this.database.transaction(async (tx) => {
      // Family lock first, as everywhere (family-locks.ts).
      await lockFamilies(tx, [familyId]);
      const [owned] = await tx
        .select({ id: ingredientsTable.id })
        .from(ingredientsTable)
        .where(and(eq(ingredientsTable.id, id), ownedIngredient(familyId)))
        .for('update');
      if (!owned) throw notFound('ingredient');
      await replaceIngredientAllergenTags(tx, id, allergenIds);
    });
    return { id, allergensChecked: true, allergenIds };
  }

  /**
   * Renames and/or moves a Family Ingredient; it stays the same Ingredient. A
   * new name follows the rules of creating one (409 with the Ingredient that
   * already has it); changing only the case or accents of its own name is fine.
   */
  async update(
    familyId: string,
    id: string,
    body: FamilyIngredientPatchBody,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[],
  ): Promise<CatalogSearchResult> {
    const scope = catalogScope(familyId);
    const key = body.name === undefined ? null : normalizeName(body.name);
    if (body.name !== undefined && !key) {
      throw new ApiException(400, 'validation_failed');
    }
    let parentId: string | null = null;
    if (body.leafCategoryId) {
      const [leaf] = await this.database
        .select({ parentId: leafCategories.parentId })
        .from(leafCategories)
        .where(eq(leafCategories.id, body.leafCategoryId));
      if (!leaf) throw notFound('leaf_category');
      parentId = leaf.parentId;
    }
    const exists = (existing: CatalogSearchResult) =>
      new ApiException(409, 'catalog.family_ingredient_exists', { existing });

    try {
      await this.database.transaction(async (tx) => {
        // Family lock first, as everywhere (family-locks.ts).
        await lockFamilies(tx, [familyId]);
        const [current] = await tx
          .select({
            normalizedName: ingredientsTable.normalizedName,
          })
          .from(ingredientsTable)
          .where(and(eq(ingredientsTable.id, id), ownedIngredient(familyId)))
          .for('update');
        if (!current) throw notFound('ingredient');
        if (key && key !== current.normalizedName) {
          const clashId = await this.search.findIdByName(scope, key, tx);
          if (clashId === id) {
            // One of its own Synonyms: the name replaces it.
            await tx
              .delete(catalogTranslations)
              .where(
                and(
                  eq(catalogTranslations.entityType, 'ingredient'),
                  eq(catalogTranslations.entityId, id),
                  eq(catalogTranslations.normalizedValue, key),
                  ownedTranslation(familyId),
                ),
              );
          } else if (clashId) {
            const [existing] = await this.search.findByIds(
              scope,
              [clashId],
              locale,
              overrides,
            );
            throw exists(existing);
          }
        }
        await tx
          .update(ingredientsTable)
          .set({
            ...(body.name !== undefined && key
              ? { name: body.name, normalizedName: key, nameLocale: locale }
              : {}),
            ...(body.leafCategoryId && parentId
              ? {
                  leafCategoryId: body.leafCategoryId,
                  amountScale: amountScaleForParent(parentId),
                }
              : {}),
          })
          .where(eq(ingredientsTable.id, id));
        if (body.leafCategoryId) {
          // Batches sit under their Ingredient's Leaf Category (ADR 0005).
          await tx
            .update(batches)
            .set({ leafCategoryId: body.leafCategoryId })
            .where(eq(batches.ingredientId, id));
        }
      });
    } catch (error) {
      // A concurrent request took the name first.
      if (key && hasPgCode(error, UNIQUE_VIOLATION)) {
        const raced = await this.search.findIdByName(scope, key);
        if (raced) {
          const [existing] = await this.search.findByIds(
            scope,
            [raced],
            locale,
            overrides,
          );
          throw exists(existing);
        }
      }
      throw error;
    }
    this.scanCatalog.invalidate(familyId);
    const [updated] = await this.search.findByIds(
      scope,
      [id],
      locale,
      overrides,
    );
    return updated;
  }

  /**
   * Deletes a Family Ingredient. What used it by name stays, Unmatched (the
   * Admin queue is not told: the Family discarded it); what cannot exist
   * without an Ingredient goes.
   */
  async remove(familyId: string, id: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await lockFamilies(tx, [familyId]);
      const [ingredient] = await tx
        .select({
          name: ingredientsTable.name,
          normalizedName: ingredientsTable.normalizedName,
          parentId: leafCategories.parentId,
        })
        .from(ingredientsTable)
        .innerJoin(
          leafCategories,
          eq(leafCategories.id, ingredientsTable.leafCategoryId),
        )
        .where(and(eq(ingredientsTable.id, id), ownedIngredient(familyId)))
        .for('update', { of: ingredientsTable });
      if (!ingredient) throw notFound('ingredient');
      await this.makeUnmatched(tx, id, ingredient);

      await tx.delete(staples).where(eq(staples.ingredientId, id));
      await tx.delete(runningLow).where(eq(runningLow.ingredientId, id));
      await tx
        .delete(suggestionDismissals)
        .where(eq(suggestionDismissals.ingredientId, id));
      await tx
        .delete(ingredientStockHistory)
        .where(eq(ingredientStockHistory.ingredientId, id));
      await tx
        .delete(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.entityType, 'ingredient'),
            eq(catalogTranslations.entityId, id),
          ),
        );
      await tx.delete(ingredientsTable).where(eq(ingredientsTable.id, id));
    });
    this.scanCatalog.invalidate(familyId);
  }

  /** Deletes a Family Synonym; it stops matching at once. */
  async removeSynonym(familyId: string, id: string): Promise<void> {
    const deleted = await this.database.transaction(async (tx) => {
      await lockFamilies(tx, [familyId]);
      return tx
        .delete(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.id, id),
            eq(catalogTranslations.kind, 'synonym'),
            ownedTranslation(familyId),
          ),
        )
        .returning({ id: catalogTranslations.id });
    });
    if (deleted.length === 0) throw notFound('synonym');
    this.scanCatalog.invalidate(familyId);
  }

  /** Re-expresses every use of the Ingredient as the typed name it had. */
  private async makeUnmatched(
    tx: Tx,
    id: string,
    ingredient: { name: string; normalizedName: string; parentId: string },
  ): Promise<void> {
    const { name, normalizedName: key } = ingredient;
    const [other] = await tx
      .select({ id: leafCategories.id })
      .from(leafCategories)
      .where(
        and(
          eq(leafCategories.parentId, ingredient.parentId),
          eq(leafCategories.isOther, true),
        ),
      );
    if (!other) throw notFound('leaf_category');
    await tx
      .update(batches)
      .set({
        ingredientId: null,
        unmatched: true,
        rawName: name,
        leafCategoryId: other.id,
      })
      .where(eq(batches.ingredientId, id));
    await tx
      .update(shoppingItems)
      .set({ ingredientId: null, name, normalizedName: key })
      .where(eq(shoppingItems.ingredientId, id));
    await tx
      .update(shoppingTemplateLines)
      .set({ ingredientId: null, name, normalizedName: key })
      .where(eq(shoppingTemplateLines.ingredientId, id));
    await tx
      .update(recipeIngredientLines)
      .set({ ingredientId: null, rawName: name, normalizedName: key })
      .where(eq(recipeIngredientLines.ingredientId, id));
    // A pairing keeps its label; it just no longer links.
    await tx
      .update(recipePairings)
      .set({ linkedIngredientId: null })
      .where(eq(recipePairings.linkedIngredientId, id));
  }

  private async allergensOf(
    scope: CatalogScope,
    locale: CatalogLocale,
    ids: string[],
  ): Promise<
    Map<string, FamilyIngredientAllergens & { allergens: CatalogAllergen[] }>
  > {
    const state = new Map<
      string,
      FamilyIngredientAllergens & { allergens: CatalogAllergen[] }
    >(
      ids.map((id) => [
        id,
        { allergensChecked: false, allergenIds: [], allergens: [] },
      ]),
    );
    if (ids.length === 0) return state;
    const [checked, tags] = await Promise.all([
      this.database
        .select({
          id: ingredientsTable.id,
          checked: ingredientsTable.allergensChecked,
        })
        .from(ingredientsTable)
        .where(inArray(ingredientsTable.id, ids)),
      this.database
        .select()
        .from(ingredientAllergens)
        .where(inArray(ingredientAllergens.ingredientId, ids)),
    ]);
    for (const row of checked)
      state.get(row.id)!.allergensChecked = row.checked;
    for (const tag of tags)
      state.get(tag.ingredientId)?.allergenIds.push(tag.allergenId);
    const tagged = [...new Set(tags.map((tag) => tag.allergenId))];
    if (tagged.length > 0) {
      const names = await this.database
        .select({ id: allergensTable.id, name: allergensTable.name })
        .from(allergensTable)
        .where(inArray(allergensTable.id, tagged));
      const { pick } = await loadDisplayNames(
        this.database,
        scope,
        locale,
        tagged,
      );
      const nameOf = new Map(
        names.map((row) => [row.id, pick('allergen', row.id, row.name)]),
      );
      for (const entry of state.values()) {
        entry.allergens = entry.allergenIds.map((id) => ({
          id,
          name: nameOf.get(id) ?? id,
        }));
      }
    }
    return state;
  }

  private async usageOf(
    ids: string[],
  ): Promise<Map<string, FamilyIngredientUsage>> {
    const usage = new Map<string, FamilyIngredientUsage>(
      ids.map((id) => [
        id,
        {
          batches: 0,
          shoppingItems: 0,
          templateLines: 0,
          recipeLines: 0,
          staples: 0,
        },
      ]),
    );
    if (ids.length === 0) return usage;
    const tally = async (
      field: keyof FamilyIngredientUsage,
      rows: Promise<Array<{ id: string | null; n: number }>>,
    ) => {
      for (const row of await rows) {
        if (row.id) usage.get(row.id)![field] = row.n;
      }
    };
    // A Family Ingredient is referenced only by its own Family's rows.
    await tally(
      'batches',
      this.database
        .select({ id: batches.ingredientId, n: count() })
        .from(batches)
        .where(inArray(batches.ingredientId, ids))
        .groupBy(batches.ingredientId),
    );
    await tally(
      'shoppingItems',
      this.database
        .select({ id: shoppingItems.ingredientId, n: count() })
        .from(shoppingItems)
        .where(inArray(shoppingItems.ingredientId, ids))
        .groupBy(shoppingItems.ingredientId),
    );
    await tally(
      'templateLines',
      this.database
        .select({ id: shoppingTemplateLines.ingredientId, n: count() })
        .from(shoppingTemplateLines)
        .where(inArray(shoppingTemplateLines.ingredientId, ids))
        .groupBy(shoppingTemplateLines.ingredientId),
    );
    await tally(
      'recipeLines',
      this.database
        .select({ id: recipeIngredientLines.ingredientId, n: count() })
        .from(recipeIngredientLines)
        .where(inArray(recipeIngredientLines.ingredientId, ids))
        .groupBy(recipeIngredientLines.ingredientId),
    );
    await tally(
      'staples',
      this.database
        .select({ id: staples.ingredientId, n: count() })
        .from(staples)
        .where(inArray(staples.ingredientId, ids))
        .groupBy(staples.ingredientId),
    );
    return usage;
  }
}
