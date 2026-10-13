import {
  Box,
  Button,
  CloseIcon,
  Sheet,
  Stack,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { expiryTagFor, fullDate, relativeDay } from '../../lib/pantry';
import { useStaleThresholdDays } from '../../lib/settings';
import { ExpiryTag } from '../ExpiryTag';
import { ExpiryCalendar, type ExpiryCalendarHandle } from './ExpiryCalendar';
import { QuickPicks } from './QuickPicks';

export type ExpirySheetProps = {
  open: boolean;
  /** Done, the scrim and Escape. The value is already saved through `onChange`, so closing never discards. */
  onClose: () => void;
  /** After the close transition, with focus back on the opener. */
  onExited?: () => void;
  /** `YYYY-MM-DD`, or null for no expiry. */
  value: string | null;
  /** Called on every tap. */
  onChange: (value: string | null) => void;
  /** The Default Expiry in days, for the "Usual" quick pick; null when there is none. */
  usualDays: number | null;
  /** The line under the title, e.g. "Greek yogurt · 500 g · Fridge". */
  context: string;
  /** The title and the dialog's name, e.g. "Expires". */
  title: string;
};

/**
 * The expiry picker's bottom sheet: title and context, a readout of the chosen date and the tag it will get, the
 * calendar, and No expiry / Done. Every tap goes straight to `onChange`.
 */
export function ExpirySheet({
  open,
  onClose,
  onExited,
  value,
  onChange,
  usualDays,
  context,
  title,
}: ExpirySheetProps) {
  const { t } = useTranslation('pantry');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      onExited={onExited}
      label={title}
      size="content"
      header={
        <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
          <Typography component="h2" variant="h3">
            {title}
          </Typography>
          <Typography variant="meta" color="text.secondary" sx={{ mt: '3px' }}>
            {context}
          </Typography>
          <Readout value={value} />
        </Box>
      }
      footer={
        <Stack direction="row" spacing={1.25} sx={{ px: 3, py: 1.5 }}>
          <Button
            type="button"
            variant="text"
            aria-pressed={value === null}
            startIcon={<CloseIcon size={16} strokeWidth={2.4} />}
            onClick={() => onChange(null)}
            sx={{ flex: 'none', whiteSpace: 'nowrap' }}
          >
            {t('picker.clear')}
          </Button>
          <Button type="button" onClick={onClose} sx={{ flex: 1 }}>
            {t('picker.done')}
          </Button>
        </Stack>
      }
    >
      <SheetBody value={value} onChange={onChange} usualDays={usualDays} />
    </Sheet>
  );
}

/** Mounted with the open sheet, so the calendar opens on the value's month every time. */
function SheetBody({
  value,
  onChange,
  usualDays,
}: Pick<ExpirySheetProps, 'value' | 'onChange' | 'usualDays'>) {
  const { i18n } = useTranslation();
  const staleThresholdDays = useStaleThresholdDays(i18n.language);
  const calendar = useRef<ExpiryCalendarHandle>(null);
  const today = new Date();
  return (
    <Box sx={{ px: 3, pt: 0.5, pb: 2 }}>
      <QuickPicks
        value={value}
        usualDays={usualDays}
        today={today}
        onPick={(iso) => {
          onChange(iso);
          calendar.current?.scrollToMonth(iso, true);
        }}
      />
      <ExpiryCalendar
        ref={calendar}
        value={value}
        onChange={onChange}
        today={today}
        staleThresholdDays={staleThresholdDays}
      />
    </Box>
  );
}

/** The chosen date, how far away it is and the tag it will get; "No expiry date" when empty. */
function Readout({ value }: { value: string | null }) {
  const { t, i18n } = useTranslation('pantry');
  const staleThresholdDays = useStaleThresholdDays(i18n.language);
  const today = new Date();
  return (
    <Box
      role="status"
      sx={{
        mt: 1.5,
        minHeight: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        px: '2px',
      }}
    >
      {value === null ? (
        <Box
          component="span"
          sx={{ fontSize: 14, fontWeight: 500, color: tokens.color.muted }}
        >
          {t('picker.none')}
        </Box>
      ) : (
        <Box
          component="span"
          sx={{
            fontSize: 14,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fullDate(value, today, i18n.language)}
          <Box
            component="small"
            sx={{
              ml: '6px',
              fontSize: 13,
              fontWeight: 500,
              color: tokens.color.muted,
            }}
          >
            {relativeDay(value, today, i18n.language)}
          </Box>
        </Box>
      )}
      <ExpiryTag tag={expiryTagFor(value, today, staleThresholdDays)} />
    </Box>
  );
}
