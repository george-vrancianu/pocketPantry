import { aboveDock, DOCK_HEIGHT } from '@pocket-pantry/ui';

// The Voice Note's notices all hang above the Dock's mic: first the Scan Language chip's row, which
// starts where `aboveDock` ends (clear of the capsule's overhang), then whatever sits above it.

/** The chip's row: the 30 px chip plus air, px. */
export const MIC_ROW = 36;

/** CSS `bottom` of the chip row: just above the capsule, which overhangs the Dock. */
export const micBottom = {
  xs: aboveDock(DOCK_HEIGHT.xs),
  md: aboveDock(DOCK_HEIGHT.md),
};

/** CSS `bottom` of something sitting above the chip row (the Listening card, the tip). */
export const aboveMic = (gap: number) => ({
  xs: `calc(${micBottom.xs} + ${MIC_ROW + gap}px)`,
  md: `calc(${micBottom.md} + ${MIC_ROW + gap}px)`,
});

/** Where a toast sits so it clears the Dock's mic and its chip. */
export const toastBottom = aboveMic(10);

/** The status pill (and the Listening card) sit this far above the chip row, px. */
export const PILL_OFFSET = 22;
/** The status pill's height (a title line, a one-line hint and its padding), px, plus the air kept above it. */
export const PILL_HEIGHT = 60;
export const PILL_GAP = 8;

/** CSS `bottom` of the status pill and the Listening card. */
export const pillBottom = aboveMic(PILL_OFFSET);

/** The spot clear above the pill. */
export const abovePill = aboveMic(PILL_OFFSET + PILL_HEIGHT + PILL_GAP);

/**
 * Options for a voice toast: polite, clear of the mic, and clear of the status pill when one is up
 * (the Reading pill and its Cancel, a failed send and its Retry must stay reachable).
 */
export const voiceToast = ({ abovePill: lifted = false } = {}) => ({
  polite: true as const,
  bottom: lifted ? abovePill : toastBottom,
});

/** Stacking of the voice layers; the app's toasts (1400) stay above all of them. */
export const VOICE_LAYER = {
  scrim: 1100,
  /** The Listening card, the status pill, the tip, the language menu. */
  card: 1250,
} as const;
