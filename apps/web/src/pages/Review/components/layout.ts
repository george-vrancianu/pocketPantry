import { tokens } from '@pocket-pantry/ui';

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

/**
 * The tablet table's columns (handoff §5.2): status icon, Produs, Cantitate,
 * Locație, Expiră, Încredere, actions. Plate drops Location and Expiry. The
 * middle columns may shrink toward their minimum at 900 px.
 */
export const tabletColumnsFor = (shopping: boolean) =>
  shopping
    ? '24px minmax(0,1fr) minmax(120px,150px) 120px 92px'
    : '24px minmax(0,1fr) minmax(120px,150px) minmax(100px,150px) minmax(104px,150px) 120px 92px';

export const tabletRowSx = (shopping: boolean) => ({
  display: 'grid',
  gridTemplateColumns: tabletColumnsFor(shopping),
  columnGap: '16px',
  px: '20px',
});

export const focusRing = {
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: -3,
  },
};
