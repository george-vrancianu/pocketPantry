import type {
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
  /** Name of a just-picked linked Ingredient, to show before saving. */
  linkName?: string;
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
export const MAX_PAIRING_LABEL = 200;
export const MAX_PAIRING_REASON = 1000;

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

/** Anything carrying guidance: a saved Recipe, or a Variant draft (Pairings without ids). */
type GuidanceSource = {
  nutritionNote: string | null;
  pairings: Array<{
    id?: string;
    kind: PairingKind;
    label: string;
    reason: string;
    principle: PairingPrinciple | null;
    linkedIngredientId: string | null;
    linkedRecipeId: string | null;
  }>;
  eatingMoments: Array<{
    eatingMomentId: string;
    polarity: EatingMomentPolarity;
    reason: string | null;
  }>;
};

export function toGuidanceDraft(recipe: GuidanceSource): GuidanceDraft {
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

/** Characters as the API counts them: code points of the trimmed text. */
export const noteLength = (note: string) => [...note.trim()].length;

export function guidanceProblems(draft: GuidanceDraft) {
  return {
    pairing: draft.pairings.some(
      (p) => p.label.trim() === '' || p.reason.trim() === '',
    ),
    note: noteLength(draft.nutritionNote) > MAX_NUTRITION_NOTE,
    /** Position of the first Pairing with a link type but no target, else null. */
    linkPosition: (() => {
      const index = draft.pairings.findIndex(
        (p) => p.linkType !== 'none' && p.linkTarget === '',
      );
      return index === -1 ? null : index + 1;
    })(),
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
