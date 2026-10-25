import type { GuidanceInput } from './adminRecipes';
import { toGuidanceInput, type GuidanceDraft } from './guidanceDraft';

/** The three fields of Guidance (mirror of the API's `GuidanceField`). */
export type GuidanceField = 'pairings' | 'nutritionNote' | 'eatingMoments';

/**
 * The fields Suggest Guidance proposes (mirror of the API's `COVERED_GUIDANCE_FIELDS`).
 * Tracer: the Nutrition Note only; Pairings and Eating Moments join here when the API covers them.
 */
export const COVERED_GUIDANCE_FIELDS: readonly GuidanceField[] = [
  'nutritionNote',
];

/** The answer (mirror of the API's `GuidanceSuggestion`): the Guidance body restricted to the fields that were empty, and the ones with nothing to propose. */
export type GuidanceSuggestion = {
  guidance: Partial<GuidanceInput>;
  noSuggestions: GuidanceField[];
};

/** The fields of the form that are empty now (a Pairing row or Eating Moment counts as filled). */
export function emptyGuidanceFields(draft: GuidanceDraft): GuidanceField[] {
  const empty: Record<GuidanceField, boolean> = {
    pairings: draft.pairings.length === 0,
    nutritionNote: draft.nutritionNote.trim() === '',
    eatingMoments: draft.eatingMoments.length === 0,
  };
  return (Object.keys(empty) as GuidanceField[]).filter((f) => empty[f]);
}

/** The covered fields that are empty now: what a Suggest Guidance press could fill. */
export const fillableFields = (draft: GuidanceDraft) =>
  emptyGuidanceFields(draft).filter((f) => COVERED_GUIDANCE_FIELDS.includes(f));

/**
 * All the Guidance on the form, as the request carries it. Pairing rows that are not
 * filled in yet are left out: the API refuses them, and they hold nothing to go on.
 */
export function guidanceForRequest(draft: GuidanceDraft): GuidanceInput {
  const input = toGuidanceInput(draft);
  return {
    ...input,
    nutritionNote: input.nutritionNote?.slice(0, 5000) ?? null,
    pairings: input.pairings.filter((p) => p.label !== '' && p.reason !== ''),
  };
}

/**
 * Puts a proposal into the form, only into fields that are empty in `draft` as it is
 * now (it may have changed while the answer was on its way), each marked suggested.
 */
export function mergeSuggestion(
  draft: GuidanceDraft,
  suggestion: GuidanceSuggestion,
): { draft: GuidanceDraft; filled: GuidanceField[] } {
  const empty = fillableFields(draft);
  const filled: GuidanceField[] = [];
  let next = draft;
  // Pairings and Eating Moments rows (each with `suggested: true`) are merged here when covered.
  const { nutritionNote } = suggestion.guidance;
  if (empty.includes('nutritionNote') && nutritionNote?.trim()) {
    next = { ...next, nutritionNote, nutritionNoteSuggested: true };
    filled.push('nutritionNote');
  }
  return { draft: next, filled };
}
