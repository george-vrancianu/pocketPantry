import type { GuidanceInput } from './adminRecipes';
import {
  toGuidanceDraft,
  toGuidanceInput,
  type GuidanceDraft,
  type PairingDraft,
} from './guidanceDraft';

/** The three fields of Guidance (mirror of the API's `GuidanceField`). */
export type GuidanceField = 'pairings' | 'nutritionNote' | 'eatingMoments';

/**
 * The fields Suggest Guidance proposes (mirror of the API's `COVERED_GUIDANCE_FIELDS`).
 * Eating Moments join here when the API covers them (plus a branch in `mergeSuggestion`).
 */
export const COVERED_GUIDANCE_FIELDS: readonly GuidanceField[] = [
  'pairings',
  'nutritionNote',
];

/** A proposed Pairing: the Guidance input's, plus the name of what it links to. */
export type SuggestedPairing = GuidanceInput['pairings'][number] & {
  linkedIngredientName?: string | null;
  linkedRecipeTitle?: string | null;
};

/** The answer (mirror of the API's `GuidanceSuggestion`): the Guidance body restricted to the fields that were empty, and the ones with nothing to propose. */
export type GuidanceSuggestion = {
  guidance: Partial<Omit<GuidanceInput, 'pairings'>> & {
    pairings?: SuggestedPairing[];
  };
  noSuggestions: GuidanceField[];
};

/**
 * A Pairing row with nothing in it: no label, no reason, no chosen link. Anything else is the
 * Member's own work, started or finished, and counts as a Pairing for Suggest Guidance.
 */
export const isBlankPairing = (
  p: Pick<PairingDraft, 'label' | 'reason' | 'linkTarget'>,
) => p.label.trim() === '' && p.reason.trim() === '' && p.linkTarget === '';

/** The fields of the form that are empty now (Pairings: every row blank; an Eating Moment counts as filled). */
export function emptyGuidanceFields(draft: GuidanceDraft): GuidanceField[] {
  const empty: Record<GuidanceField, boolean> = {
    pairings: draft.pairings.every(isBlankPairing),
    nutritionNote: draft.nutritionNote.trim() === '',
    eatingMoments: draft.eatingMoments.length === 0,
  };
  return (Object.keys(empty) as GuidanceField[]).filter((f) => empty[f]);
}

/** The covered fields that are empty now: what a Suggest Guidance press could fill. */
export const fillableFields = (draft: GuidanceDraft) =>
  emptyGuidanceFields(draft).filter((f) => COVERED_GUIDANCE_FIELDS.includes(f));

/** Longest Nutrition Note the API accepts (`nutritionNote` in the API's `recipe-guidance.schemas.ts`: `max(5000)`). Keep in step. */
const NUTRITION_NOTE_MAX_LENGTH = 5000;

/**
 * All the Guidance on the form, as the request carries it. Blank Pairing rows are left out;
 * started rows are sent as typed (the request takes them, it never saves), so the API judges
 * the field empty or not exactly as the form does.
 */
export function guidanceForRequest(draft: GuidanceDraft): GuidanceInput {
  const input = toGuidanceInput(draft);
  return {
    ...input,
    nutritionNote:
      input.nutritionNote?.slice(0, NUTRITION_NOTE_MAX_LENGTH) ?? null,
    pairings: input.pairings.filter(
      (_, i) => !isBlankPairing(draft.pairings[i]),
    ),
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
  // Eating Moments rows (each with `suggested: true`) are merged here when covered.
  const { pairings } = suggestion.guidance;
  if (empty.includes('pairings') && pairings && pairings.length > 0) {
    next = {
      ...next,
      // Only blank rows are there (the field is empty), and they make way for the proposal.
      pairings: pairings.map(pairingRow),
    };
    filled.push('pairings');
  }
  const { nutritionNote } = suggestion.guidance;
  if (empty.includes('nutritionNote') && nutritionNote?.trim()) {
    next = { ...next, nutritionNote, nutritionNoteSuggested: true };
    filled.push('nutritionNote');
  }
  return { draft: next, filled };
}

/** A proposed Pairing as a form row, marked suggested, its link named as the server named it. */
function pairingRow(p: SuggestedPairing): PairingDraft {
  const [row] = toGuidanceDraft({
    nutritionNote: null,
    pairings: [p],
    eatingMoments: [],
  }).pairings;
  return { ...row, suggested: true };
}
