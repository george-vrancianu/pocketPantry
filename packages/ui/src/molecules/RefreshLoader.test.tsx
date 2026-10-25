import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REFRESH_LOADER_FAILED_MS, RefreshLoader } from './RefreshLoader';

const labels = { busy: 'Refreshing…', done: 'Updated', failed: 'Failed' };
const loader = () => screen.getByTestId('refresh-loader');

describe('RefreshLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('is up, with an empty polite status, at rest', () => {
    render(<RefreshLoader state="idle" labels={labels} />);
    expect(screen.getByRole('status').textContent).toBe('');
    expect(loader().getAttribute('data-shown')).toBe('false');
    expect(loader().getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    ['busy', 'Refreshing…'],
    ['done', 'Updated'],
    ['failed', 'Failed'],
  ] as const)('says %s to the screen reader only', (state, text) => {
    render(<RefreshLoader state={state} labels={labels} />);
    expect(screen.getByRole('status').textContent).toBe(text);
    expect(loader().textContent).not.toContain(text);
  });

  it('drops while busy and tucks back up once done', () => {
    const { rerender } = render(<RefreshLoader state="busy" labels={labels} />);
    expect(loader().getAttribute('data-shown')).toBe('true');
    rerender(<RefreshLoader state="done" labels={labels} />);
    expect(loader().getAttribute('data-shown')).toBe('false');
  });

  it('stays down on a failure briefly, then tucks up while the words remain', () => {
    const { rerender } = render(<RefreshLoader state="busy" labels={labels} />);
    rerender(<RefreshLoader state="failed" labels={labels} />);
    expect(loader().getAttribute('data-shown')).toBe('true');
    act(() => {
      vi.advanceTimersByTime(REFRESH_LOADER_FAILED_MS - 1);
    });
    expect(loader().getAttribute('data-shown')).toBe('true');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(loader().getAttribute('data-shown')).toBe('false');
    expect(screen.getByRole('status').textContent).toBe('Failed');
  });
});
