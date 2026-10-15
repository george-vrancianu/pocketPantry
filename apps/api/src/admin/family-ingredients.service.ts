import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  catalogScope,
  familyOwnedIngredients,
  familyOwnedTranslations,
  SHARED_ONLY,
} from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import { carryOverAllergenTags } from '../catalog/carry-over-allergen-tags';
import { keepFamilyNames } from '../catalog/keep-family-names';
import { mergeIngredients } from '../catalog/merge-ingredients';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import { ingredients, leafCategories } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { AdminCatalogService } from './admin-catalog.service';
import {
  type FamilyIngredientCopy,
  type FamilyIngredientsListQuery,
  type FamilyIngredientsPage,
  type MergedFamilyIngredients,
  type PromotedIngredient,
} from './family-ingredients.schemas';
import { encodeCursor } from './unmatched-queue.schemas';

const notFound = () => new ApiException(404, 'family_ingredients.not_found');
const targetNotFound = () =>
  new ApiException(404, 'family_ingredients.target_not_found');

/**
 * Admin curation of Family Ingredients (ADR 0011): the queue across Families
 * and promoting one copy to the shared Catalog.
 *
 * Lock order, as the Unmatched resolve: the per-name advisory lock, then the
 * owning Family rows in ascending id (family-locks.ts), then row updates.
 */
