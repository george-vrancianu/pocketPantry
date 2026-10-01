import { describe, expect, it } from 'vitest';
import {
  fitWithin,
  guideCropRect,
  receiptOutputSize,
  rotatedBounds,
  rotatedCropTransform,
} from './image';
import {
  RECEIPT_GUIDE_ASPECT,
  RECEIPT_GUIDE_HEIGHT_FRACTION,
  RECEIPT_VIEW,
} from './receiptGuide';

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

describe('receipt guide with the shipped constants', () => {
  const crop = (width: number, height: number) => {
    const rect = guideCropRect(
      { width, height },
      RECEIPT_VIEW,
      RECEIPT_GUIDE_HEIGHT_FRACTION,
      RECEIPT_GUIDE_ASPECT,
    );
    return { rect, out: receiptOutputSize(rect.width, rect.height) };
  };

  it('turns a 1080 x 1920 portrait frame into exactly 512 x 1536', () => {
    const { rect, out } = crop(1080, 1920);
    expect(rect.width).toBeGreaterThanOrEqual(512);
    expect(out).toEqual({ width: 512, height: 1536 });
  });

  it('keeps a 1920 x 1080 landscape frame at the guide aspect, never upscaled', () => {
    const { rect, out } = crop(1920, 1080);
    expect(out.width).toBe(rect.width);
    expect(out.height / out.width).toBeCloseTo(3, 1);
  });
});

describe('rotatedBounds', () => {
  it('is the image itself at 0 and 180 degrees, and swaps sides at 90', () => {
    expect(rotatedBounds(400, 300, 0)).toEqual({ width: 400, height: 300 });
    const quarter = rotatedBounds(400, 300, 90);
    expect(quarter.width).toBeCloseTo(300);
    expect(quarter.height).toBeCloseTo(400);
    const half = rotatedBounds(400, 300, 180);
    expect(half.width).toBeCloseTo(400);
    expect(half.height).toBeCloseTo(300);
  });

  it('grows to hold a slightly tilted image', () => {
    const tilted = rotatedBounds(400, 300, 10);
    expect(tilted.width).toBeGreaterThan(400);
    expect(tilted.height).toBeGreaterThan(300);
  });
});

describe('rotatedCropTransform', () => {
  const image = { width: 400, height: 300 };
  const crop = { x: 100, y: 50, width: 100, height: 300 };

  it('maps an unrotated crop to a plain translate', () => {
    const [a, b, c, d, e, f] = rotatedCropTransform(image, crop, 0, 1);
    expect([a, b, c + 0, d, e, f]).toEqual([1, 0, 0, 1, 100, 100]);
  });

  it('scales the output', () => {
    const [a, b, c, d, e, f] = rotatedCropTransform(image, crop, 0, 0.5);
    expect([a, b, c + 0, d, e, f]).toEqual([0.5, 0, 0, 0.5, 50, 50]);
  });

  it('centres the source on the rotated bounds, relative to the crop', () => {
    // Rotated 90 degrees the bounds are 300 x 400, so the centre is (150, 200).
    const rotated = { x: 50, y: 100, width: 100, height: 300 };
    const [a, b, c, d, e, f] = rotatedCropTransform(image, rotated, 90, 1);
    expect([a, b, c, d].map((n) => Math.round(n) + 0)).toEqual([0, 1, -1, 0]);
    expect(e).toBeCloseTo(100);
    expect(f).toBeCloseTo(100);
  });
});
