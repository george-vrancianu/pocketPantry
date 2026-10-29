import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, isNotNull, max, sql } from 'drizzle-orm';
import { catalogScope, SHARED_ONLY } from '../catalog/catalog-scope';
import {
  amountScaleForParent,
  type AmountScale,
} from '../catalog/amount-scale';
import {
  lockAisleOrder,
  lockAllergenOrder,
  lockEatingMomentOrder,
  lockTagGroupOrder,
} from '../catalog/order-lock';
import { FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { seedId } from '../catalog/seed/seed-catalog';
import type { EntityType } from '../catalog/display-names';
import { replaceIngredientAllergenTags } from '../catalog/ingredient-allergen-tags';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { hasPgCode, pgConstraint } from '../database/pg-errors';
import {
  aisles,
  allergens,
  catalogTranslations,
  tagGroups,
  tags,
  eatingMoments,
  ingredientAllergens,
  ingredients,
  leafCategories,
  parentCategories,
  recipeTags,
} from '../database/schema';
import { foldTagsInto } from '../tags/merge-tags';
import { isAllergenFreeName } from '../tags/allergen-free-names';
import type {
  AisleCreate,
  ListEntryCreate,
  ListEntryUpdate,
  CatalogTagCreate,
  CatalogTagUpdate,
  TagGroupCreate,
  TagGroupOrder,
  TagGroupUpdate,
  AisleOrder,
  AisleUpdate,
  EatingMomentOrder,
  IngredientAllergensBody,
  IngredientCreate,
  IngredientUpdate,
  LeafCategoryCreate,
  LeafCategoryUpdate,
  ParentCategoryCreate,
  ParentCategoryUpdate,
  TranslationCreate,
  TranslationUpdate,
} from './admin-catalog.schemas';

const otherLeafProtected = () =>
  new ApiException(409, 'catalog.other_leaf_protected');

const MAX_NAME_LENGTH = 100;
const OTHER_PREFIX = 'Other ';

/** The generated Other Leaf name, capped to the API's name limit by truncating the Parent part. */
export function otherLeafName(parentName: string): string {
  return (
    OTHER_PREFIX +
    parentName.toLowerCase().slice(0, MAX_NAME_LENGTH - OTHER_PREFIX.length)
  ).trimEnd();
}

const otherLeafNameTaken = () =>
  new ApiException(409, 'catalog.other_leaf_name_taken');

// Admin curation reads shared Catalog rows only (ADR 0011).
const adminScope = catalogScope(SHARED_ONLY);

const notFound = (entity: EntityType | 'translation') =>
  new ApiException(404, 'catalog.not_found', { entity });

/**
 * Admin curation of the Catalog. `catalog_translations.entity_id` is
 * polymorphic (no foreign key), so this service owns the invariants:
 * - creating an entity adds its English display name; renaming updates it;
 *   the English name is therefore managed through the entity, never directly;
 * - deleting an entity deletes every translation and Synonym of it, in the
 *   same transaction, so no orphans remain.
 */
@Injectable()
export class AdminCatalogService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async overview() {
    const sharedIngredients = adminScope.ingredients(this.database);
    const [
      aisleRows,
      parentRows,
      leafRows,
      ingredientRows,
      translationRows,
      eatingMomentRows,
      allergenRows,
      tagRows,
      tagGroupRows,
      catalogTagRows,
    ] = await Promise.all([
      this.database.select().from(aisles).orderBy(aisles.sortOrder),
      this.database
        .select()
        .from(parentCategories)
        .orderBy(parentCategories.normalizedName),
      this.database
        .select()
        .from(leafCategories)
        .orderBy(leafCategories.normalizedName),
      this.database
        .select()
        .from(sharedIngredients)
        .orderBy(sharedIngredients.normalizedName),
      this.database.select().from(adminScope.translations(this.database)),
      this.database
        .select()
        .from(eatingMoments)
        .orderBy(eatingMoments.sortOrder),
      this.database
        .select()
        .from(allergens)
        .orderBy(asc(allergens.sortOrder), asc(allergens.name)),
      // Shared Ingredients only: Family tags are not the Admin's to see.
      this.database
        .select({
          ingredientId: ingredientAllergens.ingredientId,
          allergenId: ingredientAllergens.allergenId,
        })
        .from(ingredientAllergens)
        .innerJoin(
          sharedIngredients,
          eq(ingredientAllergens.ingredientId, sharedIngredients.id),
        ),
      this.database.select().from(tagGroups).orderBy(tagGroups.position),
      // Catalog Tags only (no Family): a Family's own Tags are not the Admin's to see.
      this.database
        .select({
          id: tags.id,
          name: tags.name,
          groupId: tags.groupId,
          recipeCount: sql<number>`(SELECT count(*)::int FROM ${recipeTags} WHERE ${recipeTags.tagId} = ${tags.id})`,
        })
        .from(tags)
        .where(sql`${tags.familyId} IS NULL`)
        .orderBy(tags.normalizedName),
    ]);

    const tagsOf = new Map<string, string[]>();
    for (const tag of tagRows) {
      tagsOf.set(tag.ingredientId, [
        ...(tagsOf.get(tag.ingredientId) ?? []),
        tag.allergenId,
      ]);
    }

    const byEntity = new Map<string, unknown[]>();
    for (const row of translationRows) {
      const key = `${row.entityType}:${row.entityId}`;
      const list = byEntity.get(key) ?? [];
      list.push({
        id: row.id,
        locale: row.locale,
        kind: row.kind,
        value: row.value,
      });
      byEntity.set(key, list);
    }
    const translations = (type: EntityType, entityId: string) =>
      byEntity.get(`${type}:${entityId}`) ?? [];

    return {
      tagGroups: tagGroupRows.map((row) => ({
        id: row.id,
        name: row.name,
        position: row.position,
        translations: translations('tag_group', row.id),
      })),
      // Each carries how many Recipes (Family copies included) have it, for the delete confirmation.
      tags: catalogTagRows.map((row) => ({
        id: row.id,
        name: row.name,
        groupId: row.groupId,
        recipeCount: row.recipeCount,
        translations: translations('tag', row.id),
      })),
      eatingMoments: eatingMomentRows.map((row) => ({
        id: row.id,
        name: row.name,
        sortOrder: row.sortOrder,
        archived: row.archivedAt !== null,
        translations: translations('eating_moment', row.id),
      })),
      allergens: allergenRows.map((row) => ({
        id: row.id,
        name: row.name,
        sortOrder: row.sortOrder,
        archived: row.archivedAt !== null,
        translations: translations('allergen', row.id),
      })),
      aisles: aisleRows.map((row) => ({
        id: row.id,
        name: row.name,
        sortOrder: row.sortOrder,
        translations: translations('aisle', row.id),
      })),
      parentCategories: parentRows.map((row) => ({
        id: row.id,
        name: row.name,
        aisleId: row.aisleId,
        defaultExpiryDays: row.defaultExpiryDays,
        defaultLocation: row.defaultLocation,
        translations: translations('parent_category', row.id),
      })),
      leafCategories: leafRows.map((row) => ({
        id: row.id,
        name: row.name,
        parentId: row.parentId,
        isOther: row.isOther,
        defaultExpiryDays: row.defaultExpiryDays,
        defaultLocation: row.defaultLocation,
        translations: translations('leaf_category', row.id),
      })),
      ingredients: ingredientRows.map((row) => ({
        id: row.id,
        name: row.name,
        leafCategoryId: row.leafCategoryId,
        defaultUnit: row.defaultUnit,
        pantryBasic: row.pantryBasic,
        allergenIds: tagsOf.get(row.id) ?? [],
        allergensReviewPending: row.allergensReviewPending,
        translations: translations('ingredient', row.id),
      })),
    };
  }

  // Aisles

  createAisle(input: AisleCreate) {
    return this.write(async (tx) => {
      await lockAisleOrder(tx);
      const [{ last }] = await tx
        .select({ last: max(aisles.sortOrder) })
        .from(aisles);
      const id = randomUUID();
      const [row] = await tx
        .insert(aisles)
        .values({
          id,
          ...input,
          normalizedName: normalizeName(input.name),
          sortOrder: (last ?? 0) + 1,
        })
        .returning();
      await this.addCanonicalName(tx, 'aisle', id, input.name);
      return row;
    });
  }

  updateAisle(id: string, input: AisleUpdate) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(aisles)
        .set({ ...input, ...this.normalized(input.name) })
        .where(eq(aisles.id, id))
        .returning();
      if (!row) throw notFound('aisle');
      await this.renameCanonicalName(tx, 'aisle', id, input.name);
      return row;
    });
  }

  /**
   * Rewrites the shop order to `ids` (positions 1..n). The list must name
   * every Aisle exactly once, so a client working from a stale list (an Aisle
   * added or deleted meanwhile) is refused rather than half-applied.
   */
  reorderAisles({ ids }: AisleOrder) {
    return this.write(async (tx) => {
      await lockAisleOrder(tx);
      // deleteAisle takes the advisory lock above, so this share lock is a
      // belt-and-braces guard against deletes from outside this service: one
      // committing after this read would otherwise leave its id silently
      // unmatched. Share, not update, so Parent Categories pointing at an
      // Aisle (a key-share lock) never wait behind a reorder.
      const current = await tx
        .select({ id: aisles.id })
        .from(aisles)
        .for('share');
      const wanted = new Set(ids);
      if (
        current.length !== ids.length ||
        !current.every((row) => wanted.has(row.id))
      ) {
        throw new ApiException(409, 'catalog.aisle_order_stale');
      }
      // The sort order is unique and checked row by row, so park every row on
      // a free negative slot first, then write the final positions.
      for (const [index, id] of ids.entries()) {
        await tx
          .update(aisles)
          .set({ sortOrder: -(index + 1) })
          .where(eq(aisles.id, id));
      }
      for (const [index, id] of ids.entries()) {
        await tx
          .update(aisles)
          .set({ sortOrder: index + 1 })
          .where(eq(aisles.id, id));
      }
      return tx.select().from(aisles).orderBy(aisles.sortOrder);
    });
  }

  deleteAisle(id: string) {
    // A Parent Category moved onto the Aisle concurrently fails the delete
    // with a foreign-key error, mapped to the same code.
    return this.write(
      async (tx) => {
        // A reorder in flight must see either every Aisle or the set without this one.
        await lockAisleOrder(tx);
        await this.requireRow(tx, 'aisle', id);
        const [{ parents }] = await tx
          .select({ parents: count() })
          .from(parentCategories)
          .where(eq(parentCategories.aisleId, id));
        if (parents > 0) {
          throw new ApiException(409, 'catalog.aisle_in_use', { parents });
        }
        await this.deleteTranslationsOf(tx, 'aisle', id);
        await tx.delete(aisles).where(eq(aisles.id, id));
      },
      new ApiException(409, 'catalog.aisle_in_use'),
    );
  }

  // Eating Moments: an ordered, translated, archivable list like Aisles. Never
  // deleted: Recipes keep their uses, archiving only hides it.

  createEatingMoment(input: ListEntryCreate) {
    return this.write(async (tx) => {
      await lockEatingMomentOrder(tx);
      const [{ last }] = await tx
        .select({ last: max(eatingMoments.sortOrder) })
        .from(eatingMoments);
      const id = randomUUID();
      const [row] = await tx
        .insert(eatingMoments)
        .values({
          id,
          name: input.name,
          normalizedName: normalizeName(input.name),
          sortOrder: (last ?? 0) + 1,
        })
        .returning();
      await this.addCanonicalName(tx, 'eating_moment', id, input.name);
      return row;
    });
  }

  updateEatingMoment(id: string, input: ListEntryUpdate) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(eatingMoments)
        .set({ name: input.name, normalizedName: normalizeName(input.name) })
        .where(eq(eatingMoments.id, id))
        .returning();
      if (!row) throw notFound('eating_moment');
      await this.renameCanonicalName(tx, 'eating_moment', id, input.name);
      return row;
    });
  }

  /** Rewrites the order to `ids` (1..n); the list must name every Eating Moment once. */
  reorderEatingMoments({ ids }: EatingMomentOrder) {
    return this.write(async (tx) => {
      await lockEatingMomentOrder(tx);
      const current = await tx
        .select({ id: eatingMoments.id })
        .from(eatingMoments);
      const wanted = new Set(ids);
      if (
        current.length !== ids.length ||
        !current.every((row) => wanted.has(row.id))
      ) {
        throw new ApiException(409, 'catalog.eating_moment_order_stale');
      }
      for (const [index, id] of ids.entries()) {
        await tx
          .update(eatingMoments)
          .set({ sortOrder: index + 1 })
          .where(eq(eatingMoments.id, id));
      }
      return tx.select().from(eatingMoments).orderBy(eatingMoments.sortOrder);
    });
  }

  setEatingMomentArchived(id: string, archived: boolean) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(eatingMoments)
        .set({ archivedAt: archived ? new Date() : null })
        .where(eq(eatingMoments.id, id))
        .returning();
      if (!row) throw notFound('eating_moment');
      return row;
    });
  }

  // Allergens: an ordered, translated, retirable list like Eating Moments. Never deleted:
  // tags, Allergies and Family Allergies keep pointing at it, and dropping one would make a
  // Recipe that contains it read as clear. Retiring only hides it from the pickers.

  createAllergen(input: ListEntryCreate) {
    return this.write(async (tx) => {
      await lockAllergenOrder(tx);
      const [{ last }] = await tx
        .select({ last: max(allergens.sortOrder) })
        .from(allergens);
      const id = randomUUID();
      const [row] = await tx
        .insert(allergens)
        .values({
          id,
          name: input.name,
          normalizedName: normalizeName(input.name),
          sortOrder: (last ?? 0) + 1,
        })
        .returning();
      await this.addCanonicalName(tx, 'allergen', id, input.name);
      return row;
    });
  }

  updateAllergen(id: string, input: ListEntryUpdate) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(allergens)
        .set({ name: input.name, normalizedName: normalizeName(input.name) })
        .where(eq(allergens.id, id))
        .returning();
      if (!row) throw notFound('allergen');
      await this.renameCanonicalName(tx, 'allergen', id, input.name);
      return row;
    });
  }

  setAllergenArchived(id: string, archived: boolean) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(allergens)
        .set({ archivedAt: archived ? new Date() : null })
        .where(eq(allergens.id, id))
        .returning();
      if (!row) throw notFound('allergen');
      return row;
    });
  }

  /**
   * Replaces a shared Ingredient's Allergen tags and marks it checked, so a later re-seed never
   * re-applies its tags over this edit. Tags it already has on a retired Allergen may stay;
   * a retired Allergen cannot be newly tagged.
   */
  setIngredientAllergens(id: string, { allergenIds }: IngredientAllergensBody) {
    return this.write(async (tx) => {
      // Locked so two edits of one Ingredient serialise instead of interleaving their tags.
      const shared = adminScope.ingredients(tx);
      const [ingredient] = await tx
        .select({ id: shared.id })
        .from(shared)
        .where(eq(shared.id, id))
        .for('update');
      if (!ingredient) throw notFound('ingredient');
      await replaceIngredientAllergenTags(tx, id, allergenIds);
      return { id, allergenIds };
    });
  }

  // Tag Groups and Catalog Tags (ADR 0033). A Catalog Tag never claims an Allergen is absent, and
  // one name is one Tag: a Family Tag with the same name is folded into it, silently.

  createTagGroup(input: TagGroupCreate) {
    return this.write(async (tx) => {
      await lockTagGroupOrder(tx);
      const [{ last }] = await tx
        .select({ last: max(tagGroups.position) })
        .from(tagGroups);
      const id = randomUUID();
      const [row] = await tx
        .insert(tagGroups)
        .values({
          id,
          name: input.name,
          normalizedName: normalizeName(input.name),
          position: (last ?? 0) + 1,
        })
        .returning();
      await this.addCanonicalName(tx, 'tag_group', id, input.name);
      return row;
    });
  }

  updateTagGroup(id: string, input: TagGroupUpdate) {
    return this.write(async (tx) => {
      const [row] = await tx
        .update(tagGroups)
        .set({ name: input.name, normalizedName: normalizeName(input.name) })
        .where(eq(tagGroups.id, id))
        .returning();
      if (!row) throw notFound('tag_group');
      await this.renameCanonicalName(tx, 'tag_group', id, input.name);
      return row;
    });
  }

  reorderTagGroups({ ids }: TagGroupOrder) {
    return this.write(async (tx) => {
      await lockTagGroupOrder(tx);
      const current = await tx.select({ id: tagGroups.id }).from(tagGroups);
      const wanted = new Set(ids);
      if (
        current.length !== ids.length ||
        !current.every((row) => wanted.has(row.id))
      ) {
        throw new ApiException(409, 'catalog.tag_group_order_stale');
      }
      for (const [index, id] of ids.entries()) {
        await tx
          .update(tagGroups)
          .set({ position: index + 1 })
          .where(eq(tagGroups.id, id));
      }
      return tx.select().from(tagGroups).orderBy(tagGroups.position);
    });
  }

  /** Only an empty Tag Group goes: Catalog Tags always live in one. */
  deleteTagGroup(id: string) {
    return this.write(
      async (tx) => {
        await lockTagGroupOrder(tx);
        await this.requireRow(tx, 'tag_group', id);
        await this.deleteTranslationsOf(tx, 'tag_group', id);
        await tx.delete(tagGroups).where(eq(tagGroups.id, id));
      },
      new ApiException(409, 'catalog.tag_group_not_empty'),
    );
  }

  createCatalogTag(input: CatalogTagCreate) {
    this.assertNotAllergenFree(input.name);
    return this.write(async (tx) => {
      await this.requireRow(tx, 'tag_group', input.groupId);
      const id = randomUUID();
      const normalizedName = normalizeName(input.name);
      const [row] = await tx
        .insert(tags)
        .values({
          id,
          name: input.name,
          normalizedName,
          groupId: input.groupId,
        })
        .returning();
      await this.addCanonicalName(tx, 'tag', id, input.name);
      await this.mergeFamilyTagsInto(tx, id, normalizedName);
      return row;
    });
  }

  updateCatalogTag(id: string, input: CatalogTagUpdate) {
    if (input.name !== undefined) this.assertNotAllergenFree(input.name);
    return this.write(async (tx) => {
      if (input.groupId) await this.requireRow(tx, 'tag_group', input.groupId);
      await this.requireCatalogTag(tx, id);
      const [row] = await tx
        .update(tags)
        .set({ ...input, ...this.normalized(input.name) })
        .where(eq(tags.id, id))
        .returning();
      if (input.name !== undefined) {
        await this.renameCanonicalName(tx, 'tag', id, input.name);
        await this.mergeFamilyTagsInto(tx, id, normalizeName(input.name));
      }
      return row;
    });
  }

  /**
   * Without `confirm`, a Tag some Recipe carries is refused with `catalog.tag_in_use` and the
   * number of Recipes (Family copies included). With it, the Tag is removed from every Recipe.
   */
  deleteCatalogTag(id: string, confirm: boolean) {
    return this.write(async (tx) => {
      await this.requireCatalogTag(tx, id);
      // Locked so a Recipe cannot gain the Tag between the count shown and the delete.
      await tx
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.id, id))
        .for('update');
      const [{ recipes: used }] = await tx
        .select({ recipes: count() })
        .from(recipeTags)
        .where(eq(recipeTags.tagId, id));
      if (used > 0 && !confirm) {
        throw new ApiException(409, 'catalog.tag_in_use', { count: used });
      }
      await this.deleteTranslationsOf(tx, 'tag', id);
      await tx.delete(tags).where(eq(tags.id, id));
    });
  }

  private assertNotAllergenFree(name: string): void {
    if (isAllergenFreeName(name)) {
      throw new ApiException(400, 'catalog.tag_allergen_free_name');
    }
  }

  private async requireCatalogTag(tx: Tx, id: string): Promise<void> {
    const [row] = await tx
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.id, id), sql`${tags.familyId} IS NULL`));
    if (!row) throw notFound('tag');
  }

  /**
   * Folds every Family's Tag with this normalized name into the Catalog Tag: their Recipes get the
   * Catalog Tag (no duplicate link where they already had it) and the Family Tags are deleted.
   */
  private async mergeFamilyTagsInto(
    tx: Tx,
    catalogTagId: string,
    normalizedName: string,
  ): Promise<void> {
    // Locked first: a Member linking one of these Tags concurrently waits for this transaction, then
    // fails with 404 `recipes.tag_not_found` because the Tag is gone (the save is not retried).
    const family = await tx
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(isNotNull(tags.familyId), eq(tags.normalizedName, normalizedName)),
      )
      .for('update');
    if (family.length === 0) return;
    await foldTagsInto(
      tx,
      catalogTagId,
      family.map((row) => row.id),
    );
  }

  // Parent Categories

  createParentCategory(input: ParentCategoryCreate) {
    return this.write(async (tx) => {
      await this.requireRow(tx, 'aisle', input.aisleId);
      const id = randomUUID();
      const [row] = await tx
        .insert(parentCategories)
        .values({ id, ...input, normalizedName: normalizeName(input.name) })
        .returning();
      await this.addCanonicalName(tx, 'parent_category', id, input.name);
      // Every Parent has an "Other" Leaf so Unmatched Batches always have a
      // home; it inherits Default Expiry and Location from the Parent.
      const otherName = otherLeafName(input.name);
      const otherId = randomUUID();
      try {
        await tx.insert(leafCategories).values({
          id: otherId,
          parentId: id,
          name: otherName,
          normalizedName: normalizeName(otherName),
          isOther: true,
        });
        await this.addCanonicalName(tx, 'leaf_category', otherId, otherName);
      } catch (error) {
        if (hasPgCode(error, '23505')) throw otherLeafNameTaken();
        throw error;
      }
      return row;
    });
  }

  updateParentCategory(id: string, input: ParentCategoryUpdate) {
    return this.write(async (tx) => {
      if (input.aisleId) await this.requireRow(tx, 'aisle', input.aisleId);
      // Locked so a concurrent rename can't change the name the Other Leaf's is derived from.
      const [before] = await tx
        .select({ name: parentCategories.name })
        .from(parentCategories)
        .where(eq(parentCategories.id, id))
        .for('update');
      const [row] = await tx
        .update(parentCategories)
        .set({ ...input, ...this.normalized(input.name) })
        .where(eq(parentCategories.id, id))
        .returning();
      if (!row) throw notFound('parent_category');
      if (input.name) {
        await this.renameCanonicalName(tx, 'parent_category', id, input.name);
        if (before) await this.renameOtherLeaf(tx, id, before.name, input.name);
      }
      return row;
    });
  }

  deleteParentCategory(id: string) {
    // A Leaf inserted concurrently (or a Batch on the Other Leaf) fails the
    // delete with a foreign-key error, mapped to the same code.
    return this.write(
      async (tx) => {
        await this.requireRow(tx, 'parent_category', id);
        // The top-level "Other" Parent is the home of Unmatched Batches: never deletable.
        if (id === seedId.parent('other')) throw otherLeafProtected();
        const leaves = await tx
          .select({ id: leafCategories.id, isOther: leafCategories.isOther })
          .from(leafCategories)
          .where(eq(leafCategories.parentId, id));
        const children = leaves.filter((leaf) => !leaf.isOther).length;
        if (children > 0) {
          throw new ApiException(409, 'catalog.category_not_empty', {
            children,
          });
        }
        // Translations first: if a delete below hits a foreign key, the whole
        // transaction (including this) rolls back.
        for (const leaf of leaves) {
          await this.deleteTranslationsOf(tx, 'leaf_category', leaf.id);
          await tx.delete(leafCategories).where(eq(leafCategories.id, leaf.id));
        }
        await this.deleteTranslationsOf(tx, 'parent_category', id);
        await tx.delete(parentCategories).where(eq(parentCategories.id, id));
      },
      new ApiException(409, 'catalog.category_not_empty'),
    );
  }

  // Leaf Categories

  createLeafCategory(input: LeafCategoryCreate) {
    return this.write(async (tx) => {
      await this.requireRow(tx, 'parent_category', input.parentId);
      const id = randomUUID();
      const [row] = await tx
        .insert(leafCategories)
        .values({ id, ...input, normalizedName: normalizeName(input.name) })
        .returning();
      await this.addCanonicalName(tx, 'leaf_category', id, input.name);
      return row;
    });
  }

  updateLeafCategory(id: string, input: LeafCategoryUpdate) {
    return this.write(async (tx) => {
      // The new Parent when this update moves the Leaf; its Ingredients re-derive their scale.
      let movedToParent: string | null = null;
      if (input.parentId) {
        await this.requireRow(tx, 'parent_category', input.parentId);
        const [current] = await tx
          .select({
            parentId: leafCategories.parentId,
            isOther: leafCategories.isOther,
          })
          .from(leafCategories)
          .where(eq(leafCategories.id, id));
        if (current?.isOther && current.parentId !== input.parentId) {
          throw otherLeafProtected();
        }
        if (current && current.parentId !== input.parentId) {
          movedToParent = input.parentId;
        }
      }
      const [row] = await tx
        .update(leafCategories)
        .set({ ...input, ...this.normalized(input.name) })
        .where(eq(leafCategories.id, id))
        .returning();
      if (!row) throw notFound('leaf_category');
      if (movedToParent) {
        await tx
          .update(ingredients)
          .set({ amountScale: amountScaleForParent(movedToParent) })
          .where(eq(ingredients.leafCategoryId, id));
      }
      if (input.name) {
        await this.renameCanonicalName(tx, 'leaf_category', id, input.name);
      }
      return row;
    });
  }

  deleteLeafCategory(id: string) {
    // Ingredients and Batches reference a Leaf Category by foreign key.
    return this.write(
      async (tx) => {
        const [leaf] = await tx
          .select({ isOther: leafCategories.isOther })
          .from(leafCategories)
          .where(eq(leafCategories.id, id));
        if (!leaf) throw notFound('leaf_category');
        if (leaf.isOther) throw otherLeafProtected();
        // Counts every Ingredient in the Leaf, Family Ingredients included
        // (deliberately not through a Catalog scope: this is a structural count, not a read).
        const [{ children }] = await tx
          .select({ children: count() })
          .from(ingredients)
          .where(eq(ingredients.leafCategoryId, id));
        if (children > 0) {
          throw new ApiException(409, 'catalog.category_not_empty', {
            children,
          });
        }
        await this.deleteTranslationsOf(tx, 'leaf_category', id);
        await tx.delete(leafCategories).where(eq(leafCategories.id, id));
      },
      new ApiException(409, 'catalog.category_not_empty'),
    );
  }

  // Ingredients

  createIngredient(input: IngredientCreate) {
    return this.write((tx) => this.createIngredientIn(tx, input));
  }

  /** Creates an Ingredient with its English name inside the caller's transaction. */
  async createIngredientIn(tx: Tx, input: IngredientCreate) {
    await this.requireRow(tx, 'leaf_category', input.leafCategoryId);
    const normalizedName = await this.claimName(tx, input.name);
    const amountScale = await this.amountScaleOfLeaf(tx, input.leafCategoryId);
    const id = randomUUID();
    const [row] = await tx
      .insert(ingredients)
      .values({ id, ...input, normalizedName, amountScale })
      .returning();
    await this.addCanonicalName(tx, 'ingredient', id, input.name);
    return row;
  }

  updateIngredient(id: string, input: IngredientUpdate) {
    return this.write(async (tx) => {
      // 404 for a Family Ingredient: the Admin scope never sees them (ADR 0011).
      await this.requireRow(tx, 'ingredient', id);
      if (input.leafCategoryId) {
        await this.requireRow(tx, 'leaf_category', input.leafCategoryId);
      }
      if (input.name) await this.claimName(tx, input.name, id);
      // A new Leaf may sit under another Parent, whose Amount Scale the Ingredient takes.
      const amountScale = input.leafCategoryId
        ? {
            amountScale: await this.amountScaleOfLeaf(tx, input.leafCategoryId),
          }
        : {};
      const [row] = await tx
        .update(ingredients)
        .set({ ...input, ...this.normalized(input.name), ...amountScale })
        .where(eq(ingredients.id, id))
        .returning();
      if (!row) throw notFound('ingredient');
      if (input.name) {
        await this.renameCanonicalName(tx, 'ingredient', id, input.name);
      }
      return row;
    });
  }

  deleteIngredient(id: string) {
    // Batches, Shopping Items, Staples, Shopping Template lines and Recipe
    // Ingredient Lines and Recipe Pairing links reference Ingredients with a foreign key, so
    // the database is the guard: a referenced Ingredient fails the delete
    // atomically (no check-then-delete race) and is mapped to a stable code.
    return this.write(
      async (tx) => {
        await this.requireRow(tx, 'ingredient', id);
        // The Ingredient first: a Family linking a Synonym holds a key-share
        // lock on it, so none can land after its translations are gone. A
        // foreign-key failure rolls both back.
        await tx.delete(ingredients).where(eq(ingredients.id, id));
        await this.deleteTranslationsOf(tx, 'ingredient', id);
      },
      new ApiException(409, 'catalog.ingredient_in_use'),
    );
  }

  // Translations and Synonyms

  createTranslation(input: TranslationCreate) {
    this.assertEditable(input.kind, input.locale);
    return this.write(
      async (tx) => {
        if (input.entityType === 'tag') {
          // Family Tags are never translated, nor merged into on others' behalf.
          await this.requireCatalogTag(tx, input.entityId);
        } else {
          await this.requireRow(tx, input.entityType, input.entityId);
        }
        if (input.entityType === 'ingredient') {
          await this.claimName(tx, input.value, input.entityId);
        }
        if (input.entityType === 'tag') this.assertNotAllergenFree(input.value);
        if (input.kind === 'name') {
          const translations = adminScope.translations(tx);
          const [existing] = await tx
            .select({ id: translations.id })
            .from(translations)
            .where(
              and(
                eq(translations.entityType, input.entityType),
                eq(translations.entityId, input.entityId),
                eq(translations.locale, input.locale),
                eq(translations.kind, 'name'),
              ),
            );
          if (existing) {
            throw new ApiException(409, 'catalog.translation_exists');
          }
        }
        const [row] = await tx
          .insert(catalogTranslations)
          .values({
            id: randomUUID(),
            ...input,
            normalizedValue: normalizeName(input.value),
          })
          .returning();
        if (input.entityType === 'tag') {
          await this.mergeFamilyTagsInto(
            tx,
            input.entityId,
            normalizeName(input.value),
          );
        }
        return row;
      },
      undefined,
      (constraint) =>
        constraint === 'catalog_translations_display_value_idx'
          ? 'catalog.name_taken'
          : 'catalog.translation_exists',
    );
  }

  updateTranslation(id: string, input: TranslationUpdate) {
    return this.write(async (tx) => {
      const existing = await this.requireTranslation(tx, id);
      this.assertEditable(existing.kind, existing.locale);
      if (existing.entityType === 'ingredient') {
        await this.claimName(tx, input.value, existing.entityId);
      }
      if (existing.entityType === 'tag') {
        await this.requireCatalogTag(tx, existing.entityId);
        this.assertNotAllergenFree(input.value);
      }
      const [row] = await tx
        .update(catalogTranslations)
        .set({
          value: input.value,
          normalizedValue: normalizeName(input.value),
        })
        .where(eq(catalogTranslations.id, id))
        .returning();
      if (existing.entityType === 'tag') {
        await this.mergeFamilyTagsInto(
          tx,
          existing.entityId,
          normalizeName(input.value),
        );
      }
      return row;
    });
  }

  async deleteTranslation(id: string): Promise<void> {
    const existing = await this.requireTranslation(this.database, id);
    this.assertEditable(existing.kind, existing.locale);
    await this.database
      .delete(catalogTranslations)
      .where(eq(catalogTranslations.id, id));
  }

  // Helpers

  /**
   * Per-name advisory lock held to the end of the transaction. Everything that
   * gives an Ingredient a name (an add here, an Unmatched resolve) takes it, so
   * "is this name free?" and the insert that follows cannot interleave.
   */
  async lockName(tx: Tx, normalizedName: string): Promise<void> {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${`catalog-name:${normalizedName}`}, 0))`,
    );
  }

  /** True unless another Ingredient already answers to the key; call under `lockName`. */
  async isNameFree(
    tx: Tx,
    key: string,
    ingredientId?: string,
  ): Promise<boolean> {
    const shared = adminScope.ingredients(tx);
    const translations = adminScope.translations(tx);
    const owners = await tx
      .select({ id: shared.id })
      .from(shared)
      .where(eq(shared.normalizedName, key));
    const translated = await tx
      .select({ id: translations.entityId })
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'ingredient'),
          eq(translations.normalizedValue, key),
        ),
      );
    return [...owners, ...translated].every(
      (owner) => owner.id === ingredientId,
    );
  }

  /**
   * Locks `name`'s key for the rest of the transaction and fails with
   * `catalog.name_taken` unless it is free for `ingredientId` (or a new
   * Ingredient). Returns the key.
   */
  private async claimName(
    tx: Tx,
    name: string,
    ingredientId?: string,
  ): Promise<string> {
    const key = normalizeName(name);
    await this.lockName(tx, key);
    if (!(await this.isNameFree(tx, key, ingredientId))) {
      throw new ApiException(409, 'catalog.name_taken');
    }
    return key;
  }

  /**
   * Runs `work` in a transaction. A name collision maps to `catalog.name_taken`
   * and an Aisle sort-order collision to `catalog.aisle_order_stale`;
   * a foreign-key violation (something still references the row being deleted)
   * maps to `inUse`.
   */
  private async write<T>(
    work: (tx: Tx) => Promise<T>,
    inUse?: ApiException,
    /** Picks the code for a unique violation; defaults to `catalog.name_taken`. */
    uniqueCode: (constraint?: string) => string = () => 'catalog.name_taken',
  ): Promise<T> {
    try {
      return await this.database.transaction(work);
    } catch (error) {
      if (hasPgCode(error, '23505')) {
        const constraint = pgConstraint(error);
        throw new ApiException(
          409,
          constraint === 'aisles_sort_order_idx'
            ? 'catalog.aisle_order_stale'
            : uniqueCode(constraint),
        );
      }
      if (inUse && hasPgCode(error, '23503')) throw inUse;
      throw error;
    }
  }

  /** Keeps the Other Leaf's generated name in step with its Parent, unless an admin renamed it. */
  private async renameOtherLeaf(
    tx: Tx,
    parentId: string,
    oldName: string,
    newName: string,
  ): Promise<void> {
    const name = otherLeafName(newName);
    try {
      // Matching the old generated name keeps an Admin's concurrent rename: the update skips the row.
      const [leaf] = await tx
        .update(leafCategories)
        .set({ name, normalizedName: normalizeName(name) })
        .where(
          and(
            eq(leafCategories.parentId, parentId),
            eq(leafCategories.isOther, true),
            eq(leafCategories.name, otherLeafName(oldName)),
          ),
        )
        .returning({ id: leafCategories.id });
      if (leaf)
        await this.renameCanonicalName(tx, 'leaf_category', leaf.id, name);
    } catch (error) {
      if (hasPgCode(error, '23505')) throw otherLeafNameTaken();
      throw error;
    }
  }

  private normalized(name: string | undefined) {
    return name === undefined ? {} : { normalizedName: normalizeName(name) };
  }

  private assertEditable(kind: string, locale: string): void {
    if (kind === 'name' && locale === FALLBACK_LOCALE) {
      throw new ApiException(409, 'catalog.canonical_name_managed');
    }
  }

  private async requireTranslation(executor: Executor, id: string) {
    const translations = adminScope.translations(executor);
    const [row] = await executor
      .select()
      .from(translations)
      .where(eq(translations.id, id));
    if (!row) throw notFound('translation');
    // Translations of a Family Ingredient are outside the Admin scope too.
    if (row.entityType === 'ingredient') {
      await this.requireRow(executor, 'ingredient', row.entityId);
    }
    return row;
  }

  /** The default Amount Scale of an Ingredient in this Leaf: its Parent Category's. */
  private async amountScaleOfLeaf(
    executor: Executor,
    leafId: string,
  ): Promise<AmountScale> {
    const [leaf] = await executor
      .select({ parentId: leafCategories.parentId })
      .from(leafCategories)
      .where(eq(leafCategories.id, leafId));
    return amountScaleForParent(leaf.parentId);
  }

  private async requireRow(
    executor: Executor,
    type: EntityType,
    id: string,
  ): Promise<void> {
    const table = {
      aisle: aisles,
      parent_category: parentCategories,
      leaf_category: leafCategories,
      ingredient: adminScope.ingredients(executor),
      tag_group: tagGroups,
      tag: tags,
      eating_moment: eatingMoments,
      allergen: allergens,
    }[type];
    const [row] = await executor
      .select({ id: table.id })
      .from(table)
      .where(eq(table.id, id));
    if (!row) throw notFound(type);
  }

  private async addCanonicalName(
    tx: Tx,
    entityType: EntityType,
    entityId: string,
    name: string,
  ): Promise<void> {
    await tx.insert(catalogTranslations).values({
      id: randomUUID(),
      entityType,
      entityId,
      locale: FALLBACK_LOCALE,
      kind: 'name',
      value: name,
      normalizedValue: normalizeName(name),
    });
  }

  private async renameCanonicalName(
    tx: Tx,
    entityType: EntityType,
    entityId: string,
    name: string,
  ): Promise<void> {
    const updated = await tx
      .update(catalogTranslations)
      .set({ value: name, normalizedValue: normalizeName(name) })
      .where(
        and(
          eq(catalogTranslations.entityType, entityType),
          eq(catalogTranslations.entityId, entityId),
          eq(catalogTranslations.locale, FALLBACK_LOCALE),
          eq(catalogTranslations.kind, 'name'),
        ),
      )
      .returning({ id: catalogTranslations.id });
    if (updated.length === 0) {
      await this.addCanonicalName(tx, entityType, entityId, name);
    }
  }

  private async deleteTranslationsOf(
    tx: Tx,
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    await tx
      .delete(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, entityType),
          eq(catalogTranslations.entityId, entityId),
        ),
      );
  }
}
