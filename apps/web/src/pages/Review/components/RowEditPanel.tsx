import {
  Box,
  IconButton,
  DeleteIcon,
  SwapIcon,
  tokens,
  color,
  radius,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CatalogParent } from '../../../lib/catalog';
import {
  displayName,
  invalidFields,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import { BarcodeLookupNotes } from '../../../components/BarcodeLookupNotes';
import { AmountField } from '../../../components/AmountField';
import { ExpiryField } from '../../../components/ExpiryPicker';
import { LocationToggle } from '../../../components/LocationToggle';
import { Field, controlSx } from './Field';
import {
  CategorySelect,
  DescriptionInput,
  NameInput,
  useReviewLineExpiry,
} from './RowInputs';
import { fieldId, panelId } from './layout';

type Props = {
  line: ReviewLine;
  status: RowStatus;
  /** The Confirm button reads "Done" on a row that was already sure. */
  sure: boolean;
  parents: CatalogParent[];
  shopping: boolean;
  background: string;
  onChange: (patch: Partial<ReviewLine>) => void;
  onSwapMatch: () => void;
  onRemove: () => void;
  onConfirm: () => void;
  /** A Save or Confirm was blocked on this row: show every error now. */
  blocked: boolean;
  /** From `accessibleNamesOf`: the display name, position-qualified when repeated. */
  accessibleName: string;
};

/** The expanded half of a row: why it needs a look, then every field of the line. */
export function RowEditPanel({
  line,
  status,
  sure,
  parents,
  shopping,
  background,
  onChange,
  onSwapMatch,
  onRemove,
  onConfirm,
  blocked,
  accessibleName,
}: Props) {
  const { t } = useTranslation(['review', 'pantry', 'common']);
  const expiry = useReviewLineExpiry(line, onChange);
  const unmatched = line.match === null;
  const name = displayName(line);
  const invalid = invalidFields(line);
  // Dates are picked in the sheet here, so an invalid one is left over from typing in the table: say so once a Save is blocked.
  const expiryError = invalid.includes('expiry') && blocked;
  const matchText = unmatched
    ? `${t('review:match.none')} · ${t('review:match.choose')}`
    : name;
  const id = (field: string) => fieldId(line.key, field);
  const message = unmatched
    ? t(shopping ? 'review:msg.unmatchedShopping' : 'review:msg.unmatched')
    : status === 'low'
      ? t('review:msg.low')
      : status === 'qty'
        ? t('review:msg.qty')
        : null;

  return (
    <Box
      id={panelId(line.key)}
      role="group"
      aria-label={accessibleName}
      sx={{ bgcolor: background, px: '12px', pt: '2px', pb: '14px' }}
    >
      {message ? (
        <Box
          role="note"
          sx={{
            mb: '8px',
            fontSize: 12,
            fontWeight: 600,
            color:
              status === 'qty' && !unmatched
                ? tokens.color.soonFg
                : tokens.color.urgentFg,
          }}
        >
          {message}
        </Box>
      ) : null}
      {line.lookup ? (
        <BarcodeLookupNotes lookup={line.lookup} mb="8px" />
      ) : null}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Field htmlFor={id('match')} label={t('review:field.match')}>
          <Box
            id={id('match')}
            component="button"
            type="button"
            // A label alone would name the button "Matched ingredient" and hide which Ingredient is matched.
            // An Unmatched line leads with its own name so it never reads as the matched Ingredient.
            aria-label={
              unmatched
                ? t('review:match.unmatchedLabel', { name: accessibleName })
                : `${t('review:field.match')}: ${accessibleName} (${t('review:match.change')})`
            }
            aria-haspopup="dialog"
            onClick={onSwapMatch}
            sx={{
              ...controlSx,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Box
              component="span"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: unmatched ? tokens.color.muted : tokens.color.ink,
              }}
            >
              {matchText}
            </Box>
            {unmatched ? null : (
              <>
                <SwapIcon size={16} color={tokens.color.accent} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: tokens.color.accent,
                  }}
                >
                  {t('review:match.change')}
                </Box>
              </>
            )}
          </Box>
        </Field>

        {unmatched ? (
          <Field
            htmlFor={id('name')}
            label={t('review:field.name')}
            error={
              invalid.includes('name') ? t('review:error.name') : undefined
            }
            errorId={`${id('name')}-error`}
          >
            <NameInput
              line={line}
              onChange={onChange}
              id={id('name')}
              invalid={invalid.includes('name')}
              errorId={`${id('name')}-error`}
            />
          </Field>
        ) : null}

        {unmatched && !shopping ? (
          <Field htmlFor={id('category')} label={t('review:field.category')}>
            <CategorySelect
              line={line}
              onChange={onChange}
              id={id('category')}
              parents={parents}
              otherLabel={t('review:categoryOther')}
            />
          </Field>
        ) : null}

        {shopping ? null : (
          <Field
            htmlFor={id('description')}
            label={t('review:field.description')}
          >
            <DescriptionInput
              line={line}
              onChange={onChange}
              id={id('description')}
            />
          </Field>
        )}

        {/* The same amount, Location and expiry fields as adding a Batch in the Pantry, one per line. */}
        <Box sx={{ minWidth: 0 }}>
          <AmountField
            id={id('quantity')}
            name={name}
            quantity={line.quantity}
            unit={line.unit}
            onQuantityChange={(quantity, unit) =>
              onChange({ quantity, ...(unit ? { unit } : {}) })
            }
            onUnitChange={(unit) => {
              if (unit) onChange({ unit });
            }}
            error={
              invalid.includes('quantity')
                ? t('pantry:form.quantityInvalid')
                : null
            }
            // Enter has no save here; Confirm below closes the row.
            onSubmit={() => {}}
            // A Review line always carries a unit.
            allowNoUnit={false}
            amountScale={line.match?.amountScale}
            label={t('common:amount.placeholder')}
            height={56}
            // A misread amount is corrected here, not converted: a new unit keeps the number.
            rescaleOnUnitChange={false}
          />
        </Box>

        {shopping ? null : (
          <Box sx={{ minWidth: 0 }}>
            <LocationToggle
              label={t('pantry:form.location')}
              value={line.location}
              onChange={(location) => onChange({ location })}
            />
          </Box>
        )}

        {shopping ? null : (
          <Box sx={{ minWidth: 0 }}>
            <ExpiryField
              id={id('expiry')}
              label={t('pantry:picker.label')}
              {...expiry}
              error={expiryError ? t('review:error.expiry') : null}
            />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            alignSelf: 'flex-end',
          }}
        >
          <IconButton
            label={t('review:action.remove', { name: accessibleName })}
            tone="urgentOutline"
            size={40}
            onClick={onRemove}
          >
            <DeleteIcon size={18} />
          </IconButton>
          <Box
            component="button"
            type="button"
            onClick={onConfirm}
            sx={{
              flexGrow: 1,
              height: 40,
              border: 0,
              borderRadius: radius.control,
              bgcolor: tokens.color.accent,
              color: color.accentInk,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { bgcolor: tokens.color.accentHover },
              '&:focus-visible': {
                outline: `3px solid ${tokens.color.accent}`,
                outlineOffset: 2,
              },
            }}
          >
            {t(sure ? 'review:action.done' : 'review:action.confirm')}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
