import { z } from 'zod';

// Scan-facing snapshot of the Catalog: canonical English Ingredient names and
// their Leaf Category names. Display names and Synonyms live in src/catalog.
export type CatalogIngredient = {
  id: string;
  name: string;
  defaultUnit: string;
  category: string;
};

export type IngredientCatalog = {
  categories: string[];
  ingredients: CatalogIngredient[];
};

export type CatalogMatch = {
  matchedIngredientId: string | null;
  matchedIngredientName: string | null;
  matchedIngredientDefaultUnit: string | null;
  matchedCategory: string | null;
  matchConfidence: number;
};

function canonicalCategory(
  catalog: IngredientCatalog,
  candidate: string | null,
): string | null {
  if (!candidate) return null;
  const normalized = candidate.trim().toLocaleLowerCase();
  return (
    catalog.categories.find(
      (category) => category.toLocaleLowerCase() === normalized,
    ) ?? null
  );
}

/** A proposed Ingredient the Catalog does not hold: Unmatched, with no confidence. */
const rejectedMatch = (
  catalog: IngredientCatalog,
  candidate: { matchedCategory: string | null },
): CatalogMatch => ({
  matchedIngredientId: null,
  matchedIngredientName: null,
  matchedIngredientDefaultUnit: null,
  matchedCategory: canonicalCategory(catalog, candidate.matchedCategory),
  matchConfidence: 0,
});

export function validateCatalogMatch(
  catalog: IngredientCatalog,
  candidate: {
    matchedIngredientId: string | null;
    matchedCategory: string | null;
    matchConfidence: number;
  },
): CatalogMatch {
  const ingredient = candidate.matchedIngredientId
    ? catalog.ingredients.find(
        (item) => item.id === candidate.matchedIngredientId,
      )
    : undefined;

  if (candidate.matchedIngredientId && !ingredient) {
    return rejectedMatch(catalog, candidate);
  }

  if (ingredient) {
    return {
      matchedIngredientId: ingredient.id,
      matchedIngredientName: ingredient.name,
      matchedIngredientDefaultUnit: ingredient.defaultUnit,
      matchedCategory: ingredient.category,
      matchConfidence: candidate.matchConfidence,
    };
  }

  return {
    matchedIngredientId: null,
    matchedIngredientName: null,
    matchedIngredientDefaultUnit: null,
    matchedCategory: canonicalCategory(catalog, candidate.matchedCategory),
    matchConfidence: candidate.matchConfidence,
  };
}

/**
 * The Catalog as text for the model. Every Scan and Voice Note sends exactly
 * this text, so the provider's prompt cache is shared between them.
 *
 * Each Ingredient is a tuple `[index, name, category]`: its position in
 * `catalog.ingredients` stands in for its id, because a UUID costs the model
 * around 20 tokens and a short index one or two. The model answers with that
 * index; `ingredientIdAt` on the same `catalog` turns it back into the id.
 */
export function catalogPrompt(catalog: IngredientCatalog): string {
  return JSON.stringify({
    categories: catalog.categories,
    ingredients: catalog.ingredients.map((ingredient, index) => [
      index,
      ingredient.name,
      ingredient.category,
    ]),
  });
}

/**
 * The id of the Ingredient the model named by `index` in `catalogPrompt(catalog)`.
 * Pass the very `catalog` the prompt was built from, so a Catalog refresh in
 * between cannot remap an index. Anything that is not an index of that
 * Catalog (out of range, negative, fractional, a string, an old UUID) names no
 * Ingredient: null, so the item is Unmatched rather than an error.
 */
export function ingredientIdAt(
  catalog: IngredientCatalog,
  index: unknown,
): string | null {
  if (typeof index !== 'number' || !Number.isInteger(index)) return null;
  return catalog.ingredients[index]?.id ?? null;
}

/**
 * `validateCatalogMatch` for a Match the model gave by index into
 * `catalogPrompt(catalog)`: the index becomes its Ingredient id first, so the
 * check is the same as for an id. An index the Catalog does not hold is
 * rejected like an invented id.
 */
export function validateIndexedMatch(
  catalog: IngredientCatalog,
  candidate: {
    matchedIngredientId: number | null;
    matchedCategory: string | null;
    matchConfidence: number;
  },
): CatalogMatch {
  const id = ingredientIdAt(catalog, candidate.matchedIngredientId);
  return candidate.matchedIngredientId !== null && id === null
    ? rejectedMatch(catalog, candidate)
    : validateCatalogMatch(catalog, { ...candidate, matchedIngredientId: id });
}

/** Stands in for a model value that is not a number: an index no Catalog holds. */
const NOT_AN_INDEX = -1;

/**
 * An Ingredient reference as the model writes it: an index from
 * `catalogPrompt`, or null. Loose on purpose: any number passes and anything
 * else becomes an index no Catalog holds, so `ingredientIdAt` makes the item
 * Unmatched rather than the whole reply invalid.
 */
export const catalogIndexSchema = z
  .preprocess(
    (value) =>
      value === null || typeof value === 'number' ? value : NOT_AN_INDEX,
    z.number().nullable(),
  )
  .describe(
    'The index (first tuple element) of the matching application catalog ingredient, or null.',
  );
