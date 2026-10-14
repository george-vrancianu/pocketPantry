import { describe, expect, it } from 'vitest';
import { fitChips } from './fitChips';

// Chips in priority order; the first four are the anchors.
const widths = [60, 60, 60, 60, 60, 60];

describe('fitChips', () => {
  it('keeps the highest-priority chips that fit, with a 6 pt gap between chips', () => {
    // 3 chips: 60 + 6 + 60 + 6 + 60 = 192 fits 200; a fourth would need 258.
    expect(fitChips({ widths, rowWidth: 200 })).toEqual([0, 1, 2]);
  });

  it('stops at the first chip that does not fit, even if a later one would', () => {
    const mixed = [60, 200, 10, 10];
    expect(fitChips({ widths: mixed, rowWidth: 150 })).toEqual([0]);
  });

  it('keeps the chip matching the current value even when the row is narrow', () => {
    // Index 5 is pinned; it is placed first, then priority order fills the rest.
    const kept = fitChips({ widths, rowWidth: 130, pinned: 5 });
    expect(kept).toContain(5);
    expect(kept).toEqual([0, 5]);
  });

  it('returns the kept indexes in ascending priority order', () => {
    const kept = fitChips({ widths, rowWidth: 400, pinned: 4 });
    expect(kept).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('keeps nothing from an empty or zero-width row', () => {
    expect(fitChips({ widths, rowWidth: 0 })).toEqual([]);
    expect(fitChips({ widths: [], rowWidth: 300 })).toEqual([]);
  });
});
