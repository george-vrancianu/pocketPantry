import { focusManager } from '@tanstack/react-query';
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
    expiringSoon: false,
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
        ingredientId: 'yogurt-id',
        location: 'fridge',
        quantity: 500,
        unit: 'g',
        productDescription: 'Greek, opened',
        expiryDate: inDays(0),
      }),
      batch({
        name: 'Spinach',
        ingredientId: 'spinach-id',
        location: 'fridge',
        expiryDate: inDays(2),
        expiringSoon: true,
      }),
      batch({
        name: 'Feta',
        ingredientId: 'feta-id',
        location: 'fridge',
        expiryDate: inDays(9),
      }),
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
      screen.getByText(/from 0.001 to 1,000,000, with up to 3 decimals/),
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

  describe('managing the Pantry', () => {
    const stock = () => [
      batch({
        id: 'milk-1',
        name: 'Milk',
        quantity: 1,
        unit: 'l',
        expiryDate: inDays(5),
      }),
      batch({
        id: 'milk-2',
        name: 'Milk',
        quantity: 0.5,
        unit: 'l',
        productDescription: 'Opened',
        expiryDate: inDays(2),
        expiringSoon: true,
      }),
      batch({
        id: 'cheese',
        name: 'Parmesan',
        ingredientId: 'parmesan-id',
        location: 'freezer',
        productDescription: 'Grana Padano 200g',
        expiryDate: inDays(40),
      }),
      batch({
        id: 'rice',
        name: 'Rice',
        ingredientId: 'rice-id',
        location: 'cupboard',
      }),
    ];

    function stubManaged(initial: Batch[]) {
      let batches = initial;
      const remove = (id: string) => () => {
        batches = batches.filter((b) => b.id !== id);
        return new Response(null, { status: 204 });
      };
      const { fetchMock, calls } = stubApi({
        'GET /api/pantry': () => Response.json({ batches }),
        'PATCH /api/pantry/batches/milk-2': () => Response.json(batches[1]),
        'DELETE /api/pantry/batches/milk-2': remove('milk-2'),
        'DELETE /api/pantry/batches/cheese': remove('cheese'),
      });
      vi.stubGlobal('fetch', fetchMock);
      return calls;
    }

    it('rolls Batches of one Ingredient into a row with the total and soonest expiry', async () => {
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const fridge = await screen.findByRole('region', { name: 'Fridge · 2' });
      const [row] = within(fridge).getAllByRole('listitem');
      expect(row.textContent).toBe(
        'M' + 'Milk' + '1.5 L · 2 batches' + '2 days',
      );
    });

    it('lists totals separately when the units differ', async () => {
      stubManaged([
        batch({ name: 'Flour', ingredientId: 'f', quantity: 500, unit: 'g' }),
        batch({ name: 'Flour', ingredientId: 'f', quantity: 2, unit: 'pcs' }),
      ]);
      renderWithProviders(<PantryPage />);
      expect(
        await screen.findByText('500 g + 2 pcs · 2 batches'),
      ).toBeVisible();
    });

    it('expands a row to each Batch with its own expiry, Edit and Delete', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const toggle = await screen.findByRole('button', { name: /^Milk/ });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const details = within(
        screen.getByRole('list', { name: 'Batches of Milk' }),
      ).getAllByRole('listitem');
      expect(details.map((d) => d.textContent)).toEqual([
        '0.5 L · Opened' + '2 days' + 'Edit' + 'Delete',
        expect.stringMatching(/^1 L.*Edit.*Delete$/),
      ]);
      expect(
        within(details[0]).getByRole('button', { name: 'Edit Milk batch' }),
      ).toBeInTheDocument();

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('edits a Batch and sends only that Batch', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);

      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        within(
          screen.getByRole('list', { name: 'Batches of Milk' }),
        ).getAllByRole('button', { name: 'Edit Milk batch' })[0],
      );
      const form = screen.getByRole('form', { name: 'Edit Milk batch' });
      expect(within(form).getByLabelText('Quantity')).toHaveValue(0.5);
      expect(within(form).getByLabelText('Product description')).toHaveValue(
        'Opened',
      );

      await user.clear(within(form).getByLabelText('Quantity'));
      await user.type(within(form).getByLabelText('Quantity'), '0.25');
      await user.selectOptions(
        within(form).getByLabelText('Location'),
        'freezer',
      );
      await user.clear(within(form).getByLabelText('Expiry date'));
      await user.click(
        within(form).getByRole('button', { name: 'Save changes' }),
      );

      const patch = calls.find(
        (call) => call.key === 'PATCH /api/pantry/batches/milk-2',
      );
      // Only what changed, so two Members editing different fields do not overwrite each other.
      expect(patch?.body).toEqual({
        quantity: 0.25,
        location: 'freezer',
        expiryDate: null,
      });
    });

    it("does not revert another Member's change made while the form was open", async () => {
      const user = userEvent.setup();
      const initial = stock();
      let live = initial;
      const { fetchMock, calls } = stubApi({
        'GET /api/pantry': () => Response.json({ batches: live }),
        'PATCH /api/pantry/batches/milk-2': () => Response.json(live[1]),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        screen.getAllByRole('button', { name: 'Edit Milk batch' })[0],
      );
      const form = screen.getByRole('form', { name: 'Edit Milk batch' });

      // Another Member changes the quantity, and the list refetches under the open form.
      live = initial.map((b) =>
        b.id === 'milk-2' ? { ...b, quantity: 0.75 } : b,
      );
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      await waitFor(() =>
        expect(calls.filter((c) => c.key === 'GET /api/pantry').length).toBe(2),
      );

      await user.type(
        within(form).getByLabelText('Product description'),
        ' jar',
      );
      await user.click(
        within(form).getByRole('button', { name: 'Save changes' }),
      );
      const patch = calls.find((c) => c.key.startsWith('PATCH'));
      expect(patch?.body).toEqual({ productDescription: 'Opened jar' });
    });

    it('sends no request when nothing changed', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        screen.getAllByRole('button', { name: 'Edit Milk batch' })[0],
      );
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('form', { name: 'Edit Milk batch' }),
        ).not.toBeInTheDocument(),
      );
      expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(false);
    });

    it('refuses an exponent quantity when editing', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        screen.getAllByRole('button', { name: 'Edit Milk batch' })[0],
      );
      fireEvent.change(screen.getByLabelText('Quantity'), {
        target: { value: '1e3' },
      });
      expect(
        screen.getByRole('button', { name: 'Save changes' }),
      ).toBeDisabled();
    });

    it('refuses an invalid quantity when editing', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        screen.getAllByRole('button', { name: 'Edit Milk batch' })[0],
      );
      await user.clear(screen.getByLabelText('Quantity'));
      await user.type(screen.getByLabelText('Quantity'), '1.2345');
      expect(
        screen.getByRole('button', { name: 'Save changes' }),
      ).toBeDisabled();
    });

    it('deletes a Batch only after confirming', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);

      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await user.click(
        screen.getAllByRole('button', { name: 'Delete Milk batch' })[0],
      );
      expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);
      await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
      await waitFor(() =>
        expect(calls.map((c) => c.key)).toContain(
          'DELETE /api/pantry/batches/milk-2',
        ),
      );
    });

    describe('focus', () => {
      async function openMilk(batches = stock()) {
        const user = userEvent.setup();
        stubManaged(batches);
        renderWithProviders(<PantryPage />);
        const toggle = await screen.findByRole('button', { name: /^Milk/ });
        await user.click(toggle);
        return { user, toggle };
      }
      const editButton = () =>
        screen.getAllByRole('button', { name: 'Edit Milk batch' })[0];
      const deleteButton = () =>
        screen.getAllByRole('button', { name: 'Delete Milk batch' })[0];

      it('moves focus into the edit form and back to Edit on Cancel', async () => {
        const { user } = await openMilk();
        await user.click(editButton());
        expect(screen.getByLabelText('Quantity')).toHaveFocus();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(editButton()).toHaveFocus();
      });

      it('returns focus to Edit after Save', async () => {
        const { user } = await openMilk();
        await user.click(editButton());
        await user.clear(screen.getByLabelText('Quantity'));
        await user.type(screen.getByLabelText('Quantity'), '2');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));
        await waitFor(() => expect(editButton()).toHaveFocus());
      });

      it('moves focus to the confirm control and back to Delete on Cancel', async () => {
        const { user } = await openMilk();
        await user.click(deleteButton());
        expect(
          screen.getByRole('button', { name: 'Yes, delete' }),
        ).toHaveFocus();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(deleteButton()).toHaveFocus();
      });

      it('focuses the roll-up toggle after deleting one of several Batches', async () => {
        const { user, toggle } = await openMilk();
        await user.click(deleteButton());
        await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
        await waitFor(() => expect(toggle).toHaveFocus());
      });

      it('focuses the section heading after deleting the last Batch of a row', async () => {
        const user = userEvent.setup();
        stubManaged([
          ...stock(),
          batch({
            id: 'peas',
            name: 'Peas',
            ingredientId: 'peas-id',
            location: 'freezer',
          }),
        ]);
        renderWithProviders(<PantryPage />);
        await user.click(
          await screen.findByRole('button', { name: /^Parmesan/ }),
        );
        await user.click(
          screen.getByRole('button', { name: 'Delete Parmesan batch' }),
        );
        await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
        await waitFor(() =>
          expect(
            screen.getByRole('heading', { name: 'Freezer · 1' }),
          ).toHaveFocus(),
        );
      });

      it('focuses the Add button when deleting the last Batch of the last section', async () => {
        const user = userEvent.setup();
        stubManaged([stock()[2]]);
        renderWithProviders(<PantryPage />);
        await user.click(
          await screen.findByRole('button', { name: /^Parmesan/ }),
        );
        await user.click(
          screen.getByRole('button', { name: 'Delete Parmesan batch' }),
        );
        await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
        await waitFor(() =>
          expect(screen.queryByRole('heading', { name: /Freezer/ })).toBeNull(),
        );
        expect(screen.getByRole('button', { name: 'Add batch' })).toHaveFocus();
      });

      it('focuses the Add button when a Batch moves out of its only section', async () => {
        const user = userEvent.setup();
        let batches = [stock()[2]];
        const { fetchMock } = stubApi({
          'GET /api/pantry': () => Response.json({ batches }),
          'PATCH /api/pantry/batches/cheese': () => {
            batches = [{ ...batches[0], location: 'fridge' }];
            return Response.json(batches[0]);
          },
        });
        vi.stubGlobal('fetch', fetchMock);
        renderWithProviders(<PantryPage />);
        await user.click(
          await screen.findByRole('button', { name: /^Parmesan/ }),
        );
        await user.click(
          screen.getByRole('button', { name: 'Edit Parmesan batch' }),
        );
        await user.selectOptions(screen.getByLabelText('Location'), 'fridge');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));
        await screen.findByRole('heading', { name: 'Fridge · 1' });
        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Add batch' }),
          ).toHaveFocus(),
        );
      });
    });

    it('searches localised names and Product Descriptions', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const search = await screen.findByRole('searchbox', {
        name: 'Search pantry',
      });
      await user.type(search, 'grana');
      expect(screen.getByText('Parmesan')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'All · 1' }),
      ).toBeInTheDocument();

      await user.clear(search);
      await user.type(search, 'MILK');
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.queryByText('Parmesan')).not.toBeInTheDocument();

      await user.clear(search);
      await user.type(search, 'zzz');
      expect(screen.getByText('No batches match.')).toBeInTheDocument();
    });

    it('filters by Location with live counts and marks the active chip', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const all = await screen.findByRole('button', { name: 'All · 4' });
      expect(all).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: 'Fridge · 2' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Freezer · 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cupboard · 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Spices · 0' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Freezer · 1' }));
      expect(
        screen.getByRole('button', { name: 'Freezer · 1' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(all).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Parmesan')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();

      // Counts follow the search.
      await user.type(
        screen.getByRole('searchbox', { name: 'Search pantry' }),
        'milk',
      );
      expect(
        screen.getByRole('button', { name: 'Fridge · 2' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Freezer · 0' }),
      ).toBeInTheDocument();
    });
  });
});
