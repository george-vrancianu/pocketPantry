import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  suggestFamilyGuidance,
  useSetFamilyGuidance,
  type FamilyRecipeEdit,
} from '../../../lib/familyRecipes';
import { emptyDraft } from '../../../lib/recipeDraft';
import { useGuidanceSuggestion } from '../../../components/recipeEditor/SuggestGuidance';
import {
  draftOfEdit,
  suggestionRecipeOf,
  type FamilyDraft,
} from '../familyDraft';
import { useRecipeFilters, useRecipes } from '../../../lib/recipes';
import {
  GuidanceFields,
  type MomentOption,
  type RecipePickerProps,
} from '../../../components/recipeEditor/GuidanceFields';
import {
  guidanceProblems,
  toGuidanceDraft,
  toGuidanceInput,
  type GuidanceDraft,
} from '../../../lib/guidanceDraft';

/** The live Eating Moments the Member can pick, named in their locale. */
export function useMomentOptions(): MomentOption[] {
  const filters = useRecipeFilters().data;
  return (filters?.eatingMoments ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    archived: false,
  }));
}

/** Links a Pairing to a Recipe the Member can see: search by title, then choose. */
function FamilyRecipePicker({
  label,
  value,
  valueLabel,
  onChange,
  excludeId,
}: RecipePickerProps & { excludeId?: string }) {
  const { t } = useTranslation(['recipes', 'admin']);
  const [search, setSearch] = useState('');
  // Pairing links never hide a Recipe, whatever "Hide Recipes with my Allergies" says.
  const results = useRecipes(
    { search, cuisineId: '', methodId: '' },
    { showHidden: true },
  );
  const options = (results.data?.recipes ?? []).filter(
    (r) => r.id !== excludeId,
  );
  const known = options.some((r) => r.id === value);
  return (
    <Stack spacing={1}>
      <TextField
        label={`${t('recipes:search')} (${label})`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <TextField
        select
        label={label}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
            options.find((r) => r.id === event.target.value)?.title,
          )
        }
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.guidance.pairings.choose')}</option>
        {value && !known ? (
          <option value={value}>
            {valueLabel ?? t('recipes:family.linkedRecipeUnavailable')}
          </option>
        ) : null}
        {options.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </TextField>
    </Stack>
  );
}

type FieldsProps = {
  draft: GuidanceDraft;
  onChange: (draft: GuidanceDraft) => void;
  momentOptions: MomentOption[];
  /** The Recipe being edited, which a Pairing cannot link to. */
  recipeId?: string;
  /** The Recipe content on the page now, which Suggest Guidance reads; without it there is no button. */
  page?: FamilyDraft;
};

/** The shared guidance fields with the Family's Recipe picker and Eating Moment list. */
export function FamilyGuidanceFields({
  draft,
  onChange,
  momentOptions,
  recipeId,
  page,
}: FieldsProps) {
  const suggestion = useGuidanceSuggestion({
    draft,
    onChange,
    send: (guidance) =>
      suggestFamilyGuidance({
        recipe: suggestionRecipeOf(page ?? emptyDraft()),
        guidance,
        ...(recipeId ? { recipeId } : {}),
      }),
  });
  const RecipePicker = useMemo(
    () =>
      function Picker(props: RecipePickerProps) {
        return <FamilyRecipePicker {...props} excludeId={recipeId} />;
      },
    [recipeId],
  );
  return (
    <GuidanceFields
      draft={draft}
      onChange={onChange}
      momentOptions={momentOptions}
      RecipePicker={RecipePicker}
      suggestion={page ? suggestion : undefined}
    />
  );
}

/**
 * Guidance of a saved Family Recipe, with its own Save. `page` is the Recipe form above it as
 * it is now (unsaved edits included), which Suggest Guidance reads; absent, the saved Recipe.
 */
export function FamilyGuidance({
  recipe,
  page,
}: {
  recipe: FamilyRecipeEdit;
  page?: FamilyDraft | null;
}) {
  const { t } = useTranslation(['admin', 'errors']);
  const save = useSetFamilyGuidance(recipe.id);
  const momentOptions = useMomentOptions();
  const [draft, setDraft] = useState<GuidanceDraft>(() =>
    toGuidanceDraft(recipe),
  );
  const [done, setDone] = useState(false);
  const problems = guidanceProblems(draft);

  const submit = async () => {
    try {
      const saved = await save.mutateAsync(toGuidanceInput(draft));
      setDraft(toGuidanceDraft(saved));
      setDone(true);
    } catch {
      // The error is shown below.
    }
  };

  return (
    <Stack
      spacing={2}
      component="section"
      aria-label={t('admin:recipe.guidance.title')}
    >
      <Typography variant="sectionLabel" color="text.secondary">
        {t('admin:recipe.guidance.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:recipe.guidance.hint')}
      </Typography>
      {save.error ? <Alert>{translateApiError(t, save.error)}</Alert> : null}
      <FamilyGuidanceFields
        draft={draft}
        onChange={(next) => {
          setDone(false);
          setDraft(next);
        }}
        momentOptions={momentOptions}
        recipeId={recipe.id}
        page={page ?? draftOfEdit(recipe)}
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          disabled={
            save.isPending ||
            problems.pairing ||
            problems.note ||
            problems.linkPosition !== null
          }
          onClick={() => void submit()}
        >
          {save.isPending
            ? t('admin:recipe.guidance.saving')
            : t('admin:recipe.guidance.save')}
        </Button>
        <Typography role="status" variant="body2">
          {done ? t('admin:recipe.guidance.saved') : null}
        </Typography>
      </Stack>
    </Stack>
  );
}
