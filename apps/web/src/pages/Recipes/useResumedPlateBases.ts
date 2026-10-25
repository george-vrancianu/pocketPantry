import type { BaseRecipeOption } from '../../components/BaseRecipePicker';
import { usePlateMatches } from '../../lib/plateRecipe';
import type { RecipeDraftForm } from '../../lib/recipeDraftContent';
import { useRecipe } from '../../lib/recipes';

/** What Plate matches are asked from: the title and the Matched Ingredients of the lines. */
export function plateMatchInput(
  title: string,
  lines: { ingredientId?: string | null }[],
) {
  return {
    dishTitle: title,
    ingredientIds: [
      ...new Set(
        lines.flatMap((line) => (line.ingredientId ? [line.ingredientId] : [])),
      ),
    ],
  };
}

/** Whether a resumed Recipe Draft had the base picker (a Plate Scan, or a base was picked). */
const offersBases = (form: RecipeDraftForm | null) =>
  form !== null && (form.plateScan === true || Boolean(form.pickedBaseId));

/**
 * Resuming a Recipe Draft that offered a base (ADR 0028): the Plate matches are
 * asked again from its title and lines (they are never stored), and the base
 * picked before leaving is looked up by id for its name, since one picked
 * through search is stored only as `pickedBaseId`.
 */
export function useResumedPlateBases(form: RecipeDraftForm | null): {
  closest: BaseRecipeOption[];
  hiddenByAllergiesCount: number;
  /** The base picked before leaving, once named; null when there was none or it is gone. */
  picked: BaseRecipeOption | null;
  /** The picker may be shown: the picked base (if any) is named. If its name cannot be looked up, the picker stays away and the pick is kept as it is. */
  ready: boolean;
} {
  const asks = offersBases(form);
  const matches = usePlateMatches(
    plateMatchInput(form?.draft.title ?? '', form?.draft.lines ?? []),
    asks,
  );
  const pickedId = asks ? (form?.pickedBaseId ?? '') : '';
  const base = useRecipe(pickedId, pickedId !== '');
  return {
    closest: matches.data?.matches ?? [],
    hiddenByAllergiesCount: matches.data?.hiddenByAllergiesCount ?? 0,
    picked: base.data
      ? { id: base.data.id, title: base.data.title, allergyWarning: null }
      : null,
    ready: pickedId === '' || base.data !== undefined,
  };
}
