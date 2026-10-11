import { IconButton, MinusIcon, PlusIcon, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The most Servings the API will match or add for. */
export const MAX_SERVINGS = 100;

/** How many servings a Recipe makes. */
export function Servings({ servings }: { servings: number }) {
  const { t } = useTranslation('recipes');
  return <span>{t('servings', { count: servings })}</span>;
}

/** Servings with a stepper; the Pantry status and quantities follow it. */
export function ServingsStepper({
  servings,
  onChange,
}: {
  servings: number;
  onChange: (servings: number) => void;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <IconButton
        label={t('fewerServings')}
        size={40}
        ariaDisabled={servings <= 1}
        onClick={() => onChange(servings - 1)}
      >
        <MinusIcon />
      </IconButton>
      <Servings servings={servings} />
      <IconButton
        label={t('moreServings')}
        size={40}
        ariaDisabled={servings >= MAX_SERVINGS}
        onClick={() => onChange(servings + 1)}
      >
        <PlusIcon />
      </IconButton>
    </Stack>
  );
}
