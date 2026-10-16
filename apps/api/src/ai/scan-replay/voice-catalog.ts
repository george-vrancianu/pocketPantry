// The Catalog a Voice Note replay sends: the real seed Catalog, built the way
// IngredientCatalogService builds it for a Member, so tokens, cost, latency and Matching
// difficulty match production.
import {
  SEED_INGREDIENTS,
  SEED_LEAVES,
} from '../../catalog/seed/catalog-seed-data';
import { seedId } from '../../catalog/seed/seed-ids';
import {
  CATALOG_LOCALES,
  type CatalogLocale,
} from '../../catalog/catalog.schemas';
import { normalizeName } from '../../catalog/normalize';
import {
  catalogPrompt,
  type IngredientCatalog,
} from '../../ingredients/ingredient-catalog';

export type VoiceCatalogIngredient = {
  id: string;
  /** Leaf Category name (English, as the Catalog text carries it). */
  category: string;
  defaultUnit: string;
  names: Record<CatalogLocale, string>;
  /** Synonyms by locale, as seeded. */
  synonyms: Record<CatalogLocale, string[]>;
};

export type VoiceCatalog = {
  categories: string[];
  ingredients: VoiceCatalogIngredient[];
};

const byName = new Intl.Collator('en');

/**
 * Every seeded Ingredient with its seed id, ordered as IngredientCatalogService orders a
 * Member's Catalog: by Leaf Category name, then Ingredient name (both English).
 */
export function seedVoiceCatalog(): VoiceCatalog {
  const leafName = new Map(SEED_LEAVES.map((leaf) => [leaf.slug, leaf.en]));
  const ingredients = SEED_INGREDIENTS.map((item): VoiceCatalogIngredient => ({
    id: seedId.ingredient(item.slug),
    category: leafName.get(item.leaf) ?? '',
    defaultUnit: item.unit,
    names: { en: item.en, ro: item.ro, da: item.da },
    synonyms: {
      en: item.synonyms?.en ?? [],
      ro: item.synonyms?.ro ?? [],
      da: item.synonyms?.da ?? [],
    },
  })).sort(
    (a, b) =>
      byName.compare(a.category, b.category) ||
      byName.compare(a.names.en, b.names.en),
  );
  return {
    categories: SEED_LEAVES.map((leaf) => leaf.en).sort(byName.compare),
    ingredients,
  };
}

/** The Ingredient's name in `locale`, English when the locale has none (as the display names do). */
export const nameIn = (
  ingredient: VoiceCatalogIngredient,
  locale: CatalogLocale,
) => ingredient.names[locale] || ingredient.names.en;

/** The Catalog with names in `locale`: what `getCatalogIn` hands the model. */
export function catalogIn(
  catalog: VoiceCatalog,
  locale: CatalogLocale,
): IngredientCatalog {
  return {
    categories: catalog.categories,
    ingredients: catalog.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: nameIn(ingredient, locale),
      defaultUnit: ingredient.defaultUnit,
      category: ingredient.category,
    })),
  };
}

/** The Catalog text a read sends, in one locale: the production `catalogPrompt`. */
export const catalogTextFor = (catalog: VoiceCatalog, locale: CatalogLocale) =>
  catalogPrompt(catalogIn(catalog, locale));

const claimsOf = new WeakMap<VoiceCatalog, Map<string, Set<string>>>();

function claims(catalog: VoiceCatalog): Map<string, Set<string>> {
  let map = claimsOf.get(catalog);
  if (!map) {
    map = new Map();
    for (const ingredient of catalog.ingredients) {
      for (const locale of CATALOG_LOCALES) {
        for (const name of [
          ingredient.names[locale],
          ...ingredient.synonyms[locale],
        ]) {
          const key = normalizeName(name);
          if (!key) continue;
          const ids = map.get(key) ?? new Set<string>();
          ids.add(ingredient.id);
          map.set(key, ids);
        }
      }
    }
    claimsOf.set(catalog, map);
  }
  return map;
}

/**
 * The Ingredient an exact normalised name or Synonym (any locale) names, trying `names` in
 * order, as `CatalogSearchService.findExact` does for the shared Catalog. A name that
 * several Ingredients claim is skipped (it stays Unmatched).
 */
export function exactIngredient(
  catalog: VoiceCatalog,
  names: readonly string[],
): VoiceCatalogIngredient | null {
  const table = claims(catalog);
  for (const name of names) {
    const ids = table.get(normalizeName(name));
    if (ids?.size !== 1) continue;
    const [id] = ids;
    return catalog.ingredients.find((i) => i.id === id) ?? null;
  }
  return null;
}
