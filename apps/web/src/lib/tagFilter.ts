import { useRecipes, type RecipeBrowse, type RecipeListItem } from './recipes';
import type { RecipeTag } from './tags';

/** Whether a Recipe has every one of the Tags (AND). */
export function hasEveryTag(
  recipe: Pick<RecipeListItem, 'tags'>,
  tagIds: readonly string[],
): boolean {
  return tagIds.every((id) => recipe.tags.some((tag) => tag.id === id));
}

/**
 * How many of the loaded Recipes a Member would see with `tagIds` picked: the Recipes of the
 * search's scope that have all of them. Computed on the client from the loaded list (#711).
 */
export function countWithTags(
  scope: readonly RecipeListItem[],
  tagIds: readonly string[],
): number {
  return scope.filter((recipe) => hasEveryTag(recipe, tagIds)).length;
}

/** One "Without {Tag} n" button: the Tag to drop and how many Recipes that would show. */
export type RelaxStep =
  | { kind: 'tag'; tagId: string; count: number }
  | { kind: 'search'; count: number };

/**
 * What loosening the filter by one step would show: each picked Tag dropped in turn (search kept),
 * and, with text typed, the text dropped (Tags kept). `withoutSearch` is the count for that last
 * step, which the loaded list (already narrowed by the text) cannot answer.
 */
export function relaxSteps(
  scope: readonly RecipeListItem[],
  tagIds: readonly string[],
  search: string,
  withoutSearch: number | undefined,
): RelaxStep[] {
  const steps: RelaxStep[] = tagIds.map((tagId) => ({
    kind: 'tag',
    tagId,
    count: countWithTags(
      scope,
      tagIds.filter((id) => id !== tagId),
    ),
  }));
  if (search.trim() !== '') {
    steps.push({ kind: 'search', count: withoutSearch ?? 0 });
  }
  return steps;
}

/**
 * The Recipes in one scope narrowed by the text search only (Variants listed): the base of the
 * option counts and the relax buttons. Off until the sheet or the no-match state needs it.
 * Same Allergy rule as the page's own list, so counts agree with what it shows.
 */
export function useTagScope(
  browse: RecipeBrowse,
  {
    scope,
    showHidden,
    enabled,
  }: { scope: 'family' | 'catalog'; showHidden: boolean; enabled: boolean },
) {
  return useRecipes(
    { ...browse, tagIds: [] },
    { includeVariants: true, scope, showHidden, enabled },
  );
}

/** The Recipes with the Tags picked but no text: the "Without “text”" count. */
export function useTagsOnly(
  browse: RecipeBrowse,
  {
    scope,
    showHidden,
    enabled,
  }: { scope: 'family' | 'catalog'; showHidden: boolean; enabled: boolean },
) {
  return useRecipes(
    { ...browse, search: '' },
    { includeVariants: true, scope, showHidden, enabled },
  );
}

/** The picked Tags as options, in the order picked. A Tag no longer on offer is left out. */
export function pickedTags(
  options: readonly RecipeTag[],
  tagIds: readonly string[],
): RecipeTag[] {
  return tagIds.flatMap((id) => {
    const found = options.find((tag) => tag.id === id);
    return found ? [found] : [];
  });
}
