import { z } from 'zod';
import type { ingredientUnit } from '../database/schema';
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

export const catalogSearchQuery = z.object({
  q: z.string().max(100),
  // Browse by aisle: an empty `q` lists the Aisle's Ingredients A to Z (limit 50); with `q` it filters within.
  aisleId: z.uuid().optional(),
  parentCategoryId: z.uuid().optional(),
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  // 'shared' searches the shared Catalog only: Admin curation and Catalog Recipe editing.
  scope: z.enum(['family', 'shared']).default('family'),
});
export type CatalogSearchQuery = z.infer<typeof catalogSearchQuery>;

export const catalogParentsQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});
export type CatalogParentsQuery = z.infer<typeof catalogParentsQuery>;

export type CatalogParent = { id: string; name: string };

export const catalogAislesQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  scope: z.enum(['family', 'shared']).default('family'),
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

export type CatalogSearchResult = {
  id: string;
  name: string;
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
