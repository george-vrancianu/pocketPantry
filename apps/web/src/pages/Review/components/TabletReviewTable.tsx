import { Box, tokens } from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogParent, CatalogSearchResult } from '../../../lib/catalog';
import { displayName, statusOf, type ReviewLine } from '../../../lib/review';
import { rowGroup, type ReviewState } from '../../../lib/reviewState';
import type { ScanMode } from '../../../lib/scan';
import { ExcludedRow } from './ExcludedRow';
import { TabletReviewRow } from './TabletReviewRow';
import { focusRing, tabletRowSx } from './layout';

type Props = {
  state: ReviewState;
  groups: { review: ReviewLine[]; sure: ReviewLine[]; excluded: ReviewLine[] };
  parents: CatalogParent[];
  shopping: boolean;
  mode: ScanMode;
  /** Rows whose Save or Done was blocked. */
  blocked: Record<string, boolean>;
  onOpen: (key: string) => void;
  onToggle: (key: string) => void;
  onChange: (key: string, patch: Partial<ReviewLine>) => void;
  onChangeMatch: (key: string, match: CatalogSearchResult) => void;
  onRemove: (key: string) => void;
  onConfirm: (key: string) => void;
  onRestore: (key: string) => void;
  onToggleSureGroup: () => void;
};

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

/** A full-width row titling a group; "Sigure" also carries the collapse toggle. */
function GroupHeaderRow({
  kind,
  count,
  expanded,
  onToggle,
  controls,
}: {
  kind: 'review' | 'sure';
  count: number;
  expanded?: boolean;
  onToggle?: () => void;
  controls?: string;
}) {
  const { t } = useTranslation('review');
  return (
    <Box
      role="row"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 40,
        px: '20px',
        bgcolor: tokens.color.subtle,
        borderTop: `1px solid ${tokens.color.divider}`,
      }}
    >
      <Box role="cell" sx={{ flexGrow: 1 }}>
        <Box
          component="h2"
          sx={{
            m: 0,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color:
              kind === 'review' ? tokens.color.urgentFg : tokens.color.accent,
          }}
        >
          {`${t(`group.${kind}`)} · ${count}`}
        </Box>
      </Box>
      {onToggle ? (
        <Box role="cell">
          <Box
            component="button"
            type="button"
            aria-expanded={expanded}
            aria-controls={expanded ? controls : undefined}
            onClick={onToggle}
            sx={{
              minHeight: 36,
              px: '8px',
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
            {t(expanded ? 'group.collapse' : 'group.expand')}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

/**
 * The tablet and laptop table (handoff §5.2): a CSS grid with table roles.
 * Same state, groups and handlers as the phone's `ReviewTable`.
 */
export function TabletReviewTable({
  state,
  groups,
  parents,
  shopping,
  mode,
  blocked,
  onOpen,
  onToggle,
  onChange,
  onChangeMatch,
  onRemove,
  onConfirm,
  onRestore,
  onToggleSureGroup,
}: Props) {
  const { t } = useTranslation('review');
  const sureId = useId();
  // Inline swap search, one row at a time; the swap dialog slice replaces this with a page-level dialog.
  const [swapKey, setSwapKey] = useState<string | null>(null);
  const row = (line: ReviewLine) => {
    const toCheck = rowGroup(state, line) !== 'ok';
    return (
      <TabletReviewRow
        key={line.key}
        line={line}
        status={statusOf(line, !!state.confirmed[line.key])}
        toCheck={toCheck}
        editing={toCheck || !!state.open[line.key]}
        parents={parents}
        shopping={shopping}
        mode={mode}
        blocked={!!blocked[line.key]}
        onEdit={() => onToggle(line.key)}
        onChange={(patch) => {
          // Open first, so the row keeps its group while it is typed in: it can turn sure mid-edit.
          if (toCheck) onOpen(line.key);
          onChange(line.key, patch);
        }}
        swapping={swapKey === line.key}
        onSwapMatch={() => {
          // Hold the row in its group: a new Match clears low confidence and must not move it mid-swap.
          if (toCheck) onOpen(line.key);
          setSwapKey((was) => (was === line.key ? null : line.key));
        }}
        onChangeMatch={(match) => {
          onChangeMatch(line.key, match);
          setSwapKey(null);
        }}
        onRemove={() => onRemove(line.key)}
        onDone={() => onConfirm(line.key)}
      />
    );
  };
  const columns = shopping
    ? ['status', 'product', 'qty', 'confidence', 'actions']
    : [
        'status',
        'product',
        'qty',
        'location',
        'expiry',
        'confidence',
        'actions',
      ];

  return (
    <Box
      role="table"
      aria-label={t('title')}
      sx={{
        mt: '24px',
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      <Box
        role="row"
        sx={{
          ...tabletRowSx(shopping),
          alignItems: 'center',
          height: 44,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: tokens.color.muted,
        }}
      >
        {columns.map((column) => (
          <Box
            key={column}
            role="columnheader"
            sx={{
              pl: ['qty', 'location', 'expiry'].includes(column) ? '12px' : 0,
            }}
          >
            {column === 'status' || column === 'actions' ? (
              <Box component="span" sx={visuallyHidden}>
                {t(`col.${column}`)}
              </Box>
            ) : (
              t(`col.${column}`)
            )}
          </Box>
        ))}
      </Box>
      {groups.review.length > 0 ? (
        <Box role="rowgroup" aria-label={t('group.review')}>
          <GroupHeaderRow kind="review" count={groups.review.length} />
          {groups.review.map(row)}
        </Box>
      ) : null}
      {groups.sure.length > 0 ? (
        <Box role="rowgroup" aria-label={t('group.sure')}>
          <GroupHeaderRow
            kind="sure"
            count={groups.sure.length}
            expanded={state.sureOpen}
            onToggle={onToggleSureGroup}
            controls={sureId}
          />
          {state.sureOpen ? (
            <Box id={sureId}>{groups.sure.map(row)}</Box>
          ) : (
            <Box
              role="row"
              sx={{
                px: '20px',
                py: '10px',
                fontSize: 13,
                color: tokens.color.muted,
                borderTop: `1px solid ${tokens.color.divider}`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Box role="cell">
                {groups.sure.map((line) => displayName(line)).join(', ')}
              </Box>
            </Box>
          )}
        </Box>
      ) : null}
      {groups.excluded.length > 0 ? (
        <Box role="row">
          <Box role="cell">
            <ExcludedRow lines={groups.excluded} onRestore={onRestore} />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
