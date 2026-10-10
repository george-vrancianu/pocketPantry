import type { ScanMode } from './scan';

/** Each Scan Mode's guide as a fraction of the screen (width x height). */
export const SCAN_GUIDES: Record<ScanMode, { width: number; height: number }> =
  {
    receipt: { width: 0.52, height: 0.64 },
    product: { width: 0.6, height: 0.48 },
    ingredients: { width: 0.88, height: 0.42 },
    plate: { width: 0.8, height: 0.5 },
  };

/** The guides are centred this far down the screen, a little above the middle. */
export const GUIDE_CENTER_Y = 0.46;

/** The guide on a `view` of the given size, in view pixels. */
export function guideRect(
  mode: ScanMode,
  view: { width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  const width = view.width * SCAN_GUIDES[mode].width;
  const height = view.height * SCAN_GUIDES[mode].height;
  return {
    x: (view.width - width) / 2,
    y: view.height * GUIDE_CENTER_Y - height / 2,
    width,
    height,
  };
}
