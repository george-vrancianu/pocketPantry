import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { verdictOf, type PantryHealth } from '../../lib/health';
import { renderWithProviders } from '../../test/render';
import { stubMotion } from '../../test/viewport';
import { HealthGator } from './HealthGator';

const scored = (total: number): PantryHealth => ({
  scored: true,
  factors: {},
  total,
  verdict: verdictOf(total),
});
const unscored: PantryHealth = { scored: false, batchCount: 4 };

const ALT = {
  curious: 'Gator, curious',
  dapper: 'Gator, dapper',
  hmm: 'Gator, with a raised eyebrow',
  worried: 'Gator, worried',
} as const;

/** Shows a 90, and a 50 once "Change" is pressed. */
function Harness() {
  const [score, setScore] = useState(90);
  return (
    <>
      <HealthGator health={scored(score)} size={64} />
      <button type="button" onClick={() => setScore(50)}>
        Change
      </button>
      <button type="button" onClick={() => setScore(90)}>
        Back
      </button>
    </>
  );
}

describe('HealthGator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['fewer than ten Batches', unscored, ALT.curious],
    ['64', scored(64), ALT.worried],
    ['65', scored(65), ALT.hmm],
    ['84', scored(84), ALT.hmm],
    ['85', scored(85), ALT.dapper],
    ['100', scored(100), ALT.dapper],
    ['0', scored(0), ALT.worried],
  ])('shows the mood for %s', (_name, health, alt) => {
    renderWithProviders(<HealthGator health={health} size={64} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByAltText(alt)).toBeInTheDocument();
  });

  it('fades the old mood out beside the new one', async () => {
    stubMotion(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<Harness />);
    expect(screen.queryByTestId('health-gator-leaving')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(screen.getByTestId('health-gator-leaving')).toBeInTheDocument();
    expect(screen.getByAltText(ALT.worried)).toBeInTheDocument();
    // The leaving face is decorative: only the current mood is announced.
    expect(screen.queryByAltText(ALT.dapper)).toBeNull();
    // The new mood goes straight to its loop, never the Entrance.
    expect(screen.getByAltText(ALT.worried).getAttribute('data-motion')).toBe(
      'idle',
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('health-gator-leaving')).toBeNull();
  });

  it('never plays an Entrance after a band change, even when the band comes back', async () => {
    stubMotion(false);
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByAltText(ALT.dapper).getAttribute('data-motion')).toBe(
      'idle',
    );
  });

  it('swaps without a fade under reduced motion', async () => {
    stubMotion(true);
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(screen.queryByTestId('health-gator-leaving')).toBeNull();
    expect(screen.getByAltText(ALT.worried)).toBeInTheDocument();
  });
});
