import { beforeEach, describe, expect, it } from 'vitest';
import { loadOverlayMode, saveOverlayMode } from './cameraMode';

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
