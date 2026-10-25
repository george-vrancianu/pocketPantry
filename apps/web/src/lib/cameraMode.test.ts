import { beforeEach, describe, expect, it } from 'vitest';
import {
  CAMERA_MODES,
  loadLastScanMode,
  saveScanPageMode,
  scanModeOf,
} from './cameraMode';

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

describe('the camera mode order', () => {
  it('runs Receipt, Ingredients, Product, Barcode, Plate (Barcode right after Product)', () => {
    expect([...CAMERA_MODES]).toEqual([
      'receipt',
      'ingredients',
      'product',
      'barcode',
      'plate',
    ]);
  });
});
