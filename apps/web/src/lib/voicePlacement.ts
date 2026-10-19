import { aboveDock, DOCK_HEIGHT } from '@pocket-pantry/ui';

/** Air between the Dock and the Voice Note button, px. */
const BUTTON_AIR = 8;
/** The round button's size, px. */
export const BUTTON_SIZE = 62;

/** CSS `bottom` of the Voice Note button: above the Dock (76 on phones, 84 wider) plus air. */
export const buttonBottom = {
  xs: `calc(${aboveDock(DOCK_HEIGHT.xs)} + ${BUTTON_AIR}px)`,
  md: `calc(${aboveDock(DOCK_HEIGHT.md)} + ${BUTTON_AIR}px)`,
};

/** CSS `bottom` of something sitting above the button (the Listening card, the tip). */
export const aboveButton = (gap: number) => ({
  xs: `calc(${buttonBottom.xs} + ${BUTTON_SIZE + gap}px)`,
  md: `calc(${buttonBottom.md} + ${BUTTON_SIZE + gap}px)`,
});

/** Where a toast sits so it clears the button and its chip. */
export const toastBottom = aboveButton(10);

/** The status pill's height (two lines and its padding), px, plus the air kept above it. */
export const PILL_HEIGHT = 60;
export const PILL_GAP = 8;

/** The pill sits 22 px above the button; this is the spot clear above the pill. */
export const abovePill = aboveButton(22 + PILL_HEIGHT + PILL_GAP);

/**
 * Options for a voice toast: polite, clear of the button, and clear of the status pill when one is up
 * (the Reading pill and its Cancel, a failed send and its Retry must stay reachable).
 */
export const voiceToast = ({ abovePill: lifted = false } = {}) => ({
  polite: true as const,
  bottom: lifted ? abovePill : toastBottom,
});

/** Stacking of the voice layers; the app's toasts (1400) stay above all of them. */
export const VOICE_LAYER = {
  scrim: 1100,
  button: 1200,
  /** The Listening card, the status pill, the tip, the language menu. */
  card: 1250,
} as const;
