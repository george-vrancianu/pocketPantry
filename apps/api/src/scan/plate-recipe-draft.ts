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
 * A Recipe Draft holds Tips on Steps only, so a Tip of the whole Recipe is kept on the first Step.
 * Standalone is the stored base choice (`pickedBaseId` null); `plateScan` makes resuming ask for
 * the plate matches again.
 */
export function draftContentOfPlate(
  answer: PlateRecipeAnswer,
  checked: { tagIds: string[]; ingredientIds: (string | null)[] },
  context: ReadingContext,
): RecipeDraftContent {
  const steps = answer.steps
    .filter((step) => step.text.trim() !== '')
    .slice(0, MAX_STEPS);
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
  // `draftOfReading` keeps the Steps that have text, in order, so an index into `steps` still points at the same one.
  const tips = answer.tips.flatMap((tip) => {
    const text = tip.text.trim().slice(0, TIP_MAX);
    if (text === '' || draft.steps.length === 0) return [];
    const index = tip.stepIndex === null ? 0 : Math.round(tip.stepIndex);
    return index >= 0 && index < draft.steps.length
      ? [{ stepIndex: index, text }]
      : [{ stepIndex: 0, text }];
  });
  return {
    ...draftContentOfLink(
      { ...draft, tips: tips.slice(0, MAX_TIPS) },
      { sourceLink: null, sourceLanguage: null, pickedBaseId: null },
    ),
    plateScan: true,
    offersBases: false,
  };
}
