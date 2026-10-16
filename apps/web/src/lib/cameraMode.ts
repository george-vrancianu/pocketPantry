import type { ScanMode } from './scan';

/**
 * A mode on the camera's dial. Barcode is a camera mode, not a Scan Mode (ADR 0013): it never
 * joins the Scan Mode list. It can be the Scan page's remembered mode, and its Session cards ride
 * apart from the Scan Cap (ADR 0016).
 */
export type CameraMode = ScanMode | 'barcode';

/** How often the barcode watch looks at a frame. */
export const SCAN_INTERVAL_MS = 250;

/** The Scan page's dial, in order: Barcode sits right after Product. */
export const CAMERA_MODES = [
  'receipt',
  'product',
  'barcode',
  'ingredients',
  'plate',
] as const satisfies readonly CameraMode[];

export function isCameraMode(value: string | null): value is CameraMode {
  return CAMERA_MODES.some((mode) => mode === value);
}

const SCAN_PAGE_MODE_KEY = 'pocket-pantry.scan-mode';

/** The mode the Scan page was last left in, else Receipt. */
export function loadScanPageMode(): CameraMode {
  try {
    const saved = window.localStorage.getItem(SCAN_PAGE_MODE_KEY);
    if (isCameraMode(saved)) return saved;
  } catch {
    // Storage can be blocked; fall back to Receipt.
  }
  return 'receipt';
}

/** Remembers the Scan page's mode for the next visit, apart from the add-Batch overlay's. */
export function saveScanPageMode(mode: CameraMode): void {
  try {
    window.localStorage.setItem(SCAN_PAGE_MODE_KEY, mode);
  } catch {
    // Not persisting is acceptable.
  }
}

const OVERLAY_MODE_KEY = 'pocket-pantry.camera-overlay-mode';

/** The mode the add-Batch camera overlay was last left in on this device, else Barcode (free and instant). */
export function loadOverlayMode(): CameraMode {
  try {
    const saved = window.localStorage.getItem(OVERLAY_MODE_KEY);
    if (saved === 'barcode' || saved === 'product') return saved;
  } catch {
    // Storage can be blocked; fall back to Barcode.
  }
  return 'barcode';
}

/** Remembers the overlay's mode, apart from the Scan page's own. */
export function saveOverlayMode(mode: CameraMode): void {
  try {
    window.localStorage.setItem(OVERLAY_MODE_KEY, mode);
  } catch {
    // Not persisting is acceptable.
  }
}
