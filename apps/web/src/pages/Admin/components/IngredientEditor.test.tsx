import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog, AdminIngredient } from '../../../lib/admin';
import { renderWithProviders, stubApi } from '../../../test/render';
import { IngredientEditor } from './IngredientEditor';

const catalog: AdminCatalog = {
  aisles: [{ id: 'a1', name: 'Dairy & eggs', sortOrder: 1, translations: [] }],
  parentCategories: [
    {
      id: 'p1',
      name: 'Dairy',
      aisleId: 'a1',
      defaultExpiryDays: 10,
      defaultLocation: 'fridge',
      translations: [
        { id: 't-p1', locale: 'ro', kind: 'name', value: 'Lactate' },
      ],
    },
  ],
  leafCategories: [
    {
      id: 'l1',
      name: 'Hard cheese',
      parentId: 'p1',
      isOther: false,
      defaultExpiryDays: null,
      defaultLocation: null,
      translations: [],
    },
    {
      id: 'l2',
      name: 'Butter',
      parentId: 'p1',
      isOther: false,
      defaultExpiryDays: 30,
      defaultLocation: null,
      translations: [],
    },
  ],
  ingredients: [],
};

const parmesan: AdminIngredient = {
  id: 'i1',
  name: 'Parmesan',
  leafCategoryId: 'l1',
  defaultUnit: 'g',
  translations: [
    { id: 't1', locale: 'en', kind: 'name', value: 'Parmesan' },
    { id: 't2', locale: 'ro', kind: 'name', value: 'Parmezan' },
    { id: 't3', locale: 'en', kind: 'synonym', value: 'Parmigiano' },
  ],
};

function stub(routes: Parameters<typeof stubApi>[0] = {}) {
  const api = stubApi({
    'GET /api/admin/catalog': () => Response.json(catalog),
    ...routes,
  });
  vi.stubGlobal('fetch', api.fetchMock);
  return api.calls;
}

describe('IngredientEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an Ingredient with a Leaf Category and default unit', async () => {
    const calls = stub({
      'POST /api/admin/catalog/ingredients': () =>
        Response.json({ id: 'new' }, { status: 201 }),
    });
    const onDone = vi.fn();
    renderWithProviders(<IngredientEditor catalog={catalog} onDone={onDone} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Name \(English\)/), 'Gouda');
    await user.selectOptions(screen.getByLabelText('Leaf Category'), 'l2');
    await user.selectOptions(screen.getByLabelText('Default unit'), 'kg');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
      name: 'Gouda',
      leafCategoryId: 'l2',
      defaultUnit: 'kg',
    });
    // No translation controls until the Ingredient exists.
    expect(screen.queryByText('Translations and Synonyms')).toBeNull();
  });

  it('edits an existing Ingredient and shows its translations and Synonyms', async () => {
    const calls = stub({
      'PATCH /api/admin/catalog/ingredients/i1': () => Response.json({}),
    });
    renderWithProviders(
      <IngredientEditor
        ingredient={parmesan}
        catalog={catalog}
        onDone={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    expect(screen.getByLabelText(/Name \(English\)/)).toHaveValue('Parmesan');
    expect(screen.getByLabelText('Name (Romanian)')).toHaveValue('Parmezan');
    expect(screen.getByText('Parmigiano')).toBeVisible();

    await user.clear(screen.getByLabelText(/Name \(English\)/));
    await user.type(
      screen.getByLabelText(/Name \(English\)/),
      'Parmigiano Reggiano',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(true),
    );
    expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
      name: 'Parmigiano Reggiano',
      leafCategoryId: 'l1',
      defaultUnit: 'g',
    });
  });

  it('adds a Synonym, saves a translated name, and removes a Synonym', async () => {
    const calls = stub({
      'POST /api/admin/catalog/translations': () =>
        Response.json({}, { status: 201 }),
      'PATCH /api/admin/catalog/translations/t2': () => Response.json({}),
      'DELETE /api/admin/catalog/translations/t3': () =>
        new Response(null, { status: 204 }),
    });
    renderWithProviders(
      <IngredientEditor
        ingredient={parmesan}
        catalog={catalog}
        onDone={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText('New Synonym (Romanian)'),
      'parmezan tare',
    );
    await user.click(
      screen.getByRole('button', { name: 'Add Romanian Synonym' }),
    );
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/admin/catalog/translations'),
      ).toBeDefined(),
    );
    expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
      entityType: 'ingredient',
      entityId: 'i1',
      locale: 'ro',
      kind: 'synonym',
      value: 'parmezan tare',
    });

    await user.clear(screen.getByLabelText('Name (Romanian)'));
    await user.type(screen.getByLabelText('Name (Romanian)'), 'Parmezan DOP');
    await user.click(
      screen.getByRole('button', { name: 'Save Romanian name' }),
    );
    await vi.waitFor(() =>
      expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
        value: 'Parmezan DOP',
      }),
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove Synonym Parmigiano' }),
    );
    await vi.waitFor(() =>
      expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(true),
    );
  });

  it('explains in the Member language why an Ingredient in use cannot be deleted', async () => {
    stub({
      'DELETE /api/admin/catalog/ingredients/i1': () =>
        Response.json(
          {
            code: 'catalog.ingredient_in_use',
            params: {},
          },
          { status: 409 },
        ),
    });
    renderWithProviders(
      <IngredientEditor
        ingredient={parmesan}
        catalog={catalog}
        onDone={vi.fn()}
      />,
      { locale: 'ro' },
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Șterge' }));
    await user.click(
      screen.getByRole('button', { name: 'Confirmă ștergerea' }),
    );

    expect(
      await screen.findByText(/încă folosit de Loturi sau Articole/),
    ).toBeVisible();
  });

  it('shows the duplicate-name error from the API', async () => {
    stub({
      'POST /api/admin/catalog/ingredients': () =>
        Response.json(
          { code: 'catalog.name_taken', params: {} },
          { status: 409 },
        ),
    });
    renderWithProviders(
      <IngredientEditor catalog={catalog} onDone={vi.fn()} />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Name \(English\)/), 'Parmesan');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(/already used/)).toBeVisible();
  });

  it('focuses a heading when the editor opens', () => {
    stub();
    renderWithProviders(
      <IngredientEditor
        ingredient={parmesan}
        catalog={catalog}
        onDone={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Parmesan' }),
    ).toHaveFocus();
  });

  it('keeps visible button text inside the accessible name', () => {
    stub();
    renderWithProviders(
      <IngredientEditor
        ingredient={parmesan}
        catalog={catalog}
        onDone={vi.fn()}
      />,
    );
    const add = screen.getByRole('button', { name: 'Add Romanian Synonym' });
    expect(add).toHaveTextContent('Add');
    const remove = screen.getByRole('button', {
      name: 'Remove Synonym Parmigiano',
    });
    expect(remove).toHaveTextContent('Remove');
  });
});
