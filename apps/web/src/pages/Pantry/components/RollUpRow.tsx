import {
  Box,
  ChevronDownIcon,
  Typography,
  tokens,
  radius,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../../../components/IngredientIconSlot';
import { StapleToggle } from '../../../components/StapleToggle';
import { RunningLowToggle } from '../../../components/RunningLowToggle';
import { RunningLowChip } from '../../../components/RunningLowChip';
import { ExpiryTag } from '../../../components/ExpiryTag';
import { useExpiryTags, type Batch } from '../../../lib/pantry';
import type { PantryRowHint } from '../hooks/usePantryRowHint';
import type { PantryRow } from '../hooks/usePantryScreen';
import { formatAmount } from '../../../lib/amount';
import { BatchDetail } from './BatchDetail';

type Props = {
  rollUp: PantryRow;
  today: Date;
  /** Open this Ingredient (closing any other on the page), or close it when it is open. */
  onToggle: () => void;
  onRemoveBatch: (batch: Batch) => void;
  /** Called when removing or moving a Batch leaves this row with nothing, so focus can go elsewhere. */
  onRowGone: () => void;
  rowHint: PantryRowHint;
};

/** One Ingredient in a Location: total quantity and soonest expiry, expanding to each Batch (with its own expiry) and the Staple star. */
export function RollUpRow({
  rollUp,
  today,
  onToggle,
  onRemoveBatch,
  onRowGone,
  rowHint,
}: Props) {
  const { t, i18n } = useTranslation('pantry');
  const expanded = rollUp.open;
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const { tagFor } = useExpiryTags(today);
  // A row without an expiry shows no tag; only Batch detail says "No expiry".
  const tag =
    rollUp.soonestExpiry === null ? null : tagFor(rollUp.soonestExpiry);

  // Tell the first-use hint when this roll-up is showing Batch rows to swipe.
  const showingBatches = expanded && !rollUp.gone;
  const { setOpen } = rowHint;
  useEffect(() => {
    setOpen(panelId, showingBatches);
    return () => setOpen(panelId, false);
  }, [panelId, showingBatches, setOpen]);

  // The last Batch was removed: if focus was on its row it is on the list or <body> now, so place it.
  const item = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (!rollUp.gone) return;
    const active = document.activeElement;
    if (active === document.body || item.current?.contains(active)) {
      onRowGone();
    }
    // Only when the row becomes gone, not on every render while it is.
  }, [rollUp.gone]);

  // Escape inside the open body closes it, and focus goes back to the row. A Batch row that used
  // the key (its removal confirmation) has already prevented the default.
  const closeFromInside = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    onToggle();
    toggle.current?.focus();
  };

  const detail = [
    rollUp.totals
      .map((total) =>
        formatAmount(total.quantity, total.unit, i18n.language, t),
      )
      .join(' + ') || null,
    rollUp.batches.length > 1
      ? t('batchCount', { count: rollUp.batches.length })
      : rollUp.batches[0].productDescription,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      component="li"
      ref={item}
      sx={{
        borderTop: `1px solid ${tokens.color.divider}`,
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Box
        // Awaiting its delete: nothing to expand, and nothing to focus.
        inert={rollUp.gone || undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: rollUp.gone ? 0.5 : 1,
        }}
      >
        <Box
          component="button"
          type="button"
          ref={toggle}
          aria-expanded={expanded}
          aria-controls={expanded && !rollUp.gone ? panelId : undefined}
          onClick={onToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexGrow: 1,
            minWidth: 0,
            minHeight: 60,
            p: 0,
            border: 0,
            bgcolor: 'transparent',
            color: 'inherit',
            font: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <IngredientIconSlot
            ingredientId={rollUp.ingredientId}
            aisleId={rollUp.aisleId}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              component="span"
              sx={{ display: 'block', fontSize: 15, fontWeight: 600 }}
            >
              {rollUp.name}
              {rollUp.unmatched ? (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: 11,
                    fontWeight: 700,
                    px: '8px',
                    py: '2px',
                    borderRadius: radius.pill,
                    bgcolor: tokens.color.soonBg,
                    color: tokens.color.soonFg,
                  }}
                >
                  {t('unmatched')}
                </Box>
              ) : null}
            </Typography>
            {detail ? (
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  fontSize: 12,
                  color: tokens.color.muted,
                  mt: '2px',
                }}
              >
                {detail}
              </Typography>
            ) : null}
          </Box>
          {tag && !expanded ? <ExpiryTag tag={tag} /> : null}
          {rollUp.runningLow ? <RunningLowChip /> : null}
          <Box
            component="span"
            aria-hidden="true"
            data-testid="chevron"
            sx={{
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              color: tokens.color.muted,
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 260ms cubic-bezier(.2,.8,.2,1)',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <ChevronDownIcon size={18} />
          </Box>
        </Box>
        {expanded && !rollUp.unmatched ? (
          <>
            <RunningLowToggle ingredientId={rollUp.key} />
            <StapleToggle ingredientId={rollUp.key} name={rollUp.name} />
          </>
        ) : null}
      </Box>
      {expanded && !rollUp.gone ? (
        <Box
          id={panelId}
          role="group"
          aria-label={`${rollUp.name}, ${t('group.batches', { count: rollUp.batches.length })}`}
          onKeyDown={closeFromInside}
        >
          <Box
            component="ul"
            sx={{
              mt: 0,
              mb: 1,
              // The rows pad themselves (12 pt), so their content lines up 50 pt in.
              ml: '38px',
              p: 0,
              borderTop: `1px solid ${tokens.color.divider}`,
            }}
          >
            {rollUp.batches.map((batch, index) => (
              <BatchDetail
                key={batch.id}
                batch={batch}
                peek={
                  index === 0 && rowHint.leader === panelId && rowHint.hint.peek
                }
                onLearned={rowHint.hint.onLearned}
                today={today}
                onRemove={onRemoveBatch}
                onLeft={() =>
                  rollUp.batches.length > 1
                    ? toggle.current?.focus()
                    : onRowGone()
                }
              />
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