@Injectable()
export class FamilyIngredientsAdminService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly catalog: AdminCatalogService,
    private readonly search: CatalogSearchService,
    private readonly scanCatalog: IngredientCatalogService,
  ) {}

  async list(
    query: FamilyIngredientsListQuery,
  ): Promise<FamilyIngredientsPage> {
    const owned = familyOwnedIngredients(this.database);
    const count = sql`count(*)`;
    const name = sql`${owned.normalizedName} collate "C"`;
    const after = query.cursor
      ? sql`${count} < ${query.cursor.count} or (${count} = ${query.cursor.count} and ${name} > ${query.cursor.name} collate "C")`
      : sql`true`;
    const groups = await this.database
      .select({
        normalizedName: owned.normalizedName,
        count: sql<number>`count(*)::int`,
      })
      .from(owned)
      .groupBy(owned.normalizedName)
      .having(after)
      .orderBy(desc(count), name)
      .limit(query.limit + 1);
    const page = groups.slice(0, query.limit);
    const last = page.at(-1);

    const rows =
      page.length === 0
        ? []
        : await this.database
            .select({
              normalizedName: owned.normalizedName,
              id: owned.id,
              name: owned.name,
              locale: owned.nameLocale,
              defaultUnit: owned.defaultUnit,
              leafId: leafCategories.id,
              leafName: leafCategories.name,
            })
            .from(owned)
            .innerJoin(
              leafCategories,
              eq(leafCategories.id, owned.leafCategoryId),
            )
            .where(
              inArray(
                owned.normalizedName,
                page.map((group) => group.normalizedName),
              ),
            )
            .orderBy(asc(owned.createdAt), asc(owned.id));
    const copiesOf = new Map<string, typeof rows>();
    for (const row of rows) {
      copiesOf.set(row.normalizedName, [
        ...(copiesOf.get(row.normalizedName) ?? []),
        row,
      ]);
    }
    return {
      groups: page.flatMap((group) => {
        const copies = copiesOf.get(group.normalizedName);
        // Promoted between the two reads: gone from the queue.
        if (!copies) return [];
        const votes = new Map<string, number>();
        for (const copy of copies) {
          votes.set(copy.leafId, (votes.get(copy.leafId) ?? 0) + 1);
        }
        const top = Math.max(...votes.values());
        // Copies are oldest first, so the first at the top count is the oldest.
        const leaf = copies.find((copy) => votes.get(copy.leafId) === top)!;
        const oldest = copies[0];
        return [
          {
            normalizedName: group.normalizedName,
            name: oldest.name,
            leafCategory: { id: leaf.leafId, name: leaf.leafName },
            familyCount: copies.length,
            locale: oldest.locale ?? 'en',
            copies: copies.map((copy): FamilyIngredientCopy => ({
              id: copy.id,
              name: copy.name,
              locale: copy.locale ?? 'en',
              defaultUnit: copy.defaultUnit,
              leafCategory: { id: copy.leafId, name: copy.leafName },
            })),
          },
        ];
      }),
      nextCursor:
        groups.length > query.limit && last
          ? encodeCursor({ count: last.count, name: last.normalizedName })
          : null,
    };
  }

  /**
   * Makes `ingredientId` shared (same ID) and merges every other Family's copy
   * of the name into it.
   */
  async promote(ingredientId: string): Promise<PromotedIngredient> {
    const owned = familyOwnedIngredients(this.database);
    const [peek] = await this.database
      .select({ normalizedName: owned.normalizedName })
      .from(owned)
      .where(eq(owned.id, ingredientId));
    if (!peek) throw notFound();
    const key = peek.normalizedName;

    const result = await this.database.transaction(async (tx) => {
      await this.catalog.lockName(tx, key);
      const ownedNow = familyOwnedIngredients(tx);
      const copies = await tx
        .select({
          id: ownedNow.id,
          name: ownedNow.name,
          leafCategoryId: ownedNow.leafCategoryId,
          ownerFamilyId: ownedNow.ownerFamilyId,
        })
        .from(ownedNow)
        .where(eq(ownedNow.normalizedName, key))
        .orderBy(asc(ownedNow.createdAt), asc(ownedNow.id));
      const picked = copies.find((copy) => copy.id === ingredientId);
      if (!picked) throw notFound();

      // The same clash rule as adding a Family Ingredient: shared names,
      // display names in any locale and Synonyms.
      const clash = await this.search.findIdByName(
        catalogScope(SHARED_ONLY),
        key,
        tx,
      );
      if (clash) {
        throw new ApiException(409, 'family_ingredients.shared_name_exists', {
          ingredientId: clash,
        });
      }

      await lockFamilies(
        tx,
        copies.map((copy) => copy.ownerFamilyId as string),
      );
      // A Family-side rename only holds its Family lock: re-read the group.
      const still = await this.groupNow(
        tx,
        key,
        copies.map((copy) => copy.id),
      );
      if (!still.some((copy) => copy.id === ingredientId)) throw notFound();
      const others = still.filter((copy) => copy.id !== ingredientId);
      const moved = await this.synonymIdsOf(
        tx,
        others.map((copy) => copy.id),
      );
      await carryOverAllergenTags(
        tx,
        picked.id,
        others.map((copy) => copy.id),
        'promote',
      );
      const merged = await mergeIngredients(
        tx,
        picked,
        others.map((copy) => copy.id),
      );
      // Their names stay theirs: no skip, the names equal the promoted one's.
      await keepFamilyNames(tx, picked.id, merged, {
        skipSharedNames: false,
        movedSynonymIds: moved,
      });
      await tx
        .update(ingredients)
        .set({ ownerFamilyId: null })
        .where(eq(ingredients.id, ingredientId));
      return {
        ingredientId,
        name: picked.name,
        mergedIngredientIds: others.map((copy) => copy.id),
      };
    });
    // Owners lost a copy and every other Family gained a shared row.
    this.scanCatalog.invalidate();
    return result;
  }

  /**
   * Folds every Family copy of the group `ingredientId` belongs to into the
   * shared Ingredient `targetId`; each Family keeps the name as a Family Synonym.
   *
   * Locks: both names (sorted), then the owning Families in ascending id, and
   * both rows are re-read under them.
   */
  async merge(
    ingredientId: string,
    targetId: string,
  ): Promise<MergedFamilyIngredients> {
    const owned = familyOwnedIngredients(this.database);
    const [peek] = await this.database
      .select({ normalizedName: owned.normalizedName })
      .from(owned)
      .where(eq(owned.id, ingredientId));
    if (!peek) throw notFound();
    const sharedPeek = catalogScope(SHARED_ONLY).ingredients(this.database);
    const [targetPeek] = await this.database
      .select({ normalizedName: sharedPeek.normalizedName })
      .from(sharedPeek)
      .where(eq(sharedPeek.id, targetId));
    if (!targetPeek) throw targetNotFound();
    const key = peek.normalizedName;

    const result = await this.database.transaction(async (tx) => {
      for (const name of [
        ...new Set([key, targetPeek.normalizedName]),
      ].sort()) {
        await this.catalog.lockName(tx, name);
      }
      const ownedNow = familyOwnedIngredients(tx);
      const copies = await tx
        .select({
          id: ownedNow.id,
          ownerFamilyId: ownedNow.ownerFamilyId,
        })
        .from(ownedNow)
        .where(eq(ownedNow.normalizedName, key));
      if (!copies.some((copy) => copy.id === ingredientId)) throw notFound();
      const sharedNow = catalogScope(SHARED_ONLY).ingredients(tx);
      const [target] = await tx
        .select({
          id: sharedNow.id,
          leafCategoryId: sharedNow.leafCategoryId,
        })
        .from(sharedNow)
        .where(eq(sharedNow.id, targetId))
        .for('key share');
      if (!target) throw targetNotFound();

      await lockFamilies(
        tx,
        copies.map((copy) => copy.ownerFamilyId as string),
      );
      // A Family-side rename only holds its Family lock: re-read the group.
      const still = await this.groupNow(
        tx,
        key,
        copies.map((copy) => copy.id),
      );
      if (!still.some((copy) => copy.id === ingredientId)) throw notFound();
      const ids = still.map((copy) => copy.id);
      const moved = await this.synonymIdsOf(tx, ids);
      await carryOverAllergenTags(tx, target.id, ids, 'merge');
      const merged = await mergeIngredients(tx, target, ids);
      await keepFamilyNames(tx, target.id, merged, {
        skipSharedNames: true,
        movedSynonymIds: moved,
      });
      return { targetIngredientId: target.id, mergedIngredientIds: ids };
    });
    // Every owner lost a copy and gained a Synonym.
    this.scanCatalog.invalidate();
    return result;
  }

  /** The copies still named `key`, among `ids`, once the Family locks are held. */
  private async groupNow(tx: Tx, key: string, ids: string[]) {
    const owned = familyOwnedIngredients(tx);
    return tx
      .select({ id: owned.id })
      .from(owned)
      .where(and(eq(owned.normalizedName, key), inArray(owned.id, ids)));
  }

  /** Family Synonyms the Ingredients `ids` hold, before a merge moves them. */
  private async synonymIdsOf(tx: Tx, ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const synonyms = familyOwnedTranslations(tx);
    const rows = await tx
      .select({ id: synonyms.id })
      .from(synonyms)
      .where(
        and(
          eq(synonyms.entityType, 'ingredient'),
          eq(synonyms.kind, 'synonym'),
          inArray(synonyms.entityId, ids),
        ),
      );
    return rows.map((row) => row.id);
  }
}
