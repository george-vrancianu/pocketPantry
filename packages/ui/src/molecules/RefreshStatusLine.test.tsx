import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RefreshStatusLine } from './RefreshStatusLine';

afterEach(cleanup);

const labels = { busy: 'Refreshing…', done: 'Updated', failed: 'Failed' };

describe('RefreshStatusLine', () => {
  it('is an empty polite status at rest', () => {
    render(<RefreshStatusLine state="idle" labels={labels} />);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it.each([
    ['busy', 'Refreshing…'],
    ['done', 'Updated'],
    ['failed', 'Failed'],
  ] as const)('says %s', (state, text) => {
    render(<RefreshStatusLine state={state} labels={labels} />);
    expect(screen.getByRole('status').textContent).toBe(text);
  });
});

describe('RefreshStatusLine rest', () => {
  it('shows the rest text when idle and the state text otherwise', () => {
    const { rerender } = render(
      <RefreshStatusLine state="idle" labels={labels} rest="Sunday" />,
    );
    expect(screen.getByRole('status').textContent).toBe('Sunday');
    rerender(<RefreshStatusLine state="done" labels={labels} rest="Sunday" />);
    expect(screen.getByRole('status').textContent).toBe('Updated');
  });
});
