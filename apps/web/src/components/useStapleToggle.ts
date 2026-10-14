import { useTranslation } from 'react-i18next';
import { useStapleMutations, useStaples } from '../lib/staples';
import { useRowToggleOutcome } from './RowToggleErrors';

/**
 * Whether an Ingredient is a Staple, from the Staples query, and a toggle that adds it or removes it
 * by its Staple id. `onSaved` runs once the server has accepted the change, with the new state; a
 * refusal goes to the page's row-toggle error. The toggle does nothing until `ready`: an add in
 * flight has no server id yet to remove by.
 */
export function useStapleToggle(
  ingredientId: string,
  name: string,
  onSaved?: (isStaple: boolean) => void,
) {
  const { i18n } = useTranslation();
  const staples = useStaples(i18n.language);
  const { add, remove } = useStapleMutations(i18n.language);
  const outcome = useRowToggleOutcome();
  const staple = staples.data?.find((s) => s.ingredientId === ingredientId);
  const ready =
    staples.data !== undefined && !add.isPending && !remove.isPending;

  return {
    isStaple: staple !== undefined,
    ready,
    toggle: () => {
      if (!ready) return;
      if (staple)
        remove.mutate(
          staple.id,
          outcome(() => onSaved?.(false)),
        );
      else
        add.mutate(
          { ingredientId, name },
          outcome(() => onSaved?.(true)),
        );
    },
  };
}

export type StapleToggleState = ReturnType<typeof useStapleToggle>;
