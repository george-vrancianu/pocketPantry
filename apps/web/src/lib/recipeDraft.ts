import { localName, type AdminCatalog } from './admin';
import type {
  AdminRecipe,
  RecipeDocument,
  SuggestCatalogGuidanceRequest,
} from './adminRecipes';
import type { Difficulty } from './recipeVocabulary';
import type { Unit } from './catalog';

export type LineDraft = {
  /** Stable React key; not sent. */
  key: number;
  /** Present on a saved line, so saving keeps it (and its translated note). */
  id?: string;
  ingredientId: string;
  name: string;
  quantity: string;
  unit: Unit;
  optional: boolean;
  note: string;
};
/** A step Tip copied into an unsaved draft; saved Recipes manage Tips through the Tips editor. */
export type StepTipDraft = { key: number; text: string };
export type StepDraft = {
  key: number;
  id?: string;
  /** Only on a new Variant draft: the copied Tips of this step, sent on create. */
  tips?: StepTipDraft[];
  text: string;
  /** Minutes, decimals allowed; blank for no timer. */
  timer: string;
};
export type RecipeDraft = {
  title: string;
  servings: string;
  prepMinutes: string;
  cookMinutes: string;
  difficulty: Difficulty | '';
  cuisineId: string;
  methodId: string;
  lines: LineDraft[];
  steps: StepDraft[];
};

export type DraftProblems = {
  title: boolean;
  servings: boolean;
  prepMinutes: boolean;
  cookMinutes: boolean;
  lines: Record<number, boolean>;
  steps: Record<number, 'text' | 'timer'>;
};

let nextKey = 1;
/** A fresh React key for a draft row (shared by every Recipe draft). */
export const newKey = () => nextKey++;

export const minutesText = (value: number | null) =>
  value === null ? '' : String(value);

export const timerText = (seconds: number | null) =>
  seconds === null ? '' : String(Math.round((seconds / 60) * 100) / 100);

export function emptyDraft(): RecipeDraft {
  return {
    title: '',
    servings: '4',
    prepMinutes: '',
    cookMinutes: '',
    difficulty: '',
    cuisineId: '',
    methodId: '',
    lines: [],
    steps: [],
  };
}

export function draftOf(
  recipe: AdminRecipe,
  catalog: AdminCatalog,
  locale: string,
): RecipeDraft {
  return {
    title: recipe.title,
    servings: String(recipe.servings),
    prepMinutes: minutesText(recipe.prepMinutes),
    cookMinutes: minutesText(recipe.cookMinutes),
    difficulty: recipe.difficulty ?? '',
    cuisineId: recipe.cuisineId ?? '',
    methodId: recipe.methodId ?? '',
    lines: recipe.lines.map((line) => {
      const ingredient = catalog.ingredients.find(
        (item) => item.id === line.ingredientId,
      );
      return {
        key: newKey(),
        id: line.id,
        ingredientId: line.ingredientId ?? '',
        name: ingredient ? localName(ingredient, locale) : '',
        quantity: line.quantity === null ? '' : String(line.quantity),
        unit: line.unit ?? ingredient?.defaultUnit ?? 'g',
        optional: line.optional,
        note: line.note ?? '',
      };
    }),
    steps: recipe.steps.map((step) => ({
      key: newKey(),
      id: step.id,
      text: step.text,
      timer:
        step.timerSeconds === null
          ? ''
          : String(Math.round((step.timerSeconds / 60) * 100) / 100),
    })),
  };
}

export const decimal = (text: string) => Number(text.trim().replace(',', '.'));
// Bounds mirror the API's recipe schema (MAX_QUANTITY, minutes, timer seconds).
const MAX_MINUTES = 100_000;
const MAX_QUANTITY = 1_000_000;
const MAX_TIMER_SECONDS = 1_000_000;
const isMinutes = (text: string) =>
  text.trim() === '' ||
  (/^\d{1,6}$/.test(text.trim()) && Number(text.trim()) <= MAX_MINUTES);
const isQuantity = (text: string) => {
  if (text.trim() === '') return true;
  const value = decimal(text);
  return (
    Number.isFinite(value) &&
    value >= 0.001 &&
    value <= MAX_QUANTITY &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6
  );
};
const isTimer = (text: string) => {
  if (text.trim() === '') return true;
  const value = decimal(text);
  const seconds = Math.round(value * 60);
  return Number.isFinite(value) && seconds >= 1 && seconds <= MAX_TIMER_SECONDS;
};

export function problemsOf(draft: RecipeDraft): DraftProblems {
  const servings = Number(draft.servings.trim());
  const lines: Record<number, boolean> = {};
  for (const line of draft.lines) {
    if (!isQuantity(line.quantity)) lines[line.key] = true;
  }
  const steps: Record<number, 'text' | 'timer'> = {};
  for (const step of draft.steps) {
    if (step.text.trim() === '') steps[step.key] = 'text';
    else if (!isTimer(step.timer)) steps[step.key] = 'timer';
  }
  return {
    title: draft.title.trim() === '',
    servings: !(
      Number.isInteger(servings) &&
      servings >= 1 &&
      servings <= 1000
    ),
    prepMinutes: !isMinutes(draft.prepMinutes),
    cookMinutes: !isMinutes(draft.cookMinutes),
    lines,
    steps,
  };
}

export function hasProblems(problems: DraftProblems): boolean {
  return (
    problems.title ||
    problems.servings ||
    problems.prepMinutes ||
    problems.cookMinutes ||
    Object.keys(problems.lines).length > 0 ||
    Object.keys(problems.steps).length > 0
  );
}

/** The document to send; call only when `problemsOf` found nothing. */
export function documentOf(draft: RecipeDraft): RecipeDocument {
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
        ingredientId: line.ingredientId,
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

/** A copy of `items` with the entries at `index` and `index + offset` swapped. */
export function moved<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/**
 * The editor's Recipe as Suggest Guidance reads it. The form may be half done, so unlike
 * `documentOf` this never needs `problemsOf` to be clear: lines without an Ingredient and
 * Steps with no text are left out, and a missing Title or Servings is left out too.
 */
export function suggestionRecipeOf(
  draft: RecipeDraft,
): SuggestCatalogGuidanceRequest['recipe'] {
  const servings = Number(draft.servings.trim());
  const quantityOf = (text: string) => {
    const value = decimal(text);
    return text.trim() !== '' && value >= 0.001 && value <= MAX_QUANTITY
      ? Math.round(value * 1000) / 1000
      : null;
  };
  return {
    ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    ...(Number.isInteger(servings) && servings >= 1 && servings <= 1000
      ? { servings }
      : {}),
    prepMinutes: null,
    cookMinutes: null,
    difficulty: null,
    cuisineId: draft.cuisineId || null,
    methodId: draft.methodId || null,
    lines: draft.lines.flatMap((line) => {
      if (!line.ingredientId) return [];
      const quantity = quantityOf(line.quantity);
      return [
        {
          ingredientId: line.ingredientId,
          quantity,
          unit: quantity === null ? null : line.unit,
          optional: line.optional,
          note: null,
        },
      ];
    }),
    steps: draft.steps.flatMap((step) =>
      step.text.trim() === ''
        ? []
        : [{ text: step.text.trim().slice(0, 2000), timerSeconds: null }],
    ),
  };
}
