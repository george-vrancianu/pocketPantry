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
    return {
      matchedIngredientId: null,
      matchedIngredientName: null,
      matchedIngredientDefaultUnit: null,
      matchedCategory: canonicalCategory(catalog, candidate.matchedCategory),
      matchConfidence: 0,
    };
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
