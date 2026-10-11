/** Every locale's Suggestions; refetch after anything that changes the Pantry, the list or the Staples. */
export const suggestionsQueryKey = ['suggestions'] as const;

/** Every Template's detail view; its `inPantry` flags go stale when the Pantry changes. */
export const templateDetailsQueryKey = [
  'shopping-templates',
  'detail',
] as const;
