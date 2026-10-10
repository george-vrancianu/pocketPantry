import { describe, expect, it } from 'vitest';
import { DOUBLE_TAP_DISTANCE, DOUBLE_TAP_MS, isDoubleTap } from './doubleTap';

const first = { x: 100, y: 200, t: 1000 };

describe('isDoubleTap', () => {
  it('uses 320 ms and 60 pt', () => {
    expect(DOUBLE_TAP_MS).toBe(320);
    expect(DOUBLE_TAP_DISTANCE).toBe(60);
  });

  it('is false for the first tap', () => {
    expect(isDoubleTap(null, first, null)).toBe(false);
  });

  it('accepts two taps within 320 ms', () => {
    expect(isDoubleTap(first, { ...first, t: 1100 }, null)).toBe(true);
    expect(isDoubleTap(first, { ...first, t: 1320 }, null)).toBe(true);
  });

  it('rejects a second tap after more than 320 ms', () => {
    expect(isDoubleTap(first, { ...first, t: 1321 }, null)).toBe(false);
  });

  it('accepts taps within 60 pt of each other', () => {
    expect(isDoubleTap(first, { x: 160, y: 200, t: 1100 }, null)).toBe(true);
    expect(isDoubleTap(first, { x: 136, y: 248, t: 1100 }, null)).toBe(true); // 60 away
  });

  it('rejects taps further than 60 pt apart, in any direction', () => {
    expect(isDoubleTap(first, { x: 161, y: 200, t: 1100 }, null)).toBe(false);
    expect(isDoubleTap(first, { x: 100, y: 139, t: 1100 }, null)).toBe(false);
    expect(isDoubleTap(first, { x: 150, y: 240, t: 1100 }, null)).toBe(false); // ~64 away
  });

  it('ignores a second tap that follows a dial drag within the window', () => {
    expect(isDoubleTap(first, { ...first, t: 1100 }, 1050)).toBe(false);
    expect(isDoubleTap(first, { ...first, t: 1100 }, 900)).toBe(false);
  });

  it('counts a double-tap once the drag is older than the window', () => {
    expect(isDoubleTap(first, { ...first, t: 1100 }, 700)).toBe(true);
    expect(isDoubleTap(first, { ...first, t: 1100 }, null)).toBe(true);
  });
});
