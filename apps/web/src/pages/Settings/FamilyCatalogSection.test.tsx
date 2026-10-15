import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FamilyCatalog } from '../../lib/familyCatalog';
import { renderWithProviders, stubApi } from '../../test/render';
import { FamilyCatalogSection } from './components/FamilyCatalogSection';

const usage = {
  batches: 0,
  shoppingItems: 0,
  templateLines: 0,
  recipeLines: 0,
  staples: 0,
};
const kombucha = {
  id: 'k1',
  name: 'Kombucha',
  owner: 'family' as const,
  defaultUnit: 'ml' as const,
  amountScale: 'medium' as const,
  leafCategory: { id: 'soft-drinks', name: 'Soft drinks' },
  parentCategory: {
    id: 'drinks',
    name: 'Drinks',
    aisle: { id: 'a-drinks', name: 'Drinks aisle' },
  },
  defaults: { expiryDays: null, location: null },
  allergensChecked: true,
  allergenIds: [],
  usage: { ...usage, batches: 3, staples: 1 },
};
const tempeh = {
  ...kombucha,
  id: 't1',
  name: 'Tempeh',
  defaultUnit: 'g' as const,
  usage,
};

const catalog: FamilyCatalog = {
  ingredients: [kombucha, tempeh],
  synonyms: [
    { id: 's1', name: 'Booch', ingredient: { id: 'k1', name: 'Kombucha' } },
  ],
};

