/** Gap between the floating Dock and the bottom edge, px. */
export const DOCK_BOTTOM = 16;
/** Dock height in px: phone, then from the `md` breakpoint. */
export const DOCK_HEIGHT = { xs: 76, md: 84 } as const;

const DOCK_GAP = 8;
/** CSS `bottom` that clears the floating Dock of the given height (and the device's bottom inset). */
export const aboveDock = (height: number) =>
  `calc(${DOCK_BOTTOM + height + DOCK_GAP}px + env(safe-area-inset-bottom, 0px))`;
