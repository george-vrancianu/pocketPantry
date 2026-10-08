import type { ingredientUnit, storageLocation } from '../../database/schema';

export type Location = (typeof storageLocation.enumValues)[number];
export type Unit = (typeof ingredientUnit.enumValues)[number];

export type SeedAisle = {
  slug: string;
  en: string;
  ro: string;
  da: string;
  sortOrder: number;
};

export type SeedParent = {
  slug: string;
  en: string;
  ro: string;
  da: string;
  aisle: string; // Aisle slug
  defaultExpiryDays: number | null;
  defaultLocation: Location | null;
};

export type SeedLeaf = {
  slug: string;
  parent: string;
  en: string;
  ro: string;
  da: string;
  defaultExpiryDays?: number;
  defaultLocation?: Location;
  /** The Parent's catch-all Leaf for Unmatched Batches: exactly one per Parent. */
  isOther?: boolean;
};

export type SeedIngredient = {
  slug: string;
  leaf: string;
  en: string;
  ro: string;
  da: string;
  unit: Unit;
  synonyms?: { en?: string[]; ro?: string[]; da?: string[] };
};

/**
 * A row as the per-Parent data files declare it. Danish names and Synonyms
 * live in data/danish.ts and are merged in by catalog-seed-data.ts.
 */
export type DeclaredRow<T> = Omit<T, 'da'>;

/** A declared Ingredient may carry en and ro Synonyms only; Danish ones are merged in. */
export type DeclaredIngredient = Omit<SeedIngredient, 'da' | 'synonyms'> & {
  synonyms?: { en?: string[]; ro?: string[] };
};

/** What one Parent Category's data file contributes. */
export type SeedSection = {
  leaves: DeclaredRow<SeedLeaf>[];
  ingredients: DeclaredIngredient[];
};

export const leaf = (
  slug: string,
  parentSlug: string,
  en: string,
  ro: string,
  defaultExpiryDays: number,
  defaultLocation: Location,
): DeclaredRow<SeedLeaf> => ({
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
): DeclaredIngredient[] =>
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
