import type { RecipeOwner } from './recipes';

/** A Family Recipe's own page. */
export const familyRecipeHref = (id: string) => `/recipes/${id}`;

/**
 * Where a link to a Recipe lands. A Family Recipe opens as itself. A Catalog
 * Recipe opens as the Family's live copy when it has one, else as its Explore
 * preview. Every Recipe link that may point at the Catalog goes through this.
 */
export const recipeHref = (recipe: {
  id: string;
  owner: RecipeOwner;
  familyCopyId?: string | null;
}) =>
  recipe.owner === 'family'
    ? familyRecipeHref(recipe.id)
    : recipe.familyCopyId
      ? familyRecipeHref(recipe.familyCopyId)
      : `/recipes/explore/${recipe.id}`;
