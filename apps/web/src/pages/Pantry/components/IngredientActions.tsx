import {
  BatteryLowIcon,
  Box,
  StarFillIcon,
  StarIcon,
  border,
  color,
  radius,
  tokens,
  useToast,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useRowToggleReport } from '../../../components/StapleToggle';
import { translateApiError } from '../../../i18n/translateApiError';
import { useStapleMutations, useStaples } from '../../../lib/staples';

type Props = {
  ingredientId: string;
  /** The Ingredient's name, for the toasts. */
  name: string;
  runningLow: boolean;
  /** Flip Running low; the row sends it and says so. */
  onToggleLow: () => void;
};

/**
 * The action row at the bottom of an open, matched Ingredient's card: a Staple chip and a Running
 * low chip. Each flips at once and says so in a toast with no Undo (Pantry batches handoff, section 3).
 */
export function IngredientActions({
  ingredientId,
  name,
  runningLow,
  onToggleLow,
}: Props) {
  const { t } = useTranslation('pantry');
  const staple = useStapleChip(ingredientId, name);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '8px',
        p: '10px 12px',
        borderTop: `1px solid ${tokens.color.divider}`,
        animation: 'pp-actions-in 200ms 120ms both',
        '@keyframes pp-actions-in': { from: { opacity: 0 } },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <ActionChip
        aria-label={t('a11y.makeStaple')}
        pressed={staple.isStaple}
        tone="staple"
        ariaDisabled={!staple.ready}
        onClick={staple.toggle}
        icon={
          staple.isStaple ? <StarFillIcon size={16} /> : <StarIcon size={16} />
        }
      >
        {t(staple.isStaple ? 'group.staple' : 'group.makeStaple')}
      </ActionChip>
      <ActionChip
        pressed={runningLow}
        tone="low"
        onClick={onToggleLow}
        icon={<BatteryLowIcon size={16} strokeWidth={2.2} />}
      >
        {t('group.runningLow')}
      </ActionChip>
    </Box>
  );
}

/** Whether the Ingredient is a Staple, from the Staples query, and a toggle that says so. */
function useStapleChip(ingredientId: string, name: string) {
  const { t, i18n } = useTranslation('pantry');
  const staples = useStaples(i18n.language);
  const { add, remove } = useStapleMutations(i18n.language);
  const toast = useToast();
  const report = useRowToggleReport();
  const staple = staples.data?.find((s) => s.ingredientId === ingredientId);
  // An add in flight has no server id yet to remove by, so the chip waits for it to settle.
  const ready =
    staples.data !== undefined && !add.isPending && !remove.isPending;

  return {
    isStaple: staple !== undefined,
    ready,
    toggle: () => {
      if (!ready) return;
      const options = {
        onSuccess: () => report(null),
        onError: (error: unknown) => report(translateApiError(t, error)),
      };
      if (staple) remove.mutate(staple.id, options);
      else add.mutate({ ingredientId, name }, options);
      toast.show(t(staple ? 'toast.staple.off' : 'toast.staple.on', { name }));
    },
  };
}

const PRESSED = {
  staple: {
    bgcolor: tokens.color.accentTint,
    color: tokens.color.accentOnTint,
    '& svg': { color: 'pp.star' },
  },
  low: { bgcolor: tokens.color.butter, color: tokens.color.butterInk },
};

type ChipProps = {
  pressed: boolean;
  /** The chip's fill while pressed: accent tint with a star-coloured icon, or butter. */
  tone: keyof typeof PRESSED;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  ariaDisabled?: boolean;
  'aria-label'?: string;
};

function ActionChip({
  pressed,
  tone,
  icon,
  children,
  onClick,
  ariaDisabled,
  'aria-label': ariaLabel,
}: ChipProps) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      aria-disabled={ariaDisabled || undefined}
      onClick={onClick}
      sx={[
        {
          flex: '1 1 0',
          minWidth: 0,
          height: 38,
          px: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderRadius: radius.chip,
          border: `${border.width} solid ${color.lineStrong}`,
          bgcolor: color.cardBg,
          color: tokens.color.ink,
          font: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'background-color .15s, color .15s, transform 80ms',
          '&:active': { transform: 'scale(.96)' },
          '& svg': { flex: '0 0 auto' },
          '&:focus-visible': {
            outline: `2px solid ${tokens.color.accent}`,
            outlineOffset: 2,
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        },
        pressed && { borderColor: 'transparent', ...PRESSED[tone] },
      ]}
    >
      {icon}
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {children}
      </Box>
    </Box>
  );
}
