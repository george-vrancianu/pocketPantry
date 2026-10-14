import { Box, ClockIcon, Stack, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeDetailStep, RecipeDetailTip } from '../../../lib/recipes';
import { displayType, radius } from '../../../lib/themeVars';

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0
    ? `${minutes}:00`
    : `${minutes}:${String(rest).padStart(2, '0')}`;
}

/** A dashed callout for a Tip: "Tip: {text}", plus "(from the Base Recipe)" when inherited. */
export function TipCallout({ tip }: { tip: RecipeDetailTip }) {
  const { t } = useTranslation('recipes');
  return (
    <Box
      sx={{
        mt: '8px',
        px: '11px',
        py: '9px',
        borderRadius: radius.control,
        bgcolor: tokens.color.subtle,
        border: `1px dashed ${tokens.color.line}`,
        fontSize: 13,
        lineHeight: 1.4,
        color: tokens.color.muted,
      }}
    >
      <Box component="b" sx={{ color: tokens.color.ink, fontWeight: 700 }}>
        {t('tipLabel')}:
      </Box>{' '}
      {tip.text}
      {tip.inherited ? (
        <Box component="span" sx={{ fontSize: 12 }}>
          {' '}
          ({t('inheritedTip')})
        </Box>
      ) : null}
    </Box>
  );
}

/** The Tips anchored to one Step. */
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
        <li key={tip.id}>
          <TipCallout tip={tip} />
        </li>
      ))}
    </Stack>
  );
}

/** Steps in order as numbered blocks in a card, each with the Tips anchored to it shown inline. */
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
    <Box
      component="ol"
      aria-label={label}
      sx={{
        listStyle: 'none',
        m: 0,
        px: '16px',
        py: '4px',
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: radius.card,
      }}
    >
      {steps.map((step, index) => (
        <Box
          component="li"
          key={step.id}
          sx={{
            display: 'flex',
            gap: '12px',
            py: '12px',
            borderTop: index === 0 ? 0 : `1px solid ${tokens.color.divider}`,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              flex: '0 0 28px',
              height: 28,
              borderRadius: '50%',
              bgcolor: tokens.color.ink,
              color: tokens.color.surface,
              display: 'grid',
              placeItems: 'center',
              ...displayType,
              fontSize: 14,
            }}
          >
            {index + 1}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, lineHeight: 1.45, fontWeight: 500 }}>
            {step.text}
            {step.timerSeconds ? (
              <Box component="p" sx={{ m: 0, mt: '8px', lineHeight: 'normal' }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: 32,
                    px: '11px',
                    borderRadius: radius.pill,
                    bgcolor: tokens.color.accentTint,
                    color: tokens.color.accent,
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <ClockIcon size={14} />
                  {t('timer', { time: formatTimer(step.timerSeconds) })}
                </Box>
              </Box>
            ) : null}
            <StepTips tips={tips.filter((tip) => tip.stepId === step.id)} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
