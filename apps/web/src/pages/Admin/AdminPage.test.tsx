import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { AdminPage } from './AdminPage';

const catalog = {
  aisles: [],
  cuisines: [{ id: 'cu1', name: 'Italian', translations: [] }],
  methods: [{ id: 'me1', name: 'Baking', translations: [] }],
  parentCategories: [],
  leafCategories: [],
  ingredients: [],
};

describe('AdminPage Recipes tab', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists Recipes, Cuisines and Methods, and opens their editors', async () => {
    vi.stubGlobal(
      'fetch',
      stubApi({
        'GET /api/admin/catalog': () => Response.json(catalog),
        'GET /api/admin/recipes': () =>
          Response.json([
            {
              id: 'r1',
              parentId: null,
              title: 'Pizza',
              servings: 4,
              difficulty: null,
              cuisineId: null,
              methodId: null,
              archived: false,
            },
          ]),
      }).fetchMock,
    );
    renderWithProviders(<AdminPage />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Recipes' }));
    expect(
      await screen.findByRole('button', { name: 'Edit Recipe Pizza' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Edit Cuisine Italian' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Cuisine Italian' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(
      screen.getByRole('button', { name: 'Edit Method Baking' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Method Baking' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getByRole('button', { name: 'New Base Recipe' }));
    expect(
      screen.getByRole('heading', { name: 'New Base Recipe' }),
    ).toHaveFocus();
  });
});
