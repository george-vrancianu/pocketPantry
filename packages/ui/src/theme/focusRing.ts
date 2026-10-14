/**
 * Handoff section 7: a 2 px `accent` ring with a 2 px offset in every Theme.
 * MUI's ButtonBase resets `outline`, so controls built on it set the ring
 * themselves rather than relying on the global `:focus-visible` rule.
 */
export const focusRing = {
  '&.Mui-focusVisible, &:focus-visible': {
    outline: '2px solid var(--mui-palette-pp-accent)',
    outlineOffset: '2px',
  },
} as const;
