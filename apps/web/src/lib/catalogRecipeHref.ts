/**
 * Where a link to a Catalog Recipe lands: the Family's live copy when it has
 * one, else the Explore preview. Every Catalog Recipe link goes through this.
 */
export const catalogRecipeHref = (
  catalogId: string,
  familyCopyId: string | null | undefined,
) =>
  familyCopyId ? `/recipes/${familyCopyId}` : `/recipes/explore/${catalogId}`;
