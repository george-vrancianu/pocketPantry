import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BaseRecipePicker,
  noBasePick,
} from '../../../components/BaseRecipePicker';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  matchedIngredientIds,
  useSaveFromPlate,
  usePlateMatches,
} from '../../../lib/plateRecipe';
import type { ReviewLine } from '../../../lib/review';

type Props = {
  dishTitle: string;
  /** The Tags the Plate Scan read proposed; the saved Recipe starts with them (the Member edits them in the Recipe). */
  proposedTagIds?: string[];
  /** The Review's current lines, for one serving. */
  lines: ReviewLine[];
  /** The Review's own line checks: opens and focuses the first invalid line, and says whether there was one. */
  hasInvalidLine: () => boolean;
  onSaved: (recipeId: string) => void;
};

/** Saves a Plate Scan's dish as a Family Recipe: a Variant of a Catalog Base Recipe, or standalone. */
export function PlateRecipeSave({
  dishTitle,
  proposedTagIds = [],
  lines,
  hasInvalidLine,
  onSaved,
}: Props) {
  const { t } = useTranslation('review');
  const groupName = useId();
  // The Ingredients are read when the panel opens, so editing lines does not reshuffle the matches.
  const [ingredientIds, setIngredientIds] = useState<string[] | null>(null);
  const open = ingredientIds !== null;
  const [title, setTitle] = useState(dishTitle);
  const [parentId, setParentId] = useState<string | null>(null);
  // Held here, not in the picker, so the pick and search survive Cancel and reopen.
  const [basePick, setBasePick] = useState(noBasePick);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // Focus follows the panel: its heading when it opens, the opener when it is cancelled.
  useEffect(() => {
    if (open) headingRef.current?.focus();
    else if (wasOpen.current) openerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const save = useSaveFromPlate();
  // "Show" in the hidden-by-Allergies note asks for the closest matches again, hidden ones too.
  const [showHidden, setShowHidden] = useState(false);
  const matches = usePlateMatches(
    {
      dishTitle,
      ingredientIds: ingredientIds ?? [],
      ...(showHidden ? { showHidden: true as const } : {}),
    },
    open,
  );
  const closestBases = matches.data?.matches ?? [];

  if (!open)
    return (
      <Button
        ref={openerRef}
        variant="secondary"
        onClick={() => setIngredientIds(matchedIngredientIds(lines))}
      >
        {t('plateRecipe.open')}
      </Button>
    );

  const submit = () => {
    if (hasInvalidLine()) return;
    save.mutate(
      {
        title,
        parentId,
        lines,
        tagIds: proposedTagIds,
      },
      { onSuccess: (recipe) => onSaved(recipe.id) },
    );
  };
  return (
    <Stack
      component="section"
      aria-labelledby={`${groupName}-heading`}
      spacing={1.5}
    >
      <Typography
        id={`${groupName}-heading`}
        component="h2"
        ref={headingRef}
        tabIndex={-1}
        sx={{ fontWeight: 700, outline: 'none' }}
      >
        {t('plateRecipe.heading')}
      </Typography>
      <TextField
        label={t('plateRecipe.title')}
        value={title}
        slotProps={{ htmlInput: { maxLength: 200 } }}
        onChange={(event) => setTitle(event.target.value)}
      />
      <BaseRecipePicker
        pick={basePick}
        onPick={setBasePick}
        closest={closestBases}
        loading={matches.isPending}
        hiddenByAllergiesCount={matches.data?.hiddenByAllergiesCount ?? 0}
        onShowHidden={() => setShowHidden(true)}
        onChange={setParentId}
      />
      {save.error ? <Alert>{translateApiError(t, save.error)}</Alert> : null}
      <Stack direction="row" spacing={1}>
        <Button
          variant="ghost"
          onClick={() => setIngredientIds(null)}
          disabled={save.isPending}
        >
          {t('plateRecipe.cancel')}
        </Button>
        <Button
          onClick={submit}
          disabled={
            save.isPending ||
            matches.isPending ||
            title.trim() === '' ||
            lines.length === 0
          }
        >
          {save.isPending ? t('plateRecipe.saving') : t('plateRecipe.save')}
        </Button>
      </Stack>
    </Stack>
  );
}
