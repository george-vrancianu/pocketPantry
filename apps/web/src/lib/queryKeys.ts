/** Every Cook Tonight view and Recipe Pantry match ('recipes' must match `recipesQueryKey`, which cannot be imported here without a cycle); refetch after anything that changes the Pantry. */
export const recipeMatchingQueryKeys = [
  ['recipes', 'cook-tonight'],
  ['recipes', 'pantry-match'],
] as const;

/** Every locale's Suggestions; refetch after anything that changes the Pantry, the list or the Staples. */
export const suggestionsQueryKey = ['suggestions'] as const;

/** Every Template's detail view; its `inPantry` flags go stale when the Pantry changes. */
export const templateDetailsQueryKey = [
  'shopping-templates',
  'detail',
] as const;

/** Every Recipe's Pantry match; its per-line "on your list" status goes stale when the Shopping List changes ('recipes' must match `recipesQueryKey`). */
export const pantryMatchesQueryKey = ['recipes', 'pantry-match'] as const;

/** The Family's Recently Stocked Ingredients. Under `['pantry']`, so anything that invalidates the Pantry (Scan save, Finish Shopping, relink, a Batch change) refetches it. */
export const recentlyStockedQueryKey = ['pantry', 'recently-stocked'] as const;
