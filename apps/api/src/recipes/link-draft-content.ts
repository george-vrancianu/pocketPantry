import type { RecipeDraftContent } from '../recipe-drafts/recipe-drafts.schemas';
import type { LinkRecipeDraft } from './recipes.schemas';

const minutesText = (value: number | null) =>
  value === null ? '' : String(value);

/** A step timer as the form types it: minutes, up to two decimals. */
const timerText = (seconds: number | null) =>
  seconds === null ? '' : String(Math.round((seconds / 60) * 100) / 100);

/**
 * A link reading as the Family Recipe form state a Recipe Draft stores (ADR 0031): the same
 * conversion the New Recipe page makes from a supplied draft (`draftOfVariantDraft`), so the
 * editor resumes it as it would have opened the fill. `pickedBaseId` is the top closest Base
 * Recipe, the one the picker starts on; with it, resuming asks for the closest bases again.
 */
export function draftContentOfLink(
  draft: LinkRecipeDraft,
  origin: {
    sourceLink: string | null;
    sourceLanguage: string | null;
    pickedBaseId: string | null;
  },
): RecipeDraftContent {
  return {
    title: draft.title,
    servings: draft.servings === null ? '' : String(draft.servings),
    prepMinutes: minutesText(draft.prepMinutes),
    cookMinutes: minutesText(draft.cookMinutes),
    difficulty: draft.difficulty ?? '',
    tagIds: draft.tagIds,
    // Legacy keys: a reading proposes Tags only; #715 drops them from the content.
    cuisineId: '',
    methodId: '',
    lines: draft.lines.map((line) => ({
      ingredientId: line.ingredientId ?? '',
      name: line.ingredientName || line.rawName || '',
      quantity: line.quantity === null ? '' : String(line.quantity),
      unit: line.unit ?? 'g',
      optional: line.optional,
      note: line.note ?? '',
    })),
    steps: draft.steps.map((step, index) => {
      const tips = draft.tips
        .filter((tip) => tip.stepIndex === index)
        .map((tip) => ({ text: tip.text }));
      return {
        text: step.text,
        timer: timerText(step.timerSeconds),
        ...(tips.length > 0 ? { tips } : {}),
      };
    }),
    // A reading never fills in guidance.
    guidance: { nutritionNote: '', pairings: [], eatingMoments: [] },
    pickedBaseId: origin.pickedBaseId,
    sourceLink: origin.sourceLink,
    sourceLanguage: origin.sourceLanguage,
    plateScan: false,
    offersBases: true,
  };
}
