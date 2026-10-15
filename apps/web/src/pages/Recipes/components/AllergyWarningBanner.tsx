import { Alert, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { AllergyWarning } from '../../../lib/recipes';

/**
 * The Allergy Warning above a Recipe's tabs (ADR 0014): strong when a required line contains one
 * of the viewer's Allergies, softer when only optional or Unchecked lines might. Never claims a
 * Recipe is free of anything; no warning means no banner.
 */
export function AllergyWarningBanner({ warning }: { warning: AllergyWarning }) {
  const { t } = useTranslation('recipes');
  const strong = warning.entries.filter((e) => e.severity === 'strong');
  const soft = warning.entries.filter((e) => e.severity === 'soft');
  const lines = [
    ...(strong.length > 0
      ? [
          {
            key: 'strong',
            text: t('allergyWarning.strong', {
              names: strong.map((e) => e.allergen.name).join(', '),
            }),
          },
        ]
      : []),
    ...soft.map((e) => ({
      key: `optional-${e.allergen.id}`,
      text: t('allergyWarning.optionalLine', { name: e.allergen.name }),
    })),
    ...(warning.uncheckedCount > 0
      ? [
          {
            key: 'unchecked',
            text: t('allergyWarning.unchecked', {
              count: warning.uncheckedCount,
            }),
          },
        ]
      : []),
  ];
  return (
    <div
      role="group"
      aria-label={t('allergyWarning.title')}
      data-severity={warning.severity}
    >
      <Alert severity={warning.severity === 'strong' ? 'error' : 'warning'}>
        <Stack spacing={0.5}>
          {lines.map((line, index) => (
            <Typography
              key={line.key}
              sx={{ fontWeight: index === 0 && strong.length > 0 ? 700 : 500 }}
            >
              {line.text}
            </Typography>
          ))}
        </Stack>
      </Alert>
    </div>
  );
}
