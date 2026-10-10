import { describe, expect, it } from 'vitest';
import {
  DIAL_ITEM_WIDTH,
  rubberBand,
  startsHorizontalDrag,
  releaseTarget,
} from './dialGesture';

describe('dial gesture maths', () => {
  it('uses 84 pt items', () => {
    expect(DIAL_ITEM_WIDTH).toBe(84);
  });

  describe('startsHorizontalDrag', () => {
    it('needs more than 10 pt of horizontal travel', () => {
      expect(startsHorizontalDrag(10, 0)).toBe(false);
      expect(startsHorizontalDrag(-10, 0)).toBe(false);
      expect(startsHorizontalDrag(11, 0)).toBe(true);
      expect(startsHorizontalDrag(-11, 2)).toBe(true);
    });

    it('needs |dx| > |dy|', () => {
      expect(startsHorizontalDrag(20, 20)).toBe(false);
      expect(startsHorizontalDrag(12, 40)).toBe(false);
      expect(startsHorizontalDrag(21, 20)).toBe(true);
    });
  });

  describe('rubberBand', () => {
    const max = 3 * DIAL_ITEM_WIDTH;

    it('is 1:1 inside the strip', () => {
      expect(rubberBand(0, max)).toBe(0);
      expect(rubberBand(100, max)).toBe(100);
      expect(rubberBand(max, max)).toBe(max);
    });

    it('moves at 35 % of the finger past the first item', () => {
      expect(rubberBand(-100, max)).toBeCloseTo(-35);
    });

    it('moves at 35 % of the finger past the last item', () => {
      expect(rubberBand(max + 100, max)).toBeCloseTo(max + 35);
    });
  });

  describe('releaseTarget', () => {
    const base = { index: 1, count: 4 };

    it('snaps to the nearest item when slow', () => {
      expect(
        releaseTarget({ ...base, offset: 84 + 30, dx: -30, dt: 1000 }),
      ).toBe(1);
      expect(
        releaseTarget({ ...base, offset: 84 + 50, dx: -50, dt: 1000 }),
      ).toBe(2);
      expect(
        releaseTarget({ ...base, offset: 84 - 50, dx: 50, dt: 1000 }),
      ).toBe(0);
    });

    it('treats a fast short drag as a flick of exactly one step', () => {
      // 40 pt in 50 ms = 0.8 pt/ms, under 0.6 of an item (50.4 pt)
      expect(releaseTarget({ ...base, offset: 84 + 40, dx: -40, dt: 50 })).toBe(
        2,
      );
      expect(releaseTarget({ ...base, offset: 84 - 40, dx: 40, dt: 50 })).toBe(
        0,
      );
      // offset would round back to the current item; the flick still advances
      expect(releaseTarget({ ...base, offset: 84 + 20, dx: -20, dt: 20 })).toBe(
        2,
      );
    });

    it('is not a flick at or below 0.45 pt/ms', () => {
      expect(releaseTarget({ ...base, offset: 84 + 20, dx: -20, dt: 50 })).toBe(
        1,
      );
    });

    it('is not a flick once the finger travelled 0.6 of an item or more', () => {
      // 60 pt in 30 ms is fast, but it already moved past 0.6 of an item: nearest wins
      expect(releaseTarget({ ...base, offset: 84 + 60, dx: -60, dt: 30 })).toBe(
        2,
      );
      expect(
        releaseTarget({ ...base, offset: 84 + 130, dx: -130, dt: 100 }),
      ).toBe(3);
    });

    it('never leaves the strip', () => {
      expect(
        releaseTarget({ index: 0, count: 4, offset: -30, dx: 30, dt: 1000 }),
      ).toBe(0);
      expect(
        releaseTarget({ index: 0, count: 4, offset: 0, dx: 30, dt: 20 }),
      ).toBe(0);
      expect(
        releaseTarget({
          index: 3,
          count: 4,
          offset: 3 * 84 + 30,
          dx: -30,
          dt: 1000,
        }),
      ).toBe(3);
      expect(
        releaseTarget({ index: 3, count: 4, offset: 3 * 84, dx: -30, dt: 20 }),
      ).toBe(3);
    });
  });
});
