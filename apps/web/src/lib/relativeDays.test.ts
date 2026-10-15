import { describe, expect, it } from 'vitest';
import { daysSince } from './relativeDays';

describe('daysSince', () => {
  it('counts calendar days in local time, not 24-hour spans', () => {
    expect(
      daysSince(new Date(2026, 9, 13, 23, 30), new Date(2026, 9, 14, 0, 10)),
    ).toBe(1);
    expect(
      daysSince(new Date(2026, 9, 14, 0, 10), new Date(2026, 9, 14, 23, 50)),
    ).toBe(0);
  });

  it('survives a DST change', () => {
    expect(daysSince(new Date(2026, 2, 20, 12), new Date(2026, 3, 3, 12))).toBe(
      14,
    );
    expect(
      daysSince(new Date(2026, 9, 20, 0, 5), new Date(2026, 10, 3, 23, 55)),
    ).toBe(14);
  });

  it('accepts ISO timestamps and plain dates, and never goes negative', () => {
    expect(daysSince('2026-10-10', new Date(2026, 9, 14, 9))).toBe(4);
    expect(
      daysSince(new Date(2026, 9, 14, 9).toISOString(), new Date(2026, 9, 12)),
    ).toBe(0);
  });
});
