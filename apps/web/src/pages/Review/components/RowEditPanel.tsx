import {
  Box,
  IconButton,
  DeleteIcon,
  SwapIcon,
  tokens,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import {
  LOCATIONS,
  UNITS,
  type CatalogParent,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  formatDate,
  maskDateInput,
  parseDateInput,
  isIsoDate,
} from '../../../lib/dateFormat';
import {
  invalidFields,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import { Field, controlSx } from './Field';
import { fieldId, focusRing, panelId, titleId } from './layout';

type Props = {
  line: ReviewLine;
  status: RowStatus;
  /** The Confirm button reads "Done" on a row that was already sure. */
  sure: boolean;
  parents: CatalogParent[];
  shopping: boolean;
  background: string;
  onChange: (patch: Partial<ReviewLine>) => void;
  onChangeMatch: (match: CatalogSearchResult) => void;
  onRemove: () => void;
  onConfirm: () => void;
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
  onChangeMatch,
  onRemove,
  onConfirm,
}: Props) {
  const { t } = useTranslation(['review', 'pantry', 'common']);
  const [searching, setSearching] = useState(false);
  const unmatched = line.match === null;
  const name = line.match?.name ?? line.name;
  const invalid = invalidFields(line);
  const matchText = unmatched
    ? `${t('review:match.none')} · ${t('review:match.choose')}`
    : name;
  const id = (field: string) => fieldId(line.key, field);
  const quantityMissing = line.quantity.trim() === '';
  const message = unmatched
    ? t(shopping ? 'review:msg.unmatchedShopping' : 'review:msg.unmatched')
    : status === 'low'
      ? t('review:msg.low')
      : status === 'qty'
        ? t('review:msg.qty')
        : null;
  const quantityBorder = invalid.includes('quantity')
    ? tokens.color.urgentFg
    : quantityMissing
      ? tokens.color.soonBorder
      : tokens.color.line;

  return (
    <Box
      id={panelId(line.key)}
      role="group"
      aria-labelledby={titleId(line.key)}
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          alignItems: 'start',
        }}
      >
        <Field htmlFor={id('match')} label={t('review:field.match')} wide>
          <Box
            id={id('match')}
            component="button"
            type="button"
            // A label alone would name the button "Match in your pantry" and hide which Ingredient is matched.
            aria-label={`${t('review:field.match')}: ${matchText}${unmatched ? '' : ` (${t('review:match.change')})`}`}
            aria-expanded={searching}
            onClick={() => setSearching((was) => !was)}
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

        {searching ? (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <CatalogSearch
              autoFocus
              onSelect={(match) => {
                onChangeMatch(match);
                setSearching(false);
              }}
            />
            <Box
              component="button"
              type="button"
              onClick={() => setSearching(false)}
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
              {t('review:match.keep')}
            </Box>
          </Box>
        ) : null}

        {unmatched ? (
          <Field
            htmlFor={id('name')}
            label={t('review:field.name')}
            wide
            error={
              invalid.includes('name') ? t('review:error.name') : undefined
            }
            errorId={`${id('name')}-error`}
          >
            <Box
              id={id('name')}
              component="input"
              value={line.name}
              maxLength={100}
              aria-invalid={invalid.includes('name') || undefined}
              aria-describedby={
                invalid.includes('name') ? `${id('name')}-error` : undefined
              }
              onChange={(event) => onChange({ name: event.target.value })}
              sx={controlSx}
            />
          </Field>
        ) : null}

        {unmatched && !shopping ? (
          <Field
            htmlFor={id('category')}
            label={t('review:field.category')}
            wide
          >
            <Box
              id={id('category')}
              component="select"
              value={line.parentCategoryId}
              onChange={(event) =>
                onChange({ parentCategoryId: event.target.value })
              }
              sx={controlSx}
            >
              <option value="">{t('review:categoryOther')}</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </Box>
          </Field>
        ) : null}

        {shopping ? null : (
          <Field
            htmlFor={id('description')}
            label={t('review:field.description')}
            wide
          >
            <Box
              id={id('description')}
              component="input"
              value={line.description}
              maxLength={200}
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
              sx={controlSx}
            />
          </Field>
        )}

        <Field
          htmlFor={id('quantity')}
          label={t('review:field.quantity')}
          error={
            invalid.includes('quantity')
              ? t('pantry:form.quantityInvalid')
              : undefined
          }
          errorId={`${id('quantity')}-error`}
        >
          <Box
            sx={{
              display: 'flex',
              height: 40,
              boxSizing: 'border-box',
              borderRadius: `${tokens.radius.field}px`,
              border: `1px solid ${quantityBorder}`,
              bgcolor: tokens.color.surface,
              overflow: 'hidden',
              '&:focus-within': {
                outline: `3px solid ${tokens.color.accent}`,
                outlineOffset: 1,
              },
            }}
          >
            <Box
              id={id('quantity')}
              component="input"
              type="number"
              value={line.quantity}
              placeholder="0"
              aria-invalid={invalid.includes('quantity') || undefined}
              aria-describedby={
                invalid.includes('quantity')
                  ? `${id('quantity')}-error`
                  : undefined
              }
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
              aria-label={t('pantry:form.unit')}
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
        </Field>

        {shopping ? null : (
          <>
            <Field htmlFor={id('location')} label={t('review:field.location')}>
              <Box
                id={id('location')}
                component="select"
                value={line.location}
                onChange={(event) =>
                  onChange({
                    location: event.target.value as ReviewLine['location'],
                  })
                }
                sx={controlSx}
              >
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {t(`common:locations.${location}`)}
                  </option>
                ))}
              </Box>
            </Field>

            <Field
              htmlFor={id('expiry')}
              label={t('review:field.expiry')}
              error={
                invalid.includes('expiry')
                  ? t('review:error.expiry')
                  : undefined
              }
              errorId={`${id('expiry')}-error`}
            >
              <Box
                id={id('expiry')}
                component="input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t('review:expiryPlaceholder')}
                value={
                  isIsoDate(line.expiryDate)
                    ? formatDate(line.expiryDate)
                    : line.expiryDate
                }
                aria-invalid={invalid.includes('expiry') || undefined}
                aria-describedby={
                  invalid.includes('expiry')
                    ? `${id('expiry')}-error`
                    : undefined
                }
                onChange={(event) => {
                  const masked = maskDateInput(event.target.value);
                  onChange({
                    expiryDate: parseDateInput(masked) ?? masked,
                    expiryExplicit: true,
                  });
                }}
                sx={{ ...controlSx, fontVariantNumeric: 'tabular-nums' }}
              />
            </Field>
          </>
        )}

        <Box sx={{ display: 'flex', gap: '8px', alignSelf: 'end' }}>
          <IconButton
            label={t('review:action.remove', { name })}
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
              borderRadius: `${tokens.radius.field}px`,
              bgcolor: tokens.color.accent,
              color: '#FFFFFF',
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
