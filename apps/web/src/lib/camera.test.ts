import { describe, expect, it } from 'vitest';
import { cameraConstraints } from './camera';

describe('cameraConstraints', () => {
  it('asks only for the rear camera by default', () => {
    expect(cameraConstraints(false)).toEqual({
      video: { facingMode: { ideal: 'environment' } },
    });
  });

  it('asks for an ideal (never exact) 1080p stream in high resolution', () => {
    expect(cameraConstraints(true)).toEqual({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  });
});
