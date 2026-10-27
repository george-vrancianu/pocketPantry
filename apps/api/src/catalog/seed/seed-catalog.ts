import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Database } from '../../database/database.types';
import {
  aisles,
  allergens,
  catalogTranslations,
  ingredientAllergens,
  ingredients,
  leafCategories,
  parentCategories,
} from '../../database/schema';
import { amountScaleForParent } from '../amount-scale';
import { catalogScope, SHARED_ONLY } from '../catalog-scope';
import { seedId, stableId } from './seed-ids';
import { lockAisleOrder } from '../order-lock';
import { CATALOG_LOCALES, type CatalogLocale } from '../catalog.schemas';
import type { EntityType } from '../display-names';
import { normalizeName } from '../normalize';
import { SEED_ALLERGENS } from './allergens';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import { assertCatalogSeedValid } from './validate-seed';

export { seedId, stableId };

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

export function translationRows(
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
  // These Synonyms moved to Ingredients of their own: Prawns, Pickled herring,
  // Salt cod, Salmon roe, Leg of lamb, Lamb chops, Wild boar, Caraway seeds,
  // Chilli flakes, Cayenne pepper, Jamón (Serrano ham), Kapia pepper,
  // Cornichons and Tarama. Romanian "chimen" is caraway, not cumin.
  ...(
    [
      ['shrimp', 'en', 'prawns'],
      ['salted-herring', 'en', 'pickled herring'],
      ['salted-herring', 'ro', 'hering marinat'],
      ['dried-fish', 'ro', 'bacalau'],
      ['dried-fish', 'ro', 'bacalau uscat'],
      ['caviar', 'ro', 'caviar rosu'],
      ['lamb', 'ro', 'pulpa de miel'],
      ['lamb', 'ro', 'cotlet miel'],
      ['venison', 'ro', 'mistret'],
      ['cumin', 'ro', 'chimen'],
      ['cumin-seeds', 'en', 'caraway seeds'],
      ['cumin-seeds', 'ro', 'chimen boabe'],
      ['cumin-seeds', 'ro', 'seminte chimen'],
      ['chili-powder', 'en', 'cayenne pepper'],
      ['chili-powder', 'en', 'chili flakes'],
      ['chili-powder', 'ro', 'fulgi de ardei iute'],
      ['chili-powder', 'ro', 'cayenne'],
      ['prosciutto', 'en', 'jamon'],
      ['bell-pepper', 'ro', 'ardei capia'],
      ['bell-pepper', 'ro', 'ardei kapia'],
      ['pickled-cucumbers', 'ro', 'cornichons'],
      ['pickled-cucumbers', 'ro', 'corniosi'],
      ['taramasalata', 'en', 'tarama'],
    ] as const
  ).map(([slug, locale, key]) =>
    stableId(
      `translation:ingredient:${seedId.ingredient(slug)}:${locale}:synonym:${key}`,
    ),
  ),
];

/**
 * Display-name rows that held old wording. A name row is never dropped from the
 * data, so it is deleted only while it still holds the old text (normalised);
 * once rewritten, or renamed by an Admin, it is left alone.
 */
const RETIRED_SEED_NAMES: [id: string, normalizedValue: string][] = [
  // Danish "Remoulade" was Tartar sauce's name; it now belongs to the new
  // Danish remoulade Ingredient and Tartar sauce is "Tartarsauce". The old row
  // is deleted, then the seed writes the new one in the same run.
  [
    stableId(
      `translation:ingredient:${seedId.ingredient('tartar-sauce')}:da:name`,
    ),
    'remoulade',
  ],
];

const PARENT_OF_LEAF = new Map(
  SEED_LEAVES.map((leaf) => [leaf.slug, leaf.parent]),
);

/** The Parent Category id a seed Leaf belongs to, for its Ingredients' Amount Scale. */
function parentIdOfLeaf(leafSlug: string): string {
  return seedId.parent(PARENT_OF_LEAF.get(leafSlug) ?? '');
}

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
 * in RETIRED_SEED_TRANSLATIONS are deleted; rows in RETIRED_SEED_NAMES are
 * deleted only while they still hold their old text. A seed Ingredient's Allergen tags
 * are applied once, the first run that sees it untagged; after that they
 * belong to the Admins.
 */
export async function seedCatalog(
  database: Pick<Database, 'transaction'>,
): Promise<void> {
  assertCatalogSeedValid({
    aisles: SEED_AISLES,
    parents: SEED_PARENTS,
    leaves: SEED_LEAVES,
    ingredients: SEED_INGREDIENTS,
    allergens: SEED_ALLERGENS,
  });
  await database.transaction(async (tx) => {
    await lockAisleOrder(tx);
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
          amountScale: amountScaleForParent(parentIdOfLeaf(item.leaf)),
        })),
      )
      .onConflictDoNothing({ target: ingredients.id });

    // The Allergen list. Like the other rows it is only ever inserted, never
    // updated: an Admin's edits to the list are kept.
    await tx
      .insert(allergens)
      .values(
        SEED_ALLERGENS.map((allergen, index) => ({
          id: seedId.allergen(allergen.slug),
          name: allergen.en,
          normalizedName: normalizeName(allergen.en),
          sortOrder: index + 1,
        })),
      )
      .onConflictDoNothing({ target: allergens.id });

    // Each seed Ingredient's tags are applied once. `allergens_checked` marks
    // a seed Ingredient whose tags have been applied (the flag is otherwise
    // read for Family rows and for promoted shared rows, ADR 0014), so a database seeded before the
    // tags existed gains them on this run, and an Admin's later edits (a tag
    // removed, say) are never undone by a re-seed.
    const untagged = await tx
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(
        and(
          inArray(
            ingredients.id,
            SEED_INGREDIENTS.map((item) => seedId.ingredient(item.slug)),
          ),
          eq(ingredients.allergensChecked, false),
        ),
      );
    if (untagged.length > 0) {
      const toApply = new Set(untagged.map((row) => row.id));
      const tags = SEED_INGREDIENTS.filter((item) =>
        toApply.has(seedId.ingredient(item.slug)),
      ).flatMap((item) =>
        (item.allergens ?? []).map((slug) => ({
          ingredientId: seedId.ingredient(item.slug),
          allergenId: seedId.allergen(slug),
        })),
      );
      if (tags.length > 0) {
        await tx.insert(ingredientAllergens).values(tags).onConflictDoNothing();
      }
      await tx
        .update(ingredients)
        .set({ allergensChecked: true })
        .where(inArray(ingredients.id, [...toApply]));
    }

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
      ...SEED_ALLERGENS.flatMap((allergen) =>
        translationRows('allergen', seedId.allergen(allergen.slug), allergen),
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
    for (const [id, normalizedValue] of RETIRED_SEED_NAMES) {
      await tx
        .delete(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.id, id),
            eq(catalogTranslations.normalizedValue, normalizedValue),
          ),
        );
    }

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
    const shared = catalogScope(SHARED_ONLY).translations(tx);
    const ambiguous = await tx
      .select({ key: shared.normalizedValue })
      .from(shared)
      .where(eq(shared.entityType, 'ingredient'))
      .groupBy(shared.normalizedValue)
      .having(sql`count(distinct ${shared.entityId}) > 1`);
    if (ambiguous.length > 0) {
      console.warn(
        `Catalog: ${ambiguous.length} name(s) or Synonym(s) belong to more than one Ingredient: ${ambiguous.map((row) => `"${row.key}"`).join(', ')}`,
      );
    }
  });
}
