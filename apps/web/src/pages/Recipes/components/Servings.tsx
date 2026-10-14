import {
  IconButton,
  MinusIcon,
  PlusIcon,
  Stack,
  tokens,
  radius,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The most Servings the API will match or add for (keep in step with MAX_MATCH_SERVINGS in apps/api/src/recipes/recipe-pantry.schemas.ts). */
export const MAX_SERVINGS = 100;

/** How many servings a Recipe makes. */
export function Servings({ servings }: { servings: number }) {
  const { t } = useTranslation('recipes');
  return <span>{t('servings', { count: servings })}</span>;
}

/** Servings with a stepper, as a white pill; the Pantry status and quantities follow it. */
export function ServingsStepper({
  servings,
  onChange,
}: {
  servings: number;
  onChange: (servings: number) => void;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        height: 40,
        px: '3px',
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: radius.pill,
        fontSize: 13.5,
        fontWeight: 700,
      }}
    >
      <IconButton
        label={t('fewerServings')}
        size={34}
        tone="plain"
        ariaDisabled={servings <= 1}
        onClick={() => onChange(servings - 1)}
      >
        <MinusIcon size={16} />
      </IconButton>
      <Servings servings={servings} />
      <IconButton
        label={t('moreServings')}
        size={34}
        tone="plain"
        ariaDisabled={servings >= MAX_SERVINGS}
        onClick={() => onChange(servings + 1)}
      >
        <PlusIcon size={16} />
      </IconButton>
    </Stack>
  );
}
