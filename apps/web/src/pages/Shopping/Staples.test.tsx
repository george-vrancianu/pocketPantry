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
  parentCategory: { id: 'b', name: 'Baking', aisle: 'Baking' },
  defaults: { expiryDays: 365, location: 'cupboard' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Suggestions section on the Shopping List', () => {
  it('lists missing Staples and adds one with its preferred quantity and unit', async () => {
    let suggestions = [
      suggestion(),
      suggestion({
        ingredientId: 'flour-id',
        name: 'Flour',
        quantity: null,
        unit: null,
        aisle: baking,
      }),
    ];
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: suggestions }),
      'POST /api/shopping-list/items': () => {
        suggestions = suggestions.slice(1);
        return Response.json(emptyList());
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const section = await screen.findByRole('region', { name: 'Suggestions' });
    const rows = within(section).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Milk');
    expect(rows[0]).toHaveTextContent('2 L');
    expect(rows[1]).toHaveTextContent('Flour');

    await userEvent.click(
      within(section).getByRole('button', { name: 'Add Milk to the list' }),
    );

    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/shopping-list/items')?.body,
      ).toEqual({
        ingredientId: 'milk-id',
        quantity: 2,
        unit: 'l',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Add Milk to the list' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('dismisses a Suggestion for the Family', async () => {
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

    await userEvent.click(
      await screen.findByRole('button', { name: 'Dismiss Milk' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Suggestions' }),
      ).not.toBeInTheDocument(),
    );
    expect(calls.map((c) => c.key)).toContain(
      'POST /api/shopping-list/suggestions/milk-id/dismiss',
    );
  });

  it('collapses and expands', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [suggestion()] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const toggle = await screen.findByRole('button', {
      name: /Suggested, 1 staple missing/,
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Add Milk to the list' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('lists Used Up Ingredients below the Staples, adds one with no quantity and dismisses one', async () => {
    let usedUp = [
      suggestion({
        ingredientId: 'eggs-id',
        name: 'Eggs',
        quantity: null,
        unit: null,
      }),
      suggestion({
        ingredientId: 'rice-id',
        name: 'Rice',
        quantity: null,
        unit: null,
      }),
    ];
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [suggestion()], usedUp }),
      'POST /api/shopping-list/items': () => {
        usedUp = usedUp.slice(1);
        return Response.json(emptyList());
      },
      'POST /api/shopping-list/suggestions/rice-id/dismiss': () => {
        usedUp = [];
        return new Response(null, { status: 204 });
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const section = await screen.findByRole('region', { name: 'Suggestions' });
    const rows = within(section).getAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Milk'),
      expect.stringContaining('Eggs'),
      expect.stringContaining('Rice'),
    ]);
    expect(
      within(section).getByRole('button', {
        name: /Recently used up, 2 ingredients/,
      }),
    ).toBeVisible();

    await userEvent.click(
      within(section).getByRole('button', { name: 'Add Eggs to the list' }),
    );
    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/shopping-list/items')?.body,
      ).toEqual({ ingredientId: 'eggs-id' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Add Eggs to the list' }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss Rice' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Dismiss Rice' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the section when only Used Up Ingredients are suggested', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({
          staples: [],
          usedUp: [suggestion({ name: 'Eggs', quantity: null, unit: null })],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    const section = await screen.findByRole('region', { name: 'Suggestions' });
    expect(
      within(section).getByRole('button', {
        name: /Recently used up, 1 ingredient$/,
      }),
    ).toBeVisible();
  });

  it('shows nothing when there are no Suggestions', async () => {
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => Response.json(emptyList()),
      'GET /api/shopping-list/suggestions': () =>
        Response.json({ staples: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ShoppingPage />);

    await screen.findByText(/Your list is empty/);
    expect(
      screen.queryByRole('region', { name: 'Suggestions' }),
    ).not.toBeInTheDocument();
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
