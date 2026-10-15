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

/** Everything a Catalog change makes stale: search, the Family catalog, Staples, and the Unmatched items it relinks (Batches, Shopping Items, Template lines, Recipe lines) with the Suggestions built on them. Literals, as the owning modules cannot be imported here without a cycle. */
export const catalogChangeQueryKeys = [
  ['catalog-search'],
  ['family-catalog'],
  ['staples'],
  ['pantry'],
  ['shopping-list'],
  ['shopping-templates'],
  ['recipes'],
  suggestionsQueryKey,
] as const;
