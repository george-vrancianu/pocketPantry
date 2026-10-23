/** Every Meal Plan read: the Widget's window and the plan pages. The Plan Forecast goes stale when the Pantry, the Shopping List, the Recipes or the plans change. */
export const mealPlanQueryKey = ['meal-plans'] as const;

/** Every Cook Tonight view, Recipe Pantry match and Meal Plan forecast ('recipes' must match `recipesQueryKey`, which cannot be imported here without a cycle); refetch after anything that changes the Pantry. */
export const recipeMatchingQueryKeys = [
  ['recipes', 'cook-tonight'],
  ['recipes', 'pantry-match'],
  mealPlanQueryKey,
] as const;

/** Every Suggestions read; refetch after anything that changes the Pantry, the list or the Staples. */
export const suggestionsQueryKey = ['suggestions'] as const;

/** Every Template's detail view; its `inPantry` flags go stale when the Pantry changes. */
export const templateDetailsQueryKey = [
  'shopping-templates',
  'detail',
] as const;

/** Every Recipe's Pantry match; its per-line "on your list" status goes stale when the Shopping List changes ('recipes' must match `recipesQueryKey`). */
export const pantryMatchesQueryKey = ['recipes', 'pantry-match'] as const;

/** Everything a Shopping List change makes stale: Suggestions, the Recipe Pantry matches and the Meal Plan forecast's "on list" flags. */
export const shoppingListChangeQueryKeys = [
  suggestionsQueryKey,
  pantryMatchesQueryKey,
  mealPlanQueryKey,
] as const;

/** Everything a Recipe change (edit, archive, new variant, Catalog rename) makes stale: every Recipe query and the Meal Plan forecast, whose slots may turn unavailable ('recipes' must match `recipesQueryKey`). */
export const recipeChangeQueryKeys = [['recipes'], mealPlanQueryKey] as const;

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
  mealPlanQueryKey,
  suggestionsQueryKey,
] as const;
