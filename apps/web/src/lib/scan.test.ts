import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadScanMode, saveScanMode } from './scan';

const KEY = 'pocket-pantry.scan-mode';

describe('last-used Scan Mode storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('defaults to receipt when nothing is stored', () => {
    expect(loadScanMode()).toBe('receipt');
  });

  it('falls back to receipt for an unknown stored value', () => {
    localStorage.setItem(KEY, 'barcode');
    expect(loadScanMode()).toBe('receipt');
  });

  it('round-trips every Scan Mode', () => {
    for (const mode of [
      'receipt',
      'product',
      'ingredients',
      'plate',
    ] as const) {
      saveScanMode(mode);
      expect(localStorage.getItem(KEY)).toBe(mode);
      expect(loadScanMode()).toBe(mode);
    }
  });

  it('falls back to receipt when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadScanMode()).toBe('receipt');
  });

  it('does not throw when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveScanMode('plate')).not.toThrow();
  });
});
