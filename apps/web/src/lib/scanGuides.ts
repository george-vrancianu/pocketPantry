import type { CameraMode } from './cameraMode';

export type Rect = { x: number; y: number; width: number; height: number };

/** Safe-area insets in pt (`env(safe-area-inset-*)`); 0 where the device has none. */
export type Insets = { top: number; bottom: number };

/** The camera screen: its size and safe-area insets. The insets default to none. */
export type GuideView = { width: number; height: number; insets?: Insets };

/**
 * Bar heights of the camera chrome (handoff sections 2.1 and 5.1), in pt, without the safe areas.
 * The glass top bar and the footer must use these same constants, because the guide is centred in
 * the clear area between them.
 */
export const TOP_BAR_HEIGHT = 52;
export const SHUTTER_ROW_HEIGHT = 104;
export const MODE_SLIDER_HEIGHT = 40;
/** Room under the mode slider, above the bottom safe area, so it doesn't sit on the screen's edge. */
export const FOOTER_BOTTOM_GAP = 20;
export const FOOTER_HEIGHT =
  SHUTTER_ROW_HEIGHT + MODE_SLIDER_HEIGHT + FOOTER_BOTTOM_GAP;

/** The guide sits this far above the middle of the clear area (room for the zoom pill later). */
export const GUIDE_LIFT = 14;

/** Each camera mode's guide as a fraction of the screen width x the clear-area height (handoff 3.2). */
export const SCAN_GUIDES: Record<
  CameraMode,
  { width: number; height: number }
> = {
  receipt: { width: 0.56, height: 0.78 },
  product: { width: 0.62, height: 0.56 },
  ingredients: { width: 0.88, height: 0.5 },
  plate: { width: 0.8, height: 0.6 },
  // Barcode is a camera mode, not a Scan Mode: a wide, shallow guide to aim at the bars.
  barcode: { width: 0.8, height: 0.3 },
};

/** The part of the screen between the bars, as its top edge and height. */
export function clearArea(view: GuideView): { top: number; height: number } {
  const insets = view.insets ?? { top: 0, bottom: 0 };
  const top = insets.top + TOP_BAR_HEIGHT;
  const bottom = view.height - (insets.bottom + FOOTER_HEIGHT);
  return { top, height: bottom - top };
}

/** The guide for a camera mode on `view`, in pt from the screen's top left. */
export function guideRect(mode: CameraMode, view: GuideView): Rect {
  const clear = clearArea(view);
  const width = view.width * SCAN_GUIDES[mode].width;
  const height = clear.height * SCAN_GUIDES[mode].height;
  // Centred in the clear area, then lifted: 14 pt above its middle.
  const centreY = clear.top + clear.height / 2 - GUIDE_LIFT;
  return {
    x: (view.width - width) / 2,
    y: centreY - height / 2,
    width,
    height,
  };
}
