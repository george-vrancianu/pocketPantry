import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, sql } from 'drizzle-orm';
import { FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { seedId } from '../catalog/seed/seed-catalog';
import type { EntityType } from '../catalog/display-names';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { hasPgCode, pgConstraint } from '../database/pg-errors';
import {
  aisles,
  catalogTranslations,
  ingredients,
  leafCategories,
  parentCategories,
} from '../database/schema';
import type {
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
    const [aisleRows, parentRows, leafRows, ingredientRows, translationRows] =
      await Promise.all([
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
          .from(ingredients)
          .orderBy(ingredients.normalizedName),
        this.database.select().from(catalogTranslations),
      ]);

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
        translations: translations('ingredient', row.id),
      })),
    };
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
      }
      const [row] = await tx
        .update(leafCategories)
        .set({ ...input, ...this.normalized(input.name) })
        .where(eq(leafCategories.id, id))
        .returning();
      if (!row) throw notFound('leaf_category');
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
    const key = normalizeName(input.name);
    await this.lockName(tx, key);
    await this.assertNameFree(tx, key);
    const id = randomUUID();
    const [row] = await tx
      .insert(ingredients)
      .values({ id, ...input, normalizedName: normalizeName(input.name) })
      .returning();
    await this.addCanonicalName(tx, 'ingredient', id, input.name);
    return row;
  }

  updateIngredient(id: string, input: IngredientUpdate) {
    return this.write(async (tx) => {
      if (input.leafCategoryId) {
        await this.requireRow(tx, 'leaf_category', input.leafCategoryId);
      }
      if (input.name) {
        const key = normalizeName(input.name);
        await this.lockName(tx, key);
        await this.assertNameFree(tx, key, id);
      }
      const [row] = await tx
        .update(ingredients)
        .set({ ...input, ...this.normalized(input.name) })
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
    // Batches and Shopping Items reference Ingredients with a foreign key, so
    // the database is the guard: a referenced Ingredient fails the delete
    // atomically (no check-then-delete race) and is mapped to a stable code.
    return this.write(
      async (tx) => {
        await this.requireRow(tx, 'ingredient', id);
        // Translations first: a foreign-key failure on the delete below rolls
        // them back with it.
        await this.deleteTranslationsOf(tx, 'ingredient', id);
        await tx.delete(ingredients).where(eq(ingredients.id, id));
      },
      new ApiException(409, 'catalog.ingredient_in_use'),
    );
  }

  // Translations and Synonyms

  createTranslation(input: TranslationCreate) {
    this.assertEditable(input.kind, input.locale);
    return this.write(
      async (tx) => {
        await this.requireRow(tx, input.entityType, input.entityId);
        if (input.entityType === 'ingredient') {
          const key = normalizeName(input.value);
          await this.lockName(tx, key);
          await this.assertNameFree(tx, key, input.entityId);
        }
        if (input.kind === 'name') {
          const [existing] = await tx
            .select({ id: catalogTranslations.id })
            .from(catalogTranslations)
            .where(
              and(
                eq(catalogTranslations.entityType, input.entityType),
                eq(catalogTranslations.entityId, input.entityId),
                eq(catalogTranslations.locale, input.locale),
                eq(catalogTranslations.kind, 'name'),
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
        const key = normalizeName(input.value);
        await this.lockName(tx, key);
        await this.assertNameFree(tx, key, existing.entityId);
      }
      const [row] = await tx
        .update(catalogTranslations)
        .set({
          value: input.value,
          normalizedValue: normalizeName(input.value),
        })
        .where(eq(catalogTranslations.id, id))
        .returning();
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
    const owners = await tx
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.normalizedName, key));
    const translated = await tx
      .select({ id: catalogTranslations.entityId })
      .from(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, 'ingredient'),
          eq(catalogTranslations.normalizedValue, key),
        ),
      );
    return [...owners, ...translated].every(
      (owner) => owner.id === ingredientId,
    );
  }

  private async assertNameFree(
    tx: Tx,
    key: string,
    ingredientId?: string,
  ): Promise<void> {
    if (!(await this.isNameFree(tx, key, ingredientId))) {
      throw new ApiException(409, 'catalog.name_taken');
    }
  }

  /**
   * Runs `work` in a transaction. A name collision maps to `catalog.name_taken`;
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
        throw new ApiException(409, uniqueCode(pgConstraint(error)));
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
    const [row] = await executor
      .select()
      .from(catalogTranslations)
      .where(eq(catalogTranslations.id, id));
    if (!row) throw notFound('translation');
    return row;
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
      ingredient: ingredients,
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
