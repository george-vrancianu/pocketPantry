import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import {
  LOCATIONS,
  UNITS,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  formatDate,
  isIsoDate,
  maskDateInput,
  parseDateInput,
} from '../../../lib/dateFormat';
import type { ReviewLine } from '../../../lib/review';
import { controlSx } from './Field';
import { focusRing } from './layout';

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
        borderRadius: `${tokens.radius.field}px`,
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
 * Swap Match for now: Catalog search opened inline under the row. The swap
 * dialog slice replaces this one component for both layouts.
 */
export function InlineMatchSearch({
  onSelect,
  onCancel,
}: {
  onSelect: (match: CatalogSearchResult) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('review');
  return (
    <Box>
      <CatalogSearch autoFocus onSelect={onSelect} />
      <Box
        component="button"
        type="button"
        onClick={onCancel}
        sx={{
          mt: '4px',
          minHeight: 36,
          border: 0,
          bgcolor: 'transparent',
          color: tokens.color.accent,
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          ...focusRing,
        }}
      >
        {t('match.keep')}
      </Box>
    </Box>
  );
}
