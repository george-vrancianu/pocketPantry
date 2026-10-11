import { IconButton } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useStapleMutations, useStaples } from '../lib/staples';

type Props = {
  ingredientId: string;
  /** The Ingredient's display name, for the button's accessible name. */
  name: string;
};

/** A ★ that marks an Ingredient as a Staple, or unmarks it. Unmatched names have no toggle. */
export function StapleToggle({ ingredientId, name }: Props) {
  const { t, i18n } = useTranslation('staples');
  const staples = useStaples(i18n.language);
  const { add, remove } = useStapleMutations(i18n.language);
  const staple = staples.data?.find((s) => s.ingredientId === ingredientId);
  const busy = add.isPending || remove.isPending;

  return (
    <IconButton
      label={t(staple ? 'toggle.remove' : 'toggle.add', { name })}
      aria-pressed={staple !== undefined}
      tone="plain"
      size={40}
      ariaDisabled={busy || staples.data === undefined}
      onClick={() =>
        staple ? remove.mutate(staple.id) : add.mutate({ ingredientId })
      }
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={staple ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
      </svg>
    </IconButton>
  );
}
