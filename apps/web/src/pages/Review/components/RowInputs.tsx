import { Box, CalendarIcon, tokens, radius } from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpirySheet, expiryContext } from '../../../components/ExpiryPicker';
import { LOCATIONS, UNITS, type CatalogParent } from '../../../lib/catalog';
import {
  formatDate,
  isIsoDate,
  maskDateInput,
  parseDateInput,
} from '../../../lib/dateFormat';
import { displayName, type ReviewLine } from '../../../lib/review';
import { controlSx } from './Field';

/**
 * The inputs of a Review line, shared by the phone edit panel and the tablet
 * table so the two layouts arrange the same fields without forking them.
 * `ariaLabel` names a control where the layout has no visible per-row label.
 */

type Change = (patch: Partial<ReviewLine>) => void;

type QuantityProps = {
  line: ReviewLine;
  onChange: Change;
  id: string;
  invalid: boolean;
  errorId: string;
  /** Names the quantity input; the unit select gets `unitAriaLabel`. */
  ariaLabel?: string;
  unitAriaLabel?: string;
};

/** Quantity and its unit in one bordered box; amber when the quantity is missing, urgent when invalid. */
export function QuantityUnitInput({
  line,
  onChange,
  id,
  invalid,
  errorId,
  ariaLabel,
  unitAriaLabel,
}: QuantityProps) {
  const { t } = useTranslation(['review', 'common']);
  const missing = line.quantity.trim() === '';
  const border = invalid
    ? tokens.color.urgentFg
    : missing
      ? tokens.color.soonBorder
      : tokens.color.line;
  return (
    <Box
      sx={{
        display: 'flex',
        height: 40,
        boxSizing: 'border-box',
        borderRadius: radius.control,
        border: `1px solid ${border}`,
        bgcolor: tokens.color.surface,
        overflow: 'hidden',
        '&:focus-within': {
          outline: `3px solid ${tokens.color.accent}`,
          outlineOffset: 1,
        },
      }}
    >
      <Box
        id={id}
        component="input"
        type="number"
        value={line.quantity}
        placeholder="0"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange({ quantity: event.target.value })}
        min={0}
        step="any"
        inputMode="decimal"
        sx={{
          ...controlSx,
          flex: '1 1 0',
          minWidth: 0,
          width: 'auto',
          height: '100%',
          border: 0,
          borderRadius: 0,
          '&:focus-visible': { outline: 'none' },
        }}
      />
      <Box
        component="select"
        aria-label={unitAriaLabel ?? t('review:field.unit')}
        value={line.unit}
        onChange={(event) =>
          onChange({ unit: event.target.value as ReviewLine['unit'] })
        }
        sx={{
          ...controlSx,
          width: 'auto',
          height: '100%',
          border: 0,
          borderRadius: 0,
          borderLeft: `1px solid ${tokens.color.divider}`,
          bgcolor: tokens.color.subtle,
          '&:focus-visible': { outline: 'none' },
        }}
      >
        {UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {t(`common:units.${unit}`)}
          </option>
        ))}
      </Box>
    </Box>
  );
}

export function LocationSelect({
  line,
  onChange,
  id,
  ariaLabel,
}: {
  line: ReviewLine;
  onChange: Change;
  id: string;
  ariaLabel?: string;
}) {
  const { t } = useTranslation('common');
  return (
    <Box
      id={id}
      component="select"
      value={line.location}
      aria-label={ariaLabel}
      onChange={(event) =>
        onChange({ location: event.target.value as ReviewLine['location'] })
      }
      sx={controlSx}
    >
      {LOCATIONS.map((location) => (
        <option key={location} value={location}>
          {t(`locations.${location}`)}
        </option>
      ))}
    </Box>
  );
}

/** A masked `dd.MM.yyyy` text field over the ISO date in state. */
export function ExpiryInput({
  line,
  onChange,
  id,
  error,
  errorId,
  onBlur,
  ariaLabel,
}: {
  line: ReviewLine;
  onChange: Change;
  id: string;
  error: boolean;
  errorId: string;
  onBlur: () => void;
  ariaLabel?: string;
}) {
  const { t } = useTranslation('review');
  return (
    <Box
      id={id}
      component="input"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={t('expiryPlaceholder')}
      aria-label={ariaLabel}
      value={
        isIsoDate(line.expiryDate)
          ? formatDate(line.expiryDate)
          : line.expiryDate
      }
      onBlur={onBlur}
      aria-invalid={error || undefined}
      aria-describedby={error ? errorId : undefined}
      onChange={(event) => {
        const masked = maskDateInput(event.target.value);
        onChange({
          expiryDate: parseDateInput(masked) ?? masked,
          expiryExplicit: true,
        });
      }}
      sx={{ ...controlSx, fontVariantNumeric: 'tabular-nums' }}
    />
  );
}

