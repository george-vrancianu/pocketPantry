import {
  Box,
  CheckIcon,
  DeleteIcon,
  IconButton,
  ManualEntryIcon,
  SwapIcon,
  tokens,
} from '@pocket-pantry/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogParent } from '../../../lib/catalog';
import { formatDate } from '../../../lib/dateFormat';
import {
  displayName,
  invalidFields,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import type { ScanMode } from '../../../lib/scan';
import { ConfidencePill } from './ConfidencePill';
import { controlSx } from './Field';
import {
  CategorySelect,
  DescriptionInput,
  ExpiryInput,
  LocationSelect,
  NameInput,
  QuantityUnitInput,
} from './RowInputs';
import { SourceText } from './SourceText';
import { StatusIcon } from './StatusIcon';
import {
  ROW_TINT,
  fieldId,
  linkButtonSx,
  rowId,
  tabletRowSx,
  titleId,
} from './layout';

type Props = {
  line: ReviewLine;
  /** Live status: drives the icon, the pill and the tint. */
  status: RowStatus;
  /** Inputs show: a row to check always, a sure row once the Member opens it. */
  editing: boolean;
  /** The row sits among the rows to check: it has Confirm, a sure row has Finish editing. */
  toCheck: boolean;
  parents: CatalogParent[];
  shopping: boolean;
  mode: ScanMode;
  /** A Save or Done was blocked on this row: show every error now. */
  blocked: boolean;
  onEdit: () => void;
  onChange: (patch: Partial<ReviewLine>) => void;
  onRemove: () => void;
  onDone: () => void;
  /** Opens the page-level swap dialog for this line. */
  onSwapMatch: () => void;
};

const ellipsis = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/** 12 px text input for the Description and Category lines under a name. */
const compactSx = { ...controlSx, height: 32, fontSize: 12 } as const;

function CellError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Box id={id} sx={{ mt: '4px', fontSize: 12, color: tokens.color.urgentFg }}>
      {children}
    </Box>
  );
}

/**
 * One row of the tablet table. Rows to check are always inputs; a sure row is
 * read-only text on one line until the Member clicks it or its pencil. The
 * Description and, for an Unmatched line, the Name and Category sit under the
 * name, so the columns stay the five of the spec.
 */
