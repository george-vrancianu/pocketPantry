import type { RecipeOwner } from './recipes';

/**
 * Where a link to a Recipe lands. A Family Recipe opens as itself. A Catalog
 * Recipe opens as the Family's live copy when it has one, else as its Explore
 * preview. Every Recipe link that may point at the Catalog goes through this.
 */
export const catalogRecipeHref = (recipe: {
  id: string;
  owner: RecipeOwner;
  familyCopyId?: string | null;
}) =>
  recipe.owner === 'family'
    ? `/recipes/${recipe.id}`
    : recipe.familyCopyId
      ? `/recipes/${recipe.familyCopyId}`
      : `/recipes/explore/${recipe.id}`;
