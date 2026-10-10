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

describe('receipt guide on a full-screen aspect-fill feed', () => {
  const phone = { width: 390, height: 844 };
  const crop = (width: number, height: number, view = phone) => {
    const rect = guideCropRect(
      { width, height },
      view,
      RECEIPT_GUIDE_HEIGHT_FRACTION,
      RECEIPT_GUIDE_ASPECT,
    );
    return { rect, out: receiptOutputSize(rect.width, rect.height) };
  };

  it('keeps the guide aspect for a portrait frame and never upscales', () => {
    const { rect, out } = crop(1080, 1920);
    expect(out).toEqual({ width: rect.width, height: rect.height });
    expect(out.height / out.width).toBeCloseTo(3, 1);
  });

  it('maps the centred on-screen guide through cover scaling for a landscape frame', () => {
    // 1920 x 1080 on a 390 x 844 view: scale = 844 / 1080, the sides are cut off.
    const { rect } = crop(1920, 1080);
    const scale = 844 / 1080;
    expect(rect.height).toBeCloseTo(
      (844 * RECEIPT_GUIDE_HEIGHT_FRACTION) / scale,
      -1,
    );
    expect(rect.x + rect.width / 2).toBeCloseTo(1920 / 2, -1);
    expect(rect.y + rect.height / 2).toBeCloseTo(1080 / 2, -1);
  });

  it('maps the guide of a tall frame on a wider view by the other axis', () => {
    // 1080 x 2400 on 390 x 700: scale = 390 / 1080, top and bottom are cut off.
    const { rect } = crop(1080, 2400, { width: 390, height: 700 });
    const scale = 390 / 1080;
    expect(rect.height).toBeCloseTo(
      (700 * RECEIPT_GUIDE_HEIGHT_FRACTION) / scale,
      -1,
    );
    expect(rect.y + rect.height / 2).toBeCloseTo(2400 / 2, -1);
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
  const corners = [
    [-200, -150],
    [200, -150],
    [200, 150],
    [-200, 150],
  ];
  /** Where the source image corners land on the output canvas. */
  const landed = (
    crop: { x: number; y: number; width: number; height: number },
    degrees: number,
    scale = 1,
  ) => {
    const [a, b, c, d, e, f] = rotatedCropTransform(
      image,
      crop,
      degrees,
      scale,
    );
    return corners.map(([x, y]) => [a * x + c * y + e, b * x + d * y + f]);
  };
  const xs = (points: number[][]) => points.map(([x]) => x);
  const ys = (points: number[][]) => points.map(([, y]) => y);

  it.each([0, 90, 180, 270, 10])(
    'puts the rotated image exactly on its bounding box when the crop is that box (%i degrees)',
    (degrees) => {
      const bounds = rotatedBounds(image.width, image.height, degrees);
      const points = landed(
        { x: 0, y: 0, width: bounds.width, height: bounds.height },
        degrees,
      );
      expect(Math.min(...xs(points))).toBeCloseTo(0);
      expect(Math.max(...xs(points))).toBeCloseTo(bounds.width);
      expect(Math.min(...ys(points))).toBeCloseTo(0);
      expect(Math.max(...ys(points))).toBeCloseTo(bounds.height);
    },
  );

  it('sends each corner to the expected corner at the right angles', () => {
    // 90 degrees clockwise: top-left goes to top-right, in a 300 x 400 box.
    const [topLeft, topRight, bottomRight, bottomLeft] = landed(
      { x: 0, y: 0, width: 300, height: 400 },
      90,
    );
    expect(topLeft).toEqual([expect.closeTo(300), expect.closeTo(0)]);
    expect(topRight).toEqual([expect.closeTo(300), expect.closeTo(400)]);
    expect(bottomRight).toEqual([expect.closeTo(0), expect.closeTo(400)]);
    expect(bottomLeft).toEqual([expect.closeTo(0), expect.closeTo(0)]);
    // 180 degrees: top-left goes to bottom-right of the unchanged 400 x 300 box.
    const [flipped] = landed({ x: 0, y: 0, width: 400, height: 300 }, 180);
    expect(flipped).toEqual([expect.closeTo(400), expect.closeTo(300)]);
    // 270 degrees: top-left goes to bottom-left.
    const [turned] = landed({ x: 0, y: 0, width: 300, height: 400 }, 270);
    expect(turned).toEqual([expect.closeTo(0), expect.closeTo(400)]);
  });

  it('moves the output origin to the crop corner', () => {
    const crop = { x: 100, y: 50, width: 100, height: 300 };
    const whole = rotatedBounds(image.width, image.height, 10);
    const full = landed(
      { x: 0, y: 0, width: whole.width, height: whole.height },
      10,
    );
    const cropped = landed(crop, 10);
    cropped.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(full[i][0] - crop.x);
      expect(y).toBeCloseTo(full[i][1] - crop.y);
    });
  });

  it('scales the whole output', () => {
    const crop = { x: 100, y: 50, width: 100, height: 300 };
    const one = landed(crop, 10);
    const half = landed(crop, 10, 0.5);
    half.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(one[i][0] / 2);
      expect(y).toBeCloseTo(one[i][1] / 2);
    });
  });
});
