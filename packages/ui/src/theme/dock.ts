/** Gap between the floating Dock and the bottom edge, px: lifted so the capsule's overhang stays on screen. */
export const DOCK_BOTTOM = 28;
/** How far the Camera/Mic capsule reaches past the Dock's top and bottom edges, px. */
export const DOCK_OVERHANG = 18;
/** Dock height in px: phone, then from the `md` breakpoint. */
export const DOCK_HEIGHT = { xs: 76, md: 84 } as const;

/** Air between the capsule's top and anything that sits above the Dock. */
const DOCK_GAP = DOCK_OVERHANG + 6;
/** CSS `bottom` that clears the floating Dock of the given height (and the device's bottom inset). */
export const aboveDock = (height: number) =>
  `calc(${DOCK_BOTTOM + height + DOCK_GAP}px + env(safe-area-inset-bottom, 0px))`;
