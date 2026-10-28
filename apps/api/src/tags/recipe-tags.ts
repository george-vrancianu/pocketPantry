import { and, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor, Tx } from '../database/database.types';
import {
  catalogTranslations,
  cuisines,
  methods,
  recipes,
  recipeTags,
  tagGroups,
  tags,
} from '../database/schema';

/** A Tag on a Recipe, named for the viewer (ADR 0033). Family Tags have no group. */
export type RecipeTag = {
  id: string;
  name: string;
  kind: 'catalog' | 'family';
  groupId: string | null;
  groupName: string | null;
  groupOrder: number | null;
};

type TagRow = {
  id: string;
  name: string;
  familyId: string | null;
  groupId: string | null;
  groupName: string | null;
  groupOrder: number | null;
};

type Names = Awaited<ReturnType<typeof loadDisplayNames>>;

function toRecipeTag(row: TagRow, names: Names): RecipeTag {
  const catalog = row.familyId === null;
  return {
    id: row.id,
    name: catalog ? names.pick('tag', row.id, row.name) : row.name,
    kind: catalog ? 'catalog' : 'family',
    groupId: row.groupId,
    groupName:
      row.groupId && row.groupName
        ? names.pick('tag_group', row.groupId, row.groupName)
        : null,
    groupOrder: row.groupOrder,
  };
}

const compareTags = (locale: CatalogLocale) => (a: RecipeTag, b: RecipeTag) =>
  (a.kind === b.kind ? 0 : a.kind === 'family' ? -1 : 1) ||
  (a.groupOrder ?? 0) - (b.groupOrder ?? 0) ||
  a.name.localeCompare(b.name, locale) ||
  a.id.localeCompare(b.id);

/**
 * The Tags on at least one Recipe matching `recipeFilter` (a condition on `recipes`), named in
 * the viewer's language and ordered like a Recipe's Tags: Family Tags first, then Catalog Tags by
 * Tag Group position, then by name. Feeds the Tag filter's options.
 */
export async function loadTagsInUse(
  executor: Executor,
  scope: CatalogScope,
  locale: CatalogLocale,
  recipeFilter: SQL | undefined,
): Promise<RecipeTag[]> {
  const rows = await executor
    .selectDistinct({
      id: tags.id,
      name: tags.name,
      familyId: tags.familyId,
      groupId: tagGroups.id,
      groupName: tagGroups.name,
      groupOrder: tagGroups.position,
    })
    .from(recipeTags)
    .innerJoin(recipes, eq(recipes.id, recipeTags.recipeId))
    .innerJoin(tags, eq(tags.id, recipeTags.tagId))
    .leftJoin(tagGroups, eq(tagGroups.id, tags.groupId))
    .where(recipeFilter);
  if (rows.length === 0) return [];
  const names = await loadDisplayNames(executor, scope, locale, [
    ...rows.map((r) => r.id),
    ...rows.flatMap((r) => (r.groupId ? [r.groupId] : [])),
  ]);
  return rows.map((r) => toRecipeTag(r, names)).sort(compareTags(locale));
}

/**
 * The Tags of each Recipe, in the viewer's language: Family Tags first (by name), then Catalog
 * Tags by Tag Group position, then by name. Recipes without Tags are absent from the map.
 */
export async function loadRecipeTags(
  executor: Executor,
  scope: CatalogScope,
  locale: CatalogLocale,
  recipeIds: string[],
): Promise<Map<string, RecipeTag[]>> {
  const byRecipe = new Map<string, RecipeTag[]>();
  const wanted = [...new Set(recipeIds)];
  if (wanted.length === 0) return byRecipe;
  const rows = await executor
    .select({
      recipeId: recipeTags.recipeId,
      id: tags.id,
      name: tags.name,
      familyId: tags.familyId,
      groupId: tagGroups.id,
      groupName: tagGroups.name,
      groupOrder: tagGroups.position,
    })
    .from(recipeTags)
    .innerJoin(tags, eq(tags.id, recipeTags.tagId))
    .leftJoin(tagGroups, eq(tagGroups.id, tags.groupId))
    .where(inArray(recipeTags.recipeId, wanted));
  if (rows.length === 0) return byRecipe;
  const names = await loadDisplayNames(executor, scope, locale, [
    ...rows.map((r) => r.id),
    ...rows.flatMap((r) => (r.groupId ? [r.groupId] : [])),
  ]);
  for (const row of rows) {
    const tag = toRecipeTag(row, names);
    byRecipe.set(row.recipeId, [...(byRecipe.get(row.recipeId) ?? []), tag]);
  }
  for (const list of byRecipe.values()) list.sort(compareTags(locale));
  return byRecipe;
}

