import type { ingredientUnit, storageLocation } from '../../database/schema';

export type Location = (typeof storageLocation.enumValues)[number];
export type Unit = (typeof ingredientUnit.enumValues)[number];

export type SeedAisle = {
  slug: string;
  en: string;
  ro: string;
  sortOrder: number;
};

export type SeedParent = {
  slug: string;
  en: string;
  ro: string;
  aisle: string; // Aisle slug
  defaultExpiryDays: number | null;
  defaultLocation: Location | null;
};

export type SeedLeaf = {
  slug: string;
  parent: string;
  en: string;
  ro: string;
  defaultExpiryDays?: number;
  defaultLocation?: Location;
};

export type SeedIngredient = {
  slug: string;
  leaf: string;
  en: string;
  ro: string;
  unit: Unit;
  synonyms?: { en?: string[]; ro?: string[] };
};

/** What one Parent Category's data file contributes. */
export type SeedSection = {
  leaves: SeedLeaf[];
  ingredients: SeedIngredient[];
};

export const leaf = (
  slug: string,
  parentSlug: string,
  en: string,
  ro: string,
  defaultExpiryDays: number,
  defaultLocation: Location,
): SeedLeaf => ({
  slug,
  parent: parentSlug,
  en,
  ro,
  defaultExpiryDays,
  defaultLocation,
});

/** [slug, English name, Romanian name, unit, English Synonyms?, Romanian Synonyms?] */
export type IngredientRow = [
  slug: string,
  en: string,
  ro: string,
  unit: Unit,
  enSynonyms?: string[],
  roSynonyms?: string[],
];

/** Every row in `rows` belongs to the Leaf Category `leafSlug`. */
export const ingredientsOf = (
  leafSlug: string,
  rows: IngredientRow[],
): SeedIngredient[] =>
  rows.map(([slug, en, ro, unit, enSynonyms, roSynonyms]) => ({
    slug,
    leaf: leafSlug,
    en,
    ro,
    unit,
    ...(enSynonyms || roSynonyms
      ? { synonyms: { en: enSynonyms, ro: roSynonyms } }
      : {}),
  }));
