import {
  Alert,
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import { localName, type AdminCatalog } from '../../../lib/admin';
import {
  DIFFICULTIES,
  useCreateRecipe,
  useUpdateRecipe,
  type AdminRecipe,
  type Difficulty,
} from '../../../lib/adminRecipes';
import { UNITS, type Unit } from '../../../lib/catalog';
import {
  documentOf,
  draftOf,
  emptyDraft,
  hasProblems,
  moved,
  newKey,
  problemsOf,
  type LineDraft,
  type RecipeDraft,
  type StepDraft,
} from '../recipeDraft';
import { EditorForm } from './EditorForm';
import { RowControls } from './RowControls';

type Props = {
  /** Omit to create a new Base Recipe. */
  recipe?: AdminRecipe;
  catalog: AdminCatalog;
  onSaved: (recipe: AdminRecipe) => void;
  onCancel: () => void;
};

/**
 * The Recipe document: metadata, ordered Ingredient Lines and ordered Steps.
 * Saving sends the whole document; lines and Steps that carry an id are
 * updated in place, so their translations and Step Tips stay put.
 */
export function RecipeForm({ recipe, catalog, onSaved, onCancel }: Props) {
  const { t, i18n } = useTranslation(['admin', 'recipes', 'common']);
  const create = useCreateRecipe();
  const update = useUpdateRecipe(recipe?.id ?? '');
  const write = recipe ? update : create;
  const [draft, setDraft] = useState<RecipeDraft>(() =>
    recipe ? draftOf(recipe, catalog, i18n.language) : emptyDraft(),
  );
  const [searchKey, setSearchKey] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  /** Steps whose blank text should be flagged: edited or blurred, not just added. */
  const [touchedSteps, setTouchedSteps] = useState<Set<number>>(new Set());
  /** A saved Step with Tips waiting for the Admin to confirm its removal. */
  const [removing, setRemoving] = useState<number | null>(null);
  const problems = problemsOf(draft);
  const showTitleError = problems.title && (titleTouched || !!recipe);
  const tipCount = (stepId?: string) =>
    stepId
      ? (recipe?.tips.filter((tip) => tip.stepId === stepId).length ?? 0)
      : 0;

  const change = (patch: Partial<RecipeDraft>) => {
    setJustSaved(false);
    setDraft((current) => ({ ...current, ...patch }));
  };
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

  const submit = () =>
    write.mutate(documentOf(draft), {
      onSuccess: (result) => {
        const saved = result as AdminRecipe;
        if (recipe) {
          // Reseed so lines and Steps added now carry their new ids.
          setDraft(draftOf(saved, catalog, i18n.language));
          setJustSaved(true);
        }
        onSaved(saved);
      },
    });

  const nameOf = (line: LineDraft) =>
    line.name || t('admin:recipe.lines.unknown');

  return (
    <EditorForm
      heading={
        recipe
          ? t('admin:recipe.editHeading', { title: recipe.title })
          : t('admin:recipe.new')
      }
      error={write.error}
      canSave={!hasProblems(problems)}
      saving={write.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      saveLabel={recipe ? t('admin:recipe.save') : t('admin:recipe.create')}
    >
      <TextField
        label={t('admin:recipe.fields.title')}
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
        label={t('admin:recipe.fields.cuisine')}
        value={draft.cuisineId}
        onChange={(event) => change({ cuisineId: event.target.value })}
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.fields.none')}</option>
        {catalog.cuisines.map((cuisine) => (
          <option key={cuisine.id} value={cuisine.id}>
            {localName(cuisine, i18n.language)}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label={t('admin:recipe.fields.method')}
        value={draft.methodId}
        onChange={(event) => change({ methodId: event.target.value })}
        slotProps={{ select: { native: true } }}
      >
        <option value="">{t('admin:recipe.fields.none')}</option>
        {catalog.methods.map((method) => (
          <option key={method.id} value={method.id}>
            {localName(method, i18n.language)}
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
            const name = nameOf(line);
            return (
              <Stack component="li" key={line.key} spacing={1}>
                <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
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
            change({
              lines: [
                ...draft.lines,
                {
                  key: newKey(),
                  ingredientId: ingredient.id,
                  name: ingredient.name,
                  quantity: '',
                  unit: ingredient.defaultUnit,
                  optional: false,
                  note: '',
                },
              ],
            });
            setSearchKey((value) => value + 1);
          }}
        />
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
                  error={
                    problems.steps[step.key] === 'text' &&
                    touchedSteps.has(step.key)
                  }
                  helperText={
                    problems.steps[step.key] === 'text' &&
                    touchedSteps.has(step.key)
                      ? t('admin:recipe.invalid.stepText')
                      : undefined
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
                    tipCount(step.id) > 0
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
                          count: tipCount(step.id),
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
      <Box role="status">
        {justSaved && recipe ? t('admin:recipe.saved') : null}
      </Box>
    </EditorForm>
  );
}
