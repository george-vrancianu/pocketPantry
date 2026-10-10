import type { ScanMode } from './scan';

// Stub: implemented in the #111 implementation commit.
export const SCAN_GUIDES = {} as Record<
  ScanMode,
  { width: number; height: number }
>;
export const GUIDE_CENTER_Y = 0;
export function guideRect(
  _mode: ScanMode,
  _view: { width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  return { x: 0, y: 0, width: 0, height: 0 };
}
