import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState } from 'react';
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
  onRemoveBatch: (batch: Batch) => void;
  /** Called when removing or moving a Batch leaves this row with nothing, so focus can go elsewhere. */
  onRowGone: () => void;
  rowHint: PantryRowHint;
};

/** One Ingredient in a Location: total quantity and soonest expiry, expanding to each Batch (with its own expiry) and the Staple star. */
export function RollUpRow({
  rollUp,
  today,
  onRemoveBatch,
  onRowGone,
  rowHint,
}: Props) {
  const { t, i18n } = useTranslation('pantry');
  const [expanded, setExpanded] = useState(false);
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
          onClick={() => setExpanded((open) => !open)}
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
                    borderRadius: `${tokens.radius.chip}px`,
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
          component="ul"
          id={panelId}
          aria-label={t('batchesOf', { name: rollUp.name })}
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
      ) : null}
    </Box>
  );
}
