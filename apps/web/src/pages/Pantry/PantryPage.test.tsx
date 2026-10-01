import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { defaultExpiryDate, type Batch } from '../../lib/pantry';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

const inDays = (days: number) => defaultExpiryDate(days, new Date());

function batch(overrides: Partial<Batch>): Batch {
  return {
    id: crypto.randomUUID(),
    name: 'Milk',
    ingredientId: 'milk-id',
    unmatched: false,
    quantity: null,
    unit: null,
    location: 'fridge',
    expiryDate: null,
    productDescription: null,
    createdAt: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hard-cheese', name: 'Hard cheese' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy & eggs' },
  defaults: { expiryDays: 30, location: 'fridge' },
};

function stubPantry(batches: Batch[], search: CatalogSearchResult[] = []) {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () => Response.json({ batches }),
    'GET /api/catalog/search': () => Response.json({ results: search }),
    'POST /api/pantry/batches': () => Response.json(batch({})),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

describe('PantryPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('groups Batches by Location in the order given, with name, amount, description and ExpiryChip', async () => {
    stubPantry([
      batch({
        name: 'Yogurt',
        location: 'fridge',
        quantity: 500,
        unit: 'g',
        productDescription: 'Greek, opened',
        expiryDate: inDays(0),
      }),
      batch({ name: 'Spinach', location: 'fridge', expiryDate: inDays(2) }),
      batch({ name: 'Feta', location: 'fridge', expiryDate: inDays(9) }),
      batch({
        name: 'Zorblax paste',
        location: 'cupboard',
        unmatched: true,
        ingredientId: null,
      }),
    ]);
    renderWithProviders(<PantryPage />);

    const fridge = await screen.findByRole('region', { name: 'Fridge · 3' });
    const rows = within(fridge).getAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'Y' + 'Yogurt' + '500 g · Greek, opened' + 'Today',
      'S' + 'Spinach' + '2 days',
      expect.stringMatching(/^FFeta/),
    ]);
    expect(within(rows[2]).getByText(/\d{4}$/)).toBeInTheDocument();

    const cupboard = screen.getByRole('region', { name: 'Cupboard · 1' });
    expect(within(cupboard).getByText('Unmatched')).toBeInTheDocument();
    expect(within(cupboard).getByText('Zorblax paste')).toBeInTheDocument();
  });

  it('shows an empty state with no Batches', async () => {
    stubPantry([]);
    renderWithProviders(<PantryPage />);
    expect(await screen.findByText(/Your pantry is empty/)).toBeInTheDocument();
  });

  it('adds a Batch from the Catalog with pre-filled Location and expiry that can be overridden', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], [parmesan]);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));

    expect(screen.getByLabelText('Location')).toHaveValue('fridge');
    expect(screen.getByLabelText('Expiry date')).toHaveValue(inDays(30));
    expect(screen.getByLabelText('Unit')).toHaveValue('g');

    await user.selectOptions(screen.getByLabelText('Location'), 'freezer');
    await user.clear(screen.getByLabelText('Expiry date'));
    await user.type(screen.getByLabelText('Expiry date'), '2030-01-31');
    await user.type(screen.getByLabelText('Quantity'), '200');
    await user.type(
      screen.getByLabelText('Product description'),
      'Grana Padano 200g',
    );
    await user.click(screen.getByRole('button', { name: 'Add to pantry' }));

    const post = calls.find((call) => call.key === 'POST /api/pantry/batches');
    expect(post?.body).toEqual({
      ingredientId: 'parmesan-id',
      quantity: 200,
      unit: 'g',
      location: 'freezer',
      expiryDate: '2030-01-31',
      productDescription: 'Grana Padano 200g',
    });
    // Back on the list after saving, with focus on the Add button.
    const addButton = await screen.findByRole('button', { name: 'Add batch' });
    expect(addButton).toHaveFocus();
  });

  it('explains an invalid quantity and returns focus to Add after Cancel', async () => {
    const user = userEvent.setup();
    stubPantry([], []);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(screen.getByLabelText('Quantity'), '1.2345');
    expect(
      screen.getByText(/at least 0.001, with up to 3 decimals/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      await screen.findByRole('button', { name: 'Add batch' }),
    ).toHaveFocus();
  });

  it('saves a typed name with no Catalog match as an Unmatched Batch', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], []);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'Zorblax paste',
    );
    expect(
      screen.getByRole('button', { name: 'Add to pantry' }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Not in the Catalog? Add "Zorblax paste" as Unmatched',
      }),
    );
    expect(
      screen.getByText(/saved as Unmatched and flagged/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to pantry' }));

    const post = calls.find((call) => call.key === 'POST /api/pantry/batches');
    expect(post?.body).toMatchObject({
      rawName: 'Zorblax paste',
      location: 'cupboard',
      expiryDate: null,
      quantity: null,
      unit: null,
    });
    expect(post?.body).not.toHaveProperty('ingredientId');
  });
});
