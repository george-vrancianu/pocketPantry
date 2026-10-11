import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RecipeDetail } from '../../lib/recipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { RecipeDetailPage } from './RecipeDetailPage';

const entry = (
  id: string,
  ingredientName: string,
  quantity: number | null = null,
  unit: 'g' | 'ml' | null = null,
) => ({ id, ingredientName, quantity, unit });

const recipe = (over: Partial<RecipeDetail>): RecipeDetail => ({
  id: 'o',
  parentId: null,
  owner: 'catalog',
  title: 'Omelette',
  servings: 2,
  prepMinutes: 5,
  cookMinutes: 10,
  difficulty: 'easy',
  cuisine: { id: 'c-fr', name: 'French' },
  method: { id: 'm-pan', name: 'Pan frying' },
  archived: false,
  lines: [
    {
      id: 'l1',
      ingredientId: 'egg',
      ingredientName: 'Egg',
      quantity: 3,
      unit: 'pcs',
      optional: false,
      note: null,
    },
    {
      id: 'l2',
      ingredientId: 'chive',
      ingredientName: 'Chives',
      quantity: null,
      unit: null,
      optional: true,
      note: 'chopped',
    },
  ],
  steps: [
    { id: 's1', text: 'Whisk the eggs', timerSeconds: null },
    { id: 's2', text: 'Fry gently', timerSeconds: 90 },
  ],
  tips: [],
  base: null,
  variants: [],
  diff: null,
  guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
  ...over,
});

function setup(detail: RecipeDetail, route = `/recipes/${detail.id}`) {
  const { fetchMock, calls } = stubApi({
    [`GET /api/recipes/${detail.id}`]: () => Response.json(detail),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes/:id" element={<RecipeDetailPage />} />
    </Routes>,
    { route },
  );
  return calls;
}

describe('RecipeDetailPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the header, ingredients and steps in the Member locale', async () => {
    const calls = setup(recipe({}));
    expect(
      await screen.findByRole('heading', { name: 'Omelette' }),
    ).toBeInTheDocument();
    expect(calls[0]!.search).toContain('locale=en');
    expect(screen.getByText(/French/)).toBeInTheDocument();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
    const ingredients = screen.getByRole('list', { name: 'Ingredients' });
    expect(within(ingredients).getByText(/Egg/)).toBeInTheDocument();
    expect(within(ingredients).getByText(/optional/)).toBeInTheDocument();
    expect(screen.getByText('Whisk the eggs')).toBeInTheDocument();
  });

  it('notes an archived Recipe', async () => {
    setup(recipe({ archived: true }));
    expect(
      await screen.findByText('This recipe is archived.'),
    ).toBeInTheDocument();
  });

  it("lists a base Recipe's Variants with Cuisine and Method, linking through", async () => {
    setup(
      recipe({
        variants: [
          {
            id: 'f',
            title: 'Frittata',
            cuisine: { id: 'c-it', name: 'Italian' },
            method: { id: 'm-bake', name: 'Baking' },
            owner: 'catalog',
          },
        ],
      }),
    );
    const section = (
      await screen.findByRole('heading', { name: 'Variants' })
    ).closest('section')!;
    expect(
      within(section).getByRole('link', { name: 'Frittata' }),
    ).toHaveAttribute('href', '/recipes/f');
    expect(within(section).getByText(/Italian/)).toBeInTheDocument();
    expect(within(section).getByText(/Baking/)).toBeInTheDocument();
  });

  it("shows a Variant's base link and What's different", async () => {
    setup(
      recipe({
        id: 'f',
        title: 'Frittata',
        parentId: 'o',
        base: { id: 'o', title: 'Omelette', archived: false },
        diff: {
          added: [entry('a1', 'Feta', 100, 'g')],
          removed: [entry('r1', 'Butter', 20, 'g')],
          swapped: [
            { from: entry('w1', 'Chives', 5, 'ml'), to: entry('w2', 'Dill') },
          ],
        },
      }),
    );
    const back = await screen.findByRole('link', {
      name: /variant of Omelette/,
    });
    expect(back).toHaveAttribute('href', '/recipes/o');
    const section = screen
      .getByRole('heading', { name: "What's different" })
      .closest('section')!;
    const added = within(section).getByRole('list', { name: 'Added' });
    expect(within(added).getByText('Feta 100 g')).toBeInTheDocument();
    const removed = within(section).getByRole('list', { name: 'Removed' });
    expect(within(removed).getByText('Butter 20 g')).toBeInTheDocument();
    const swapped = within(section).getByRole('list', { name: 'Swapped' });
    expect(
      within(swapped).getByText('Chives 5 ml to Dill'),
    ).toBeInTheDocument();
    // A Variant has no Variants section.
    expect(screen.queryByRole('heading', { name: 'Variants' })).toBeNull();
  });

  it("omits What's different on a base Recipe", async () => {
    setup(recipe({}));
    await screen.findByRole('heading', { name: 'Omelette' });
    expect(
      screen.queryByRole('heading', { name: "What's different" }),
    ).toBeNull();
  });

  it('shows own and inherited Tips in the Tips section and step Tips on their step', async () => {
    setup(
      recipe({
        tips: [
          {
            id: 't1',
            stepId: null,
            text: 'Use a nonstick pan',
            inherited: true,
          },
          { id: 't2', stepId: null, text: 'Salt at the end', inherited: false },
          {
            id: 't3',
            stepId: 's2',
            text: 'Keep the heat low',
            inherited: false,
          },
        ],
      }),
    );
    const tips = (await screen.findByRole('heading', { name: 'Tips' })).closest(
      'section',
    )!;
    expect(within(tips).getByText('Use a nonstick pan')).toBeInTheDocument();
    expect(within(tips).getByText('Salt at the end')).toBeInTheDocument();
    expect(within(tips).getAllByText(/from the Base Recipe/)).toHaveLength(1);
    expect(within(tips).queryByText('Keep the heat low')).toBeNull();
    const step = screen.getByText('Fry gently').closest('li')!;
    expect(within(step).getByText('Keep the heat low')).toBeInTheDocument();
    const firstStep = screen.getByText('Whisk the eggs').closest('li')!;
    expect(within(firstStep).queryByText('Keep the heat low')).toBeNull();
  });

  it('places guidance after Tips and before Variants', async () => {
    setup(
      recipe({
        tips: [{ id: 't1', stepId: null, text: 'Salt', inherited: false }],
        guidance: {
          nutritionNote: 'Rich in fat.',
          pairings: [],
          eatingMoments: [],
        },
      }),
    );
    const tips = await screen.findByRole('heading', { name: 'Tips' });
    const nutrition = screen.getByRole('heading', { name: 'Nutrition' });
    const variants = screen.getByRole('heading', { name: 'Variants' });
    const follows = (a: Node, b: Node) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(tips, nutrition)).toBe(true);
    expect(follows(nutrition, variants)).toBe(true);
  });

  it('omits the Tips section when there are no Recipe-level Tips', async () => {
    setup(recipe({}));
    await screen.findByRole('heading', { name: 'Omelette' });
    expect(screen.queryByRole('heading', { name: 'Tips' })).toBeNull();
  });

  it('shows a message when the Recipe is not found', async () => {
    const { fetchMock } = stubApi({});
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/nope' },
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This recipe could not be found.',
    );
  });
});
