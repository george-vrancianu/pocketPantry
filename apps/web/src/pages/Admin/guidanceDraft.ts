import type {
  AdminRecipe,
  EatingMomentPolarity,
  GuidanceInput,
  PairingKind,
  PairingPrinciple,
} from '../../lib/adminRecipes';
import { MAX_NUTRITION_NOTE } from '../../lib/adminRecipes';

export type LinkType = 'none' | 'ingredient' | 'recipe';

export type PairingDraft = {
  /** Stable React key; not sent. */
  key: number;
  /** Present on a saved Pairing, so saving keeps it (and its translations). */
  id?: string;
  kind: PairingKind;
  label: string;
  reason: string;
  principle: PairingPrinciple | '';
  /** One link at a time: switching the type clears the target. */
  linkType: LinkType;
  linkTarget: string;
};
export type EatingMomentDraft = {
  eatingMomentId: string;
  polarity: EatingMomentPolarity;
  reason: string;
};
export type GuidanceDraft = {
  nutritionNote: string;
  pairings: PairingDraft[];
  eatingMoments: EatingMomentDraft[];
};

let nextKey = 1;
export const newKey = () => nextKey++;

export function emptyPairing(): PairingDraft {
  return {
    key: newKey(),
    kind: 'food',
    label: '',
    reason: '',
    principle: '',
    linkType: 'none',
    linkTarget: '',
  };
}

export function toGuidanceDraft(recipe: AdminRecipe): GuidanceDraft {
  return {
    nutritionNote: recipe.nutritionNote ?? '',
    pairings: recipe.pairings.map((p) => ({
      key: newKey(),
      id: p.id,
      kind: p.kind,
      label: p.label,
      reason: p.reason,
      principle: p.principle ?? '',
      linkType: p.linkedIngredientId
        ? 'ingredient'
        : p.linkedRecipeId
          ? 'recipe'
          : 'none',
      linkTarget: p.linkedIngredientId ?? p.linkedRecipeId ?? '',
    })),
    eatingMoments: recipe.eatingMoments.map((m) => ({
      eatingMomentId: m.eatingMomentId,
      polarity: m.polarity,
      reason: m.reason ?? '',
    })),
  };
}

export const noteLength = (note: string) => note.trim().length;

export function guidanceProblems(draft: GuidanceDraft) {
  return {
    pairing: draft.pairings.some(
      (p) => p.label.trim() === '' || p.reason.trim() === '',
    ),
    note: noteLength(draft.nutritionNote) > MAX_NUTRITION_NOTE,
  };
}

export function toGuidanceInput(draft: GuidanceDraft): GuidanceInput {
  const note = draft.nutritionNote.trim();
  return {
    nutritionNote: note === '' ? null : note,
    pairings: draft.pairings.map((p) => {
      const linked = p.linkType !== 'none' && p.linkTarget !== '';
      return {
        ...(p.id ? { id: p.id } : {}),
        kind: p.kind,
        label: p.label.trim(),
        reason: p.reason.trim(),
        principle: p.principle === '' ? null : p.principle,
        linkedIngredientId:
          linked && p.linkType === 'ingredient' ? p.linkTarget : null,
        linkedRecipeId: linked && p.linkType === 'recipe' ? p.linkTarget : null,
      };
    }),
    eatingMoments: draft.eatingMoments.map((m) => ({
      eatingMomentId: m.eatingMomentId,
      polarity: m.polarity,
      reason: m.reason.trim() === '' ? null : m.reason.trim(),
    })),
  };
}
