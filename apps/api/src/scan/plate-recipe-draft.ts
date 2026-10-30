import { draftContentOfLink } from '../recipes/link-draft-content';
import { draftOfReading } from '../recipes/link-reading-mapping';
import { MAX_STEPS, MAX_TIPS } from '../recipes/recipes.schemas';
import type { RecipeDraftContent } from '../recipe-drafts/recipe-drafts.schemas';
import type { ReadingContext } from '../recipes/link-reading-mapping';
import type { PlateRecipeAnswer } from './plate-scan.schemas';

const TIP_MAX = 2000;

/**
 * The Recipe the model wrote for a Plate Scan dish as the Recipe Draft content New Recipe resumes
 * (ADR 0035). `tagIds` are the already-checked Tag ids and `ingredientIds` the Catalog ids the
 * indexes named (null for an index no Catalog holds). The checks are the link reading's: a weak or
 * unknown Match leaves the line Unmatched, numbers out of range are dropped, and Guidance stays empty.
 *
 * A Tip of the whole Recipe (`stepIndex` null) stays a Recipe Tip (`content.tips`); a Step Tip follows its
 * Step through the filtering of blank Steps, and is dropped when its Step is gone or never existed.
 * Standalone is the stored base choice (`pickedBaseId` null); `plateScan` makes resuming ask for
 * the plate matches again.
 */
export function draftContentOfPlate(
  answer: PlateRecipeAnswer,
  checked: { tagIds: string[]; ingredientIds: (string | null)[] },
  context: ReadingContext,
): RecipeDraftContent {
  // The model's Tips index `answer.steps`: remember where each kept Step came from.
  const kept: { step: PlateRecipeAnswer['steps'][number]; from: number }[] = [];
  answer.steps.forEach((step, from) => {
    if (step.text.trim() !== '' && kept.length < MAX_STEPS) {
      kept.push({ step, from });
    }
  });
  const steps = kept.map(({ step }) => step);
  const draft = draftOfReading(
    {
      recipeFound: true,
      sourceLanguage: null,
      title: answer.title,
      servings: answer.servings,
      prepMinutes: null,
      cookMinutes: null,
      tagIds: checked.tagIds,
      steps,
      ingredients: answer.ingredients.map((line, index) => ({
        nameAsWritten: line.nameAsWritten,
        ingredientId: checked.ingredientIds[index] ?? null,
        matchConfidence: line.matchConfidence,
        quantity: line.quantity,
        unit: line.unit,
        originalAmount: null,
        preparation: line.preparation,
        optional: line.optional,
      })),
    },
    context,
  );
  // `draftOfReading` keeps the Steps that have text, in order, so `kept` lines up with `draft.steps`.
  const keptIndex = new Map(kept.map(({ from }, index) => [from, index]));
  const stepTips: { stepIndex: number; text: string }[] = [];
  const recipeTips: { text: string }[] = [];
  for (const tip of answer.tips) {
    const text = tip.text.trim().slice(0, TIP_MAX);
    if (text === '') continue;
    if (tip.stepIndex === null) {
      recipeTips.push({ text });
      continue;
    }
    const stepIndex = keptIndex.get(tip.stepIndex);
    if (stepIndex !== undefined) stepTips.push({ stepIndex, text });
  }
  // MAX_TIPS counts both levels; the Recipe's own Tips come first.
  const wanted = [
    ...recipeTips.map((tip) => ({ ...tip, stepIndex: null })),
    ...stepTips,
  ].slice(0, MAX_TIPS);
  const ownTips = wanted.flatMap((tip) =>
    tip.stepIndex === null ? [{ text: tip.text }] : [],
  );
  const onSteps = wanted.flatMap((tip) =>
    tip.stepIndex === null
      ? []
      : [{ stepIndex: tip.stepIndex, text: tip.text }],
  );
  return {
    ...draftContentOfLink(
      { ...draft, tips: onSteps },
      { sourceLink: null, sourceLanguage: null, pickedBaseId: null },
    ),
    ...(ownTips.length > 0 ? { tips: ownTips } : {}),
    plateScan: true,
    offersBases: false,
  };
}