export function TabletReviewRow({
  line,
  status,
  editing,
  toCheck,
  parents,
  shopping,
  mode,
  blocked,
  onEdit,
  onChange,
  onRemove,
  onDone,
  onSwapMatch,
}: Props) {
  const { t } = useTranslation(['review', 'common', 'pantry']);
  const [expiryTouched, setExpiryTouched] = useState(false);
  const name = displayName(line);
  const unmatched = line.match === null;
  const invalid = invalidFields(line);
  const expiryError = invalid.includes('expiry') && (expiryTouched || blocked);
  const id = (field: string) => fieldId(line.key, field);
  const named = (field: string) => t('review:row.fieldFor', { field, name });
  const unit = t(`common:units.${line.unit}`);

  const swap = (
    <IconButton
      id={toCheck ? rowId(line.key) : undefined}
      label={t(unmatched ? 'review:action.choose' : 'review:action.swap', {
        name,
      })}
      tone="accentOutline"
      size={40}
      aria-haspopup="dialog"
      onClick={onSwapMatch}
    >
      <SwapIcon size={18} />
    </IconButton>
  );
  const confirm = (
    <IconButton
      label={t('review:action.confirmFor', { name })}
      tone="accentOutline"
      size={40}
      onClick={onDone}
    >
      <CheckIcon size={18} />
    </IconButton>
  );
  const remove = (
    <IconButton
      label={t('review:action.remove', { name })}
      tone={toCheck ? 'urgentOutline' : 'plain'}
      size={40}
      onClick={onRemove}
    >
      <DeleteIcon size={18} />
    </IconButton>
  );
  const edit = (
    <IconButton
      id={rowId(line.key)}
      label={t(editing ? 'review:action.finish' : 'review:action.edit', {
        name,
      })}
      tone="plain"
      size={40}
      aria-expanded={editing}
      onClick={editing ? onDone : onEdit}
    >
      {editing ? <CheckIcon size={18} /> : <ManualEntryIcon size={18} />}
    </IconButton>
  );

  const readOnly = !editing;
  return (
    <Box
      role="row"
      onClick={readOnly ? onEdit : undefined}
      sx={{
        ...tabletRowSx(shopping),
        alignItems: readOnly ? 'center' : 'start',
        minHeight: readOnly ? 52 : 68,
        py: readOnly ? '6px' : '14px',
        borderTop: `1px solid ${tokens.color.divider}`,
        // Only a row that still needs a look is tinted, by its live status; sure rows stay white even when open.
        bgcolor:
          editing && status !== 'ok' ? ROW_TINT[status] : tokens.color.surface,
        cursor: readOnly ? 'pointer' : undefined,
        '&:hover': readOnly ? { bgcolor: tokens.color.subtle } : undefined,
      }}
    >
      <Box
        role="cell"
        sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}
      >
        <StatusIcon status={status} />
      </Box>

      <Box
        role="cell"
        sx={{ minWidth: 0, minHeight: readOnly ? undefined : 40 }}
      >
        {readOnly ? (
          <Box sx={{ ...ellipsis, pl: '12px' }}>
            <Box
              component="span"
              id={titleId(line.key)}
              sx={{ fontSize: 14, fontWeight: 700 }}
            >
              {name}
            </Box>
            {line.sourceText === null ? null : (
              <>
                {' · '}
                <SourceText text={line.sourceText} mode={mode} inline />
              </>
            )}
            {shopping || line.description === '' ? null : (
              <Box
                component="span"
                title={line.description}
                sx={{ fontSize: 12, color: tokens.color.muted }}
              >
                {` · ${line.description}`}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: '4px' }}>
            {unmatched ? (
              <Box>
                <NameInput
                  line={line}
                  onChange={onChange}
                  id={id('name')}
                  invalid={invalid.includes('name')}
                  errorId={`${id('name')}-error`}
                  ariaLabel={named(t('review:field.name'))}
                  sx={{ fontSize: 15, fontWeight: 700 }}
                />
                {invalid.includes('name') ? (
                  <CellError id={`${id('name')}-error`}>
                    {t('review:error.name')}
                  </CellError>
                ) : null}
              </Box>
            ) : (
              <Box
                id={titleId(line.key)}
                sx={{ ...ellipsis, fontSize: 15, fontWeight: 700 }}
              >
                {name}
              </Box>
            )}
            <SourceText text={line.sourceText} mode={mode} />
            {shopping ? null : (
              <DescriptionInput
                line={line}
                onChange={onChange}
                id={id('description')}
                placeholder={t('review:field.description')}
                ariaLabel={named(t('review:field.description'))}
                sx={compactSx}
              />
            )}
            {unmatched && !shopping ? (
              <CategorySelect
                line={line}
                onChange={onChange}
                id={id('category')}
                parents={parents}
                otherLabel={t('review:row.categoryNone')}
                ariaLabel={named(t('review:field.category'))}
                sx={compactSx}
              />
            ) : null}
            {!toCheck ? (
              // A sure row's actions are edit and delete only, so (Change|Choose) match lives here while it is open.
              <Box
                component="button"
                type="button"
                aria-label={t(
                  unmatched ? 'review:action.choose' : 'review:action.swap',
                  { name },
                )}
                aria-haspopup="dialog"
                onClick={onSwapMatch}
                sx={{ ...linkButtonSx, justifySelf: 'start', px: 0 }}
              >
                {t(unmatched ? 'review:match.choose' : 'review:match.change')}
              </Box>
            ) : null}
          </Box>
        )}
      </Box>

      <Box role="cell" sx={{ minWidth: 0 }}>
        {readOnly ? (
          <Box sx={{ pl: '12px', fontSize: 13, fontWeight: 600 }}>
            {line.quantity.trim() === ''
              ? `? ${unit}`
              : `${line.quantity} ${unit}`}
          </Box>
        ) : (
          <>
            <QuantityUnitInput
              line={line}
              onChange={onChange}
              id={id('quantity')}
              invalid={invalid.includes('quantity')}
              errorId={`${id('quantity')}-error`}
              ariaLabel={named(t('review:field.quantity'))}
              unitAriaLabel={named(t('review:field.unit'))}
            />
            {invalid.includes('quantity') ? (
              <CellError id={`${id('quantity')}-error`}>
                {t('pantry:form.quantityInvalid')}
              </CellError>
            ) : null}
          </>
        )}
      </Box>

      {shopping ? null : (
        <>
          <Box role="cell" sx={{ minWidth: 0 }}>
            {readOnly ? (
              <Box sx={{ ...ellipsis, pl: '12px', fontSize: 13 }}>
                {t(`common:locations.${line.location}`)}
              </Box>
            ) : (
              <LocationSelect
                line={line}
                onChange={onChange}
                id={id('location')}
                ariaLabel={named(t('review:field.location'))}
              />
            )}
          </Box>
          <Box role="cell" sx={{ minWidth: 0 }}>
            {readOnly ? (
              <Box
                sx={{
                  ...ellipsis,
                  pl: '12px',
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatDate(line.expiryDate)}
              </Box>
            ) : (
              <>
                <ExpiryInput
                  line={line}
                  onChange={onChange}
                  id={id('expiry')}
                  error={expiryError}
                  errorId={`${id('expiry')}-error`}
                  onBlur={() => setExpiryTouched(true)}
                  ariaLabel={named(t('review:field.expiry'))}
                />
                {expiryError ? (
                  <CellError id={`${id('expiry')}-error`}>
                    {t('review:error.expiry')}
                  </CellError>
                ) : null}
              </>
            )}
          </Box>
        </>
      )}

      <Box
        role="cell"
        sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}
      >
        <ConfidencePill status={status} />
      </Box>

      {/* Buttons act on their own: a click must not also open the row. */}
      <Box
        role="cell"
        onClick={(event) => event.stopPropagation()}
        sx={{ display: 'flex', gap: '8px' }}
      >
        {toCheck ? (
          <>
            {swap}
            {confirm}
            {remove}
          </>
        ) : (
          <>
            {edit}
            {remove}
          </>
        )}
      </Box>
    </Box>
  );
}
