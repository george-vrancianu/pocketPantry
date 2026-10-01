import { createHash } from 'node:crypto';
import type { Database } from '../../database/database.types';
import {
  aisles,
  catalogTranslations,
  ingredients,
  leafCategories,
  parentCategories,
} from '../../database/schema';
import { normalizeName } from '../normalize';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import { assertCatalogSeedValid } from './validate-seed';

type EntityType = (typeof catalogTranslations.entityType.enumValues)[number];
type TranslationRow = typeof catalogTranslations.$inferInsert;

/** Deterministic UUID from a stable key, so seed rows keep their ids forever. */
export function stableId(key: string): string {
  const hex = createHash('sha1').update(`pocket-pantry:${key}`).digest('hex');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

export const seedId = {
  aisle: (slug: string) => stableId(`aisle:${slug}`),
  parent: (slug: string) => stableId(`parent:${slug}`),
  leaf: (slug: string) => stableId(`leaf:${slug}`),
  ingredient: (slug: string) => stableId(`ingredient:${slug}`),
};

function translationRows(
  entityType: EntityType,
  entityId: string,
  names: { en: string; ro: string },
  synonyms: { en?: string[]; ro?: string[] } = {},
): TranslationRow[] {
  const row = (
    locale: 'en' | 'ro',
    kind: 'name' | 'synonym',
    value: string,
  ): TranslationRow => ({
    // A display name's id ignores its text, so changing the wording in the seed
    // never collides with the name row an earlier seed run already wrote.
    // Synonyms are many per locale, so their id includes the value.
    id: stableId(
      `translation:${entityType}:${entityId}:${locale}:${kind}` +
        (kind === 'synonym' ? `:${normalizeName(value)}` : ''),
    ),
    entityType,
    entityId,
    locale,
    kind,
    value,
    normalizedValue: normalizeName(value),
  });
  return [
    row('en', 'name', names.en),
    row('ro', 'name', names.ro),
    ...(synonyms.en ?? []).map((value) => row('en', 'synonym', value)),
    ...(synonyms.ro ?? []).map((value) => row('ro', 'synonym', value)),
  ];
}

/**
 * Loads the Catalog seed, after checking it for duplicates and dangling references. Rows have fixed ids and are inserted with
 * ON CONFLICT (id) DO NOTHING, so running it again leaves the database unchanged
 * and keeps in-place Admin edits. Rows an Admin deleted come back; rows an Admin
 * renamed keep their new name. A real collision (e.g. an Admin-made Ingredient with the same normalised
 * name) fails loudly instead of being skipped.
 */
export async function seedCatalog(
  database: Pick<Database, 'transaction'>,
): Promise<void> {
  assertCatalogSeedValid({
    aisles: SEED_AISLES,
    parents: SEED_PARENTS,
    leaves: SEED_LEAVES,
    ingredients: SEED_INGREDIENTS,
  });
  await database.transaction(async (tx) => {
    await tx
      .insert(aisles)
      .values(
        SEED_AISLES.map((aisle) => ({
          id: seedId.aisle(aisle.slug),
          name: aisle.en,
          normalizedName: normalizeName(aisle.en),
          sortOrder: aisle.sortOrder,
        })),
      )
      .onConflictDoNothing({ target: aisles.id });

    await tx
      .insert(parentCategories)
      .values(
        SEED_PARENTS.map((parent) => ({
          id: seedId.parent(parent.slug),
          name: parent.en,
          normalizedName: normalizeName(parent.en),
          aisleId: seedId.aisle(parent.aisle),
          defaultExpiryDays: parent.defaultExpiryDays,
          defaultLocation: parent.defaultLocation,
        })),
      )
      .onConflictDoNothing({ target: parentCategories.id });

    await tx
      .insert(leafCategories)
      .values(
        SEED_LEAVES.map((leaf) => ({
          id: seedId.leaf(leaf.slug),
          parentId: seedId.parent(leaf.parent),
          name: leaf.en,
          normalizedName: normalizeName(leaf.en),
          defaultExpiryDays: leaf.defaultExpiryDays ?? null,
          defaultLocation: leaf.defaultLocation ?? null,
          isOther: leaf.isOther ?? false,
        })),
      )
      .onConflictDoNothing({ target: leafCategories.id });

    await tx
      .insert(ingredients)
      .values(
        SEED_INGREDIENTS.map((item) => ({
          id: seedId.ingredient(item.slug),
          leafCategoryId: seedId.leaf(item.leaf),
          name: item.en,
          normalizedName: normalizeName(item.en),
          defaultUnit: item.unit,
        })),
      )
      .onConflictDoNothing({ target: ingredients.id });

    const translations: TranslationRow[] = [
      ...SEED_AISLES.flatMap((aisle) =>
        translationRows('aisle', seedId.aisle(aisle.slug), aisle),
      ),
      ...SEED_PARENTS.flatMap((parent) =>
        translationRows('parent_category', seedId.parent(parent.slug), parent),
      ),
      ...SEED_LEAVES.flatMap((leaf) =>
        translationRows('leaf_category', seedId.leaf(leaf.slug), leaf),
      ),
      ...SEED_INGREDIENTS.flatMap((item) =>
        translationRows(
          'ingredient',
          seedId.ingredient(item.slug),
          item,
          item.synonyms,
        ),
      ),
    ];
    await tx
      .insert(catalogTranslations)
      .values(translations)
      .onConflictDoNothing({ target: catalogTranslations.id });
  });
}
