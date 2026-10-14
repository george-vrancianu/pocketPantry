import { Tag } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** Scale .4 -> 1 with an overshoot, as the flag turns on (Pantry batches handoff, section 6). */
const popSx = {
  animation: 'pp-running-low-pop 420ms cubic-bezier(.2,.8,.2,1.4)',
  '@keyframes pp-running-low-pop': {
    from: { transform: 'scale(.4)', opacity: 0 },
    to: { transform: 'none', opacity: 1 },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

/**
 * The "Running low" chip, in the expiry tag's style (the `soon` tone). The caller shows it while the
 * Ingredient is flagged; `pop` animates it in when the Member has just turned the flag on.
 */
export function RunningLowChip({ pop = false }: { pop?: boolean }) {
  const { t } = useTranslation('pantry');

  return (
    <Tag tone="soon" sx={pop ? popSx : undefined}>
      {t('runningLow.chip')}
    </Tag>
  );
}
