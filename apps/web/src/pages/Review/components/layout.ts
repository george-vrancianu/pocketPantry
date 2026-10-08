import { tokens } from '@pocket-pantry/ui';
import type { RowStatus } from '../../../lib/review';

/**
 * The column grid shared by the header row and the item rows (handoff §4.3).
 * Plate lines go to the Shopping List, which has no Location or expiry.
 */
export const columnsFor = (shopping: boolean) =>
  shopping ? 'minmax(0,1fr) 72px' : 'minmax(0,1fr) 56px 60px 58px';

export const rowGridSx = (shopping: boolean) => ({
  display: 'grid',
  gridTemplateColumns: columnsFor(shopping),
  columnGap: '8px',
  alignItems: 'center',
  px: '12px',
});

/** DOM id of a row's button; also where focus lands after Add back. */
export const rowId = (key: string) => `review-line-${key}`;
/** DOM id of the row's name, which also names its edit panel. */
export const titleId = (key: string) => `review-line-${key}-title`;
/** DOM id of the Excluded row's button, where focus goes when no row is left after a Remove. */
export const EXCLUDED_TOGGLE_ID = 'review-excluded-toggle';
export const panelId = (key: string) => `review-line-${key}-panel`;
/** DOM id of one of a row's inputs, so a blocked Save can focus the first invalid one. */
export const fieldId = (key: string, field: string) =>
  `review-line-${key}-${field}`;

export type TabletColumnKey =
  | 'status'
  | 'product'
  | 'qty'
  | 'location'
  | 'expiry'
  | 'confidence'
  | 'actions';

/**
 * The tablet table's columns (handoff §5.2), the one source for the grid
 * template, the header cells and the 12 px text indent that lines read-only
 * values up with the inputs. `actions` fits three 40 px buttons.
 */
export const TABLET_COLUMNS: {
  key: TabletColumnKey;
  /** Fixed width; Produs takes whatever is left. (`minmax` columns would grow to their max first and starve Produs.) */
  width: string;
  /** The §5.2 width, used from 1280 px where there is room. */
  wideWidth: string;
  indent: boolean;
}[] = [
  { key: 'status', width: '24px', wideWidth: '24px', indent: false },
  {
    key: 'product',
    width: 'minmax(0,1fr)',
    wideWidth: 'minmax(0,1fr)',
    indent: false,
  },
  { key: 'qty', width: '120px', wideWidth: '150px', indent: true },
  { key: 'location', width: '104px', wideWidth: '150px', indent: true },
  { key: 'expiry', width: '112px', wideWidth: '150px', indent: true },
  { key: 'confidence', width: '112px', wideWidth: '120px', indent: false },
  { key: 'actions', width: '144px', wideWidth: '144px', indent: false },
];

/** Plate lines go to the Shopping List, which has no Location or expiry. */
export const tabletColumnsFor = (shopping: boolean) =>
  TABLET_COLUMNS.filter(
    (column) =>
      !shopping || (column.key !== 'location' && column.key !== 'expiry'),
  );

export const tabletTemplate = (shopping: boolean, wide = false) =>
  tabletColumnsFor(shopping)
    .map((column) => (wide ? column.wideWidth : column.width))
    .join(' ');

export const tabletRowSx = (shopping: boolean) => ({
  display: 'grid',
  gridTemplateColumns: tabletTemplate(shopping),
  // Tighter below 1024 px so Produs keeps room.
  columnGap: '8px',
  px: '12px',
  '@media (min-width:1024px)': { columnGap: '16px', px: '20px' },
  '@media (min-width:1280px)': {
    gridTemplateColumns: tabletTemplate(shopping, true),
  },
});

/** Row backgrounds by status: tinted for rows to check. */
export const ROW_TINT: Record<RowStatus, string> = {
  low: tokens.color.urgentRow,
  qty: tokens.color.soonRow,
  ok: tokens.color.subtle,
};

/** A borderless accent text button (Collapse, Change match). */
export const linkButtonSx = {
  minHeight: 36,
  px: '8px',
  border: 0,
  bgcolor: 'transparent',
  color: tokens.color.accent,
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: -3,
  },
} as const;

export const focusRing = {
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: -3,
  },
};