function stub(
  data: FamilyCatalog = catalog,
  extra: Parameters<typeof stubApi>[0] = {},
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/family': () => Response.json(data),
    'GET /api/settings/categories': () =>
      Response.json({
        parents: [
          {
            id: 'drinks',
            name: 'Drinks',
            leaves: [
              { id: 'soft-drinks', name: 'Soft drinks' },
              { id: 'tea', name: 'Tea' },
            ],
          },
        ],
      }),
    'PATCH /api/catalog/family-ingredients/k1': () => Response.json(kombucha),
    'DELETE /api/catalog/family-ingredients/k1': () =>
      new Response(null, { status: 204 }),
    'DELETE /api/catalog/family-synonyms/s1': () =>
      new Response(null, { status: 204 }),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

describe('FamilyCatalogSection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists Family Ingredients with category, aisle and unit, and Family Synonyms', async () => {
    stub();
    renderWithProviders(<FamilyCatalogSection />);

    expect(
      await screen.findByRole('heading', { name: 'Family catalog' }),
    ).toBeInTheDocument();
    const row = (await screen.findByText('Kombucha')).closest('li')!;
    expect(
      within(row).getByText('Soft drinks · Drinks aisle · ml'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tempeh')).toBeInTheDocument();
    expect(screen.getByText('Booch → Kombucha')).toBeInTheDocument();
  });

  it('says so when the Family has added nothing', async () => {
    stub({ ingredients: [], synonyms: [] });
    renderWithProviders(<FamilyCatalogSection />);
    expect(await screen.findByText(/Nothing added yet/)).toBeInTheDocument();
  });

  it('renames a Family Ingredient', async () => {
    const calls = stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edit Kombucha' }),
    );
    const name = screen.getByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Booch tea');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PATCH /api/catalog/family-ingredients/k1',
          body: { name: 'Booch tea' },
        }),
      ),
    );
  });

  it('moves a Family Ingredient to another category', async () => {
    const calls = stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edit Kombucha' }),
    );
    await userEvent.selectOptions(
      await screen.findByLabelText('Category'),
      await screen.findByRole('option', { name: 'Tea' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PATCH /api/catalog/family-ingredients/k1',
          body: { leafCategoryId: 'tea' },
        }),
      ),
    );
  });

  it('explains a name that is already taken', async () => {
    stub(catalog, {
      'PATCH /api/catalog/family-ingredients/k1': () =>
        Response.json(
          {
            code: 'catalog.family_ingredient_exists',
            params: { existing: tempeh },
          },
          { status: 409 },
        ),
    });
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edit Kombucha' }),
    );
    const name = screen.getByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Tempeh');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tempeh” already has that name',
    );
  });

  it('confirms a delete with what uses the Ingredient, then deletes it', async () => {
    const calls = stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Kombucha' }),
    );
    expect(
      screen.getByText(/3 Batches and 1 Staple use it/),
    ).toBeInTheDocument();
    expect(calls.map((c) => c.key)).not.toContain(
      'DELETE /api/catalog/family-ingredients/k1',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await vi.waitFor(() =>
      expect(calls.map((c) => c.key)).toContain(
        'DELETE /api/catalog/family-ingredients/k1',
      ),
    );
  });

  it('uses the singular for one use, and says so when nothing uses it', async () => {
    stub({
      ingredients: [{ ...kombucha, usage: { ...usage, batches: 1 } }, tempeh],
      synonyms: [],
    });
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Kombucha' }),
    );
    expect(
      screen.getByText(/1 Batch uses it. It stays as an unmatched item/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Tempeh' }),
    );
    expect(screen.getByText(/Nothing uses it/)).toBeInTheDocument();
  });

  it('counts in Romanian with the few form', async () => {
    stub({
      ingredients: [{ ...kombucha, usage: { ...usage, batches: 3 } }],
      synonyms: [],
    });
    renderWithProviders(<FamilyCatalogSection />, { locale: 'ro' });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Șterge Kombucha' }),
    );
    expect(screen.getByText(/3 loturi/)).toBeInTheDocument();
  });

  it('puts focus in the Name field, and back on Edit after Cancel', async () => {
    stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edit Kombucha' }),
    );
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Edit Kombucha' })).toHaveFocus();
  });

  it('puts focus back on Edit after saving', async () => {
    stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edit Kombucha' }),
    );
    await userEvent.type(screen.getByLabelText('Name'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Edit Kombucha' }),
      ).toHaveFocus(),
    );
  });

  it('moves focus to the next row on delete, and to the heading when none is left', async () => {
    stub({ ingredients: [kombucha, tempeh], synonyms: [] });
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Kombucha' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByRole('button', { name: 'Edit Tempeh' })).toHaveFocus();
  });

  it('moves focus to the heading when the last row is deleted', async () => {
    stub({ ingredients: [kombucha], synonyms: [] });
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Kombucha' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(
      screen.getByRole('heading', { name: 'Family catalog' }),
    ).toHaveFocus();
  });

  it('moves focus on after deleting a Family Synonym', async () => {
    stub({
      ingredients: [],
      synonyms: [
        { id: 's1', name: 'Booch', ingredient: { id: 'k1', name: 'Kombucha' } },
        { id: 's2', name: 'Kefir', ingredient: { id: 'k1', name: 'Kombucha' } },
      ],
    });
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Booch' }),
    );
    expect(screen.getByRole('button', { name: 'Delete Kefir' })).toHaveFocus();
  });

  it('keeps the neighbouring Synonym button enabled while a delete is pending', async () => {
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const calls = stub(
      {
        ingredients: [],
        synonyms: [
          {
            id: 's1',
            name: 'Booch',
            ingredient: { id: 'k1', name: 'Kombucha' },
          },
          {
            id: 's2',
            name: 'Kefir',
            ingredient: { id: 'k1', name: 'Kombucha' },
          },
        ],
      },
      {
        'DELETE /api/catalog/family-synonyms/s1': async () => {
          await pending;
          return new Response(null, { status: 204 });
        },
      },
    );
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Booch' }),
    );
    await vi.waitFor(() =>
      expect(calls.map((c) => c.key)).toContain(
        'DELETE /api/catalog/family-synonyms/s1',
      ),
    );

    // A disabled button loses focus in a real browser, so only the row being
    // deleted may be disabled.
    expect(screen.getByRole('button', { name: 'Delete Kefir' })).toBeEnabled();
    release();
  });

  it('deletes a Family Synonym', async () => {
    const calls = stub();
    renderWithProviders(<FamilyCatalogSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete Booch' }),
    );

    await vi.waitFor(() =>
      expect(calls.map((c) => c.key)).toContain(
        'DELETE /api/catalog/family-synonyms/s1',
      ),
    );
  });
});
