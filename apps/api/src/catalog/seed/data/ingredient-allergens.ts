// The Allergens each shared Ingredient contains, keyed by Ingredient slug, with
// Allergen slugs from ../allergens.ts. They sit apart from the per-Parent data
// files so the tagging reads as one list; catalog-seed-data.ts merges them in.
// A shared Ingredient with no entry contains none (ADR 0014), so every entry
// here is a claim an Admin can rely on: tag only what the Ingredient contains.
// A handful are tagged so far; #354 tags the rest and makes the declaration required.

export const SEED_INGREDIENT_ALLERGENS: Record<string, string[]> = {
  parmesan: ['milk'],
  butter: ['milk'],
  milk: ['milk'],
  eggs: ['eggs'],
  flour: ['gluten'],
  peanuts: ['peanuts'],
};
