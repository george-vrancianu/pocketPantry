import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultExpiryDate, type Batch } from '../../lib/pantry';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from '../Shopping/ShoppingPage';
import { PantryPage } from './PantryPage';

const inDays = (days: number) => defaultExpiryDate(days, new Date());

const batch = (overrides: Partial<Batch> = {}): Batch => ({
  id: 'milk-1',
  name: 'Milk',
  ingredientId: 'milk-id',
  unmatched: false,
  aisle: null,
  amountScale: null,
  defaultUnit: null,
  defaultExpiryDays: null,
  quantity: null,
  unit: null,
  location: 'fridge',
  expiryDate: null,
  productDescription: null,
  createdAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

const shoppingList = (checked: number) => ({
  id: 'l1',
  groups: [],
  summary: { remaining: 0, checked },
});

function stub({
  batches = [] as Batch[],
  checked = 0,
  extra = {} as Record<string, () => Response>,
} = {}) {
  let current = batches;
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () => Response.json({ batches: current }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/shopping-list': () => Response.json(shoppingList(checked)),
    'GET /api/catalog/search': () => Response.json({ results: [] }),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'DELETE /api/pantry/batches/milk-1': () => {
      current = [];
      return new Response(null, { status: 204 });
    },
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderPantry() {
  return renderWithProviders(
    <>
      <PantryPage />
      <Where />
    </>,
    { route: '/pantry' },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('the Empty Pantry', () => {
  it('shows the subtitle, dimmed inert chips, no search, the banner and four shelves in order', async () => {
    stub();
    renderPantry();

    expect(await screen.findByText('Nothing in here yet')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    const chips = screen.getByText('All · 0').closest('[aria-hidden]')!;
    expect(chips).toHaveAttribute('aria-hidden', 'true');
    expect(chips).toHaveAttribute('inert');
    expect(chips).toHaveStyle({ opacity: '0.55' });
    expect(
      screen.getByText(
        "Tell me what you have and I'll put it on the right shelf.",
      ),
    ).toBeInTheDocument();
    const shelves = screen
      .getAllByRole('button', { name: /^Add to / })
      .map((button) => button.getAttribute('aria-label'))
      .filter((name) => name !== 'Add to Pantry');
    expect(shelves).toEqual([
      'Add to Fridge',
      'Add to Freezer',
      'Add to Cupboard',
      'Add to Spices',
    ]);
    expect(screen.getByText('Fridge is empty')).toBeInTheDocument();
    expect(
      screen.getByText('Milk, eggs, cheese, leftovers'),
    ).toBeInTheDocument();
  });

  it('names Gator as a button with its art hidden', async () => {
    stub();
    renderPantry();
    const gator = await screen.findByRole('button', {
      name: 'Gator reading a list. Tap to say hi',
    });
    expect(gator.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the list, not the empty state, with only Expired Batches', async () => {
    stub({ batches: [batch({ expiryDate: inDays(-5) })] });
    renderPantry();
    expect(await screen.findByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Nothing in here yet')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('shows the ticked bar only with checked Shopping Items and goes to Finish Shopping', async () => {
    stub({ checked: 3 });
    const user = userEvent.setup();
    renderPantry();
    const bar = await screen.findByRole('button', {
      name: '3 ticked on your Shopping List · Move them',
    });
    await user.click(bar);
    expect(screen.getByTestId('where')).toHaveTextContent('/shopping?finish=1');
  });

  it('has no ticked bar when nothing is checked', async () => {
    stub({ checked: 0 });
    renderPantry();
    await screen.findByText('Nothing in here yet');
    expect(screen.queryByText(/ticked on your/)).not.toBeInTheDocument();
  });

  it('uses the Romanian plural forms in the ticked bar', async () => {
    stub({ checked: 3 });
    renderWithProviders(<PantryPage />, { locale: 'ro' });
    expect(
      await screen.findByRole('button', {
        name: '3 produse bifate în Lista de cumpărături · Mută-le',
      }),
    ).toBeInTheDocument();
  });

  it('Type opens the Add to Pantry sheet', async () => {
    stub();
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/pantry" element={<PantryPage />} />
        <Route path="/scan" element={<Where />} />
      </Routes>,
      { route: '/pantry' },
    );
    await user.click(await screen.findByRole('button', { name: 'Type' }));
    expect(
      await screen.findByRole('dialog', { name: 'Add to Pantry' }),
    ).toBeInTheDocument();
  });

  it('Scan goes to the Scan page on Receipt', async () => {
    stub();
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/pantry" element={<PantryPage />} />
        <Route path="/scan" element={<Where />} />
      </Routes>,
      { route: '/pantry' },
    );
    await user.click(await screen.findByRole('button', { name: 'Scan' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/scan?mode=receipt');
  });

  it('a shelf "+" presets its Location for every pick, and the create carries it', async () => {
    const rice = {
      id: 'rice-id',
      name: 'Rice',
      owner: 'catalog',
      defaultUnit: 'g',
      amountScale: 'medium',
      defaults: { expiryDays: 365, location: 'cupboard' },
      leafCategory: { id: 'leaf', name: 'Rice' },
      parentCategory: {
        id: 'parent',
        name: 'Grains',
        aisle: { id: 'aisle', name: 'Grains' },
      },
    };
    const calls = stub({
      extra: {
        'GET /api/catalog/search': () => Response.json({ results: [rice] }),
        'POST /api/pantry/batches': () =>
          Response.json(batch({ id: 'rice-1', name: 'Rice' })),
      },
    });
    const user = userEvent.setup();
    renderPantry();
    await user.click(
      await screen.findByRole('button', { name: 'Add to Freezer' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add to Pantry' });
    await user.type(within(dialog).getByRole('combobox'), 'rice');
    await user.click(await within(dialog).findByText('Rice'));
    expect(
      within(dialog).getByRole('button', { name: /Freezer/, pressed: true }),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole('button', { name: 'Add to Pantry' }),
    );
    await waitFor(() =>
      expect(calls.some((c) => c.key === 'POST /api/pantry/batches')).toBe(
        true,
      ),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/pantry/batches')?.body,
    ).toMatchObject({ location: 'freezer' });
  });

  it('swaps for the list on the first save', async () => {
    let batches: Batch[] = [];
    stub({
      extra: {
        'GET /api/pantry': () => Response.json({ batches }),
        'POST /api/pantry/batches': () => {
          batches = [batch()];
          return Response.json(batches[0]);
        },
      },
    });
    const { queryClient } = renderPantry();
    await screen.findByText('Nothing in here yet');
    batches = [batch()];
    await act(() => queryClient.invalidateQueries());
    expect(await screen.findByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Nothing in here yet')).not.toBeInTheDocument();
  });
});

describe('a Location filter with none', () => {
  it("shows that Location's shelf card instead of 'No batches match.'", async () => {
    stub({ batches: [batch()] });
    const user = userEvent.setup();
    renderPantry();
    await screen.findByText('Milk');
    await user.click(screen.getByRole('button', { name: 'Freezer · 0' }));
    expect(screen.getByText('Freezer is empty')).toBeInTheDocument();
    expect(screen.queryByText('No batches match.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add to Freezer' }),
    ).toBeInTheDocument();
  });
});

describe('deleting the last Batch', () => {
  it('shows the empty state while the Undo toast is up, and Undo restores the list', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    stub({ batches: [batch()] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPantry();
    await user.click(await screen.findByRole('button', { name: /^Milk/ }));
    const row = within(
      screen.getByRole('group', { name: /^Milk, \d+ batch/ }),
    ).getAllByRole('group')[0];
    act(() => row.focus());
    await user.keyboard('{Delete}');
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(await screen.findByText('Nothing in here yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.queryByText('Nothing in here yet')).not.toBeInTheDocument();
    expect(await screen.findByText('Milk')).toBeInTheDocument();
  });
});

describe('Shopping page ?finish=1', () => {
  it("opens Finish Shopping's Review once loaded and drops the parameter", async () => {
    const calls = stub({
      checked: 1,
      extra: {
        'GET /api/shopping-list/finish': () =>
          Response.json({ listId: 'l1', lines: [] }),
      },
    });
    renderWithProviders(
      <>
        <ShoppingPage />
        <Where />
      </>,
      { route: '/shopping?finish=1' },
    );
    await waitFor(() =>
      expect(calls.some((c) => c.key === 'GET /api/shopping-list/finish')).toBe(
        true,
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('where')).toHaveTextContent(/^\/shopping$/),
    );
  });
});
