import { tokens } from '@pocket-pantry/ui';

/** The keyboard focus ring for custom buttons and rows; a negative offset draws it inside. */
export const focusRing = (offset = -3) => ({
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: offset,
  },
});
