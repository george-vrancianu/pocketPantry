import { z } from 'zod';
import { guidanceBody, type GuidanceBody } from './recipe-guidance.schemas';
import { familyLineInput, recipeDocument, MAX_LINES } from './recipes.schemas';

/** Structured-output schema name of a Suggest Guidance answer. */
export const GUIDANCE_SUGGESTION_SCHEMA_NAME = 'recipe_guidance_suggestion';

/** The three fields of Guidance, in the order the form shows them. */
export const GUIDANCE_FIELDS = [
  'pairings',
  'nutritionNote',
  'eatingMoments',
] as const;
export type GuidanceField = (typeof GUIDANCE_FIELDS)[number];

/**
 * The fields Suggest Guidance proposes. Tracer: the Nutrition Note only. Pairings and
 * Eating Moments join this list when their proposal is built; the request, the empty check
 * and the response already carry all three.
 */
export const COVERED_GUIDANCE_FIELDS: readonly GuidanceField[] = [
  'nutritionNote',
];

/** The page's current Recipe content, as the Family Recipe form holds it (unsaved edits included). */
const suggestionRecipe = recipeDocument.extend({
  lines: z.array(familyLineInput).max(MAX_LINES).default([]),
});

/**
 * Suggest Guidance for a Family Recipe (ADR 0026): what the page holds now, and the Guidance
 * already on the form (all of it, so the empty fields can be told).
 */
export const suggestGuidanceBody = z
  .object({
    recipe: suggestionRecipe,
    guidance: guidanceBody,
    /** The saved Family Recipe being edited, if any: Pairings may never link to it. */
    recipeId: z.uuid().optional(),
  })
  .strict();
export type SuggestGuidanceBody = z.infer<typeof suggestGuidanceBody>;

/** What the model returns; the service judges every value, so it is loosely typed. */
export const guidanceSuggestionSchema = z.object({
  /** Good and bad, no values; null when there is nothing worth saying. */
  nutritionNote: z.string().nullable(),
});
export type GuidanceSuggestionAnswer = z.infer<typeof guidanceSuggestionSchema>;

export const guidanceSuggestionJsonSchema = z.toJSONSchema(
  guidanceSuggestionSchema,
  { target: 'draft-7' },
);

/**
 * The answer: the Guidance body restricted to the fields that were empty and got a
 * proposal, and the empty, covered fields with nothing worth proposing.
 */
export type GuidanceSuggestion = {
  guidance: Partial<GuidanceBody>;
  noSuggestions: GuidanceField[];
};

/** Which fields of the Guidance on the form are empty (Pairings: none; Nutrition Note: null or blank; Eating Moments: none). */
export function emptyGuidanceFields(
  guidance: Pick<GuidanceBody, GuidanceField>,
): GuidanceField[] {
  return GUIDANCE_FIELDS.filter((field) => {
    switch (field) {
      case 'pairings':
        return guidance.pairings.length === 0;
      case 'nutritionNote':
        return (guidance.nutritionNote ?? '').trim() === '';
      case 'eatingMoments':
        return guidance.eatingMoments.length === 0;
    }
  });
}
