import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RowHintPill } from './RowHintPill';

describe('RowHintPill', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows its text, then fades for 250 ms and leaves when closed', () => {
    vi.useFakeTimers();
    const view = render(<RowHintPill open>Swipe left</RowHintPill>);
    expect(screen.getByText('Swipe left')).toBeTruthy();
    view.rerender(<RowHintPill open={false}>Swipe left</RowHintPill>);
    act(() => vi.advanceTimersByTime(249));
    expect(screen.queryByText('Swipe left')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Swipe left')).toBeNull();
  });

  it('clears its timer when it unmounts mid-fade', () => {
    vi.useFakeTimers();
    const view = render(<RowHintPill open>Swipe left</RowHintPill>);
    view.rerender(<RowHintPill open={false}>Swipe left</RowHintPill>);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
