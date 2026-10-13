import { tokens } from '@pocket-pantry/ui';

/** The keyboard focus ring for the sheet's custom buttons and rows. */
export const focusRing = {
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: -3,
  },
};
