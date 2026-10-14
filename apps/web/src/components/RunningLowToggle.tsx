import { ChevronDownIcon, IconButton } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../i18n/translateApiError';
import { useRunningLow, useSetRunningLow } from '../lib/pantry';
import { useRowToggleReport } from './StapleToggle';

type Props = {
  ingredientId: string;
};

/** A downward toggle that flags an Ingredient as running low for the Family, or clears the flag. Its state is the Pantry's cache, so every row of the Ingredient agrees. */
export function RunningLowToggle({ ingredientId }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const runningLow = useRunningLow(i18n.language);
  const save = useSetRunningLow(i18n.language);
  const report = useRowToggleReport();
  const on = runningLow.data?.has(ingredientId) ?? false;

  return (
    <IconButton
      label={t('runningLow.toggle')}
      aria-pressed={on}
      tone="plain"
      size={40}
      ariaDisabled={save.isPending || runningLow.data === undefined}
      onClick={() =>
        save.mutate(
          { ingredientId, on: !on },
          {
            onSuccess: () => report(null),
            onError: (error: unknown) => report(translateApiError(t, error)),
          },
        )
      }
    >
      <ChevronDownIcon size={20} />
    </IconButton>
  );
}
