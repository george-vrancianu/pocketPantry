import { tokens } from '@pocket-pantry/ui';

/** The translucent control look on the dark camera screen: round buttons and the Scan Language chip. */
export const glassControl = (disabled: boolean) => ({
  backgroundColor: tokens.color.camGlass,
  color: tokens.color.camFg,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});

export const glassFocusRing = {
  outline: `2px solid ${tokens.color.accentMid}`,
  outlineOffset: 2,
};
