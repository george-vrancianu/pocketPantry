import { z } from 'zod';
import { ingredientUnit } from '../database/schema';
import type { ResolvedCatalogDefaults } from './catalog-defaults';
import type { AmountScale } from './amount-scale';

export const CATALOG_LOCALES = ['en', 'ro', 'da'] as const;
export type CatalogLocale = (typeof CATALOG_LOCALES)[number];
export const FALLBACK_LOCALE: CatalogLocale = 'en';

/**
 * The languages a Scan can be read in, chosen per Scan and independent of the
 * UI locale. Wider than the catalog locales: a Synonym may be in any of them,
 * a display name only in a catalog locale.
 */
export const SCAN_LANGUAGES = ['en', 'ro', 'da'] as const;
export type ScanLanguage = (typeof SCAN_LANGUAGES)[number];

/** 'shared' reads the shared Catalog only: Admin curation and Catalog Recipe editing. */
export const catalogScopeParam = z.enum(['family', 'shared']).default('family');

export const catalogSearchQuery = z.object({
  q: z.string().max(100),
  // Browse by aisle: an empty `q` lists the Aisle's Ingredients A to Z (limit 50); with `q` it filters within.
  aisleId: z.uuid().optional(),
  parentCategoryId: z.uuid().optional(),
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  scope: catalogScopeParam,
});
export type CatalogSearchQuery = z.infer<typeof catalogSearchQuery>;

export const catalogParentsQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});
export type CatalogParentsQuery = z.infer<typeof catalogParentsQuery>;

export type CatalogParent = { id: string; name: string };

export const catalogAislesQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  scope: catalogScopeParam,
});
export type CatalogAislesQuery = z.infer<typeof catalogAislesQuery>;

/** An Aisle with its Parent Categories, for Browse by aisle. */
export type CatalogAisle = {
  id: string;
  name: string;
  parentCategories: CatalogParent[];
};

/** An empty-`q` Aisle listing returns at most this many Ingredients. */
export const AISLE_LISTING_LIMIT = 50;

export const familyIngredientQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});

export const familyIngredientBody = z.object({
  name: z.string().trim().min(1).max(100),
  leafCategoryId: z.uuid(),
  defaultUnit: z.enum(ingredientUnit.enumValues),
});
export type FamilyIngredientBody = z.infer<typeof familyIngredientBody>;

export const familySynonymBody = z.object({
  name: z.string().trim().min(1).max(100),
  ingredientId: z.uuid(),
});
export type FamilySynonymBody = z.infer<typeof familySynonymBody>;

export const familyIngredientPatchBody = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    leafCategoryId: z.uuid().optional(),
  })
  .refine(
    (body) => body.name !== undefined || body.leafCategoryId !== undefined,
  );
export type FamilyIngredientPatchBody = z.infer<
  typeof familyIngredientPatchBody
>;

export const idParam = z.object({ id: z.uuid() });
export type IdParam = z.infer<typeof idParam>;

/** What uses a Family Ingredient: shown in the delete confirmation. */
export type FamilyIngredientUsage = {
  batches: number;
  shoppingItems: number;
  templateLines: number;
  recipeLines: number;
  staples: number;
};

/** The Family catalog: Family Ingredients (with usage) and Family Synonyms. */
export type FamilyCatalog = {
  ingredients: Array<CatalogSearchResult & { usage: FamilyIngredientUsage }>;
  synonyms: Array<{
    id: string;
    name: string;
    ingredient: { id: string; name: string };
  }>;
};

export const catalogCategoriesQuery = z.object({
  q: z.string().max(100).default(''),
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type CatalogCategoriesQuery = z.infer<typeof catalogCategoriesQuery>;

/** A Leaf Category to file a Family Ingredient under, with where it sits and its effective defaults. */
export type CatalogCategory = {
  id: string;
  name: string;
  parentCategory: { id: string; name: string };
  aisle: { id: string; name: string };
  defaults: ResolvedCatalogDefaults;
};

export type CatalogSearchResult = {
  id: string;
  name: string;
  /** 'family' for a Family Ingredient (ADR 0011), 'catalog' for a shared row. */
  owner: 'catalog' | 'family';
  defaultUnit: (typeof ingredientUnit.enumValues)[number];
  /** How much a Member usually buys at once; always present, medium when unset. */
  amountScale: AmountScale;
  leafCategory: { id: string; name: string };
  parentCategory: {
    id: string;
    name: string;
    aisle: { id: string; name: string };
  };
  /** Default Expiry (days) and Location, resolved Leaf then Parent. */
  defaults: ResolvedCatalogDefaults;
};
