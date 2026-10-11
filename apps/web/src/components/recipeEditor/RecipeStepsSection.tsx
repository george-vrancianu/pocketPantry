import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  moved,
  newKey,
  type DraftProblems,
  type StepDraft,
} from '../../lib/recipeDraft';
import { RowControls } from '../RowControls';

type Props = {
  steps: StepDraft[];
  problems: DraftProblems;
  /** How many own Tips a saved Step carries, for the warning before removing it. */
  tipCount: (step: StepDraft) => number;
  onChange: (steps: StepDraft[]) => void;
};

/** The ordered Steps of a Recipe draft, with Move up/down, remove and add. */
export function RecipeStepsSection({
  steps,
  problems,
  tipCount,
  onChange,
}: Props) {
  const { t } = useTranslation(['admin']);
  /** Steps whose blank text should be flagged: edited or blurred, not just added. */
  const [touchedSteps, setTouchedSteps] = useState<Set<number>>(new Set());
  /** A saved Step with Tips waiting for the user to confirm its removal. */
  const [removing, setRemoving] = useState<number | null>(null);
  const touch = (key: number) =>
    setTouchedSteps((set) => new Set(set).add(key));
  const changeStep = (key: number, patch: Partial<StepDraft>) =>
    onChange(
      steps.map((step) => (step.key === key ? { ...step, ...patch } : step)),
    );
  const without = (key: number) => steps.filter((item) => item.key !== key);

  return (
    <Stack
      component="fieldset"
      spacing={1.5}
      sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
    >
      <Typography component="legend" variant="sectionLabel">
        {t('admin:recipe.steps.title')}
      </Typography>
      {steps.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.steps.empty')}
        </Typography>
      ) : null}
      <Stack component="ol" spacing={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {steps.map((step, index) => {
          const number = index + 1;
          const tips = tipCount(step);
          const flagged =
            problems.steps[step.key] === 'text' && touchedSteps.has(step.key);
          return (
            <Stack component="li" key={step.key} spacing={1}>
              <TextField
                label={t('admin:recipe.steps.text', { number })}
                value={step.text}
                onChange={(event) => {
                  touch(step.key);
                  changeStep(step.key, { text: event.target.value });
                }}
                onBlur={() => touch(step.key)}
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
                last={index === steps.length - 1}
                onMoveUp={() => onChange(moved(steps, index, -1))}
                onMoveDown={() => onChange(moved(steps, index, 1))}
                onRemove={() =>
                  tips > 0 ? setRemoving(step.key) : onChange(without(step.key))
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
                          onChange(without(step.key));
                        }}
                      >
                        {t('admin:recipe.steps.removeWithTips')}
                      </Button>
                      <Button variant="text" onClick={() => setRemoving(null)}>
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
            onChange([...steps, { key: newKey(), text: '', timer: '' }])
          }
        >
          {t('admin:recipe.steps.add')}
        </Button>
      </div>
    </Stack>
  );
}
