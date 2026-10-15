import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  catalogScope,
  familyOwnedIngredients,
  SHARED_ONLY,
} from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import { mergeIngredients } from '../catalog/merge-ingredients';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredients, leafCategories } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { AdminCatalogService } from './admin-catalog.service';
import {
  type FamilyIngredientCopy,
  type FamilyIngredientsListQuery,
  type FamilyIngredientsPage,
  type PromotedIngredient,
} from './family-ingredients.schemas';
import { encodeCursor } from './unmatched-queue.schemas';

const notFound = () => new ApiException(404, 'family_ingredients.not_found');

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
      const others = copies.filter((copy) => copy.id !== ingredientId);
      await mergeIngredients(
        tx,
        picked,
        others.map((copy) => copy.id),
      );
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
}
