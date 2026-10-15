import type { ScanMode } from './scan';

/**
 * A mode on the camera's dial. Barcode is a camera mode, not a Scan Mode (ADR 0013): it never
 * joins the Scan Mode list or the Scan page's remembered mode.
 */
export type CameraMode = ScanMode | 'barcode';

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
