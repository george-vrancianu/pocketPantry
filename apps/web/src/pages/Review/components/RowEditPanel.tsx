import {
  Box,
  IconButton,
  DeleteIcon,
  tokens,
  color,
  radius,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogParent, CatalogSearchResult } from '../../../lib/catalog';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import {
  displayName,
  invalidFields,
  matchSearchInputs,
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
import { fieldId } from './layout';

type Props = {
  line: ReviewLine;
  status: RowStatus;
  /** The Confirm button reads "Done" on a row that was already sure. */
  sure: boolean;
  parents: CatalogParent[];
  onChange: (patch: Partial<ReviewLine>) => void;
  /** An unmatched line's "Choose" button: opens the Match dialog. */
  onSwapMatch: () => void;
  /** A matched line's chooser picked another Ingredient. */
  onPickMatch: (match: CatalogSearchResult) => void;
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
  onChange,
  onSwapMatch,
  onPickMatch,
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
  // A matched line's chooser: once its token is cleared the Member is searching and only the search shows.
  const [searching, setSearching] = useState(false);
  const lookupInputs = matchSearchInputs(line);
  const message = unmatched
    ? t('review:msg.unmatched')
    : status === 'low'
      ? t('review:msg.low')
      : status === 'qty'
        ? t('review:msg.qty')
        : null;

  return (
    <Box sx={{ px: '20px', pt: '2px', pb: '24px' }}>
      {message && !searching ? (
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
      {line.lookup && !searching ? (
        <BarcodeLookupNotes lookup={line.lookup} mb="8px" />
      ) : null}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {unmatched ? (
          <Field htmlFor={id('match')} label={t('review:field.match')}>
            <Box
              id={id('match')}
              component="button"
              type="button"
              // An Unmatched line leads with its own name so it never reads as the matched Ingredient.
              aria-label={t('review:match.unmatchedLabel', {
                name: accessibleName,
              })}
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
                  color: tokens.color.muted,
                }}
              >
                {matchText}
              </Box>
            </Box>
          </Field>
        ) : (
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                display: 'block',
                mb: '4px',
                fontSize: 11,
                fontWeight: 600,
                color: tokens.color.muted,
              }}
            >
              {t('review:field.match')}
            </Box>
            {/* No "Use as typed": a matched line can never become Unmatched. */}
            <CatalogSearch
              showUnit={false}
              label={t('review:field.match')}
              selected={searching ? null : line.match}
              defaultQuery={lookupInputs.query}
              newIngredientAllergenIds={lookupInputs.allergenIds}
              // Clearing the token (×, a tap, a key) only starts a search; the line changes on a pick.
              onQueryChange={() => setSearching(true)}
              onSelect={(match) => {
                setSearching(false);
                onPickMatch(match);
              }}
            />
          </Box>
        )}

        {/* While searching the results take the sheet's height: the other fields step aside. */}
        <Box
          hidden={searching}
          sx={{ display: searching ? 'none' : 'contents' }}
        >
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

          {unmatched ? (
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

          <Box sx={{ minWidth: 0 }}>
            <LocationToggle
              label={t('pantry:form.location')}
              value={line.location}
              onChange={(location) => onChange({ location })}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <ExpiryField
              id={id('expiry')}
              label={t('pantry:picker.label')}
              {...expiry}
              error={expiryError ? t('review:error.expiry') : null}
            />
          </Box>

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
    </Box>
  );
}
