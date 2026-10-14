import { tokens } from '@pocket-pantry/ui';

/**
 * A Theme colour at `percent` opacity. The camera screen is forced into
 * Dark-first, so these resolve to its colours whatever the Member's Theme.
 */
export const translucent = (colour: string, percent: number) =>
  `color-mix(in srgb, ${colour} ${percent}%, transparent)`;

/** Dark-first's background as a scrim or drop shadow over the camera feed. */
export const shade = (percent: number) => translucent(tokens.color.bg, percent);

/** The translucent control look on the dark camera screen: round buttons and the Scan Language chip. */
export const glassControl = (disabled: boolean) => ({
  backgroundColor: translucent(tokens.color.surface, 55),
  color: tokens.color.ink,
  backdropFilter: 'blur(14px)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});

export const glassFocusRing = {
  outline: `2px solid ${tokens.color.accent}`,
  outlineOffset: 2,
};
