import { describe, expect, it } from 'vitest';
import { fitWithin, guideCropRect, receiptOutputSize } from './image';

describe('fitWithin', () => {
  it('scales the longest edge down to the limit, keeping the aspect ratio', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('never upscales a small image', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('guideCropRect', () => {
  // A 100 x 200 view with a 1:3 guide filling 90% of its height (so 60 wide).
  const view = { width: 100, height: 200 };

  it('maps the guide onto a frame with the same aspect as the view', () => {
    const rect = guideCropRect({ width: 1000, height: 2000 }, view, 0.9);
    expect(rect).toEqual({ x: 200, y: 100, width: 600, height: 1800 });
  });

  it('accounts for the preview cropping a wider frame to fill the view', () => {
    // Cover scale is 0.2 view px per frame px: the view shows 500 x 1000 of the frame, centred.
    const rect = guideCropRect({ width: 1500, height: 1000 }, view, 0.9);
    expect(rect).toEqual({ x: 600, y: 50, width: 300, height: 900 });
  });

  it('handles a landscape frame delivered to a portrait view', () => {
    const rect = guideCropRect({ width: 1920, height: 1080 }, view, 0.9);
    expect(rect.height).toBeCloseTo(972, 0);
    expect(rect.width).toBeCloseTo(324, 0);
    expect(rect.x + rect.width / 2).toBeCloseTo(960, 0);
    expect(rect.y + rect.height / 2).toBeCloseTo(540, 0);
  });

  it('keeps the crop inside the frame', () => {
    const rect = guideCropRect({ width: 640, height: 480 }, view, 1);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(640);
    expect(rect.y + rect.height).toBeLessThanOrEqual(480);
  });
});

describe('receiptOutputSize', () => {
  it('scales a large crop to exactly 3 tiles: 512 x 1536', () => {
    expect(receiptOutputSize(972, 2916)).toEqual({ width: 512, height: 1536 });
  });

  it('never upscales a smaller crop', () => {
    expect(receiptOutputSize(324, 972)).toEqual({ width: 324, height: 972 });
  });

  it('follows the configured output width', () => {
    expect(receiptOutputSize(2000, 6000, 768)).toEqual({
      width: 768,
      height: 2304,
    });
  });
});
