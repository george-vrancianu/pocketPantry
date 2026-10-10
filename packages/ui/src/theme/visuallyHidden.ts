/** `sx` that hides content visually but keeps it for screen readers. */
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
