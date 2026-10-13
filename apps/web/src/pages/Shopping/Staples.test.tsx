import { screen, waitFor, within } from '@testing-library/react';
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
  it('adds a Staple from the Catalog search, edits its amount and removes it', async () => {
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
      'PATCH /api/staples/s1': () => {
        staples = [staple({ quantity: 3 }), ...staples.slice(1)];
        return Response.json(staples[0]);
      },
      'DELETE /api/staples/s1': () => {
        staples = staples.filter((s) => s.id !== 's1');
        return new Response(null, { status: 204 });
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StaplesPage />);

    expect(await screen.findByLabelText('Usual amount of Milk')).toHaveValue(2);

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'flo',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Flour/ }));
    expect(
      await screen.findByLabelText('Usual amount of Flour'),
    ).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/staples')?.body).toEqual({
      ingredientId: 'flour-id',
    });

    const amount = screen.getByLabelText('Usual amount of Milk');
    await userEvent.clear(amount);
    await userEvent.type(amount, '3');
    await userEvent.click(screen.getByRole('button', { name: 'Save Milk' }));
    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PATCH /api/staples/s1')?.body,
      ).toEqual({
        quantity: 3,
        unit: 'l',
      }),
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Milk from staples' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByLabelText('Usual amount of Milk'),
      ).not.toBeInTheDocument(),
    );
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
