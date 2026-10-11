import {
  Alert,
  Button,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import { DIFFICULTIES, type Difficulty } from '../../../lib/adminRecipes';
import { UNITS, type Unit } from '../../../lib/catalog';
import type { FamilyRecipeDocument } from '../../../lib/familyRecipes';
import { useRecipeFilters } from '../../../lib/recipes';
import type { GuidanceInput } from '../../../lib/adminRecipes';
import {
  guidanceProblems,
  toGuidanceInput,
  type GuidanceDraft,
} from '../../../lib/guidanceDraft';
import type { MomentOption } from '../../../components/recipeEditor/GuidanceFields';
import { FamilyGuidanceFields } from './FamilyGuidance';
import { EditorForm } from '../../../components/EditorForm';
import { RowControls } from '../../../components/RowControls';
import {
  documentOf,
  hasProblems,
  moved,
  newKey,
  problemsOf,
  type FamilyDraft,
} from '../familyDraft';
import type { LineDraft, StepDraft } from '../../../lib/recipeDraft';

type Props = {
  heading: string;
  description?: string;
  initial: FamilyDraft;
  saveLabel: string;
  saving: boolean;
  error: unknown;
  /** How many own Tips a saved Step carries, for the warning before removing it. */
  stepTipCount?: (stepId: string) => number;
  /** A Variant draft brings its guidance, edited and saved with the document. */
  guidance?: { initial: GuidanceDraft; momentOptions: MomentOption[] };
  onSave: (document: FamilyRecipeDocument, guidance?: GuidanceInput) => void;
  onCancel: () => void;
};

/**
 * The Family's Recipe document: metadata, Cuisine and Method from the curated
 * lists, Ingredient Lines (a Catalog Ingredient or a typed name) and Steps.
 * Family Recipes are never translated, so there is one text per field.
 */
export function FamilyRecipeForm({
  heading,
  description,
  initial,
  saveLabel,
  saving,
  error,
  stepTipCount,
  guidance,
  onSave,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation(['recipes', 'admin', 'common']);
  const filters = useRecipeFilters(i18n.language);
  const [draft, setDraft] = useState<FamilyDraft>(initial);
  const [searchKey, setSearchKey] = useState(0);
  const [guidanceDraft, setGuidanceDraft] = useState<GuidanceDraft | null>(
    guidance?.initial ?? null,
  );
  const [freeName, setFreeName] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [touchedSteps, setTouchedSteps] = useState<Set<number>>(new Set());
  const [removing, setRemoving] = useState<number | null>(null);
  const problems = problemsOf(draft);
  const guidanceBad = guidanceDraft
    ? Object.values(guidanceProblems(guidanceDraft)).some(
        (problem) => problem !== false && problem !== null,
      )
    : false;
  const showTitleError = problems.title && titleTouched;

  const change = (patch: Partial<FamilyDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const changeLine = (key: number, patch: Partial<LineDraft>) =>
    change({
      lines: draft.lines.map((line) =>
        line.key === key ? { ...line, ...patch } : line,
      ),
    });
  const changeStep = (key: number, patch: Partial<StepDraft>) =>
    change({
      steps: draft.steps.map((step) =>
        step.key === key ? { ...step, ...patch } : step,
      ),
    });
  const addLine = (line: Pick<LineDraft, 'ingredientId' | 'name' | 'unit'>) =>
    change({
      lines: [
        ...draft.lines,
        { key: newKey(), quantity: '', optional: false, note: '', ...line },
      ],
    });
  const addFreeName = () => {
    const name = freeName.trim();
    if (!name) return;
    addLine({ ingredientId: '', name, unit: 'g' });
    setFreeName('');
  };

  return (
    <EditorForm
      heading={heading}
      description={description}
      error={error}
      canSave={!hasProblems(problems) && !guidanceBad}
      saving={saving}
      onSubmit={() =>
        onSave(
          documentOf(draft),
          guidanceDraft ? toGuidanceInput(guidanceDraft) : undefined,
        )
      }
      onCancel={onCancel}
      saveLabel={saveLabel}
    >
      <TextField
        label={t('recipes:family.title')}
        value={draft.title}
        onChange={(event) => change({ title: event.target.value })}
        onBlur={() => setTitleTouched(true)}
        error={showTitleError}
        helperText={
          showTitleError ? t('admin:recipe.invalid.title') : undefined
        }
        required
      />
      <Stack direction="row" spacing={1}>
        <TextField
          label={t('admin:recipe.fields.servings')}
          value={draft.servings}
          onChange={(event) => change({ servings: event.target.value })}
          error={problems.servings}
          helperText={
            problems.servings ? t('admin:recipe.invalid.servings') : undefined
          }
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          required
        />
        <TextField
          label={t('admin:recipe.fields.prepMinutes')}
          value={draft.prepMinutes}
          onChange={(event) => change({ prepMinutes: event.target.value })}
          error={problems.prepMinutes}
          helperText={
            problems.prepMinutes ? t('admin:recipe.invalid.minutes') : undefined
          }
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />
        <TextField
          label={t('admin:recipe.fields.cookMinutes')}
          value={draft.cookMinutes}
          onChange={(event) => change({ cookMinutes: event.target.value })}
          error={problems.cookMinutes}
          helperText={
            problems.cookMinutes ? t('admin:recipe.invalid.minutes') : undefined
          }
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />
      </Stack>
      <TextField
        select
        label={t('admin:recipe.fields.difficulty')}
        value={draft.difficulty}
        onChange={(event) =>
          change({ difficulty: event.target.value as Difficulty | '' })
        }
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.fields.difficultyNone')}</option>
        {DIFFICULTIES.map((level) => (
          <option key={level} value={level}>
            {t(`recipes:difficulty.${level}`)}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label={t('recipes:cuisine')}
        value={draft.cuisineId}
        onChange={(event) => change({ cuisineId: event.target.value })}
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.fields.none')}</option>
        {(filters.data?.cuisines ?? []).map((cuisine) => (
          <option key={cuisine.id} value={cuisine.id}>
            {cuisine.name}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label={t('recipes:method')}
        value={draft.methodId}
        onChange={(event) => change({ methodId: event.target.value })}
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.fields.none')}</option>
        {(filters.data?.methods ?? []).map((method) => (
          <option key={method.id} value={method.id}>
            {method.name}
          </option>
        ))}
      </TextField>

      <Stack
        component="fieldset"
        spacing={1.5}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Typography component="legend" variant="sectionLabel">
          {t('admin:recipe.lines.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.lines.hint')}
        </Typography>
        {draft.lines.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.lines.empty')}
          </Typography>
        ) : null}
        <Stack
          component="ol"
          spacing={2}
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {draft.lines.map((line, index) => {
            const name = line.name || t('admin:recipe.lines.unknown');
            return (
              <Stack component="li" key={line.key} spacing={1}>
                <Typography sx={{ fontWeight: 600 }}>
                  {name}
                  {line.ingredientId === '' ? (
                    <Typography
                      component="span"
                      variant="meta"
                      color="text.secondary"
                    >
                      {' '}
                      ({t('recipes:family.freeTextNote')})
                    </Typography>
                  ) : null}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label={t('admin:recipe.lines.quantity', { name })}
                    value={line.quantity}
                    onChange={(event) =>
                      changeLine(line.key, { quantity: event.target.value })
                    }
                    error={problems.lines[line.key]}
                    helperText={
                      problems.lines[line.key]
                        ? t('admin:recipe.invalid.quantity')
                        : undefined
                    }
                    slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                  />
                  <TextField
                    select
                    label={t('admin:recipe.lines.unit', { name })}
                    value={line.unit}
                    onChange={(event) =>
                      changeLine(line.key, { unit: event.target.value as Unit })
                    }
                    slotProps={{ select: { native: true } }}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {t(`common:units.${unit}`)}
                      </option>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  label={t('admin:recipe.lines.note', { name })}
                  value={line.note}
                  onChange={(event) =>
                    changeLine(line.key, { note: event.target.value })
                  }
                />
                <Checkbox
                  label={t('admin:recipe.lines.optional', { name })}
                  checked={line.optional}
                  onChange={(event) =>
                    changeLine(line.key, { optional: event.target.checked })
                  }
                />
                <RowControls
                  moveUp={t('admin:recipe.lines.moveUp', { name })}
                  moveDown={t('admin:recipe.lines.moveDown', { name })}
                  remove={t('admin:recipe.lines.remove', { name })}
                  first={index === 0}
                  last={index === draft.lines.length - 1}
                  onMoveUp={() =>
                    change({ lines: moved(draft.lines, index, -1) })
                  }
                  onMoveDown={() =>
                    change({ lines: moved(draft.lines, index, 1) })
                  }
                  onRemove={() =>
                    change({
                      lines: draft.lines.filter(
                        (item) => item.key !== line.key,
                      ),
                    })
                  }
                />
              </Stack>
            );
          })}
        </Stack>
        <CatalogSearch
          key={searchKey}
          onSelect={(ingredient) => {
            addLine({
              ingredientId: ingredient.id,
              name: ingredient.name,
              unit: ingredient.defaultUnit,
            });
            setSearchKey((value) => value + 1);
          }}
        />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            label={t('recipes:family.freeTextLabel')}
            value={freeName}
            onChange={(event) => setFreeName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addFreeName();
              }
            }}
          />
          <Button
            variant="secondary"
            disabled={freeName.trim() === ''}
            onClick={addFreeName}
          >
            {t('recipes:family.freeTextAdd')}
          </Button>
        </Stack>
      </Stack>

      <Stack
        component="fieldset"
        spacing={1.5}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Typography component="legend" variant="sectionLabel">
          {t('admin:recipe.steps.title')}
        </Typography>
        {draft.steps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.steps.empty')}
          </Typography>
        ) : null}
        <Stack
          component="ol"
          spacing={2}
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {draft.steps.map((step, index) => {
            const number = index + 1;
            const tips = step.id && stepTipCount ? stepTipCount(step.id) : 0;
            const flagged =
              problems.steps[step.key] === 'text' && touchedSteps.has(step.key);
            return (
              <Stack component="li" key={step.key} spacing={1}>
                <TextField
                  label={t('admin:recipe.steps.text', { number })}
                  value={step.text}
                  onChange={(event) => {
                    setTouchedSteps((set) => new Set(set).add(step.key));
                    changeStep(step.key, { text: event.target.value });
                  }}
                  onBlur={() =>
                    setTouchedSteps((set) => new Set(set).add(step.key))
                  }
                  error={flagged}
                  helperText={
                    flagged ? t('admin:recipe.invalid.stepText') : undefined
                  }
                  multiline
                  minRows={2}
                />
                <TextField
                  label={t('admin:recipe.steps.timer', { number })}
                  value={step.timer}
                  onChange={(event) =>
                    changeStep(step.key, { timer: event.target.value })
                  }
                  error={problems.steps[step.key] === 'timer'}
                  helperText={
                    problems.steps[step.key] === 'timer'
                      ? t('admin:recipe.invalid.timer')
                      : undefined
                  }
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
                <RowControls
                  moveUp={t('admin:recipe.steps.moveUp', { number })}
                  moveDown={t('admin:recipe.steps.moveDown', { number })}
                  remove={t('admin:recipe.steps.remove', { number })}
                  first={index === 0}
                  last={index === draft.steps.length - 1}
                  onMoveUp={() =>
                    change({ steps: moved(draft.steps, index, -1) })
                  }
                  onMoveDown={() =>
                    change({ steps: moved(draft.steps, index, 1) })
                  }
                  onRemove={() =>
                    tips > 0
                      ? setRemoving(step.key)
                      : change({
                          steps: draft.steps.filter(
                            (item) => item.key !== step.key,
                          ),
                        })
                  }
                />
                {removing === step.key ? (
                  <Alert severity="warning">
                    <Stack spacing={1}>
                      <span>
                        {t('admin:recipe.steps.tipsWarning', {
                          number,
                          count: tips,
                        })}
                      </span>
                      <Stack direction="row" spacing={1}>
                        <Button
                          onClick={() => {
                            setRemoving(null);
                            change({
                              steps: draft.steps.filter(
                                (item) => item.key !== step.key,
                              ),
                            });
                          }}
                        >
                          {t('admin:recipe.steps.removeWithTips')}
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => setRemoving(null)}
                        >
                          {t('admin:recipe.steps.keep')}
                        </Button>
                      </Stack>
                    </Stack>
                  </Alert>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
        <div>
          <Button
            variant="secondary"
            onClick={() =>
              change({
                steps: [...draft.steps, { key: newKey(), text: '', timer: '' }],
              })
            }
          >
            {t('admin:recipe.steps.add')}
          </Button>
        </div>
      </Stack>
      {guidance && guidanceDraft ? (
        <Stack
          spacing={2}
          component="section"
          aria-label={t('admin:recipe.guidance.title')}
        >
          <Typography variant="sectionLabel" color="text.secondary">
            {t('admin:recipe.guidance.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('recipes:family.guidanceHint')}
          </Typography>
          <FamilyGuidanceFields
            draft={guidanceDraft}
            onChange={setGuidanceDraft}
            momentOptions={guidance.momentOptions}
          />
        </Stack>
      ) : null}
    </EditorForm>
  );
}
