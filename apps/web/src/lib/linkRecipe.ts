import { useMutation } from '@tanstack/react-query';
import type { BaseRecipeOption } from '../components/BaseRecipePicker';
import { apiRequest } from './api';
import type { FamilyRecipeDraft } from './familyRecipes';

/** What a link was read into (mirror of the API's `RecipeFromLink`): an unsaved draft and where it came from. */
export type RecipeFromLink = {
  kind: 'draft';
  /** Like a "Make a variant" draft, but with no base yet and Servings possibly unknown. */
  draft: Omit<FamilyRecipeDraft, 'parentId' | 'servings'> & {
    servings: number | null;
  };
  /** The normalised link of the page. */
  sourceLink: string;
  /** The closest Base Recipes to offer as the base; empty until matching them is built. */
  closestBases: BaseRecipeOption[];
};

export type ReadLinkInput = {
  url: string;
  /** Aborting it abandons the read on this side; the caller must then ignore the outcome. */
  signal?: AbortSignal;
};

/** Read the recipe on a web page into a draft; nothing is saved. */
export function useReadRecipeLink() {
  return useMutation({
    mutationFn: ({ url, signal }: ReadLinkInput) =>
      apiRequest<RecipeFromLink>('/recipes/from-link', {
        method: 'POST',
        body: { url },
        ...(signal ? { signal } : {}),
      }),
  });
}
