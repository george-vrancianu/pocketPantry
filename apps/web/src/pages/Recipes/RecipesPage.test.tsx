import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RecipeListItem } from '../../lib/recipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { RecipesPage } from './RecipesPage';

const item = (over: Partial<RecipeListItem>): RecipeListItem => ({
  id: 'r',
  title: 'Recipe',
  parentId: null,
  base: null,
  cuisine: null,
  method: null,
  variantCount: 0,
  servings: 2,
  prepMinutes: 10,
  cookMinutes: 20,
  difficulty: 'easy',
  owner: 'catalog',
  ...over,
});

const omelette = item({ id: 'o', title: 'Omelette', variantCount: 3 });
const frittata = item({
  id: 'f',
  title: 'Frittata',
  parentId: 'o',
  base: { id: 'o', title: 'Omelette' },
  cuisine: { id: 'c-it', name: 'Italian' },
});
const filters = {
  cuisines: [{ id: 'c-it', name: 'Italian' }],
  methods: [{ id: 'm-bake', name: 'Baking' }],
};

function setup(list: (url: URL) => RecipeListItem[]) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes': (url) => Response.json({ recipes: list(url) }),
    'GET /api/recipes/filters': () => Response.json(filters),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/:id" element={<p>detail page</p>} />
    </Routes>,
    { route: '/recipes' },
  );
  return calls;
}

describe('RecipesPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lists Base Recipes with their pluralised Variant counts', async () => {
    setup(() => [omelette, item({ id: 's', title: 'Soup', variantCount: 1 })]);
    expect(await screen.findByText('Omelette')).toBeInTheDocument();
    expect(screen.getByText('3 variants')).toBeInTheDocument();
    expect(screen.getByText('1 variant')).toBeInTheDocument();
  });

  it('opens a Recipe when tapped', async () => {
    setup(() => [omelette]);
    await userEvent.click(
      await screen.findByRole('link', { name: /Omelette/ }),
    );
    expect(screen.getByText('detail page')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    setup(() => []);
    expect(await screen.findByText('No recipes yet.')).toBeInTheDocument();
  });

  it('shows an error when the list fails to load', async () => {
    const { fetchMock } = stubApi({
      'GET /api/recipes/filters': () => Response.json(filters),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<RecipesPage />, { route: '/recipes' });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('searches and filters, labelling Variants with their base', async () => {
    const calls = setup((url) =>
      url.searchParams.has('cuisineId') || url.searchParams.has('search')
        ? [frittata]
        : [omelette],
    );
    const user = userEvent.setup();
    await screen.findByText('Omelette');

    await user.selectOptions(screen.getByLabelText('Cuisine'), 'Italian');
    expect(await screen.findByText('variant of Omelette')).toBeInTheDocument();
    const last = calls.filter((c) => c.key === 'GET /api/recipes').at(-1)!;
    expect(last.search).toContain('cuisineId=c-it');
    expect(last.search).toContain('locale=en');

    await user.selectOptions(screen.getByLabelText('Method'), 'Baking');
    await vi.waitFor(() => {
      const next = calls.filter((c) => c.key === 'GET /api/recipes').at(-1)!;
      expect(next.search).toContain('methodId=m-bake');
    });
  });

  it('sends the search text after a pause', async () => {
    const calls = setup(() => [omelette]);
    await screen.findByText('Omelette');
    await userEvent.type(screen.getByLabelText('Search recipes'), 'frit');
    await vi.waitFor(() => {
      const last = calls.filter((c) => c.key === 'GET /api/recipes').at(-1)!;
      expect(last.search).toContain('search=frit');
    });
    const requests = calls.filter((c) => c.key === 'GET /api/recipes');
    expect(requests.some((c) => c.search.includes('search=f&'))).toBe(false);
  });

  it('badges a Family Recipe', async () => {
    setup(() => [item({ id: 'x', title: 'Gran stew', owner: 'family' })]);
    const card = (await screen.findByText('Gran stew')).closest('li')!;
    expect(within(card).getByText("Your family's")).toBeInTheDocument();
  });
});
