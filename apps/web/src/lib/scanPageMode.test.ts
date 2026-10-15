import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadScanPageMode, saveScanPageMode } from './cameraMode';

const KEY = 'pocket-pantry.scan-mode';

describe('Scan page remembered mode storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('defaults to receipt when nothing is stored', () => {
    expect(loadScanPageMode()).toBe('receipt');
  });

  it('falls back to receipt for an unknown stored value', () => {
    localStorage.setItem(KEY, 'sonar');
    expect(loadScanPageMode()).toBe('receipt');
  });

  it('round-trips every camera mode', () => {
    for (const mode of [
      'receipt',
      'product',
      'barcode',
      'ingredients',
      'plate',
    ] as const) {
      saveScanPageMode(mode);
      expect(localStorage.getItem(KEY)).toBe(mode);
      expect(loadScanPageMode()).toBe(mode);
    }
  });

  it('falls back to receipt when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadScanPageMode()).toBe('receipt');
  });

  it('does not throw when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveScanPageMode('plate')).not.toThrow();
  });
});
