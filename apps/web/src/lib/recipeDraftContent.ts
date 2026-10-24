import type { GuidanceDraft } from './guidanceDraft';
import {
  newKey,
  type LineDraft,
  type RecipeDraft,
  type StepDraft,
} from './recipeDraft';
import type { RecipeDraftContent } from './recipeDrafts';

/**
 * The one place the Family Recipe form state and a Recipe Draft's content
 * are converted (ADR 0028). Content is the form as typed; React keys never go
 * out, and come back fresh.
 */
export type RecipeDraftForm = {
  draft: RecipeDraft;
  /** Null on a form with no guidance section. */
  guidance: GuidanceDraft | null;
  sourceLink?: string | null;
  sourceLanguage?: string | null;
  pickedBaseId?: string | null;
  plateScan?: boolean;
};

export function contentOfForm(form: RecipeDraftForm): RecipeDraftContent {
  const { draft, guidance } = form;
  return {
    title: draft.title,
    servings: draft.servings,
    prepMinutes: draft.prepMinutes,
    cookMinutes: draft.cookMinutes,
    difficulty: draft.difficulty,
    cuisineId: draft.cuisineId,
    methodId: draft.methodId,
    lines: draft.lines.map((line) => ({
      ...(line.id ? { id: line.id } : {}),
      ingredientId: line.ingredientId,
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
      optional: line.optional,
      note: line.note,
    })),
    steps: draft.steps.map((step) => ({
      ...(step.id ? { id: step.id } : {}),
      text: step.text,
      timer: step.timer,
      ...(step.tips
        ? { tips: step.tips.map((tip) => ({ text: tip.text })) }
        : {}),
    })),
    guidance: guidance
      ? {
          nutritionNote: guidance.nutritionNote,
          pairings: guidance.pairings.map((pairing) => ({
            ...(pairing.id ? { id: pairing.id } : {}),
            kind: pairing.kind,
            label: pairing.label,
            reason: pairing.reason,
            principle: pairing.principle,
            linkType: pairing.linkType,
            linkTarget: pairing.linkTarget,
            ...(pairing.linkName ? { linkName: pairing.linkName } : {}),
            ...(pairing.linkTitle ? { linkTitle: pairing.linkTitle } : {}),
          })),
          eatingMoments: guidance.eatingMoments.map((moment) => ({
            eatingMomentId: moment.eatingMomentId,
            polarity: moment.polarity,
            reason: moment.reason,
          })),
        }
      : null,
    pickedBaseId: form.pickedBaseId ?? null,
    sourceLink: form.sourceLink ?? null,
    sourceLanguage: form.sourceLanguage ?? null,
    plateScan: form.plateScan ?? false,
  };
}

export function formOfContent(content: RecipeDraftContent): RecipeDraftForm {
  return {
    draft: {
      title: content.title,
      servings: content.servings,
      prepMinutes: content.prepMinutes,
      cookMinutes: content.cookMinutes,
      difficulty: content.difficulty,
      cuisineId: content.cuisineId,
      methodId: content.methodId,
      lines: content.lines.map((line): LineDraft => ({
        key: newKey(),
        ...(line.id ? { id: line.id } : {}),
        ingredientId: line.ingredientId,
        name: line.name,
        quantity: line.quantity,
        unit: line.unit as LineDraft['unit'],
        optional: line.optional,
        note: line.note,
      })),
      steps: content.steps.map((step): StepDraft => ({
        key: newKey(),
        ...(step.id ? { id: step.id } : {}),
        text: step.text,
        timer: step.timer,
        ...(step.tips
          ? {
              tips: step.tips.map((tip) => ({ key: newKey(), text: tip.text })),
            }
          : {}),
      })),
    },
    guidance: content.guidance
      ? {
          nutritionNote: content.guidance.nutritionNote,
          pairings: content.guidance.pairings.map((pairing) => ({
            key: newKey(),
            ...(pairing.id ? { id: pairing.id } : {}),
            kind: pairing.kind,
            label: pairing.label,
            reason: pairing.reason,
            principle: pairing.principle,
            linkType: pairing.linkType,
            linkTarget: pairing.linkTarget,
            ...(pairing.linkName ? { linkName: pairing.linkName } : {}),
            ...(pairing.linkTitle ? { linkTitle: pairing.linkTitle } : {}),
          })),
          eatingMoments: content.guidance.eatingMoments.map((moment) => ({
            eatingMomentId: moment.eatingMomentId,
            polarity: moment.polarity,
            reason: moment.reason,
          })),
        }
      : null,
    sourceLink: content.sourceLink,
    sourceLanguage: content.sourceLanguage,
    pickedBaseId: content.pickedBaseId,
    plateScan: content.plateScan,
  };
}
