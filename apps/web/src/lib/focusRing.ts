import { tokens } from '@pocket-pantry/ui';

/** The ring itself, for a row whose focus is only virtual (an active descendant). */
export const focusRingStyle = (offset = -3) => ({
  outline: `3px solid ${tokens.color.accent}`,
  outlineOffset: offset,
});

/** The keyboard focus ring for custom buttons and rows; a negative offset draws it inside. */
export const focusRing = (offset = -3) => ({
  '&:focus-visible': focusRingStyle(offset),
});
