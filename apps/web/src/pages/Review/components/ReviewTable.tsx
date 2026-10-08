import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CatalogParent, CatalogSearchResult } from '../../../lib/catalog';
import { displayName, statusOf, type ReviewLine } from '../../../lib/review';
import type { ScanMode } from '../../../lib/scan';
import { rowGroup, type ReviewState } from '../../../lib/reviewState';
import { ExcludedRow } from './ExcludedRow';
import { ReviewGroup } from './ReviewGroup';
import { ReviewRow } from './ReviewRow';
import { rowGridSx } from './layout';

type Props = {
  state: ReviewState;
  groups: { review: ReviewLine[]; sure: ReviewLine[]; excluded: ReviewLine[] };
  parents: CatalogParent[];
  shopping: boolean;
  onToggle: (key: string) => void;
  onChange: (key: string, patch: Partial<ReviewLine>) => void;
  onChangeMatch: (key: string, match: CatalogSearchResult) => void;
  onRemove: (key: string) => void;
  onConfirm: (key: string) => void;
  onRestore: (key: string) => void;
  onToggleSureGroup: () => void;
  /** Rows whose Save or Confirm was blocked. */
  blocked: Record<string, boolean>;
  mode: ScanMode;
};

/** The card: a column header, the groups to check and the confident ones, then Excluded. */
export function ReviewTable({
  state,
  groups,
  parents,
  shopping,
  onToggle,
  onChange,
  onChangeMatch,
  onRemove,
  onConfirm,
  onRestore,
  onToggleSureGroup,
  blocked,
  mode,
}: Props) {
  const { t } = useTranslation('review');
  const row = (line: ReviewLine) => (
    <ReviewRow
      key={line.key}
      line={line}
      status={statusOf(line, !!state.confirmed[line.key])}
      groupStatus={rowGroup(state, line)}
      open={!!state.open[line.key]}
      parents={parents}
      shopping={shopping}
      mode={mode}
      blocked={!!blocked[line.key]}
      onToggle={() => onToggle(line.key)}
      onChange={(patch) => onChange(line.key, patch)}
      onChangeMatch={(match) => onChangeMatch(line.key, match)}
      onRemove={() => onRemove(line.key)}
      onConfirm={() => onConfirm(line.key)}
    />
  );
  const columns = shopping
    ? ['product', 'qty']
    : ['product', 'qty', 'location', 'expiry'];

  return (
    <Box
      sx={{
        mt: '14px',
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: `${tokens.radius.card}px`,
        overflow: 'hidden',
      }}
    >
      {/* Each row names its own cells, so the column header adds nothing for a screen reader. */}
      <Box
        aria-hidden="true"
        sx={{
          ...rowGridSx(shopping),
          height: 36,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: tokens.color.muted,
        }}
      >
        {columns.map((column, index) => (
          <Box key={column} sx={{ pl: index === 0 ? '26px' : 0 }}>
            {t(`col.${column}`)}
          </Box>
        ))}
      </Box>
      {groups.review.length > 0 ? (
        <ReviewGroup kind="review" count={groups.review.length}>
          {groups.review.map(row)}
        </ReviewGroup>
      ) : null}
      {groups.sure.length > 0 ? (
        <ReviewGroup
          kind="sure"
          count={groups.sure.length}
          expanded={state.sureOpen}
          onToggle={onToggleSureGroup}
          summary={groups.sure.map((line) => displayName(line)).join(', ')}
        >
          {groups.sure.map(row)}
        </ReviewGroup>
      ) : null}
      <ExcludedRow lines={groups.excluded} onRestore={onRestore} />
    </Box>
  );
}
