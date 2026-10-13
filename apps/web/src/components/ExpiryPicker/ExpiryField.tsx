import {
  Box,
  CalendarIcon,
  ChevronRightIcon,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { expiryTagFor, fullDate, relativeDay } from '../../lib/pantry';
import { useStaleThresholdDays } from '../../lib/settings';
import { ExpiryTag } from '../ExpiryTag';
import { ExpirySheet } from './ExpirySheet';

export type ExpiryFieldProps = {
  /** The summary row's id (the label above points at it). */
  id?: string;
  /** The label above the row, which also starts its accessible name, e.g. "Expires". */
  label: string;
  /** `YYYY-MM-DD`, or null for no expiry. */
  value: string | null;
  /** Called on every tap in the sheet, so closing it never throws a change away. */
  onChange: (value: string | null) => void;
  /** The Default Expiry in days, for the "Usual" quick pick; null when there is none (or for an Unmatched name). */
  usualDays: number | null;
  /** The sheet's context line, e.g. "Greek yogurt · 500 g · Fridge". */
  context: string;
};

/**
 * The expiry summary row of a form: a calendar tile, the date and how far away it is (or "No expiry date"), its tag
 * and a chevron. Tapping it opens the `ExpirySheet`.
 */
export function ExpiryField({
  id,
  label,
  value,
  onChange,
  usualDays,
  context,
}: ExpiryFieldProps) {
  const { t, i18n } = useTranslation('pantry');
  const fallbackId = useId();
  const rowId = id ?? fallbackId;
  const [open, setOpen] = useState(false);
  const staleThresholdDays = useStaleThresholdDays(i18n.language);
  const today = new Date();
  const { color } = tokens;

  const name =
    value === null
      ? t('picker.summaryNone', { label })
      : t('picker.summary', {
          label,
          date: fullDate(value, today, i18n.language, 'long'),
          relative: relativeDay(value, today, i18n.language),
        });

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={rowId}
        variant="sectionLabel"
        color="text.secondary"
        sx={{ display: 'block', px: '2px', mb: 0.5 }}
      >
        {label}
      </Typography>
      <Box
        component="button"
        type="button"
        id={rowId}
        aria-haspopup="dialog"
        aria-label={name}
        onClick={() => setOpen(true)}
        sx={{
          width: '100%',
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          p: '8px 10px 8px 14px',
          borderRadius: `${tokens.radius.field}px`,
          border: `1.5px solid ${color.line}`,
          backgroundColor: color.surface,
          color: color.ink,
          font: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          '&:focus-visible': {
            outline: 'none',
            borderColor: color.accent,
            boxShadow: `0 0 0 3px ${color.accentTint}`,
          },
        }}
      >
        <Box
          component="span"
          sx={{
            flex: 'none',
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            borderRadius: `${tokens.radius.field - 2}px`,
            backgroundColor: color.accentTint,
            color: color.accent,
          }}
        >
          <CalendarIcon size={18} />
        </Box>
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: 15,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value === null
              ? t('picker.none')
              : fullDate(value, today, i18n.language)}
          </Box>
          <Box component="span" sx={{ fontSize: 12.5, color: color.muted }}>
            {value === null
              ? t('picker.tapToSet')
              : relativeDay(value, today, i18n.language)}
          </Box>
        </Box>
        {value === null ? null : (
          <ExpiryTag tag={expiryTagFor(value, today, staleThresholdDays)} />
        )}
        <ChevronRightIcon
          size={18}
          color={color.muted}
          style={{ flex: 'none' }}
        />
      </Box>
      <ExpirySheet
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={onChange}
        usualDays={usualDays}
        context={context}
        title={label}
      />
    </Box>
  );
}
