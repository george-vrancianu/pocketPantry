import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CatalogParent } from '../../../lib/catalog';
import type { ScanMode } from '../../../lib/scan';
import { formatShortDate } from '../../../lib/dateFormat';
import {
  displayName,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import { SourceText } from './SourceText';
import { RowEditPanel } from './RowEditPanel';
import { StatusIcon } from './StatusIcon';
import { focusRing, panelId, rowGridSx, rowId, titleId } from './layout';

type Props = {
  line: ReviewLine;
  /** Live status: drives the icon, the tint and the message. */
  status: RowStatus;
  /** The group the row sits in; "ok" makes the button read "Done". */
  groupStatus: RowStatus;
  open: boolean;
  parents: CatalogParent[];
  shopping: boolean;
  mode: ScanMode;
  blocked: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ReviewLine>) => void;
  onSwapMatch: () => void;
  onRemove: () => void;
  onConfirm: () => void;
};

const TINT: Record<RowStatus, string> = {
  low: tokens.color.urgentRow,
  qty: tokens.color.soonRow,
  ok: tokens.color.subtle,
};

/**
 * One line of the table: a single button (name, quantity, Location, expiry)
 * that opens into its edit panel. A missing quantity shows an amber "? unit"
 * pill so it is spotted without opening the row.
 */
export function ReviewRow({
  line,
  status,
  groupStatus,
  open,
  parents,
  shopping,
  mode,
  blocked,
  onToggle,
  onChange,
  onSwapMatch,
  onRemove,
  onConfirm,
}: Props) {
  const { t } = useTranslation(['review', 'common']);
  const name = displayName(line);
  const unit = t(`common:units.${line.unit}`);
  const background = open ? TINT[status] : tokens.color.surface;
  const cell = {
    fontSize: 12,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const;

  return (
    <Box
      component="li"
      sx={{
        borderTop: `1px solid ${tokens.color.divider}`,
        bgcolor: background,
      }}
    >
      <Box
        id={rowId(line.key)}
        component="button"
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId(line.key) : undefined}
        onClick={onToggle}
        sx={{
          ...rowGridSx(shopping),
          width: '100%',
          minHeight: 54,
          py: '8px',
          border: 0,
          bgcolor: 'transparent',
          color: 'inherit',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          ...focusRing,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <StatusIcon status={status} />
          <Box sx={{ minWidth: 0 }}>
            <Box
              id={titleId(line.key)}
              sx={{
                fontSize: 14,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </Box>
            <SourceText text={line.sourceText} mode={mode} />
          </Box>
        </Box>
        {line.quantity.trim() === '' ? (
          <Box
            component="span"
            sx={{
              justifySelf: 'start',
              px: '8px',
              py: '2px',
              borderRadius: `${tokens.radius.chip}px`,
              bgcolor: tokens.color.soonBg,
              color: tokens.color.soonFg,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {`? ${unit}`}
          </Box>
        ) : (
          <Box
            component="span"
            sx={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            {`${line.quantity} ${unit}`}
          </Box>
        )}
        {shopping ? null : (
          <>
            <Box component="span" sx={cell}>
              {t(`common:locations.${line.location}`)}
            </Box>
            <Box
              component="span"
              sx={{ ...cell, fontVariantNumeric: 'tabular-nums' }}
            >
              {formatShortDate(line.expiryDate)}
            </Box>
          </>
        )}
      </Box>
      {open ? (
        <RowEditPanel
          line={line}
          status={status}
          sure={groupStatus === 'ok'}
          parents={parents}
          shopping={shopping}
          blocked={blocked}
          background={background}
          onChange={onChange}
          onSwapMatch={onSwapMatch}
          onRemove={onRemove}
          onConfirm={onConfirm}
        />
      ) : null}
    </Box>
  );
}
