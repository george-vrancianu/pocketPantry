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
export const panelId = (key: string) => `review-line-${key}-panel`;
/** DOM id of one of a row's inputs, so a blocked Save can focus the first invalid one. */
export const fieldId = (key: string, field: string) =>
  `review-line-${key}-${field}`;

export const focusRing = {
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: -3,
  },
};
