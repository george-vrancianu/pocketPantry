import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import {
  SHOPPING_POLL_INTERVAL_MS,
  type ShoppingItem,
  type ShoppingList,
} from '../../lib/shopping';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from './ShoppingPage';

const item = (
  overrides: Partial<ShoppingItem> & { id: string },
): ShoppingItem => ({
  name: 'Item',
  quantity: null,
  unit: null,
  checked: false,
  unmatched: false,
  ...overrides,
});

function list(groups: ShoppingList['groups']): ShoppingList {
  const all = groups.flatMap((g) => g.items);
  const checked = all.filter((i) => i.checked).length;
  return {
    id: 'l1',
    groups,
    summary: { remaining: all.length - checked, checked },
  };
}

const produce = { id: 'a1', name: 'Fruit & veg', sortOrder: 1 };
const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };

const tomato = item({ id: 'i1', name: 'Tomato', quantity: 250, unit: 'g' });
const milk = item({
  id: 'i2',
  name: 'Milk',
  quantity: 1,
  unit: 'l',
  checked: true,
});
const base = list([
  { aisle: produce, items: [tomato] },
  { aisle: dairy, items: [milk] },
]);

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hc', name: 'Hard cheese' },
  parentCategory: { id: 'd', name: 'Dairy', aisle: 'Dairy & eggs' },
  defaults: { expiryDays: 30, location: 'fridge' },
};

function stubShopping(
  routes: Record<string, () => Response> = {},
  initial: ShoppingList = base,
) {
  let current = initial;
  const { fetchMock, calls } = stubApi({
    'GET /api/shopping-list': () => Response.json(current),
    'GET /api/catalog/search': () => Response.json({ results: [parmesan] }),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  return {
    calls,
    setCurrent: (next: ShoppingList) => {
      current = next;
    },
  };
}

describe('ShoppingPage', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows the summary card and groups in the order given, with quantities', async () => {
    stubShopping();
    renderWithProviders(<ShoppingPage />);

    expect(await screen.findByText('1 to buy')).toBeVisible();
    expect(screen.getByText('1 of 2 in your basket')).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Basket progress' }),
    ).toHaveAttribute('aria-valuenow', '50');
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent),
    ).toEqual(['Fruit & veg', 'Dairy & eggs']);
    expect(screen.getByText('250 g')).toBeVisible();
    expect(screen.getByRole('button', { name: /^Milk/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /^Tomato/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('checks and unchecks an item through the API', async () => {
    const checkedTomato = { ...tomato, checked: true };
    const { calls } = stubShopping({
      'PATCH /api/shopping-list/items/i1': () =>
        Response.json(
          list([
            { aisle: produce, items: [checkedTomato] },
            { aisle: dairy, items: [milk] },
          ]),
        ),
    });
    renderWithProviders(<ShoppingPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /^Tomato/ }),
    );

    expect(await screen.findByText('0 to buy')).toBeVisible();
    expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
      checked: true,
    });
  });

  it('removes an item', async () => {
    const { calls } = stubShopping({
      'DELETE /api/shopping-list/items/i1': () =>
        Response.json(list([{ aisle: dairy, items: [milk] }])),
    });
    renderWithProviders(<ShoppingPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove Tomato' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /^Tomato/ }),
      ).not.toBeInTheDocument(),
    );
    expect(calls.map((c) => c.key)).toContain(
      'DELETE /api/shopping-list/items/i1',
    );
  });

  it('shows an empty state', async () => {
    stubShopping({}, list([]));
    renderWithProviders(<ShoppingPage />);

    expect(await screen.findByText(/Your list is empty/)).toBeVisible();
    expect(screen.getByText('0 to buy')).toBeVisible();
  });

  it('adds a Catalog Match with quantity and unit', async () => {
    const { calls } = stubShopping({
      'POST /api/shopping-list/items': () =>
        Response.json(
          list([
            ...base.groups,
            {
              aisle: dairy,
              items: [
                item({ id: 'i3', name: 'Parmesan', quantity: 100, unit: 'g' }),
              ],
            },
          ]),
        ),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();

    await screen.findByText('1 to buy');
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
    // The unit defaults to the Ingredient's own.
    expect(screen.getByLabelText('Unit')).toHaveValue('g');
    await user.type(screen.getByLabelText('Quantity'), '100');
    await user.click(screen.getByRole('button', { name: 'Add to list' }));

    expect(await screen.findByText('100 g')).toBeVisible();
    expect(
      calls.find((c) => c.key.startsWith('POST /api/shopping-list'))?.body,
    ).toEqual({
      ingredientId: 'parmesan-id',
      quantity: 100,
      unit: 'g',
    });
    // The form is cleared for the next item.
    expect(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    ).toHaveValue('');
  });

  it('adds a name with no Catalog match as an Unmatched item, flagged visibly', async () => {
    stubShopping({
      'GET /api/catalog/search': () => Response.json({ results: [] }),
      'POST /api/shopping-list/items': () =>
        Response.json(
          list([
            ...base.groups,
            {
              aisle: null,
              items: [
                item({ id: 'i9', name: 'Dragon fruit', unmatched: true }),
              ],
            },
          ]),
        ),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();

    await screen.findByText('1 to buy');
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'dragon fruit',
    );
    expect(
      await screen.findByText(/will be added as an unmatched item/),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add to list' }));

    const row = (
      await screen.findByRole('button', { name: /^Dragon fruit/ })
    ).closest('li');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Unmatched')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Not in the catalog' }),
    ).toBeVisible();
  });

  it('sends the typed name when no Catalog Match was picked', async () => {
    const { calls } = stubShopping({
      'GET /api/catalog/search': () => Response.json({ results: [] }),
      'POST /api/shopping-list/items': () => Response.json(base),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();

    await screen.findByText('1 to buy');
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'Dragon fruit',
    );
    await user.click(screen.getByRole('button', { name: 'Add to list' }));

    await waitFor(() =>
      expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
        name: 'Dragon fruit',
      }),
    );
  });

  it('refreshes on an interval and on window focus so other Members changes appear', async () => {
    const shopping = stubShopping();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<ShoppingPage />);
    expect(await screen.findByText('1 to buy')).toBeVisible();

    shopping.setCurrent(
      list([
        { aisle: produce, items: [tomato, item({ id: 'i5', name: 'Basil' })] },
      ]),
    );
    await act(() =>
      vi.advanceTimersByTimeAsync(SHOPPING_POLL_INTERVAL_MS + 100),
    );
    expect(await screen.findByText('Basil')).toBeVisible();

    shopping.setCurrent(
      list([
        { aisle: produce, items: [tomato, item({ id: 'i6', name: 'Chives' })] },
      ]),
    );
    act(() => {
      window.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await screen.findByText('Chives')).toBeVisible();
  });

  it('asks for the list in the Member locale and translates the copy', async () => {
    stubShopping({}, list([{ aisle: dairy, items: [milk] }]));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderWithProviders(<ShoppingPage />, { locale: 'ro' });

    expect(await screen.findByText('0 de cumpărat')).toBeVisible();
    const url = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(url.searchParams.get('locale')).toBe('ro');
  });
});
