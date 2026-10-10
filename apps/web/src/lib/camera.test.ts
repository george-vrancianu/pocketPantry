import { describe, expect, it } from 'vitest';
import { cameraConstraints } from './camera';

describe('cameraConstraints', () => {
  it('asks for the rear camera at an ideal (never exact) 1080p, in every Scan Mode', () => {
    expect(cameraConstraints()).toEqual({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  });
});
