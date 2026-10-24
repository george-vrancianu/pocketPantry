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
  /** The normalised link of the page; null for pasted text. */
  sourceLink: string | null;
  /** The page's language (a lower-case code like "fr") when the draft was translated from it; null when not. */
  sourceLanguage: string | null;
  /** The closest Base Recipes to offer as the base; empty until matching them is built. */
  closestBases: BaseRecipeOption[];
};

/** The longest link the link field takes. */
export const MAX_LINK_LENGTH = 2048;
/** The longest pasted text the text field takes (the API refuses more). */
export const MAX_PASTED_TEXT_LENGTH = 50_000;

/** `catalog`: write the Recipe in the Member's Catalog Language; `source`: keep the page's language. */
export type ReadingLanguage = 'catalog' | 'source';

/** What to read: a link or pasted text, never both. */
export type ReadLinkInput = (
  { url: string; text?: never } | { text: string; url?: never }
) & {
  language: ReadingLanguage;
  /** Aborting it abandons the read on this side; the caller must then ignore the outcome. */
  signal?: AbortSignal;
};

/** Read the recipe on a web page into a draft; nothing is saved. */
export function useReadRecipeLink() {
  return useMutation({
    mutationFn: ({ url, text, language, signal }: ReadLinkInput) =>
      apiRequest<RecipeFromLink>('/recipes/from-link', {
        method: 'POST',
        body: { ...(url !== undefined ? { url } : { text }), language },
        ...(signal ? { signal } : {}),
      }),
  });
}
