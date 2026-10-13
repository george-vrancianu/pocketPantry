import { tokens } from '@pocket-pantry/ui';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import {
  SHOPPING_POLL_INTERVAL_MS,
  type ShoppingItem,
  type ShoppingList,
} from '../../lib/shopping';
import type { Template, TemplateLine } from '../../lib/shoppingTemplates';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubMotion, stubViewport } from '../../test/viewport';
import { Route, Routes } from 'react-router-dom';
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
  parentCategory: {
    id: 'd',
    name: 'Dairy',
    aisle: { id: 'aisle', name: 'Dairy & eggs' },
  },
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
      await screen.findByText(/^\d+ to buy$/);
      await user.click(
        await screen.findByRole('button', { name: 'Add items' }),
      );
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

    const DAIRY_AISLE_ID = '244cde4d-f9a5-5df8-9f40-5e1f48fd4fcf';
    const withAisle = (id: string) =>
      withParmesan({
        'GET /api/catalog/search': () =>
          Response.json({
            results: [
              {
                ...parmesan,
                parentCategory: {
                  ...parmesan.parentCategory,
                  aisle: { id, name: 'Dairy & eggs' },
                },
              },
            ],
          }),
      });

    it('tints a result tile by its Aisle, and uses the neutral tile for an unknown Aisle', async () => {
      withAisle(DAIRY_AISLE_ID);
      const first = renderWithProviders(<ShoppingPage />);
      const { option } = await findParmesanRow(userEvent.setup());
      expect(option.firstElementChild).toHaveStyle({
        backgroundColor: '#E3ECF3',
        color: '#2F5674',
      });
      first.unmount();
      vi.unstubAllGlobals();

      withAisle('admin-made-aisle');
      renderWithProviders(<ShoppingPage />);
      const second = await findParmesanRow(userEvent.setup());
      expect(second.option.firstElementChild).toHaveStyle({
        backgroundColor: tokens.color.chipNeutral,
        color: tokens.color.muted,
      });
    });

    describe('when the Ingredient is already on the list', () => {
      const onList = (overrides: Partial<ShoppingItem>) =>
        list([
          {
            aisle: produce,
            items: [{ ...tomato, checked: !overrides.checked }],
          },
          {
            aisle: dairy,
            items: [
              item({
                id: 'p1',
                ingredientId: 'parmesan-id',
                name: 'Parmesan',
                quantity: 100,
                unit: 'g',
                ...overrides,
              }),
            ],
          },
        ]);
      const amountHint = (dialog: HTMLElement) =>
        within(dialog).queryByText(/Already on your list/);

      it('shows no tag or hint when it is not on the list or only checked', async () => {
        withParmesan({}, onList({ checked: true }));
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const { dialog, option } = await findParmesanRow(user);

        expect(within(option).queryByText('On list')).toBeNull();
        await user.click(option);
        expect(amountHint(dialog)).toBeNull();
      });

      it('switches to the separate-line hint when a typed unit changes the unit', async () => {
        withParmesan({}, onList({}));
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const { dialog, option } = await findParmesanRow(user);
        await user.click(option);

        await user.type(
          within(dialog).getByRole('textbox', { name: /Amount of Parmesan/ }),
          '200 kg',
        );
        expect(
          within(dialog).getByText(
            'Already on your list in g. This adds a separate line.',
          ),
        ).toBeVisible();
      });

      it('names the other units, or says "other units" when one line has none', async () => {
        const lines = (...units: ShoppingItem['unit'][]) =>
          list([
            { aisle: produce, items: [{ ...tomato, checked: true }] },
            {
              aisle: dairy,
              items: units.map((unit, i) =>
                item({
                  id: `p${i}`,
                  ingredientId: 'parmesan-id',
                  name: 'Parmesan',
                  quantity: 1,
                  unit,
                }),
              ),
            },
          ]);
        withParmesan({}, lines('kg', 'pcs'));
        const view = renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        let found = await findParmesanRow(user);
        await user.click(found.option);
        expect(
          within(found.dialog).getByText(
            'Already on your list in kg and pcs. This adds a separate line.',
          ),
        ).toBeVisible();
        view.unmount();
        vi.unstubAllGlobals();

        withParmesan({}, lines('kg', null));
        const mixed = renderWithProviders(<ShoppingPage />);
        found = await findParmesanRow(user);
        await user.click(found.option);
        expect(
          within(found.dialog).getByText(
            'Already on your list in other units. This adds a separate line.',
          ),
        ).toBeVisible();
        mixed.unmount();
        vi.unstubAllGlobals();

        withParmesan({}, lines(null));
        renderWithProviders(<ShoppingPage />);
        found = await findParmesanRow(user);
        await user.click(found.option);
        expect(
          within(found.dialog).getByText(
            'Already on your list with no unit. This adds a separate line.',
          ),
        ).toBeVisible();
      });

      it('ends the Romanian hint without a double period after an abbreviated unit', async () => {
        withParmesan(
          {},
          list([
            { aisle: produce, items: [{ ...tomato, checked: true }] },
            {
              aisle: dairy,
              items: [
                item({
                  id: 'p1',
                  ingredientId: 'parmesan-id',
                  name: 'Parmesan',
                  quantity: 1,
                  unit: 'pcs',
                }),
              ],
            },
          ]),
        );
        renderWithProviders(<ShoppingPage />, { locale: 'ro' });
        const user = userEvent.setup();
        await screen.findByText('1 de cumpărat');
        await user.click(
          screen.getByRole('button', { name: 'Adaugă produse' }),
        );
        const dialog = await screen.findByRole('dialog', {
          name: 'Adaugă în listă',
        });
        await user.type(
          within(dialog).getByRole('combobox', { name: 'Caută ingrediente' }),
          'parm',
        );
        await user.click(
          await within(dialog).findByRole('option', { name: /Parmesan/ }),
        );
        expect(
          within(dialog).getByText(
            'Este deja pe listă în buc.; se adaugă o linie separată.',
          ),
        ).toBeVisible();
      });

      it('tags a typed name that matches an unchecked Unmatched line', async () => {
        withParmesan(
          {},
          list([
            { aisle: produce, items: [{ ...tomato, checked: true }] },
            {
              aisle: null,
              items: [
                item({
                  id: 'u1',
                  name: 'dragon  Fruit',
                  quantity: 2,
                  unit: 'pcs',
                  unmatched: true,
                }),
              ],
            },
          ]),
        );
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openSheet(user);
        await user.type(search(dialog), ' Dragon fruit ');
        const row = await within(dialog).findByRole('option', {
          name: /Add “Dragon fruit”/,
        });
        expect(within(row).getByText('On list')).toBeVisible();
        await user.click(row);
        expect(
          within(dialog).getByText(
            'Already on your list in pcs. This adds a separate line.',
          ),
        ).toBeVisible();
        await user.click(
          within(dialog).getByRole('button', { name: 'Unit: unit' }),
        );
        await user.click(within(dialog).getByRole('button', { name: 'pcs' }));
        expect(
          within(dialog).getByText(
            'Already on your list. Adding again increases the amount.',
          ),
        ).toBeVisible();
      });

      it('tags it and explains the merge, following the unit', async () => {
        withParmesan({}, onList({}));
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const { dialog, option } = await findParmesanRow(user);

        expect(within(option).getByText('On list')).toBeVisible();
        expect(amountHint(dialog)).toBeNull();
        await user.click(option);
        expect(
          within(dialog).getByText(
            'Already on your list. Adding again increases the amount.',
          ),
        ).toBeVisible();

        await user.click(
          within(dialog).getByRole('button', { name: 'Unit: g' }),
        );
        await user.click(within(dialog).getByRole('button', { name: 'kg' }));
        expect(
          within(dialog).getByText(
            'Already on your list in g. This adds a separate line.',
          ),
        ).toBeVisible();

        await user.click(
          within(dialog).getByRole('button', { name: 'Unit: kg' }),
        );
        await user.click(within(dialog).getByRole('button', { name: 'g' }));
        expect(
          within(dialog).getByText(
            'Already on your list. Adding again increases the amount.',
          ),
        ).toBeVisible();
      });
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
      // Announced: the toast lives inside the dialog, not behind its aria-hidden.
      expect(within(dialog).getByRole('alert')).toHaveTextContent(
        'Added Parmesan',
      );
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
      ['3 stk.', '3', 3, 'pcs', 'pcs'],
      ['2 PCS', '2', 2, 'pcs', 'pcs'],
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

    it.each([
      ['500 gram', '500 gram'],
      ['1 liter', '1 liter'],
      ['4 bucăți', '4 bucăți'],
    ])(
      'keeps "%s" as typed, invalid, with the chip unchanged',
      async (typed, shown) => {
        const { calls } = withParmesan();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const { dialog, option } = await findParmesanRow(user);

        await user.click(option);
        const amount = within(dialog).getByRole('textbox', {
          name: /Amount of Parmesan/,
        });
        await user.type(amount, `${typed}{Enter}`);

        expect(amount).toHaveValue(shown);
        expect(amount).toBeInvalid();
        expect(
          within(dialog).getByRole('button', { name: 'Unit: g' }),
        ).toBeVisible();
        expect(posts(calls)).toHaveLength(0);
      },
    );

    it('keeps typing digits after a split, and splits a pasted amount cleanly', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '50 g0');
      expect(amount).toHaveValue('500');
      expect(
        within(dialog).getByRole('button', { name: 'Unit: g' }),
      ).toBeVisible();

      await user.clear(amount);
      await user.type(amount, '2 kg');
      await user.click(amount);
      await user.keyboard('{Control>}a{/Control}');
      await user.paste('25 ml');
      expect(amount).toHaveValue('25');
      expect(
        within(dialog).getByRole('button', { name: 'Unit: ml' }),
      ).toBeVisible();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 25,
        unit: 'ml',
      });
    });

    it('treats a select-all paste after a split as a fresh amount', async () => {
      withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '2 kg');
      await user.click(amount);
      await user.keyboard('{Control>}a{/Control}');
      await user.paste('2g');
      expect(amount).toHaveValue('2');
      expect(
        within(dialog).getByRole('button', { name: 'Unit: g' }),
      ).toBeVisible();
    });

    it('keeps a unit chosen from the chip after a split', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      const amount = within(dialog).getByRole('textbox', {
        name: /Amount of Parmesan/,
      });
      await user.type(amount, '2 pc');
      await user.click(
        within(dialog).getByRole('button', { name: 'Unit: pcs' }),
      );
      await user.click(within(dialog).getByRole('button', { name: 'kg' }));
      await user.type(amount, 'x');
      await user.clear(amount);
      await user.type(amount, '3{Enter}');

      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 3,
        unit: 'kg',
      });
    });

    it('lets a typed unit override a chosen chip', async () => {
      const { calls } = withParmesan();
      renderWithProviders(<ShoppingPage />);
      const user = userEvent.setup();
      const { dialog, option } = await findParmesanRow(user);

      await user.click(option);
      await user.click(within(dialog).getByRole('button', { name: 'Unit: g' }));
      await user.click(within(dialog).getByRole('button', { name: 'ml' }));
      await user.type(
        within(dialog).getByRole('textbox', { name: /Amount of Parmesan/ }),
        '2 kg{Enter}',
      );

      await waitFor(() => expect(posts(calls)).toHaveLength(1));
      expect(posts(calls)[0]?.body).toEqual({
        ingredientId: 'parmesan-id',
        quantity: 2,
        unit: 'kg',
      });
    });

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

    describe('Templates tab', () => {
      const line = (
        id: string,
        name: string,
        overrides: Partial<TemplateLine> = {},
      ): TemplateLine => ({
        id,
        ingredientId: `${id}-ingredient`,
        name,
        quantity: null,
        unit: null,
        unmatched: false,
        inPantry: false,
        aisle: produce,
        ...overrides,
      });
      const taco: Template = {
        id: 't1',
        name: 'Taco night',
        lines: [
          line('milk', 'Milk', {
            quantity: 1,
            unit: 'l',
            inPantry: true,
            aisle: dairy,
          }),
          line('tomato', 'Tomato', { quantity: 3 }),
          line('flour', 'Flour', { aisle: dairy }),
          line('saffron', 'Saffron', {
            ingredientId: null,
            unmatched: true,
            aisle: null,
          }),
        ],
      };
      const summaries = [
        {
          id: 't1',
          name: 'Taco night',
          lineCount: 4,
          previewNames: ['Milk', 'Tomato', 'Flour', 'Saffron'],
        },
        { id: 't2', name: 'Empty one', lineCount: 0, previewNames: [] },
      ];
      const onList = list([
        {
          aisle: produce,
          items: [
            item({
              id: 'i1',
              name: 'Tomato',
              ingredientId: 'tomato-ingredient',
              quantity: 250,
              unit: 'g',
            }),
            item({
              id: 'i3',
              name: 'Milk',
              ingredientId: 'milk-ingredient',
              checked: true,
            }),
          ],
        },
        {
          aisle: null,
          items: [item({ id: 'i4', name: 'saffron ', unmatched: true })],
        },
      ]);

      const stubTemplates = (routes: Record<string, () => Response> = {}) =>
        stubShopping(
          {
            'GET /api/shopping-templates': () =>
              Response.json({ templates: summaries }),
            'GET /api/shopping-templates/t1': () => Response.json(taco),
            ...routes,
          },
          onList,
        );
      const openTemplates = async (user = userEvent.setup()) => {
        const dialog = await openSheet(user);
        await user.click(
          within(dialog).getByRole('tab', { name: 'Templates' }),
        );
        return dialog;
      };

      it('lists the templates with a preview line and a Manage link', async () => {
        const { calls } = stubTemplates();
        renderWithProviders(<ShoppingPage />);

        const dialog = await openTemplates();

        const row = await within(dialog).findByRole('button', {
          name: /Taco night/,
        });
        expect(row).toHaveTextContent('4 items · Milk, Tomato, Flour, Saffron');
        expect(
          within(dialog).getByRole('button', { name: /Empty one/ }),
        ).toHaveTextContent('0 items');
        expect(
          within(dialog).getByRole('link', { name: 'Manage' }),
        ).toHaveAttribute('href', '/shopping/templates');
        expect(
          calls.find((c) => c.key === 'GET /api/shopping-templates')?.search,
        ).toContain('locale=en');
      });

      it('says there are no templates yet', async () => {
        stubShopping({
          'GET /api/shopping-templates': () => Response.json({ templates: [] }),
        });
        renderWithProviders(<ShoppingPage />);

        const dialog = await openTemplates();

        expect(
          await within(dialog).findByText(/No templates yet/),
        ).toBeVisible();
      });

      it('starts Pantry lines unticked and tags In Pantry and On list', async () => {
        stubTemplates();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openTemplates(user);

        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        const box = (name: RegExp) =>
          within(dialog).getByRole('checkbox', { name });
        expect(
          await within(dialog).findByText(
            'Items already in your Pantry start unticked.',
          ),
        ).toBeVisible();
        expect(box(/Milk/)).toHaveAttribute('aria-checked', 'false');
        expect(box(/Milk/)).toHaveTextContent('1 L');
        expect(box(/Milk/)).toHaveTextContent('In Pantry');
        expect(box(/Tomato/)).toHaveAttribute('aria-checked', 'true');
        expect(box(/Tomato/)).toHaveTextContent('On list');
        expect(box(/Flour/)).toHaveAttribute('aria-checked', 'true');
        expect(box(/Flour/)).not.toHaveTextContent(/On list|In Pantry/);
        expect(box(/Saffron/)).toHaveTextContent('On list');
        expect(
          within(dialog).getByRole('heading', { name: 'Not in the catalog' }),
        ).toBeVisible();
        expect(
          within(dialog).getByRole('button', { name: 'Add 3 items to list' }),
        ).toBeEnabled();
      });

      it('adds only the ticked lines, closes the sheet and says so', async () => {
        const { calls } = stubTemplates({
          'POST /api/shopping-list/items/bulk': () => Response.json(onList),
        });
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openTemplates(user);
        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        await user.click(
          await within(dialog).findByRole('checkbox', { name: /Milk/ }),
        );
        await user.click(
          within(dialog).getByRole('checkbox', { name: /Flour/ }),
        );
        await user.click(
          within(dialog).getByRole('button', { name: 'Add 3 items to list' }),
        );

        expect(
          await screen.findByText('Added 3 items from Taco night'),
        ).toBeVisible();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(
          calls.find((c) => c.key === 'POST /api/shopping-list/items/bulk')
            ?.body,
        ).toEqual({
          items: [
            { ingredientId: 'milk-ingredient', quantity: 1, unit: 'l' },
            { ingredientId: 'tomato-ingredient', quantity: 3 },
            { name: 'Saffron' },
          ],
        });
      });

      it('disables adding when nothing is ticked', async () => {
        stubTemplates();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openTemplates(user);
        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        for (const name of [/Tomato/, /Flour/, /Saffron/]) {
          await user.click(
            await within(dialog).findByRole('checkbox', { name }),
          );
        }

        expect(
          within(dialog).getByRole('button', { name: 'Add 0 items to list' }),
        ).toBeDisabled();
      });

      it('keeps the sheet open with an Alert when adding fails', async () => {
        stubTemplates({
          'POST /api/shopping-list/items/bulk': () =>
            Response.json(
              { code: 'shopping.list_full', params: {} },
              { status: 400 },
            ),
        });
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openTemplates(user);
        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        await user.click(
          await within(dialog).findByRole('button', {
            name: 'Add 3 items to list',
          }),
        );

        expect(await within(dialog).findByRole('alert')).toBeVisible();
        expect(dialog).toBeVisible();
        expect(
          within(dialog).getByRole('checkbox', { name: /Tomato/ }),
        ).toBeVisible();
      });

      it('goes back to all templates, and back to the list when tabs change', async () => {
        stubTemplates();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openTemplates(user);
        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        await user.click(
          await within(dialog).findByRole('button', { name: /All templates/ }),
        );
        expect(
          within(dialog).getByRole('button', { name: /Taco night/ }),
        ).toBeVisible();

        await user.click(
          within(dialog).getByRole('button', { name: /Taco night/ }),
        );
        await within(dialog).findByRole('checkbox', { name: /Milk/ });
        await user.click(
          within(dialog).getByRole('tab', { name: 'Ingredients' }),
        );
        await user.click(
          within(dialog).getByRole('tab', { name: 'Templates' }),
        );

        expect(
          within(dialog).getByRole('button', { name: /Taco night/ }),
        ).toBeVisible();
        expect(within(dialog).queryByRole('checkbox')).toBeNull();
      });

      it('offers template chips in the empty search, opening the apply view', async () => {
        stubTemplates();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openSheet(user);

        await user.click(
          await within(dialog).findByRole('button', { name: /Taco night/ }),
        );

        expect(
          await within(dialog).findByRole('checkbox', { name: /Milk/ }),
        ).toBeVisible();
        expect(
          within(dialog).getByRole('tab', { name: 'Templates' }),
        ).toHaveAttribute('aria-selected', 'true');
      });

      it('switches to the Templates tab with See all', async () => {
        stubTemplates();
        renderWithProviders(<ShoppingPage />);
        const user = userEvent.setup();
        const dialog = await openSheet(user);
        expect(
          await within(dialog).findByText('Or start from a template'),
        ).toBeVisible();
        expect(
          within(dialog).getByText('All your staples are stocked.'),
        ).toBeVisible();

        await user.click(
          within(dialog).getByRole('button', { name: 'See all' }),
        );

        expect(
          within(dialog).getByRole('heading', { name: 'Add from a template' }),
        ).toBeVisible();
      });

      describe('Save as template', () => {
        const withEditor = (
          <Routes>
            <Route path="/" element={<ShoppingPage />} />
            <Route
              path="/shopping/templates/:id"
              element={<h1>Template editor</h1>}
            />
          </Routes>
        );
        const openSave = async (user = userEvent.setup()) => {
          const dialog = await openTemplates(user);
          await user.click(
            within(dialog).getByRole('button', {
              name: /Save this list as a template/,
            }),
          );
          return dialog;
        };

        it('shows the save row with the item count', async () => {
          stubTemplates();
          renderWithProviders(<ShoppingPage />);
          const dialog = await openTemplates();
          expect(
            await within(dialog).findByRole('button', {
              name: /Save this list as a template.*3 items, quantities included/,
            }),
          ).toBeVisible();
        });

        it('hides both save rows on an empty list', async () => {
          stubShopping(
            {
              'GET /api/shopping-templates': () =>
                Response.json({ templates: [] }),
            },
            list([]),
          );
          renderWithProviders(<ShoppingPage />);
          const user = userEvent.setup();
          expect(await screen.findByText('0 to buy')).toBeVisible();
          expect(
            screen.queryByRole('button', {
              name: /Save this list as a template/,
            }),
          ).toBeNull();

          const dialog = await openSheet(user);
          await user.click(
            within(dialog).getByRole('tab', { name: 'Templates' }),
          );
          await within(dialog).findByText(/No templates yet/);
          expect(
            within(dialog).queryByRole('button', {
              name: /Save this list as a template/,
            }),
          ).toBeNull();
        });

        it('opens the sheet on the save view from the row under the list', async () => {
          stubTemplates();
          renderWithProviders(<ShoppingPage />);
          const user = userEvent.setup();

          await user.click(
            await screen.findByRole('button', {
              name: /Save this list as a template.*Reuse these 3 items next time/,
            }),
          );

          const dialog = await screen.findByRole('dialog', {
            name: 'Add to list',
          });
          expect(
            within(dialog).getByRole('textbox', { name: 'Template name' }),
          ).toHaveAttribute('placeholder', 'e.g. Weekly shop');
        });

        it('previews every item with its amount and focuses the name', async () => {
          stubTemplates();
          renderWithProviders(<ShoppingPage />);
          const user = userEvent.setup();
          const dialog = await openSave(user);

          const name = within(dialog).getByRole('textbox', {
            name: 'Template name',
          });
          await vi.waitFor(() => expect(name).toHaveFocus());
          expect(name).toHaveAttribute('maxlength', '100');
          expect(
            within(dialog).getByText('Saves all 3 items, ticked ones too'),
          ).toBeVisible();
          expect(
            within(dialog).getByText('Tomato (250 g), Milk, Saffron', {
              exact: false,
            }),
          ).toBeVisible();
          expect(
            within(dialog).getByRole('button', { name: 'Save template' }),
          ).toBeDisabled();
          await user.click(
            within(dialog).getByRole('button', { name: /Templates/ }),
          );
          expect(
            await within(dialog).findByRole('heading', {
              name: 'Add from a template',
            }),
          ).toBeVisible();
        });

        it('saves under the name, stays in the sheet and offers Edit without navigating', async () => {
          let saved = false;
          const created = { id: 't3', name: 'Weekly shop', lines: [] };
          const { calls } = stubTemplates({
            'POST /api/shopping-templates/from-list': () => {
              saved = true;
              return Response.json(created, { status: 201 });
            },
            'GET /api/shopping-templates': () =>
              Response.json({
                templates: saved
                  ? [
                      ...summaries,
                      {
                        id: 't3',
                        name: 'Weekly shop',
                        lineCount: 3,
                        previewNames: ['Tomato'],
                      },
                    ]
                  : summaries,
              }),
          });
          renderWithProviders(withEditor);
          const user = userEvent.setup();
          const dialog = await openSave(user);

          await user.type(
            within(dialog).getByRole('textbox', { name: 'Template name' }),
            'Weekly shop{Enter}',
          );

          expect(await screen.findByText('Saved “Weekly shop”')).toBeVisible();
          expect(
            calls.find(
              (c) => c.key === 'POST /api/shopping-templates/from-list',
            )?.body,
          ).toEqual({ name: 'Weekly shop' });
          const rows = await within(dialog).findAllByRole('button', {
            name: /items? ·|0 items/,
          });
          expect(rows.at(-1)).toHaveTextContent('Weekly shop');
          expect(screen.queryByText('Template editor')).toBeNull();

          await user.click(screen.getByRole('button', { name: 'Edit' }));
          expect(await screen.findByText('Template editor')).toBeVisible();
        });

        it('keeps the name and shows the API error', async () => {
          stubTemplates({
            'POST /api/shopping-templates/from-list': () =>
              Response.json(
                {
                  code: 'shopping.template_too_many_lines',
                  params: { max: 100 },
                },
                { status: 400 },
              ),
          });
          renderWithProviders(<ShoppingPage />);
          const user = userEvent.setup();
          const dialog = await openSave(user);
          const name = within(dialog).getByRole('textbox', {
            name: 'Template name',
          });

          await user.type(name, 'Big shop');
          await user.click(
            within(dialog).getByRole('button', { name: 'Save template' }),
          );

          expect(await within(dialog).findByRole('alert')).toBeVisible();
          expect(name).toHaveValue('Big shop');
        });

        it('disables Save and says why at the template limit', async () => {
          stubTemplates({
            'GET /api/shopping-templates': () =>
              Response.json({
                templates: Array.from({ length: 50 }, (_, i) => ({
                  id: `m${i}`,
                  name: `Template ${i}`,
                  lineCount: 0,
                  previewNames: [],
                })),
              }),
          });
          renderWithProviders(<ShoppingPage />);
          const user = userEvent.setup();
          const dialog = await openSave(user);

          await user.type(
            within(dialog).getByRole('textbox', { name: 'Template name' }),
            'One more',
          );

          expect(
            await within(dialog).findByText(/up to 50 templates/),
          ).toBeVisible();
          expect(
            within(dialog).getByRole('button', { name: 'Save template' }),
          ).toBeDisabled();
        });
      });

      it('shows no template section in the empty search without templates', async () => {
        stubShopping({
          'GET /api/shopping-templates': () => Response.json({ templates: [] }),
        });
        renderWithProviders(<ShoppingPage />);

        const dialog = await openSheet();

        await waitFor(() => expect(search(dialog)).toHaveFocus());
        expect(
          within(dialog).queryByText('Or start from a template'),
        ).toBeNull();
      });
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
