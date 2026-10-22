import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadLastScanMode,
  loadOverlayMode,
  saveOverlayMode,
  saveScanPageMode,
  scanModeOf,
} from './cameraMode';

describe('the camera overlay mode', () => {
  beforeEach(() => localStorage.clear());

  it('starts in Barcode', () => {
    expect(loadOverlayMode()).toBe('barcode');
  });

  it('remembers Product and Barcode', () => {
    saveOverlayMode('product');
    expect(loadOverlayMode()).toBe('product');
    saveOverlayMode('barcode');
    expect(loadOverlayMode()).toBe('barcode');
  });

  it('ignores a Scan Mode that is not on the overlay dial', () => {
    localStorage.setItem('pocket-pantry.camera-overlay-mode', 'receipt');
    expect(loadOverlayMode()).toBe('barcode');
  });
});

describe('the Scan Mode behind a camera mode', () => {
  beforeEach(() => localStorage.clear());

  it('is the camera mode itself for every Scan Mode', () => {
    expect(scanModeOf('receipt')).toBe('receipt');
    expect(scanModeOf('ingredients')).toBe('ingredients');
    expect(scanModeOf('product')).toBe('product');
    expect(scanModeOf('plate')).toBe('plate');
  });

  it('is Product for Barcode, which is a camera mode but not a Scan Mode', () => {
    expect(scanModeOf('barcode')).toBe('product');
  });

  it('loads the last-used camera mode as a Scan Mode, Receipt when none was used', () => {
    expect(loadLastScanMode()).toBe('receipt');
    saveScanPageMode('plate');
    expect(loadLastScanMode()).toBe('plate');
    saveScanPageMode('barcode');
    expect(loadLastScanMode()).toBe('product');
  });
});