/**
 * Expand step of ADR 0033: a Recipe's Cuisine and Method stay, and their Catalog Tags (the
 * Tag with the same id as the Cuisine or Method, made by migration 0049) follow them. The old
 * Cuisine and Method Tags are removed and the new ones added; every other Tag is untouched.
 */
export async function syncCuisineMethodTags(
  tx: Tx,
  recipeId: string,
  cuisineId: string | null,
  methodId: string | null,
): Promise<void> {
  const keep = [cuisineId, methodId].filter((id): id is string => id !== null);
  await tx.delete(recipeTags).where(
    and(
      eq(recipeTags.recipeId, recipeId),
      sql`(${recipeTags.tagId} IN (SELECT ${cuisines.id} FROM ${cuisines}) OR ${recipeTags.tagId} IN (SELECT ${methods.id} FROM ${methods}))`,
      keep.length > 0
        ? sql`${recipeTags.tagId} NOT IN (${sql.join(
            keep.map((id) => sql`${id}`),
            sql`, `,
          )})`
        : undefined,
    ),
  );
  if (keep.length > 0) {
    // A Cuisine or Method made without going through the Admin lists has no Tag yet.
    const have = new Set(
      (
        await tx
          .select({ id: tags.id })
          .from(tags)
          .where(inArray(tags.id, keep))
      ).map((t) => t.id),
    );
    if (cuisineId && !have.has(cuisineId)) {
      await mirrorListEntryAsTag(tx, 'cuisine', cuisineId);
    }
    if (methodId && !have.has(methodId)) {
      await mirrorListEntryAsTag(tx, 'method', methodId);
    }
    await tx
      .insert(recipeTags)
      .values(keep.map((tagId) => ({ recipeId, tagId })))
      .onConflictDoNothing();
  }
}

/** Gives `toId` the Tags of `fromId` (Add to Family, Variants); the two are independent after. */
export async function copyRecipeTags(
  tx: Tx,
  fromId: string,
  toId: string,
): Promise<void> {
  await tx.execute(
    sql`INSERT INTO ${recipeTags} (recipe_id, tag_id)
        SELECT ${toId}, ${recipeTags.tagId} FROM ${recipeTags}
        WHERE ${recipeTags.recipeId} = ${fromId}
        ON CONFLICT DO NOTHING`,
  );
}

/**
 * Expand step only: an Admin still creates, renames, translates and deletes Cuisines and Methods
 * through the old lists, so their Catalog Tag (same id, in the Cuisine or Method Tag Group) and
 * the Tag's translations are rebuilt from the list entry after each such change. Gone with the
 * old lists in the contract ticket.
 */
export async function mirrorListEntryAsTag(
  tx: Tx,
  type: 'cuisine' | 'method',
  id: string,
): Promise<void> {
  const table = type === 'cuisine' ? cuisines : methods;
  const [entry] = await tx.select().from(table).where(eq(table.id, id));
  await tx
    .delete(catalogTranslations)
    .where(
      and(
        eq(catalogTranslations.entityType, 'tag'),
        eq(catalogTranslations.entityId, id),
      ),
    );
  if (!entry) {
    await tx.delete(tags).where(eq(tags.id, id));
    return;
  }
  const [group] = await tx
    .select({ id: tagGroups.id })
    .from(tagGroups)
    .where(eq(tagGroups.normalizedName, type));
  if (!group) return;
  await tx
    .insert(tags)
    .values({
      id,
      name: entry.name,
      normalizedName: entry.normalizedName,
      groupId: group.id,
    })
    .onConflictDoUpdate({
      target: tags.id,
      set: { name: entry.name, normalizedName: entry.normalizedName },
    });
  await tx.execute(
    sql`INSERT INTO ${catalogTranslations} (id, entity_type, entity_id, locale, kind, value, normalized_value)
        SELECT gen_random_uuid(), 'tag', ${catalogTranslations.entityId}, ${catalogTranslations.locale}, ${catalogTranslations.kind}, ${catalogTranslations.value}, ${catalogTranslations.normalizedValue}
        FROM ${catalogTranslations}
        WHERE ${catalogTranslations.entityType} = ${type}
          AND ${catalogTranslations.entityId} = ${id}
          AND ${catalogTranslations.ownerFamilyId} IS NULL`,
  );
}
