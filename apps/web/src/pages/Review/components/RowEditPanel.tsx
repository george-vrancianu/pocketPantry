import {
  Box,
  IconButton,
  DeleteIcon,
  SwapIcon,
  tokens,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogParent, CatalogSearchResult } from '../../../lib/catalog';
import {
  displayName,
  invalidFields,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import { Field, controlSx } from './Field';
import {
  ExpiryInput,
  InlineMatchSearch,
  LocationSelect,
  QuantityUnitInput,
} from './RowInputs';
import { fieldId, panelId, titleId } from './layout';

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
  /** A Save or Confirm was blocked on this row: show every error now. */
  blocked: boolean;
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
  blocked,
}: Props) {
  const { t } = useTranslation(['review', 'pantry', 'common']);
  const [searching, setSearching] = useState(false);
  // A half-typed date is not an error yet: say so once the Member leaves the field, or a Save is blocked.
  const [expiryTouched, setExpiryTouched] = useState(false);
  const unmatched = line.match === null;
  const name = displayName(line);
  const invalid = invalidFields(line);
  const expiryError = invalid.includes('expiry') && (expiryTouched || blocked);
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
            <InlineMatchSearch
              onSelect={(match) => {
                onChangeMatch(match);
                setSearching(false);
              }}
              onCancel={() => setSearching(false)}
            />
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
          <QuantityUnitInput
            line={line}
            onChange={onChange}
            id={id('quantity')}
            invalid={invalid.includes('quantity')}
            errorId={`${id('quantity')}-error`}
          />
        </Field>

        {shopping ? null : (
          <>
            <Field htmlFor={id('location')} label={t('review:field.location')}>
              <LocationSelect
                line={line}
                onChange={onChange}
                id={id('location')}
              />
            </Field>

            <Field
              htmlFor={id('expiry')}
              label={t('review:field.expiry')}
              error={expiryError ? t('review:error.expiry') : undefined}
              errorId={`${id('expiry')}-error`}
            >
              <ExpiryInput
                line={line}
                onChange={onChange}
                id={id('expiry')}
                error={expiryError}
                errorId={`${id('expiry')}-error`}
                onBlur={() => setExpiryTouched(true)}
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
              color: tokens.color.surface,
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
