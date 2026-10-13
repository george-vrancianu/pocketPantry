import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RowHintPill } from './RowHintPill';

describe('RowHintPill', () => {
  afterEach(cleanup);

  const root = () => document.querySelector('[data-row-hint]')!;

  it('is exposed while visible', () => {
    render(<RowHintPill visible>Swipe left</RowHintPill>);
    expect(screen.getByText('Swipe left')).toBeTruthy();
    expect(root().getAttribute('aria-hidden')).toBe('false');
  });

  it('keeps its place in the page, hidden from assistive technology, when not visible', () => {
    const view = render(<RowHintPill visible>Swipe left</RowHintPill>);
    view.rerender(<RowHintPill visible={false}>Swipe left</RowHintPill>);
    expect(screen.getByText('Swipe left')).toBeTruthy();
    expect(root().getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(root()).visibility).toBe('hidden');
    expect(getComputedStyle(root()).pointerEvents).toBe('none');
  });
});
