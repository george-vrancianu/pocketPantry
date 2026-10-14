import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { localIso } from './pantry';
import { useToday } from './useToday';

describe('useToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14, 23, 59, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('is today, and stays the same Date while the day does not change', () => {
    const { result, rerender } = renderHook(() => useToday());
    expect(localIso(result.current)).toBe('2026-10-14');
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('moves to the next day at local midnight', () => {
    const { result } = renderHook(() => useToday());
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(localIso(result.current)).toBe('2026-10-15');
  });

  it('refreshes when the page becomes visible again', () => {
    const { result } = renderHook(() => useToday());
    // The device slept through midnight, so the timer never fired.
    vi.setSystemTime(new Date(2026, 9, 16, 8, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(localIso(result.current)).toBe('2026-10-16');
  });
});
