/** Where a Recipe opens: its preview when the Catalog Recipe is being previewed, else its detail page. */
export const recipeHref = (id: string, preview: boolean) =>
  `${preview ? '/recipes/explore' : '/recipes'}/${id}`;
