import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Batch } from '../../../lib/pantry';
import type { ShoppingItem, ShoppingList } from '../../../lib/shopping';
import { renderWithProviders, stubApi } from '../../../test/render';
import {
  BudgetWidget,
  MealPlanWidget,
  NutritionWidget,
} from './PlaceholderWidgets';
import { PantryStockWidget } from './PantryStockWidget';
import { QuickScanWidget } from './QuickScanWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { UseSoonWidget } from './UseSoonWidget';

const isoIn = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const batch = (overrides: Partial<Batch> & { id: string }): Batch => ({
  name: 'Item',
  ingredientId: 'ing',
  unmatched: false,
  quantity: null,
  unit: null,
  location: 'fridge',
  expiryDate: null,
  productDescription: null,
  expiringSoon: false,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const item = (overrides: Partial<ShoppingItem> & { id: string }) => ({
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
  it('lists the three soonest-expiring Batches with ExpiryChips, soonest first', async () => {
    stub({
      'GET /api/pantry': () =>
        Response.json({
          batches: [
            batch({ id: '1', name: 'Feta', expiryDate: isoIn(6) }),
            batch({
              id: '2',
              name: 'Yogurt',
              expiryDate: isoIn(0),
              expiringSoon: true,
            }),
            batch({ id: '3', name: 'Orzo' }),
            batch({
              id: '4',
              name: 'Spinach',
              expiryDate: isoIn(1),
              expiringSoon: true,
            }),
            batch({
              id: '5',
              name: 'Chicken',
              expiryDate: isoIn(2),
              expiringSoon: true,
            }),
          ],
        }),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    const region = await screen.findByRole('region', { name: 'Use soon' });
    const rows = await within(region).findAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'YogurtToday',
      'Spinach1 day',
      'Chicken2 days',
    ]);
    expect(
      within(region).getByRole('link', { name: 'See all' }),
    ).toHaveAttribute('href', '/pantry');
  });

  it('says so when no Batch has an expiry date', async () => {
    stub({
      'GET /api/pantry': () =>
        Response.json({ batches: [batch({ id: '1', name: 'Orzo' })] }),
    });

    renderWithProviders(<UseSoonWidget size="wide" columns={2} />);

    expect(
      await screen.findByText(
        'Nothing with an expiry date in your pantry yet.',
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

describe('QuickScanWidget', () => {
  it('deep-links each tile to its Scan Mode', () => {
    renderWithProviders(<QuickScanWidget size="wide" columns={2} />);

    const hrefs = Object.fromEntries(
      screen
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    );
    expect(hrefs).toEqual({
      Product: '/scan?mode=product',
      Receipt: '/scan?mode=receipt',
      Plate: '/scan?mode=plate',
      Ingredients: '/scan?mode=ingredients',
    });
  });
});

it.each([
  ['en', 'Meal plan', 'MTWTFSS'],
  ['ro', 'Plan de mese', 'LMMJVSD'],
] as const)('labels the Meal plan days in %s', (locale, name, days) => {
  renderWithProviders(<MealPlanWidget size="small" columns={2} />, { locale });

  expect(screen.getByRole('region', { name })).toHaveTextContent(days);
});

describe.each([
  ['Meal plan', MealPlanWidget, 'Plan de mese'],
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
