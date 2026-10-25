import type { CatalogLocale } from './catalog.schemas';
import { seedId } from './seed/seed-ids';

/**
 * Popular to start: the Ingredients the Add to Pantry sheet offers a Family with nothing Recently
 * Stocked. A fixed list of Catalog Ingredient slugs per UI locale, in display order (at most 8).
 */
export const POPULAR_TO_START_SLUGS: Readonly<
  Record<CatalogLocale, readonly string[]>
> = {
  en: [
    'milk',
    'eggs',
    'butter',
    'bread',
    'banana',
    'onion',
    'rice',
    'olive-oil',
  ],
  ro: [
    'milk',
    'eggs',
    'bread',
    'potato',
    'onion',
    'sunflower-oil',
    'flour',
    'sugar',
  ],
  da: [
    'milk',
    'eggs',
    'rye-bread',
    'butter',
    'potato',
    'onion',
    'oats',
    'rapeseed-oil',
  ],
};

/** The Ingredient ids of the Popular to start list for a locale. */
export function popularToStartIds(locale: CatalogLocale): string[] {
  return POPULAR_TO_START_SLUGS[locale].map((slug) => seedId.ingredient(slug));
}
