import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Batch } from '../../lib/pantry';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

function batch(overrides: Partial<Batch>): Batch {
  return {
    id: crypto.randomUUID(),
    name: 'Milk',
    ingredientId: 'milk-id',
    unmatched: false,
    aisle: null,
    amountScale: null,
    defaultUnit: null,
    defaultExpiryDays: null,
    quantity: 1,
    unit: 'l',
    location: 'fridge',
    expiryDate: null,
    productDescription: null,
    createdAt: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

const milkStaple = {
  id: 'staple-1',
  ingredientId: 'milk-id',
  name: 'Milk',
  quantity: null,
  unit: null,
  aisle: null,
};

/** Running-low flags and Staples follow the PUT and DELETE calls, as the API does. */
function stubRunningLow(flaggedAtStart: string[] = []) {
  const flagged = new Set<string>(flaggedAtStart);
  let staples: (typeof milkStaple)[] = [];
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () =>
      Response.json({
        batches: [
          batch({ id: 'milk-1' }),
          batch({
            id: 'zorblax',
            name: 'Zorblax paste',
            unmatched: true,
            ingredientId: null,
            location: 'cupboard',
          }),
        ],
        runningLow: [...flagged],
      }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/staples': () => Response.json({ staples }),
    'POST /api/staples': () => {
      staples = [milkStaple];
      return Response.json(milkStaple, { status: 201 });
    },
    'DELETE /api/staples/staple-1': () => {
      staples = [];
      return new Response(null, { status: 204 });
    },
    'PUT /api/pantry/running-low/milk-id': () => {
      flagged.add('milk-id');
      return new Response(null, { status: 204 });
    },
    'DELETE /api/pantry/running-low/milk-id': () => {
      flagged.delete('milk-id');
      return new Response(null, { status: 204 });
    },
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

const row = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`^${name}`) });
const chip = (name = 'Milk') =>
  within(row(name)).queryByText('Running low', { ignore: '[aria-hidden] *' });
const saves = (calls: { key: string }[]) =>
  calls.map((call) => call.key).filter((key) => key.includes('/running-low/'));
const stapleSaves = (calls: { key: string }[]) =>
  calls
    .map((call) => call.key)
    .filter((key) => /^(POST|DELETE) \/api\/staples/.test(key));

/** Press on the row at x=300, move to `300 + dx`. */
function drag(target: HTMLElement, dx: number) {
  fireEvent.pointerDown(target, { pointerId: 1, clientX: 300, clientY: 10 });
  fireEvent.pointerMove(target, {
    pointerId: 1,
    clientX: 300 + dx,
    clientY: 10,
  });
}
function release(target: HTMLElement, dx: number) {
  fireEvent.pointerUp(target, { pointerId: 1, clientX: 300 + dx, clientY: 10 });
}
function swipe(target: HTMLElement, dx: number) {
  drag(target, dx);
  release(target, dx);
}

async function renderPage(flagged: string[] = []) {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const calls = stubRunningLow(flagged);
  renderWithProviders(<PantryPage />);
  await screen.findByRole('button', { name: /^Milk/ });
  return calls;
}
/** Past the 220 ms between the release and the flag flipping. */
const settle = () => act(() => vi.advanceTimersByTimeAsync(250));

describe('swiping an Ingredient row to toggle Running low', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('does nothing on a release short of 92 pt', async () => {
    const calls = await renderPage();
    swipe(row('Milk'), -91);
    await settle();
    expect(saves(calls)).toEqual([]);
    expect(chip()).toBeNull();
  });

  it('labels the tab by what the release will do', async () => {
    await renderPage(['milk-id']);
    drag(row('Milk'), -100);
    const item = row('Milk').closest('li')!;
    expect(within(item).getByText('Not low')).toBeInTheDocument();
    release(row('Milk'), -100);
  });

  it('flags the Ingredient at 92 pt, shows the chip, and Undo clears it again', async () => {
    const calls = await renderPage();
    swipe(row('Milk'), -92);
    // The row springs back first; the flag flips 220 ms later.
    expect(saves(calls)).toEqual([]);
    await settle();

    await waitFor(() =>
      expect(saves(calls)).toEqual(['PUT /api/pantry/running-low/milk-id']),
    );
    expect(chip()).toBeVisible();
    expect(screen.getByText('Milk marked running low')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() =>
      expect(saves(calls)).toEqual([
        'PUT /api/pantry/running-low/milk-id',
        'DELETE /api/pantry/running-low/milk-id',
      ]),
    );
    await waitFor(() => expect(chip()).toBeNull());
  });

  it('clears the flag on a row already running low', async () => {
    const calls = await renderPage(['milk-id']);
    expect(chip()).toBeVisible();
    swipe(row('Milk'), -120);
    await settle();

    await waitFor(() =>
      expect(saves(calls)).toEqual(['DELETE /api/pantry/running-low/milk-id']),
    );
    expect(chip()).toBeNull();
    expect(screen.getByText('Milk no longer running low')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
  });

  it('does not open the row with the click that follows the drag', async () => {
    await renderPage();
    swipe(row('Milk'), -40);
    fireEvent.click(row('Milk'));
    expect(row('Milk')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does nothing on an open row', async () => {
    const calls = await renderPage();
    fireEvent.click(row('Milk'));
    expect(row('Milk')).toHaveAttribute('aria-expanded', 'true');

    swipe(row('Milk'), -120);
    await settle();
    expect(saves(calls)).toEqual([]);
    expect(row('Milk')).toHaveAttribute('aria-expanded', 'true');
  });

  it('does nothing on an Unmatched row', async () => {
    const calls = await renderPage();
    swipe(row('Zorblax paste'), -120);
    await settle();
    expect(saves(calls)).toEqual([]);
    expect(chip('Zorblax paste')).toBeNull();
  });

  describe('the L key', () => {
    it('toggles Running low on a focused closed row, which says so', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const calls = await renderPage();
      await waitFor(() =>
        expect(row('Milk')).toHaveAccessibleDescription(
          'Press L: Mark running low. Press S: Make Staple.',
        ),
      );

      row('Milk').focus();
      await user.keyboard('l');
      await waitFor(() =>
        expect(saves(calls)).toEqual(['PUT /api/pantry/running-low/milk-id']),
      );
      await waitFor(() => expect(chip()).toBeVisible());
      expect(row('Milk')).toHaveAccessibleDescription(
        'Press L: Clear running low. Press S: Make Staple.',
      );
      expect(row('Milk')).toHaveFocus();
      expect(row('Milk')).toHaveAttribute('aria-expanded', 'false');
    });

    it('does nothing on an open row or an Unmatched row', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const calls = await renderPage();
      expect(row('Zorblax paste')).not.toHaveAccessibleDescription();
      row('Zorblax paste').focus();
      await user.keyboard('l');

      await user.click(row('Milk'));
      expect(row('Milk')).not.toHaveAccessibleDescription();
      await user.keyboard('l');
      await settle();
      expect(saves(calls)).toEqual([]);
    });
  });

  describe('the S key', () => {
    it('makes a focused closed row a Staple, and then no longer one, saying so each time', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const calls = await renderPage();
      await waitFor(() =>
        expect(row('Milk')).toHaveAccessibleDescription(
          'Press L: Mark running low. Press S: Make Staple.',
        ),
      );

      row('Milk').focus();
      await user.keyboard('s');
      expect(await screen.findByText('Milk is a Staple')).toBeVisible();
      expect(stapleSaves(calls)).toEqual(['POST /api/staples']);
      await waitFor(() =>
        expect(row('Milk')).toHaveAccessibleDescription(
          'Press L: Mark running low. Press S: Remove Staple.',
        ),
      );
      expect(row('Milk')).toHaveFocus();
      expect(row('Milk')).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('s');
      expect(
        await screen.findByText('Milk is no longer a Staple'),
      ).toBeVisible();
      expect(stapleSaves(calls)).toEqual([
        'POST /api/staples',
        'DELETE /api/staples/staple-1',
      ]);
    });

    it('does nothing on an open row or an Unmatched row', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const calls = await renderPage();
      row('Zorblax paste').focus();
      await user.keyboard('s');

      await user.click(row('Milk'));
      await user.keyboard('s');
      await settle();
      expect(stapleSaves(calls)).toEqual([]);
    });
  });
});
