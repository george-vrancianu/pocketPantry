import { z } from 'zod';
import type { ingredientUnit } from '../database/schema';
import type { ResolvedCatalogDefaults } from './catalog-defaults';

export const CATALOG_LOCALES = ['en', 'ro'] as const;
export type CatalogLocale = (typeof CATALOG_LOCALES)[number];
export const FALLBACK_LOCALE: CatalogLocale = 'en';

export const catalogSearchQuery = z.object({
  q: z.string().max(100),
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type CatalogSearchQuery = z.infer<typeof catalogSearchQuery>;

export type CatalogSearchResult = {
  id: string;
  name: string;
  defaultUnit: (typeof ingredientUnit.enumValues)[number];
  leafCategory: { id: string; name: string };
  parentCategory: { id: string; name: string; aisle: string };
  /** Default Expiry (days) and Location, resolved Leaf then Parent. */
  defaults: ResolvedCatalogDefaults;
};
