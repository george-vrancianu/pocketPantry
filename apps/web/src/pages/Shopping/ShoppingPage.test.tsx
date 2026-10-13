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
import { stubMotion, stubViewport } from '../../test/viewport';
import { ShoppingPage } from './ShoppingPage';

const item = (
  overrides: Partial<ShoppingItem> & { id: string },
): ShoppingItem => ({
  ingredientId: null,
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
    expect(await screen.findByText('Removed Tomato')).toBeVisible();
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
  });

  describe('Staple star toasts', () => {
    const tomatoItem = item({
      id: 'i1',
      ingredientId: 'ing-tomato',
      name: 'Tomato',
    });
    const withIngredient = list([{ aisle: produce, items: [tomatoItem] }]);
    const stapleRow = {
      id: 's1',
      ingredientId: 'ing-tomato',
      name: 'Tomato',
      quantity: null,
      unit: null,
      aisle: null,
    };

    it('says the item is now a staple when starred', async () => {
      stubShopping(
        {
          'GET /api/staples': () => Response.json({ staples: [] }),
          'POST /api/staples': () => Response.json(stapleRow, { status: 201 }),
        },
        withIngredient,
      );
      renderWithProviders(<ShoppingPage />);

      const star = await screen.findByRole('button', {
        name: 'Make Tomato a staple',
      });
      await waitFor(() => expect(star).not.toHaveAttribute('aria-disabled'));
      await userEvent.click(star);

      expect(await screen.findByText('Tomato is now a staple')).toBeVisible();
    });

    it('says the item was removed from staples when unstarred', async () => {
      stubShopping(
        {
          'GET /api/staples': () => Response.json({ staples: [stapleRow] }),
          'DELETE /api/staples/s1': () => new Response(null, { status: 204 }),
        },
        withIngredient,
      );
      renderWithProviders(<ShoppingPage />);

      const star = await screen.findByRole('button', {
        name: 'Remove Tomato from staples',
      });
      await waitFor(() => expect(star).not.toHaveAttribute('aria-disabled'));
      await userEvent.click(star);

      expect(
        await screen.findByText('Tomato removed from staples'),
      ).toBeVisible();
    });
  });

  it('replaces the showing toast instead of queueing', async () => {
    stubShopping({
      'DELETE /api/shopping-list/items/i1': () =>
        Response.json(list([{ aisle: dairy, items: [milk] }])),
      'DELETE /api/shopping-list/items/i2': () => Response.json(list([])),
    });
    renderWithProviders(<ShoppingPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove Tomato' }),
    );
    expect(await screen.findByText('Removed Tomato')).toBeVisible();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove Milk' }),
    );

    expect(await screen.findByText('Removed Milk')).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByText('Removed Tomato')).not.toBeInTheDocument(),
    );
  });

  it('shows an empty state', async () => {
    stubShopping({}, list([]));
    renderWithProviders(<ShoppingPage />);

    expect(await screen.findByText('Your list is empty.')).toBeVisible();
    expect(
      screen.getByText('Add what you need, or start from a template.'),
    ).toBeVisible();
    expect(screen.getByText('0 to buy')).toBeVisible();
  });

  it('shows the Finish row and item counts per Aisle', async () => {
    stubShopping();
    renderWithProviders(<ShoppingPage />);

    expect(await screen.findByText('1 ticked off')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Move 1 to Pantry' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Finish shopping' }),
    ).not.toBeInTheDocument();
    const produceSection = screen.getByRole('region', { name: 'Fruit & veg' });
    const heading = within(produceSection).getByRole('heading', {
      name: 'Fruit & veg',
    });
    expect(heading.parentElement).toHaveTextContent('Fruit & veg1');
  });

  describe('Add sheet', () => {
    const openSheet = async (user = userEvent.setup()) => {
      await screen.findByText('1 to buy');
      await user.click(screen.getByRole('button', { name: 'Add items' }));
      return screen.findByRole('dialog', { name: 'Add to list' });
    };

    it('opens on the Ingredients tab with focus in the search field', async () => {
      stubShopping();
      renderWithProviders(<ShoppingPage />);

      const dialog = await openSheet();

      expect(
        within(dialog).getByRole('tab', { name: 'Ingredients' }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        within(dialog).getByRole('tab', { name: 'Templates' }),
      ).toHaveAttribute('aria-selected', 'false');
      await waitFor(() =>
        expect(
          within(dialog).getByRole('combobox', { name: 'Search ingredients' }),
        ).toHaveFocus(),
      );
    });

    it('closes with Done, Escape and a scrim tap, returning focus to Add items', async () => {
      stubShopping();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const opener = () => screen.getByRole('button', { name: 'Add items' });

      let dialog = await openSheet(user);
      await user.click(within(dialog).getByRole('button', { name: 'Done' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(opener()).toHaveFocus();

      await openSheet(user);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(opener()).toHaveFocus();

      dialog = await openSheet(user);
      const scrim = document.querySelector('.MuiBackdrop-root');
      await user.click(scrim as HTMLElement);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(opener()).toHaveFocus();
    });

    const withParmesan = (
      routes: Record<string, () => Response> = {},
      initial: ShoppingList = base,
    ) => {
      const added = list([
        ...base.groups,
        {
          aisle: dairy,
          items: [
            item({ id: 'i3', name: 'Parmesan', quantity: 100, unit: 'g' }),
          ],
        },
      ]);
      return stubShopping(
        {
          'POST /api/shopping-list/items': () => Response.json(added),
          ...routes,
        },
        initial,
      );
    };
    const search = (dialog: HTMLElement) =>
      within(dialog).getByRole('combobox', { name: 'Search ingredients' });
    const findParmesanRow = async (
      user: ReturnType<typeof userEvent.setup>,
    ) => {
      const dialog = await openSheet(user);
      await user.type(search(dialog), 'parm');
      const option = await within(dialog).findByRole('option', {
        name: /Parmesan/,
      });
      return { dialog, option };
    };
    const posts = (calls: { key: string; body: unknown }[]) =>
      calls.filter((c) => c.key === 'POST /api/shopping-list/items');

    it('announces the matches and shows the name, leaf and aisle of each', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const { dialog, option } = await findParmesanRow(userEvent.setup());

      await waitFor(() =>
        expect(within(dialog).getByRole('status')).toHaveTextContent('1 match'),
      );
      expect(option).toHaveTextContent('Hard cheese · Dairy & eggs');
      expect(search(dialog)).toHaveAttribute('aria-expanded', 'true');
    });

    it('adds a Catalog Match with amount and unit, then resets the search', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      // The unit defaults to the Ingredient's own.
      expect(
        within(dialog).getByRole('button', { name: 'Unit: g' }),
      ).toBeVisible();
      await user.type(
        within(dialog).getByRole('textbox', {
          name: 'Amount of Parmesan, for example 2 or 500 g',
        }),
        '100',
      );
      await user.click(
        within(dialog).getByRole('button', {
          name: 'Add Parmesan to the list',
        }),
      );

      expect(await screen.findByText('Added Parmesan')).toBeVisible();
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 100,
        unit: 'g',
      });
      expect(
        within(dialog).getByRole('button', { name: 'Done, 1 added' }),
      ).toBeVisible();
      expect(search(dialog)).toHaveValue('');
      expect(search(dialog)).toHaveFocus();
      expect(within(dialog).queryByRole('option')).toBeNull();
      expect(await screen.findByText('100 g')).toBeVisible();
    });

    it('changes the unit from the chip popover and returns focus to the amount', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '2');
      await user.click(within(dialog).getByRole('button', { name: 'Unit: g' }));
      expect(within(dialog).getByRole('button', { name: 'g' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await user.click(within(dialog).getByRole('button', { name: 'kg' }));

      expect(amount).toHaveFocus();
      expect(within(dialog).queryByRole('button', { name: 'kg' })).toBeNull();
      await user.keyboard('{Enter}');

      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 2,
        unit: 'kg',
      });
    });

    it('opens the first result on Enter, and toggles rows by tapping', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(search(dialog));
      await user.keyboard('{Enter}');
      expect(
        within(dialog).getByRole('textbox', { name: /Amount of Parmesan/ }),
      ).toBeVisible();

      await user.click(option);
      expect(
        within(dialog).queryByRole('textbox', { name: /Amount of/ }),
      ).toBeNull();
    });

    it('adds the free-text row as an Unmatched item', async () => {
      const { calls } = stubShopping({
        'GET /api/catalog/search': () => Response.json({ results: [] }),
        'POST /api/shopping-list/items': () => Response.json(base),
      });
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const dialog = await openSheet(user);

      await user.type(search(dialog), 'Dragon fruit');
      const row = await within(dialog).findByRole('option', {
        name: /Add “Dragon fruit”/,
      });
      expect(row).toHaveTextContent('Not in the catalog, added as free text');
      expect(await within(dialog).findByText('No catalog match')).toBeVisible();
      await user.click(row);
      expect(
        within(dialog).getByRole('button', { name: 'Unit: unit' }),
      ).toBeVisible();
      await user.click(
        within(dialog).getByRole('button', {
          name: 'Add Dragon fruit to the list',
        }),
      );

      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({ name: 'Dragon fruit' });
    });

    it('hides the free-text row when a result has exactly the typed name', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const dialog = await openSheet(user);

      await user.type(search(dialog), 'parmesan');
      await within(dialog).findByRole('option', { name: /Parmesan/ });
      expect(
        within(dialog).queryByRole('option', { name: /Add “/ }),
      ).toBeNull();
    });

    it('keeps the row open and marks an invalid amount without adding', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      for (const bad of ['0', '-2']) {
        await user.clear(amount);
        await user.type(amount, bad);
        await user.keyboard('{Enter}');
        expect(amount).toBeInvalid();
        expect(amount).toHaveAccessibleDescription(/0.001 to 1,000,000/);
      }
      await user.click(
        within(dialog).getByRole('button', {
          name: 'Add Parmesan to the list',
        }),
      );
      expect(posts(calls)).toHaveLength(0);
      expect(amount).toBeVisible();
    });

    it.each([
      ['500 g', '500', 500, 'g', 'g'],
      ['1,5 kg', '1,5', 1.5, 'kg', 'kg'],
      ['2 pcs', '2', 2, 'pcs', 'pcs'],
      ['3 stk', '3', 3, 'pcs', 'pcs'],
      ['3 stk.', '3.', 3, 'pcs', 'pcs'],
      ['4 buc', '4', 4, 'pcs', 'pcs'],
      ['2 pc', '2', 2, 'pcs', 'pcs'],
      ['1 L', '1', 1, 'l', 'L'],
      ['250ml', '250', 250, 'ml', 'ml'],
    ])(
      'splits typed "%s" into the amount and the unit chip',
      async (typed, shown, quantity, unit, label) => {
        const { calls } = withParmesan();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const { dialog, option } = await findParmesanRow(user);

        await user.click(option);
        const amount = within(dialog).getByRole('textbox', {
          name: /Amount of Parmesan/,
        });
        await user.type(amount, typed);
        expect(amount).toHaveValue(shown);
        expect(
          within(dialog).getByRole('button', { name: `Unit: ${label}` }),
        ).toBeVisible();
        await user.keyboard('{Enter}');

        await waitFor(() => expect(posts(calls)).toHaveLength(1));
        expect(posts(calls)[0]?.body).toEqual({
          ingredientId: 'parmesan-id',
          quantity,
          unit,
        });
      },
    );

    it('accepts a plain comma decimal as the quantity', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      await user.type(
        within(dialog).getByRole('textbox', { name: /Amount of Parmesan/ }),
        '1,5{Enter}',
      );

      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 1.5,
        unit: 'g',
      });
    });

    it('leaves input that is not a number and a unit as it is, and still validates it', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '5 xyz{Enter}');

      expect(amount).toHaveValue('5 xyz');
      expect(amount).toBeInvalid();
      expect(
        within(dialog).getByRole('button', { name: 'Unit: g' }),
      ).toBeVisible();
      expect(posts(calls)).toHaveLength(0);
    });

    it('shows an Alert and keeps everything typed when adding fails', async () => {
      withParmesan({
        'POST /api/shopping-list/items': () =>
          Response.json({ code: 'boom', params: {} }, { status: 500 }),
      });
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '100{Enter}');

      expect(await within(dialog).findByRole('alert')).toBeVisible();
      expect(amount).toHaveValue('100');
      expect(search(dialog)).toHaveValue('parm');
      expect(
        within(dialog).getByRole('button', { name: 'Done' }),
      ).toBeVisible();
      expect(screen.queryByText('Added Parmesan')).toBeNull();
    });

    it('shows no stale add error when the sheet is reopened', async () => {
      withParmesan({
        'POST /api/shopping-list/items': () =>
          Response.json({ code: 'boom', params: {} }, { status: 500 }),
      });
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);
      await user.click(option);
      await user.click(
        within(dialog).getByRole('button', {
          name: 'Add Parmesan to the list',
        }),
      );
      expect(await within(dialog).findByRole('alert')).toBeVisible();

      await user.click(within(dialog).getByRole('button', { name: 'Done' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      const reopened = await openSheet(user);

      expect(within(reopened).queryByRole('alert')).toBeNull();
    });

    it('keeps focus on the tablist when arrowing between tabs', async () => {
      stubShopping();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const dialog = await openSheet(user);

      const tab = within(dialog).getByRole('tab', { name: 'Ingredients' });
      tab.focus();
      await user.keyboard('{ArrowRight}{ArrowLeft}');

      expect(tab).toHaveFocus();
    });

    it('keeps the query when switching tabs and back', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog } = await findParmesanRow(user);

      await user.click(within(dialog).getByRole('tab', { name: 'Templates' }));
      await user.click(
        within(dialog).getByRole('tab', { name: 'Ingredients' }),
      );

      expect(search(dialog)).toHaveValue('parm');
    });

    it('closes the unit popover on Escape before the sheet', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      await user.click(within(dialog).getByRole('button', { name: 'Unit: g' }));
      await user.keyboard('{Escape}');

      expect(within(dialog).queryByRole('button', { name: 'kg' })).toBeNull();
      expect(
        within(dialog).getByRole('textbox', { name: /Amount of Parmesan/ }),
      ).toHaveFocus();
      expect(screen.getByRole('dialog')).toBeVisible();
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('keeps the query, open row and amount through a background poll', async () => {
      const shopping = withParmesan();
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { dialog, option } = await findParmesanRow(user);
      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '7');

      shopping.setCurrent(
        list([
          {
            aisle: produce,
            items: [tomato, item({ id: 'i5', name: 'Basil' })],
          },
        ]),
      );
      await act(() =>
        vi.advanceTimersByTimeAsync(SHOPPING_POLL_INTERVAL_MS + 100),
      );

      expect(await screen.findByText('Basil')).toBeInTheDocument();
      expect(search(dialog)).toHaveValue('parm');
      expect(amount).toHaveValue('7');
    });

    it('is a centred dialog from md up', async () => {
      stubViewport(1024);
      stubShopping();
      renderWithProviders(<ShoppingPage />);

      const dialog = await openSheet();

      expect(dialog).toBeVisible();
      await waitFor(() => expect(search(dialog)).toHaveFocus());
    });

    it('opens under reduced motion', async () => {
      stubMotion(true);
      stubShopping();
      renderWithProviders(<ShoppingPage />);

      expect(await openSheet()).toBeVisible();
    });
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
    const url = new URL(
      String(fetchSpy.mock.calls[0][0]),
      window.location.origin,
    );
    expect(url.searchParams.get('locale')).toBe('ro');
  });
});
