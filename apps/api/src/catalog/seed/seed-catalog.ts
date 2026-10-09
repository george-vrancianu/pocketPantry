import { createHash } from 'node:crypto';
import { eq, inArray, sql } from 'drizzle-orm';
import type { Database } from '../../database/database.types';
import {
  aisles,
  catalogTranslations,
  ingredients,
  leafCategories,
  parentCategories,
} from '../../database/schema';
import { CATALOG_LOCALES, type CatalogLocale } from '../catalog.schemas';
import type { EntityType } from '../display-names';
import { normalizeName } from '../normalize';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import { assertCatalogSeedValid } from './validate-seed';

type TranslationRow = typeof catalogTranslations.$inferInsert;

/**
 * The matching key as it was before æ, ø and å were folded (#104). Synonym ids
 * are derived from it, so ids written by earlier seed runs never move. Frozen:
 * never change it along with `normalizeName`.
 */
function synonymIdKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

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
  names: Record<CatalogLocale, string>,
  synonyms: Partial<Record<CatalogLocale, string[]>> = {},
): TranslationRow[] {
  const row = (
    locale: CatalogLocale,
    kind: 'name' | 'synonym',
    value: string,
  ): TranslationRow => ({
    // A display name's id ignores its text, so changing the wording in the seed
    // never collides with the name row an earlier seed run already wrote.
    // Synonyms are many per locale, so their id includes the value.
    id: stableId(
      `translation:${entityType}:${entityId}:${locale}:${kind}` +
        (kind === 'synonym' ? `:${synonymIdKey(value)}` : ''),
    ),
    entityType,
    entityId,
    locale,
    kind,
    value,
    normalizedValue: normalizeName(value),
  });
  return CATALOG_LOCALES.flatMap((locale) => [
    row(locale, 'name', names[locale]),
    ...(synonyms[locale] ?? []).map((value) => row(locale, 'synonym', value)),
  ]);
}

/**
 * Seed rows that were shipped once and have since been retired. The seed never
 * deletes on its own, so a row dropped from the data would live on in
 * already-seeded databases; list its stable id here to remove it on the next
 * run. One line per retirement.
 */
const RETIRED_SEED_TRANSLATIONS: string[] = [
  // English "squash" was a Synonym of Pumpkin; it now belongs to Zucchini
  // (Danish "Squash"), and an Ingredient name must have one owner.
  stableId(
    `translation:ingredient:${seedId.ingredient('pumpkin')}:en:synonym:squash`,
  ),
  // Danish "guleroedder" spelled carrot's name without ø. Folding ø→oe now
  // makes it the same key as "Gulerødder", so it is redundant.
  stableId(
    `translation:ingredient:${seedId.ingredient('carrot')}:da:synonym:guleroedder`,
  ),
];

/**
 * The seed Aisles to insert. An Admin may reorder Aisles, so a seed Aisle the
 * Admin deleted can find its seed sort order taken; it then comes back last in
 * the shop order instead of failing the run. Aisles that exist are left as the
 * Admin has them (name and order).
 */
async function seedAisleRows(tx: Pick<Database, 'select'>) {
  const existing = await tx
    .select({ id: aisles.id, sortOrder: aisles.sortOrder })
    .from(aisles);
  const ids = new Set(existing.map((row) => row.id));
  const taken = new Set(existing.map((row) => row.sortOrder));
  let last = Math.max(0, ...taken);
  return SEED_AISLES.filter((aisle) => !ids.has(seedId.aisle(aisle.slug))).map(
    (aisle) => {
      const sortOrder = taken.has(aisle.sortOrder) ? ++last : aisle.sortOrder;
      taken.add(sortOrder);
      return {
        id: seedId.aisle(aisle.slug),
        name: aisle.en,
        normalizedName: normalizeName(aisle.en),
        sortOrder,
      };
    },
  );
}

/**
 * Loads the Catalog seed, after checking it for duplicates and dangling references. Rows have fixed ids and are inserted with
 * ON CONFLICT (id) DO NOTHING, so running it again leaves the database unchanged
 * and keeps in-place Admin edits. A locale added to the seed later (Danish) is
 * just more rows with new ids, so an already-seeded database gains those names
 * and Synonyms on the next run without touching the existing en/ro rows. Rows an Admin deleted come back; rows an Admin
 * renamed keep their new name, and Aisles keep the Admin's shop order (a
 * restored Aisle whose slot is taken goes last). A real collision on an en/ro row or an
 * Ingredient (e.g. an Admin-made Ingredient with the same normalised name)
 * fails loudly. Danish rows that clash with an Admin's are skipped and
 * counted instead, and names owned by two Ingredients are logged. Rows listed
 * in RETIRED_SEED_TRANSLATIONS are deleted.
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
    const aisleRows = await seedAisleRows(tx);
    if (aisleRows.length > 0) {
      await tx
        .insert(aisles)
        .values(aisleRows)
        .onConflictDoNothing({ target: aisles.id });
    }

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
      .delete(catalogTranslations)
      .where(inArray(catalogTranslations.id, RETIRED_SEED_TRANSLATIONS));

    const isDanish = (row: TranslationRow) => row.locale === 'da';
    await tx
      .insert(catalogTranslations)
      .values(translations.filter((row) => !isDanish(row)))
      .onConflictDoNothing({ target: catalogTranslations.id });
    // Danish arrives after Admins could already add `da` Synonyms (a Synonym
    // may be in any Scan Language). A seed row that collides with one of those
    // on the per-locale unique keys is skipped instead of failing the whole
    // seed: the Admin's row wins and everything else is still inserted.
    const present = new Set(
      (
        await tx
          .select({ id: catalogTranslations.id })
          .from(catalogTranslations)
          .where(eq(catalogTranslations.locale, 'da'))
      ).map((row) => row.id),
    );
    const missing = translations.filter(
      (row) => isDanish(row) && !present.has(row.id ?? ''),
    );
    if (missing.length > 0) {
      const inserted = await tx
        .insert(catalogTranslations)
        .values(missing)
        .onConflictDoNothing()
        .returning({ id: catalogTranslations.id });
      if (inserted.length < missing.length) {
        console.log(
          `Danish seed: skipped ${missing.length - inserted.length} of ${missing.length} new rows that clash with an existing row.`,
        );
      }
    }

    // Skipped or hand-made rows can leave a name or Synonym pointing at two
    // Ingredients, which makes an exact Match ambiguous. Report, never fail.
    const ambiguous = await tx
      .select({ key: catalogTranslations.normalizedValue })
      .from(catalogTranslations)
      .where(eq(catalogTranslations.entityType, 'ingredient'))
      .groupBy(catalogTranslations.normalizedValue)
      .having(sql`count(distinct ${catalogTranslations.entityId}) > 1`);
    if (ambiguous.length > 0) {
      console.warn(
        `Catalog: ${ambiguous.length} name(s) or Synonym(s) belong to more than one Ingredient: ${ambiguous.map((row) => `"${row.key}"`).join(', ')}`,
      );
    }
  });
}
