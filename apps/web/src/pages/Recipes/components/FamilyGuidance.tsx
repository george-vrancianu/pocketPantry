import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useSetFamilyGuidance,
  type FamilyRecipeEdit,
} from '../../../lib/familyRecipes';
import { useRecipe, useRecipes } from '../../../lib/recipes';
import {
  GuidanceFields,
  type MomentOption,
  type RecipePickerProps,
} from '../../Admin/components/GuidanceFields';
import {
  guidanceProblems,
  toGuidanceDraft,
  toGuidanceInput,
  type GuidanceDraft,
} from '../../Admin/guidanceDraft';

/**
 * The names of the Eating Moments a Recipe already uses, read from the
 * Member's own view of it. The Member has no list of all Eating Moments yet,
 * so new ones cannot be added from here.
 */
export function useMomentNames(recipeId: string): MomentOption[] {
  const { i18n } = useTranslation();
  const detail = useRecipe(recipeId, i18n.language).data;
  return (detail?.guidance.eatingMoments ?? []).map((m) => ({
    id: m.eatingMomentId,
    name: m.name,
    archived: false,
  }));
}

/** Links a Pairing to a Recipe the Member can see: search by title, then choose. */
function FamilyRecipePicker({
  label,
  value,
  onChange,
  excludeId,
}: RecipePickerProps & { excludeId?: string }) {
  const { t, i18n } = useTranslation(['recipes', 'admin']);
  const [search, setSearch] = useState('');
  const results = useRecipes(
    { search, cuisineId: '', methodId: '' },
    i18n.language,
  );
  const current = useRecipe(value, i18n.language);
  const options = (results.data ?? []).filter((r) => r.id !== excludeId);
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
        onChange={(event) => onChange(event.target.value)}
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.guidance.pairings.choose')}</option>
        {value && !known ? (
          <option value={value}>{current.data?.title ?? value}</option>
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
};

/** The shared guidance fields with the Family's Recipe picker and no Eating Moment picker. */
export function FamilyGuidanceFields({
  draft,
  onChange,
  momentOptions,
  recipeId,
}: FieldsProps) {
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
      canAddMoments={false}
      RecipePicker={RecipePicker}
    />
  );
}

/** Guidance of a saved Family Recipe, with its own Save. */
export function FamilyGuidance({ recipe }: { recipe: FamilyRecipeEdit }) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const save = useSetFamilyGuidance(recipe.id, i18n.language);
  const momentOptions = useMomentNames(recipe.id);
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
