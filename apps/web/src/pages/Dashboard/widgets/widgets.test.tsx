import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Batch } from '../../../lib/pantry';
import type { ShoppingItem, ShoppingList } from '../../../lib/shopping';
import { renderWithProviders, stubApi } from '../../../test/render';
import { BudgetWidget, NutritionWidget } from './PlaceholderWidgets';
import { PantryStockWidget } from './PantryStockWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { CookTonightWidget } from './CookTonightWidget';
import { UseSoonWidget } from './UseSoonWidget';
import type { CookTonightCard } from '../../../lib/cookTonight';

const isoIn = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const batch = (overrides: Partial<Batch> & { id: string }): Batch => ({
  name: 'Item',
  ingredientId: 'ing',
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
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const item = (overrides: Partial<ShoppingItem> & { id: string }) => ({
  ingredientId: null,
  name: 'Item',
  quantity: null,
  unit: null,
  checked: false,
  unmatched: false,
  ...overrides,
});

function shoppingList(items: ShoppingItem[]): ShoppingList {
  const checked = items.filter((i) => i.checked).length;
  return {
    id: 'l1',
    groups: [{ aisle: { id: 'a', name: 'Aisle', sortOrder: 1 }, items }],
    summary: { remaining: items.length - checked, checked },
  };
}

function stub(routes: Record<string, () => Response>) {
  const { fetchMock } = stubApi(routes);
  vi.stubGlobal('fetch', fetchMock);
}

afterEach(() => vi.unstubAllGlobals());

describe('UseSoonWidget', () => {
  it('lists the three soonest-expiring Batches with their ExpiryTags, Expired ones first', async () => {
    stub({
      'GET /api/settings/family': () =>
        Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
      'GET /api/pantry': () =>
        Response.json({
          batches: [
            batch({ id: '1', name: 'Feta', expiryDate: isoIn(6) }),
            batch({ id: '2', name: 'Yogurt', expiryDate: isoIn(0) }),
            batch({ id: '3', name: 'Orzo' }),
            batch({ id: '4', name: 'Spinach', expiryDate: isoIn(1) }),
            batch({ id: '5', name: 'Bread', expiryDate: isoIn(-4) }),
          ],
        }),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    const region = await screen.findByRole('region', { name: 'Use soon' });
    const rows = await within(region).findAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'BreadExpired',
      'YogurtToday',
      'SpinachTomorrow',
    ]);
    expect(
      within(region).getByRole('link', { name: 'See all' }),
    ).toHaveAttribute('href', '/pantry');
  });

  it('counts days left within the Stale Threshold and plain days after it', async () => {
    stub({
      'GET /api/settings/family': () =>
        Response.json({ staleThresholdDays: 7, expiryOverrides: [] }),
      'GET /api/pantry': () =>
        Response.json({
          batches: [
            batch({ id: '1', name: 'Feta', expiryDate: isoIn(5) }),
            batch({ id: '2', name: 'Ham', expiryDate: isoIn(7) }),
            batch({ id: '3', name: 'Butter', expiryDate: isoIn(12) }),
          ],
        }),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    const region = await screen.findByRole('region', { name: 'Use soon' });
    await waitFor(() =>
      expect(
        within(region)
          .getAllByRole('listitem')
          .map((row) => row.textContent),
      ).toEqual([
        'Feta5 d left5 days left',
        'Ham7 d left7 days left',
        'Butter12 d12 days',
      ]),
    );
  });

  it('says so when no Batch has an expiry date', async () => {
    stub({
      'GET /api/pantry': () =>
        Response.json({ batches: [batch({ id: '1', name: 'Orzo' })] }),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    expect(
      await screen.findByText(
        'Nothing with an expiry date in your Pantry yet.',
      ),
    ).toBeInTheDocument();
  });

  it('shows a translated error when the Pantry cannot be loaded', async () => {
    stub({
      'GET /api/pantry': () =>
        Response.json(
          { code: 'internal_server_error', params: {} },
          { status: 500 },
        ),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong on our side',
    );
  });
});

describe('ShoppingWidget', () => {
  it('shows the unchecked count, the first names and links to Shopping', async () => {
    stub({
      'GET /api/shopping-list': () =>
        Response.json(
          shoppingList([
            item({ id: '1', name: 'Lemons' }),
            item({ id: '2', name: 'Milk', checked: true }),
            item({ id: '3', name: 'Dill' }),
            item({ id: '4', name: 'Feta' }),
            item({ id: '5', name: 'Bread' }),
          ]),
        ),
    });

    renderWithProviders(<ShoppingWidget size="small" columns={2} />);

    const link = await screen.findByRole('link', { name: 'Shopping' });
    expect(link).toHaveAttribute('href', '/shopping');
    expect(link).toHaveTextContent('4');
    expect(link).toHaveTextContent('items to buy');
    expect(link).toHaveTextContent('Lemons, Dill, Feta…');
    expect(link).not.toHaveTextContent('Milk');
  });

  it('shows an empty list', async () => {
    stub({ 'GET /api/shopping-list': () => Response.json(shoppingList([])) });

    renderWithProviders(<ShoppingWidget size="small" columns={2} />);

    expect(await screen.findByText('Your list is empty')).toBeInTheDocument();
  });

  it('speaks Romanian', async () => {
    stub({
      'GET /api/shopping-list': () =>
        Response.json(shoppingList([item({ id: '1', name: 'Lămâi' })])),
    });

    renderWithProviders(<ShoppingWidget size="small" columns={2} />, {
      locale: 'ro',
    });

    expect(
      await screen.findByRole('link', { name: 'Cumpărături' }),
    ).toHaveTextContent('produs de cumpărat');
  });
});

describe('PantryStockWidget', () => {
  it('shows the total and a stacked bar by Location, and links to the Pantry', async () => {
    stub({
      'GET /api/pantry': () =>
        Response.json({
          batches: [
            batch({ id: '1', location: 'fridge' }),
            batch({ id: '2', location: 'fridge' }),
            batch({ id: '3', location: 'freezer' }),
            batch({ id: '4', location: 'cupboard' }),
          ],
        }),
    });

    renderWithProviders(<PantryStockWidget size="small" columns={2} />);

    const link = await screen.findByRole('link', { name: 'Pantry' });
    expect(link).toHaveAttribute('href', '/pantry');
    expect(link).toHaveTextContent('4');
    expect(link).toHaveTextContent('items in stock');
    expect(
      within(link).getByRole('img', {
        name: 'Fridge 2, Freezer 1, Cupboard 1',
      }),
    ).toBeInTheDocument();
  });

  it('shows zero for an empty Pantry', async () => {
    stub({ 'GET /api/pantry': () => Response.json({ batches: [] }) });

    renderWithProviders(<PantryStockWidget size="small" columns={2} />);

    expect(
      await screen.findByRole('link', { name: 'Pantry' }),
    ).toHaveTextContent('0');
  });
});

describe.each([
  ['Budget', BudgetWidget, 'Buget'],
  ['Nutrition', NutritionWidget, 'Nutriție'],
])('%s placeholder', (name, Widget, roName) => {
  it('is marked as coming soon in English', () => {
    renderWithProviders(<Widget size="small" columns={2} />);

    const region = screen.getByRole('region', { name });
    expect(within(region).getByText('Coming soon')).toBeInTheDocument();
  });

  it('is marked as coming soon in Romanian', () => {
    renderWithProviders(<Widget size="small" columns={2} />, { locale: 'ro' });

    const region = screen.getByRole('region', { name: roName });
    expect(within(region).getByText('În curând')).toBeInTheDocument();
  });
});

describe('CookTonightWidget', () => {
  const card = (
    id: string,
    overrides: Partial<CookTonightCard> = {},
  ): CookTonightCard => ({
    base: { id: `b-${id}`, title: `Base ${id}`, archived: false },
    recipe: {
      id,
      title: `Recipe ${id}`,
      parentId: null,
      owner: 'catalog',
      servings: 2,
      prepMinutes: null,
      cookMinutes: null,
    },
    canMake: true,
    missing: null,
    expiringCount: 0,
    otherVariantsCount: 0,
    ...overrides,
  });
  const cookTonight = (cards: CookTonightCard[]) => ({
    'GET /api/recipes/cook-tonight': () => Response.json({ cards }),
  });

  it('shows one card linking to the Recipe, with the other Variants count and time', async () => {
    stub(
      cookTonight([
        card('r1', {
          otherVariantsCount: 2,
          recipe: {
            id: 'r1',
            title: 'Spicy Pasta',
            parentId: 'b-r1',
            owner: 'family',
            servings: 2,
            prepMinutes: 10,
            cookMinutes: 20,
          },
        }),
      ]),
    );

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    const region = await screen.findByRole('region', { name: 'Cook tonight' });
    const link = await within(region).findByRole('link', {
      name: /Spicy Pasta/,
    });
    expect(link).toHaveAttribute('href', '/recipes/r1');
    expect(within(link).getByText('Variant of Base r1')).toBeInTheDocument();
    expect(
      within(link).getByText('30 min · +2 other Variants you can make'),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole('link', { name: 'See all' }),
    ).toHaveAttribute('href', '/recipes');
  });

  it('labels a near miss with the missing Ingredient', async () => {
    stub(
      cookTonight([
        card('r1', {
          canMake: false,
          missing: { ingredientId: 'i1', name: 'Saffron' },
        }),
      ]),
    );

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    expect(await screen.findByText('Missing: Saffron')).toBeInTheDocument();
  });

  it('titles a card by the archived base and shows the Variant as secondary', async () => {
    stub(
      cookTonight([
        card('r1', {
          base: { id: 'b1', title: 'Old Stew', archived: true },
          recipe: {
            id: 'r1',
            title: 'Vegan Stew',
            parentId: 'b1',
            owner: 'family',
            servings: 2,
            prepMinutes: null,
            cookMinutes: null,
          },
        }),
      ]),
    );

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    const link = await screen.findByRole('link', { name: /Old Stew/ });
    expect(link).toHaveAttribute('href', '/recipes/r1');
    expect(within(link).getByText('Vegan Stew')).toBeInTheDocument();
    expect(within(link).queryByText(/Variant of/)).not.toBeInTheDocument();
  });

  it.each([
    ['small', 2, 1],
    ['wide', 2, 2],
    ['tall', 2, 2],
    ['tall', 3, 2],
    ['tall', 4, 3],
  ] as const)(
    'shows as many cards as a %s Widget at %i columns allows',
    async (size, columns, shown) => {
      stub(cookTonight([card('1'), card('2'), card('3'), card('4')]));

      renderWithProviders(<CookTonightWidget size={size} columns={columns} />);

      expect(
        await screen.findAllByRole('link', { name: /^Recipe / }),
      ).toHaveLength(shown);
    },
  );

  it('shows the expiring hint only when something expiring is used', async () => {
    stub(cookTonight([card('1', { expiringCount: 2 }), card('2')]));

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    expect(
      await screen.findByText('uses 2 Expiring Soon items'),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Expiring Soon/)).toHaveLength(1);
  });

  it('shows no extra lines for a base Recipe with nothing else to say', async () => {
    stub(cookTonight([card('1')]));

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    const link = await screen.findByRole('link', { name: 'Recipe 1' });
    expect(link).toHaveTextContent(/^Recipe 1$/);
  });

  it('names the link by all of its parts', async () => {
    stub(
      cookTonight([
        card('1', {
          otherVariantsCount: 1,
          missing: { ingredientId: null, name: 'Saffron' },
          recipe: {
            id: '1',
            title: 'Paella',
            parentId: 'b-1',
            owner: 'family',
            servings: 2,
            prepMinutes: 5,
            cookMinutes: null,
          },
        }),
      ]),
    );

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    expect(
      await screen.findByRole('link', {
        name: 'Paella, Variant of Base 1, Missing: Saffron, 5 min · +1 other Variant you can make',
      }),
    ).toBeInTheDocument();
  });

  it('shows an error when the cards fail to load', async () => {
    stub({
      'GET /api/recipes/cook-tonight': () =>
        Response.json({ message: 'boom' }, { status: 500 }),
    });

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('speaks Romanian plurals', async () => {
    stub(
      cookTonight([
        card('1', { otherVariantsCount: 1, expiringCount: 1 }),
        card('2', { otherVariantsCount: 3, expiringCount: 3 }),
        card('3', { otherVariantsCount: 20, expiringCount: 20 }),
      ]),
    );

    renderWithProviders(<CookTonightWidget size="tall" columns={4} />, {
      locale: 'ro',
    });

    expect(
      await screen.findByText(/\+1 altă variantă pe care o poți găti/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/\+3 alte variante pe care le poți găti/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/folosește 1 ingredient care expiră curând/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/folosește 3 ingrediente care expiră curând/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/\+20 de alte variante pe care le poți găti/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/folosește 20 de ingrediente care expiră curând/),
    ).toBeInTheDocument();
  });

  it('says so when nothing can be made tonight', async () => {
    stub(cookTonight([]));

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    expect(
      await screen.findByText(/Nothing to cook from your Pantry yet/),
    ).toBeInTheDocument();
  });

  it('asks the API with the locale and today', async () => {
    const { fetchMock, calls } = stubApi(cookTonight([]));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<CookTonightWidget size="wide" columns={2} />);

    await screen.findByText(/Nothing to cook/);
    const search = new URLSearchParams(calls[0]?.search);
    expect(calls[0]?.key).toBe('GET /api/recipes/cook-tonight');
    expect(search.get('locale')).toBe('en');
    expect(search.get('today')).toBe(isoIn(0));
  });
});
