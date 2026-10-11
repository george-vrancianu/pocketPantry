import { Box, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeDetailStep, RecipeDetailTip } from '../../../lib/recipes';

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0
    ? `${minutes}:00`
    : `${minutes}:${String(rest).padStart(2, '0')}`;
}

/** Steps in order, each with the Tips anchored to it shown inline. */
export function StepList({
  steps,
  tips,
  'aria-label': label,
}: {
  steps: RecipeDetailStep[];
  tips: RecipeDetailTip[];
  'aria-label': string;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Stack component="ol" aria-label={label} spacing={1.5} sx={{ m: 0, pl: 3 }}>
      {steps.map((step) => (
        <Box component="li" key={step.id}>
          {step.text}
          {step.timerSeconds ? (
            <Typography variant="meta" color="text.secondary" component="p">
              {t('timer', { time: formatTimer(step.timerSeconds) })}
            </Typography>
          ) : null}
          <StepTips tips={tips.filter((tip) => tip.stepId === step.id)} />
        </Box>
      ))}
    </Stack>
  );
}

/** The Tips anchored to one Step, each labelled so they read apart from the Step text. */
function StepTips({ tips }: { tips: RecipeDetailTip[] }) {
  const { t } = useTranslation('recipes');
  if (tips.length === 0) return null;
  return (
    <Stack
      component="ul"
      aria-label={t('stepTips')}
      sx={{ listStyle: 'none', m: 0, p: 0 }}
    >
      {tips.map((tip) => (
        <Typography
          key={tip.id}
          component="li"
          variant="meta"
          color="text.secondary"
        >
          <strong>{t('tipLabel')}: </strong>
          {tip.text}
        </Typography>
      ))}
    </Stack>
  );
}
