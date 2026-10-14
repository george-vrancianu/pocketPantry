import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ShoppingList } from '../../lib/shopping';
import type { Staple } from '../../lib/staples';
import type { Suggestion } from '../../lib/suggestions';
import { renderWithProviders, stubApi } from '../../test/render';
import { SuggestionsWidget } from '../Dashboard/widgets/SuggestionsWidget';
import { ShoppingPage } from './ShoppingPage';
import { StaplesPage } from './StaplesPage';

const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };
const baking = { id: 'a6', name: 'Baking', sortOrder: 6 };

const suggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
  ingredientId: 'milk-id',
  name: 'Milk',
  quantity: 2,
  unit: 'l',
  aisle: dairy,
  ...overrides,
});
const staple = (overrides: Partial<Staple> = {}): Staple => ({
  id: 's1',
  ingredientId: 'milk-id',
  name: 'Milk',
  quantity: 2,
  unit: 'l',
  aisle: dairy,
  ...overrides,
});

const emptyList = (groups: ShoppingList['groups'] = []): ShoppingList => ({
  id: 'l1',
  groups,
  summary: { remaining: 0, checked: 0 },
});

const flour: CatalogSearchResult = {
  id: 'flour-id',
  name: 'Flour',
  defaultUnit: 'g',
  leafCategory: { id: 'f', name: 'Flour' },
  parentCategory: {
    id: 'b',
    name: 'Baking',
    aisle: { id: 'aisle', name: 'Baking' },
  },
  defaults: { expiryDays: 365, location: 'cupboard' },
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Suggestions in the Add sheet', () => {
  const openSheet = async () => {
    await userEvent.click(
      await screen.findByRole('button', { name: 'Add items' }),
    );
    return screen.findByRole('dialog');
  };

  it('shows both groups with counts and a Manage link to Staples', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: [
            suggestion(),
            suggestion({
              ingredientId: 'flour-id',
              name: 'Flour',
              quantity: null,
              unit: null,
            }),
          ],
          usedUp: [
            suggestion({
              ingredientId: 'eggs-id',
              name: 'Eggs',
              quantity: 6,
              unit: 'pcs',
            }),
          ],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();

    expect(
      await within(dialog).findByText('Missing staples · 2'),
    ).toBeVisible();
    expect(within(dialog).getByText('Recently used up · 1')).toBeVisible();
    const milk = within(dialog).getByRole('button', {
      name: 'Add Milk to the list',
    });
    expect(milk).toHaveTextContent('2 L');
    expect(
      within(dialog).getByRole('button', { name: 'Add Flour to the list' }),
    ).not.toHaveTextContent(/\d/);
    expect(
      within(dialog).getByRole('button', { name: 'Add Eggs to the list' }),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('link', { name: 'Manage' }),
    ).toHaveAttribute('href', '/shopping/staples');
  });

  it('adds with the suggested quantity and unit, then shows the added state, the toast and the Done count', async () => {
    let suggestions = [suggestion()];
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: suggestions }),
      'POST /api/shopping-list/items': () => Response.json(emptyList()),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: 'Add Milk to the list',
      }),
    );

    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/shopping-list/items')?.body,
      ).toEqual({ ingredientId: 'milk-id', quantity: 2, unit: 'l' }),
    );
    expect(await screen.findByText('Added Milk')).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Done, 1 added' }),
    ).toBeVisible();
    // Disabled until the Suggestions refetch drops it.
    expect(
      within(dialog).getByRole('button', { name: 'Add Milk to the list' }),
    ).toBeDisabled();

    suggestions = [];
    window.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() =>
      expect(
        within(dialog).queryByRole('button', { name: 'Add Milk to the list' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('keeps every chip disabled while its add is pending and sends one request each', async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: [
            suggestion(),
            suggestion({ ingredientId: 'flour-id', name: 'Flour' }),
          ],
        }),
      'POST /api/shopping-list/items': () => Response.json(emptyList()),
    });
    const slowFetch = async (...args: Parameters<typeof fetch>) => {
      const url = String(args[0]);
      if (url.includes('/shopping-list/items')) await gate;
      return fetchMock(...args);
    };
    vi.stubGlobal('fetch', slowFetch);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();
    const milk = await within(dialog).findByRole('button', {
      name: 'Add Milk to the list',
    });
    const flourChip = within(dialog).getByRole('button', {
      name: 'Add Flour to the list',
    });

    await userEvent.click(milk);
    await userEvent.click(flourChip);
    await userEvent.click(milk);

    expect(milk).toBeDisabled();
    expect(flourChip).toBeDisabled();
    release();
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Done, 2 added' }),
      ).toBeVisible(),
    );
    expect(milk).toBeDisabled();
    expect(flourChip).toBeDisabled();
    expect(
      calls.filter((c) => c.key === 'POST /api/shopping-list/items'),
    ).toHaveLength(2);
  });

  it('adds a Used Up Ingredient with no quantity', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: [],
          usedUp: [
            suggestion({
              ingredientId: 'eggs-id',
              name: 'Eggs',
              quantity: null,
              unit: null,
            }),
          ],
        }),
      'POST /api/shopping-list/items': () => Response.json(emptyList()),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: 'Add Eggs to the list',
      }),
    );

    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/shopping-list/items')?.body,
      ).toEqual({ ingredientId: 'eggs-id' }),
    );
  });

  it('keeps the added state when switching tabs and back', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [suggestion()] }),
      'POST /api/shopping-list/items': () => Response.json(emptyList()),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();
    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: 'Add Milk to the list',
      }),
    );
    await screen.findByText('Added Milk');

    await userEvent.click(
      within(dialog).getByRole('tab', { name: 'Templates' }),
    );
    await userEvent.click(
      within(dialog).getByRole('tab', { name: 'Ingredients' }),
    );

    expect(
      within(dialog).getByRole('button', { name: 'Add Milk to the list' }),
    ).toBeDisabled();
  });

  it('dismisses a Suggestion for the Family and shows a toast', async () => {
    let suggestions = [suggestion()];
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: suggestions }),
      'POST /api/shopping-list/suggestions/milk-id/dismiss': () => {
        suggestions = [];
        return new Response(null, { status: 204 });
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Dismiss Milk' }),
    );

    expect(await screen.findByText('Dismissed Milk')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Undo' }),
    ).not.toBeInTheDocument();
    expect(calls.map((c) => c.key)).toContain(
      'POST /api/shopping-list/suggestions/milk-id/dismiss',
    );
    await waitFor(() =>
      expect(
        within(dialog).queryByRole('button', { name: 'Dismiss Milk' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the Suggestion and Template chips together while the search is empty, and both go once the Member types', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [suggestion()], usedUp: [] }),
      'GET /api/shopping-templates': () =>
        Response.json({
          templates: [
            {
              id: 't1',
              name: 'Taco night',
              lineCount: 2,
              previewNames: ['Milk', 'Tomato'],
            },
          ],
        }),
      'GET /api/catalog/search': () => Response.json({ results: [flour] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    expect(
      await within(dialog).findByRole('button', {
        name: 'Add Milk to the list',
      }),
    ).toBeVisible();
    expect(
      await within(dialog).findByRole('button', { name: /Taco night/ }),
    ).toBeVisible();
    expect(within(dialog).getByText('Or start from a template')).toBeVisible();

    await userEvent.type(
      within(dialog).getByRole('combobox', { name: 'Search ingredients' }),
      'flo',
    );
    await within(dialog).findByRole('option', { name: /Flour/ });
    expect(
      within(dialog).queryByRole('button', { name: 'Add Milk to the list' }),
    ).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: /Taco night/ }),
    ).toBeNull();
  });

  it('says all Staples are stocked when there are no Suggestions', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    expect(
      await within(dialog).findByText('All your staples are stocked.'),
    ).toBeVisible();
    expect(within(dialog).getByText('Staples')).toBeVisible();
    expect(within(dialog).getByRole('link', { name: 'Manage' })).toBeVisible();
    expect(screen.queryByText(/Missing staples/)).not.toBeInTheDocument();
  });

  it('hides the Suggestions once the Member types, and has no Suggestions section or header Staples link on the page', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [suggestion()] }),
      'GET /api/catalog/search': () => Response.json({ results: [flour] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);
    await screen.findByText(/Your list is empty/);
    expect(
      screen.queryByRole('link', { name: 'Staples' }),
    ).not.toBeInTheDocument();

    const dialog = await openSheet();
    await userEvent.type(
      within(dialog).getByRole('combobox', { name: 'Search ingredients' }),
      'flo',
    );
    await waitFor(() =>
      expect(
        within(dialog).queryByRole('button', { name: 'Add Milk to the list' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('toggles a Staple from a Shopping Item', async () => {
    const list = emptyList([
      {
        aisle: dairy,
        items: [
          {
            id: 'i1',
            ingredientId: 'milk-id',
            name: 'Milk',
            quantity: null,
            unit: null,
            checked: false,
            unmatched: false,
          },
        ],
      },
    ]);
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(list),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [] }),
      'GET /api/staples': () => Response.json({ staples: [] }),
      'POST /api/staples': () => Response.json(staple(), { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const star = await screen.findByRole('button', {
      name: 'Make Milk a staple',
    });
    await userEvent.click(star);

    await waitFor(() =>
      expect(calls.find((c) => c.key === 'POST /api/staples')?.body).toEqual({
        ingredientId: 'milk-id',
      }),
    );
  });
});

describe('StaplesPage', () => {
  const rowOf = (name: string) => screen.getByRole('group', { name });
  const deletes = (calls: Array<{ key: string }>) =>
    calls.filter((c) => c.key.startsWith('DELETE')).map((c) => c.key);
  const openSheet = async (
    user: ReturnType<typeof userEvent.setup>,
    name = 'Milk',
  ) => {
    act(() => rowOf(name).focus());
    await user.keyboard('{Enter}');
    return screen.findByRole('dialog', { name: `Edit ${name}` });
  };

  it('shows read-only rows with the preferred amount and no inputs or buttons', async () => {
    const { fetchMock } = stubApi({
      'GET /api/staples': () =>
        Response.json({
          staples: [
            staple(),
            staple({
              id: 's2',
              ingredientId: 'flour-id',
              name: 'Flour',
              quantity: null,
              unit: null,
            }),
          ],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);

    const milk = await screen.findByRole('group', { name: 'Milk' });
    expect(milk).toHaveTextContent('2 L');
    expect(rowOf('Flour')).not.toHaveTextContent(/\d/);
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('button', { name: /Save/ })).toBeNull();
    // The custom actions for screen readers are there, but not tab stops.
    for (const button of screen.getAllByRole('button', { name: /Remove/ })) {
      expect(button).toHaveAttribute('tabindex', '-1');
    }
  });

  it('adds a Staple from the Catalog search', async () => {
    let staples: Staple[] = [staple()];
    const { fetchMock, calls } = stubApi({
      'GET /api/staples': () => Response.json({ staples }),
      'GET /api/catalog/search': () => Response.json({ results: [flour] }),
      'POST /api/staples': () => {
        staples = [
          ...staples,
          staple({
            id: 's2',
            ingredientId: 'flour-id',
            name: 'Flour',
            quantity: null,
            unit: null,
            aisle: baking,
          }),
        ];
        return Response.json(staples[1], { status: 201 });
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);
    await screen.findByRole('group', { name: 'Milk' });

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'flo',
    );
    const option = await screen.findByRole('option', { name: /Flour/ });
    // The Staples search has no use for a unit chip.
    expect(option).toHaveAccessibleName('Flour, Flour · Baking');
    await userEvent.click(option);

    expect(await screen.findByRole('group', { name: 'Flour' })).toBeVisible();
    expect(calls.find((c) => c.key === 'POST /api/staples')?.body).toEqual({
      ingredientId: 'flour-id',
    });
  });

  it('offers no Use as typed on the Staples page: a Staple must be an Ingredient', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/staples': () => Response.json({ staples: [staple()] }),
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);
    await screen.findByRole('group', { name: 'Milk' });

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'zzz',
    );

    expect(await screen.findByText('No match for “zzz”')).toBeVisible();
    expect(screen.queryByRole('option', { name: /as typed/ })).toBeNull();
    for (const call of calls.filter(
      (c) => c.key === 'GET /api/catalog/search',
    )) {
      expect(new URLSearchParams(call.search).get('scope')).not.toBe('shared');
    }
  });

  describe('editing the amount', () => {
    it('opens on Enter, saves the preferred amount and says Updated', async () => {
      const user = userEvent.setup();
      let staples = [staple()];
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () => Response.json({ staples }),
        'PATCH /api/staples/s1': () => {
          staples = [staple({ quantity: 3 })];
          return Response.json(staples[0]);
        },
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      expect(within(dialog).getByText('from your Staples')).toBeVisible();
      const field = within(dialog).getByLabelText(/^Amount of Milk/);
      expect(field).toHaveValue('2');
      await user.clear(field);
      await user.type(field, '3');
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Updated Milk')).toBeVisible();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(
        calls.find((c) => c.key === 'PATCH /api/staples/s1')?.body,
      ).toEqual({ quantity: 3, unit: 'l' });
      await waitFor(() => expect(rowOf('Milk')).toHaveTextContent('3 L'));
    });

    it('can leave a Staple without a quantity', async () => {
      const user = userEvent.setup();
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
        'PATCH /api/staples/s1': () =>
          Response.json(staple({ quantity: null, unit: null })),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      await user.clear(within(dialog).getByLabelText(/^Amount of Milk/));
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      await screen.findByText('Updated Milk');
      expect(
        calls.find((c) => c.key === 'PATCH /api/staples/s1')?.body,
      ).toEqual({ quantity: null, unit: 'l' });
    });

    it('asks for a unit when there is a quantity but no unit, and does not save', async () => {
      const user = userEvent.setup();
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () =>
          Response.json({
            staples: [staple({ quantity: null, unit: null })],
          }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      await user.type(within(dialog).getByLabelText(/^Amount of Milk/), '2');
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(
        await within(dialog).findByText('Choose a unit for the amount.'),
      ).toBeVisible();
      expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(false);
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    it('keeps the sheet open and shows the reason when the save fails', async () => {
      const user = userEvent.setup();
      const { fetchMock } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
        'PATCH /api/staples/s1': () =>
          Response.json({ code: 'shopping.staple_not_found' }, { status: 404 }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(await within(dialog).findByRole('alert')).toBeVisible();
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    it('opens the inline confirmation on the row from "Remove Staple"', async () => {
      const user = userEvent.setup();
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      await user.click(
        within(dialog).getByRole('button', { name: 'Remove Staple' }),
      );

      expect(
        await screen.findByRole('group', { name: 'Remove Milk?' }),
      ).toBeVisible();
      expect(screen.getByText('from your Staples')).toBeVisible();
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus(),
      );
      expect(deletes(calls)).toEqual([]);
    });
  });

  describe('removing a Staple', () => {
    const remove = async (user: ReturnType<typeof userEvent.setup>) => {
      act(() => rowOf('Milk').focus());
      await user.keyboard('{Delete}');
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      await waitFor(() =>
        expect(screen.queryByRole('group', { name: 'Milk' })).toBeNull(),
      );
    };

    it('hides the row with Undo and sends no request until the Undo expires', async () => {
      const user = userEvent.setup();
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
        'DELETE /api/staples/s1': () => new Response(null, { status: 204 }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await screen.findByRole('group', { name: 'Milk' });

      await remove(user);

      expect(await screen.findByText('Removed Milk')).toBeVisible();
      expect(deletes(calls)).toEqual([]);
      await user.click(screen.getByRole('button', { name: 'Undo' }));
      expect(screen.getByRole('group', { name: 'Milk' })).toBeVisible();
      expect(deletes(calls)).toEqual([]);
    });

    it('sends the delete once the Undo expires and the row stays gone', async () => {
      vi.useFakeTimers();
      const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
      let staples = [staple()];
      const { fetchMock, calls } = stubApi({
        'GET /api/staples': () => Response.json({ staples }),
        'DELETE /api/staples/s1': () => {
          staples = [];
          return new Response(null, { status: 204 });
        },
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await flush();
      const row = rowOf('Milk');
      act(() => row.focus());
      fireEvent.keyDown(row, { key: 'Delete' });
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(screen.queryByRole('group', { name: 'Milk' })).toBeNull();

      await act(() => vi.advanceTimersByTimeAsync(3500));
      expect(deletes(calls)).toEqual([]);
      await act(() => vi.advanceTimersByTimeAsync(1500));
      await flush();

      expect(deletes(calls)).toEqual(['DELETE /api/staples/s1']);
      expect(screen.queryByRole('group', { name: 'Milk' })).toBeNull();
      expect(screen.getByText(/No staples yet/)).toBeVisible();
    });
  });

  describe('removing a Staple, further cases', () => {
    const removeMilk = async () => {
      const row = rowOf('Milk');
      act(() => row.focus());
      fireEvent.keyDown(row, { key: 'Delete' });
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      await act(() => vi.advanceTimersByTimeAsync(1000));
    };

    it('brings the row back with an error toast when the delete fails', async () => {
      vi.useFakeTimers();
      const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
      const { fetchMock } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
        'DELETE /api/staples/s1': () =>
          Response.json({ code: 'unknown', params: {} }, { status: 500 }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await flush();

      await removeMilk();
      expect(screen.queryByRole('group', { name: 'Milk' })).toBeNull();
      await act(() => vi.advanceTimersByTimeAsync(5500));
      await flush();

      expect(screen.getByRole('group', { name: 'Milk' })).toBeVisible();
      expect(screen.queryByText('Removed Milk')).toBeNull();
      expect(
        screen.getByText('Something went wrong. Please try again.'),
      ).toBeVisible();
    });

    it('hands focus to the empty text when the last Staple goes', async () => {
      vi.useFakeTimers();
      const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
      const { fetchMock } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await flush();

      await removeMilk();

      expect(screen.getByText(/No staples yet/)).toHaveFocus();
    });

    it('opens the sheet when the row is held for 500 ms', async () => {
      vi.useFakeTimers();
      const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
      const { fetchMock } = stubApi({
        'GET /api/staples': () => Response.json({ staples: [staple()] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<StaplesPage />);
      await flush();
      const content = rowOf('Milk').querySelector(
        '[data-swipe-row-content]',
      ) as HTMLElement;

      fireEvent.pointerDown(content, {
        pointerId: 1,
        clientX: 50,
        clientY: 20,
      });
      await act(() => vi.advanceTimersByTimeAsync(600));
      expect(screen.queryByRole('dialog')).toBeNull();
      await act(() => vi.advanceTimersByTimeAsync(200));

      expect(screen.getByRole('dialog', { name: 'Edit Milk' })).toBeVisible();
    });
  });

  it('shows a translated error when the Staple limit is reached', async () => {
    const { fetchMock } = stubApi({
      'GET /api/staples': () => Response.json({ staples: [] }),
      'GET /api/catalog/search': () => Response.json({ results: [flour] }),
      'POST /api/staples': () =>
        Response.json(
          { code: 'shopping.staple_limit_reached', params: { max: 200 } },
          { status: 409 },
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);

    await userEvent.type(
      await screen.findByRole('combobox', { name: 'Search ingredients' }),
      'flo',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Flour/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You can have up to 200 staples',
    );
  });

  it('shows the empty state', async () => {
    const { fetchMock } = stubApi({
      'GET /api/staples': () => Response.json({ staples: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);

    expect(await screen.findByText(/No staples yet/)).toBeVisible();
  });
});

describe('SuggestionsWidget', () => {
  it('shows the count of missing Staples, the first few Suggestions of both groups, and links to Shopping', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: ['A', 'B', 'C', 'D'].map((name) =>
            suggestion({ ingredientId: name, name }),
          ),
          usedUp: [suggestion({ ingredientId: 'E', name: 'E' })],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<SuggestionsWidget size="small" columns={2} />);

    const link = await screen.findByRole('link', { name: 'Suggestions' });
    expect(link).toHaveAttribute('href', '/shopping');
    expect(link).toHaveTextContent('4');
    expect(link).toHaveTextContent('missing staples');
    expect(link).toHaveTextContent('A, B, C…');
  });

  it('counts only missing Staples, but names Used Up Ingredients too', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: [suggestion({ ingredientId: 'A', name: 'A' })],
          usedUp: [suggestion({ ingredientId: 'E', name: 'E' })],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<SuggestionsWidget size="small" columns={2} />);

    const link = await screen.findByRole('link', { name: 'Suggestions' });
    expect(link).toHaveTextContent('1');
    expect(link).toHaveTextContent('missing staple');
    expect(link).toHaveTextContent('A, E');
  });

  it('says nothing is missing', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<SuggestionsWidget size="small" columns={2} />);

    expect(await screen.findByText('Nothing suggested')).toBeVisible();
  });
});
