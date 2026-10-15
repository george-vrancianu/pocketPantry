/**
 * Open Food Facts allergen tags onto the seeded Allergen slugs (the EU 14, ADR 0014).
 * Fixed in code, not curated by Admins: a tag not listed here is ignored.
 */
const SLUG_BY_TAG: Readonly<Record<string, string>> = {
  'en:gluten': 'gluten',
  'en:crustaceans': 'crustaceans',
  'en:eggs': 'eggs',
  'en:fish': 'fish',
  'en:peanuts': 'peanuts',
  'en:soybeans': 'soy',
  'en:milk': 'milk',
  'en:nuts': 'tree-nuts',
  'en:celery': 'celery',
  'en:mustard': 'mustard',
  'en:sesame-seeds': 'sesame',
  'en:sulphur-dioxide-and-sulphites': 'sulphites',
  'en:lupin': 'lupin',
  'en:molluscs': 'molluscs',
};

/** The Allergen slugs a product's `allergens_tags` name, once each, in tag order. */
export function allergenSlugsOf(tags: readonly string[] | undefined): string[] {
  const slugs = (tags ?? []).flatMap((tag) => {
    const slug = SLUG_BY_TAG[tag];
    return slug ? [slug] : [];
  });
  return [...new Set(slugs)];
}
