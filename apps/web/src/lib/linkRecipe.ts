import { useMutation } from '@tanstack/react-query';
import type { BaseRecipeOption } from '../components/BaseRecipePicker';
import { apiRequest } from './api';
import type { FamilyRecipeDraft } from './familyRecipes';

/** What a link was read into (mirror of the API's `RecipeFromLink`): an unsaved draft and where it came from. */
export type RecipeFromLink = RecipeFromLinkDraft | RecipeFromLinkDuplicate;

/** The link is already a live Recipe of the Family (and `force` was not sent): nothing was read. */
export type RecipeFromLinkDuplicate = { kind: 'duplicate'; recipeId: string };

export type RecipeFromLinkDraft = {
  kind: 'draft';
  /** Like a "Make a variant" draft, but with no base yet and Servings possibly unknown. */
  draft: Omit<FamilyRecipeDraft, 'parentId' | 'servings'> & {
    servings: number | null;
  };
  /** The normalised link of the page. */
  sourceLink: string;
  /** The page's language (a lower-case code like "fr") when the draft was translated from it; null when not. */
  sourceLanguage: string | null;
  /** The closest Base Recipes to offer as the base, ranked as for a Plate Scan. */
  closestBases: BaseRecipeOption[];
  /** How many of the closest "Hide Recipes with my Allergies" left out. */
  hiddenByAllergiesCount: number;
};

/** `catalog`: write the Recipe in the Member's Catalog Language; `source`: keep the page's language. */
export type ReadingLanguage = 'catalog' | 'source';

export type ReadLinkInput = {
  url: string;
  language: ReadingLanguage;
  /** Read even though the link is already one of the Family's Recipes. */
  force?: boolean;
  /** Aborting it abandons the read on this side; the caller must then ignore the outcome. */
  signal?: AbortSignal;
};

/** Read the recipe on a web page into a draft; nothing is saved. */
export function useReadRecipeLink() {
  return useMutation({
    mutationFn: ({ url, language, force, signal }: ReadLinkInput) =>
      apiRequest<RecipeFromLink>('/recipes/from-link', {
        method: 'POST',
        body: { url, language, ...(force ? { force } : {}) },
        ...(signal ? { signal } : {}),
      }),
  });
}
