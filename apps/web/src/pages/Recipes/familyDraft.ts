import type {
  FamilyRecipeDocument,
  FamilyRecipeDraft,
  FamilyRecipeEdit,
} from '../../lib/familyRecipes';
import {
  newKey,
  type LineDraft,
  type RecipeDraft,
  type StepDraft,
} from '../Admin/recipeDraft';

export { hasProblems, moved, newKey, problemsOf } from '../Admin/recipeDraft';

/**
 * The form state is the Admin's `RecipeDraft`. A line with an `ingredientId` is
 * a Catalog Ingredient; one without is a free-text name kept in `name`.
 */
export type FamilyDraft = RecipeDraft;

const minutesText = (value: number | null) =>
  value === null ? '' : String(value);
const timerText = (seconds: number | null) =>
  seconds === null ? '' : String(Math.round((seconds / 60) * 100) / 100);

type Source = Pick<
  FamilyRecipeDraft,
  | 'title'
  | 'servings'
  | 'prepMinutes'
  | 'cookMinutes'
  | 'difficulty'
  | 'cuisineId'
  | 'methodId'
>;

const metaOf = (source: Source) => ({
  title: source.title,
  servings: String(source.servings),
  prepMinutes: minutesText(source.prepMinutes),
  cookMinutes: minutesText(source.cookMinutes),
  difficulty: source.difficulty ?? ('' as const),
  cuisineId: source.cuisineId ?? '',
  methodId: source.methodId ?? '',
});

type LineSource = {
  id?: string;
  ingredientId: string | null;
  rawName: string | null;
  ingredientName: string;
  quantity: number | null;
  unit: LineDraft['unit'] | null;
  optional: boolean;
  note: string | null;
};

const lineOf = (line: LineSource): LineDraft => ({
  key: newKey(),
  ...(line.id ? { id: line.id } : {}),
  ingredientId: line.ingredientId ?? '',
  name: line.ingredientName || line.rawName || '',
  quantity: line.quantity === null ? '' : String(line.quantity),
  unit: line.unit ?? 'g',
  optional: line.optional,
  note: line.note ?? '',
});

/** A "Make a variant" draft: lines and Steps have no ids yet. */
export function draftOfVariantDraft(draft: FamilyRecipeDraft): FamilyDraft {
  return {
    ...metaOf(draft),
    lines: draft.lines.map(lineOf),
    steps: draft.steps.map((step): StepDraft => ({
      key: newKey(),
      text: step.text,
      timer: timerText(step.timerSeconds),
    })),
  };
}

/** A saved Family Recipe: lines and Steps keep their ids so Tips stay put. */
export function draftOfEdit(recipe: FamilyRecipeEdit): FamilyDraft {
  return {
    ...metaOf(recipe),
    lines: recipe.lines.map(lineOf),
    steps: recipe.steps.map((step): StepDraft => ({
      key: newKey(),
      id: step.id,
      text: step.text,
      timer: timerText(step.timerSeconds),
    })),
  };
}

const decimal = (text: string) => Number(text.trim().replace(',', '.'));

/** The document to send; call only when `problemsOf` found nothing. */
export function documentOf(draft: FamilyDraft): FamilyRecipeDocument {
  const minutes = (text: string) =>
    text.trim() === '' ? null : Number(text.trim());
  return {
    title: draft.title.trim(),
    servings: Number(draft.servings.trim()),
    prepMinutes: minutes(draft.prepMinutes),
    cookMinutes: minutes(draft.cookMinutes),
    difficulty: draft.difficulty === '' ? null : draft.difficulty,
    cuisineId: draft.cuisineId === '' ? null : draft.cuisineId,
    methodId: draft.methodId === '' ? null : draft.methodId,
    lines: draft.lines.map((line) => {
      const hasQuantity = line.quantity.trim() !== '';
      return {
        ...(line.id ? { id: line.id } : {}),
        ingredientId: line.ingredientId || null,
        rawName: line.ingredientId ? null : line.name.trim(),
        quantity: hasQuantity ? decimal(line.quantity) : null,
        unit: hasQuantity ? line.unit : null,
        optional: line.optional,
        note: line.note.trim() === '' ? null : line.note.trim(),
      };
    }),
    steps: draft.steps.map((step) => ({
      ...(step.id ? { id: step.id } : {}),
      text: step.text.trim(),
      timerSeconds:
        step.timer.trim() === '' ? null : Math.round(decimal(step.timer) * 60),
    })),
  };
}
