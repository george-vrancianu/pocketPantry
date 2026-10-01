import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { expiryChipFor, type RollUp } from '../../../lib/pantry';
import { formatAmount } from './amount';
import { BatchDetail } from './BatchDetail';
import { ExpiryChip } from './ExpiryChip';

type Props = {
  rollUp: RollUp;
  today: Date;
  /** Called when deleting a Batch leaves this row with nothing, so focus can go elsewhere. */
  onRowGone: () => void;
};

/** One Ingredient in a Location: total quantity and soonest expiry, expanding to each Batch. */
export function RollUpRow({ rollUp, today, onRowGone }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const chip = expiryChipFor(rollUp.soonestExpiry, today);

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
      sx={{
        borderTop: `1px solid ${tokens.color.divider}`,
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Box
        component="button"
        type="button"
        ref={toggle}
        aria-expanded={expanded}
        aria-controls={expanded ? panelId : undefined}
        onClick={() => setExpanded((open) => !open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
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
        <Box
          aria-hidden="true"
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '12px',
            bgcolor: rollUp.unmatched
              ? tokens.color.soonBg
              : tokens.color.accentTint,
            color: rollUp.unmatched ? tokens.color.soonFg : tokens.color.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: tokens.font.display,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {rollUp.name.charAt(0).toLocaleUpperCase(i18n.language)}
        </Box>
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
        {chip && rollUp.soonestExpiry ? (
          <ExpiryChip chip={chip} expiryDate={rollUp.soonestExpiry} />
        ) : null}
      </Box>
      {expanded ? (
        <Box
          component="ul"
          id={panelId}
          aria-label={t('batchesOf', { name: rollUp.name })}
          sx={{ m: 0, mb: 1, pl: '48px', pr: 0 }}
        >
          {rollUp.batches.map((batch) => (
            <BatchDetail
              key={batch.id}
              batch={batch}
              today={today}
              onDeleted={() =>
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