/**
 * The phone's expiry cell: the whole control is one button that shows the date as `dd.mm.yyyy` and opens the
 * expiry sheet. Its name is the Field's label plus the date (`labelledBy`).
 */
export function ExpiryButton({
  line,
  onChange,
  id,
  error,
  errorId,
  labelId,
}: {
  line: ReviewLine;
  onChange: Change;
  id: string;
  error: boolean;
  errorId: string;
  /** The visible label above the cell. */
  labelId: string;
}) {
  const { t } = useTranslation('review');
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const empty = line.expiryDate === '';
  return (
    <>
      <Box
        ref={button}
        id={id}
        component="button"
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={`${labelId} ${id}-value`}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setOpen(true)}
        sx={{
          ...controlSx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          textAlign: 'left',
          cursor: 'pointer',
          ...(error ? { borderColor: tokens.color.urgentFg } : null),
        }}
      >
        <Box
          component="span"
          id={`${id}-value`}
          sx={{
            fontVariantNumeric: 'tabular-nums',
            color: empty ? tokens.color.muted : undefined,
          }}
        >
          {empty
            ? t('expiryPlaceholder')
            : isIsoDate(line.expiryDate)
              ? formatDate(line.expiryDate)
              : line.expiryDate}
        </Box>
        <CalendarIcon size={18} color={tokens.color.muted} />
      </Box>
      <ReviewLineExpirySheet
        line={line}
        onChange={onChange}
        open={open}
        onClose={() => setOpen(false)}
        // A tap doesn't always focus the button (Safari), so put focus back explicitly.
        onExited={() => button.current?.focus()}
      />
    </>
  );
}

/**
 * The expiry picker's sheet for one line. A date (or No expiry) picked in it is written to the line as an explicit
 * expiry, the same as a typed one. Usual is the Match's Default Expiry; there is none for an Unmatched line.
 */
export function ReviewLineExpirySheet({
  line,
  onChange,
  open,
  onClose,
  onExited,
}: {
  line: ReviewLine;
  onChange: Change;
  open: boolean;
  onClose: () => void;
  /** After the close transition, to put focus back on the opener. */
  onExited?: () => void;
}) {
  const { t, i18n } = useTranslation(['pantry', 'common']);
  return (
    <ExpirySheet
      open={open}
      onClose={onClose}
      onExited={onExited}
      value={isIsoDate(line.expiryDate) ? line.expiryDate : null}
      onChange={(value) =>
        onChange({ expiryDate: value ?? '', expiryExplicit: true })
      }
      usualDays={line.match?.defaults.expiryDays ?? null}
      context={expiryContext(
        {
          name: displayName(line),
          quantity: line.quantity,
          unit: line.unit,
          location: line.location,
        },
        i18n.language,
        t,
      )}
      title={t('pantry:picker.label')}
    />
  );
}

type TextProps = {
  line: ReviewLine;
  onChange: Change;
  id: string;
  ariaLabel?: string;
  /** Extra styling for a layout that wants the control compact or bold. */
  sx?: object;
};

/** An Unmatched line's name, as the Scan read it. */
export function NameInput({
  line,
  onChange,
  id,
  invalid,
  errorId,
  ariaLabel,
  sx,
}: TextProps & { invalid: boolean; errorId: string }) {
  return (
    <Box
      id={id}
      component="input"
      value={line.name}
      maxLength={100}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      onChange={(event) => onChange({ name: event.target.value })}
      sx={{ ...controlSx, ...sx }}
    />
  );
}

/** The Product Description saved with the Batch. */
export function DescriptionInput({
  line,
  onChange,
  id,
  ariaLabel,
  placeholder,
  sx,
}: TextProps & { placeholder?: string }) {
  return (
    <Box
      id={id}
      component="input"
      value={line.description}
      maxLength={200}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onChange({ description: event.target.value })}
      sx={{ ...controlSx, ...sx }}
    />
  );
}

/** An Unmatched line's Parent Category; empty leaves it to the server's default. */
export function CategorySelect({
  line,
  onChange,
  id,
  parents,
  ariaLabel,
  otherLabel,
  sx,
}: TextProps & { parents: CatalogParent[]; otherLabel: string }) {
  return (
    <Box
      id={id}
      component="select"
      value={line.parentCategoryId}
      aria-label={ariaLabel}
      onChange={(event) => onChange({ parentCategoryId: event.target.value })}
      sx={{ ...controlSx, ...sx }}
    >
      <option value="">{otherLabel}</option>
      {parents.map((parent) => (
        <option key={parent.id} value={parent.id}>
          {parent.name}
        </option>
      ))}
    </Box>
  );
}
