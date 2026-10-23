import { describe, expect, it } from 'vitest';
import {
  dragOffset,
  nearestIndex,
  releaseTarget,
  rubberBand,
  startsHorizontalDrag,
  uniformCentres,
} from './sliderGesture';

// Labels of different widths: centres are not evenly spaced.
const centres = [30, 120, 230, 330];

describe('slider gesture maths', () => {
  describe('uniformCentres', () => {
    it('spaces labels evenly from 0', () => {
      expect(uniformCentres(3, 50)).toEqual([0, 50, 100]);
    });
  });

  describe('startsHorizontalDrag', () => {
    it('needs more than 10 pt of horizontal travel', () => {
      expect(startsHorizontalDrag(10, 0)).toBe(false);
      expect(startsHorizontalDrag(-10, 0)).toBe(false);
      expect(startsHorizontalDrag(11, 0)).toBe(true);
      expect(startsHorizontalDrag(-11, 2)).toBe(true);
    });

    it('needs |dx| > 1.3 x |dy|', () => {
      expect(startsHorizontalDrag(20, 20)).toBe(false);
      expect(startsHorizontalDrag(25, 20)).toBe(false);
      expect(startsHorizontalDrag(27, 20)).toBe(true);
      expect(startsHorizontalDrag(12, 40)).toBe(false);
    });
  });

  describe('rubberBand', () => {
    it('is 1:1 inside the strip', () => {
      expect(rubberBand(30, 30, 330)).toBe(30);
      expect(rubberBand(100, 30, 330)).toBe(100);
      expect(rubberBand(330, 30, 330)).toBe(330);
    });

    it('moves at 35 % of the finger past the first label', () => {
      expect(rubberBand(30 - 100, 30, 330)).toBeCloseTo(30 - 35);
    });

    it('moves at 35 % of the finger past the last label', () => {
      expect(rubberBand(330 + 100, 30, 330)).toBeCloseTo(330 + 35);
    });
  });

  describe('dragOffset', () => {
    it('follows the finger 1:1 from the centre of the label it went down on', () => {
      expect(dragOffset(1, -50, centres)).toBe(170);
      expect(dragOffset(1, 40, centres)).toBe(80);
    });

    it('resists past either end', () => {
      expect(dragOffset(0, 100, centres)).toBeCloseTo(30 - 35);
      expect(dragOffset(3, -100, centres)).toBeCloseTo(330 + 35);
    });
  });

  describe('nearestIndex', () => {
    it('settles on the label whose measured centre is nearest', () => {
      expect(nearestIndex(60, centres)).toBe(0);
      expect(nearestIndex(76, centres)).toBe(1);
      // Midway between 120 and 230 is 175: the wider gap decides, not a fixed item width.
      expect(nearestIndex(174, centres)).toBe(1);
      expect(nearestIndex(176, centres)).toBe(2);
      expect(nearestIndex(1000, centres)).toBe(3);
    });
  });

  describe('releaseTarget', () => {
    const base = { index: 1, centres };

    it('snaps to the nearest centre when slow', () => {
      expect(releaseTarget({ ...base, offset: 150, dx: -30, dt: 1000 })).toBe(
        1,
      );
      expect(releaseTarget({ ...base, offset: 200, dx: -80, dt: 1000 })).toBe(
        2,
      );
      expect(releaseTarget({ ...base, offset: 60, dx: 60, dt: 1000 })).toBe(0);
    });

    it('treats a quick 18-80 pt drag as a flick of exactly one step', () => {
      expect(releaseTarget({ ...base, offset: 140, dx: -20, dt: 100 })).toBe(2);
      expect(releaseTarget({ ...base, offset: 100, dx: 20, dt: 100 })).toBe(0);
      expect(releaseTarget({ ...base, offset: 120, dx: -80, dt: 249 })).toBe(2);
    });

    it('is not a flick at 250 ms or more', () => {
      expect(releaseTarget({ ...base, offset: 140, dx: -20, dt: 250 })).toBe(1);
    });

    it('is not a flick under 18 pt or over 80 pt', () => {
      expect(releaseTarget({ ...base, offset: 130, dx: -17, dt: 50 })).toBe(1);
      // 130 pt fast: past a flick, so the nearest centre wins (two labels on).
      expect(releaseTarget({ ...base, offset: 330, dx: -210, dt: 100 })).toBe(
        3,
      );
      expect(releaseTarget({ ...base, offset: 215, dx: -81, dt: 100 })).toBe(2);
    });

    it('never leaves the strip', () => {
      expect(
        releaseTarget({ index: 0, centres, offset: 0, dx: 30, dt: 20 }),
      ).toBe(0);
      expect(
        releaseTarget({ index: 3, centres, offset: 340, dx: -30, dt: 20 }),
      ).toBe(3);
    });
  });
});
