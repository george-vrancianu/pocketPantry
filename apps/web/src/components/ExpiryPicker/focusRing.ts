import { tokens } from '@pocket-pantry/ui';

/** The keyboard focus outline of the picker's tiles, days and Today link. */
export const focusRing = {
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.accent}`,
    outlineOffset: 1,
  },
} as const;
