import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function setup(
  detail: RecipeDetail,
  route = `/recipes/${detail.id}`,
  extra: Parameters<typeof stubApi>[0] = {},
) {
  const { fetchMock, calls } = stubApi({
    [`GET /api/recipes/${detail.id}`]: () => Response.json(detail),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes" element={<p>All recipes page</p>} />
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
      await screen.findByText('This Recipe is archived.'),
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

  it("marks the Family's own Variants under their base", async () => {
    setup(
      recipe({
        variants: [
          {
            id: 'f',
            title: 'Frittata',
            cuisine: null,
            method: null,
            owner: 'catalog',
          },
          {
            id: 'g',
            title: "Grandma's omelette",
            cuisine: null,
            method: null,
            owner: 'family',
          },
        ],
      }),
    );
    const section = (
      await screen.findByRole('heading', { name: 'Variants' })
    ).closest('section')!;
    const own = within(section).getByRole('link', {
      name: "Grandma's omelette",
    });
    expect(own.closest('li')!).toHaveTextContent("Your family's");
    expect(
      within(
        within(section).getByRole('link', { name: 'Frittata' }).closest('li')!,
      ).queryByText("Your family's"),
    ).toBeNull();
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
      name: /Variant of Omelette/,
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
      'This Recipe could not be found.',
    );
  });

  describe('Family actions', () => {
    it('offers Make a variant on a Catalog Recipe but not Edit or Delete', async () => {
      setup(recipe({}));
      const make = await screen.findByRole('link', { name: 'Make a Variant' });
      expect(make).toHaveAttribute('href', '/recipes/o/variant/new');
      expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    });

    it("offers Edit, Delete and Make a variant on the Family's own Recipe", async () => {
      setup(
        recipe({
          id: 'g',
          owner: 'family',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
        }),
      );
      expect(await screen.findByRole('link', { name: 'Edit' })).toHaveAttribute(
        'href',
        '/recipes/g/edit',
      );
      expect(
        screen.getByRole('link', { name: 'Make a Variant' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete' }),
      ).toBeInTheDocument();
    });

    it('offers no Edit or Delete on an archived own Recipe', async () => {
      setup(recipe({ id: 'g', owner: 'family', archived: true }));
      await screen.findByText('This Recipe is archived.');
      expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    });

    it('renders a Family Recipe with a typed-name line, its Pantry status and the actions', async () => {
      setup(
        recipe({
          id: 'g',
          owner: 'family',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
          lines: [
            {
              id: 'l9',
              ingredientId: null,
              ingredientName: 'Gran’s herbs',
              quantity: null,
              unit: null,
              optional: false,
              note: null,
            },
          ],
        }),
        '/recipes/g',
        {
          'GET /api/recipes/g/pantry-match': () =>
            Response.json({
              servings: 2,
              canMake: false,
              shortOrMissingCount: 1,
              expiringCoveredCount: 0,
              coverageRatio: 0,
              lines: [
                {
                  lineId: 'l9',
                  ingredientId: null,
                  name: 'Gran’s herbs',
                  status: 'missing',
                  optional: false,
                  pantryBasic: false,
                  quantity: null,
                  unit: null,
                  shortfall: null,
                  usesExpiringSoon: false,
                  onShoppingList: false,
                },
              ],
            }),
        },
      );
      const list = await screen.findByRole('list', { name: 'Ingredients' });
      const row = within(list)
        .getByText(/Gran’s herbs/)
        .closest('li')!;
      expect(await within(row).findByText('Missing')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Make a Variant' }),
      ).toBeInTheDocument();
    });

    it('hides Make a variant on a Family standalone Recipe', async () => {
      setup(recipe({ id: 'g', owner: 'family' }));
      await screen.findByRole('link', { name: 'Edit' });
      expect(screen.queryByRole('link', { name: 'Make a Variant' })).toBeNull();
    });

    it('hides Make a variant when the Recipe or its base is archived', async () => {
      setup(recipe({ archived: true }));
      await screen.findByRole('heading', { name: 'Omelette' });
      expect(screen.queryByRole('link', { name: 'Make a Variant' })).toBeNull();
    });

    it('hides Make a variant when the base is archived', async () => {
      setup(
        recipe({
          id: 'v',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: true },
        }),
      );
      await screen.findByRole('heading', { name: 'Omelette' });
      expect(screen.queryByRole('link', { name: 'Make a Variant' })).toBeNull();
    });

    it('archives after a confirm and goes back to the base', async () => {
      const user = userEvent.setup();
      const calls = setup(
        recipe({
          id: 'g',
          owner: 'family',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
        }),
        '/recipes/g',
        {
          'POST /api/recipes/g/archive': () => Response.json({ id: 'g' }),
          'GET /api/recipes/o': () =>
            Response.json(recipe({ id: 'o', title: 'Omelette' })),
        },
      );
      await user.click(await screen.findByRole('button', { name: 'Delete' }));
      expect(
        calls.some((call) => call.key === 'POST /api/recipes/g/archive'),
      ).toBe(false);
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      await vi.waitFor(() =>
        expect(
          screen.getByRole('link', { name: 'Make a Variant' }),
        ).toHaveAttribute('href', '/recipes/o/variant/new'),
      );
      expect(calls.map((call) => call.key)).toContain(
        'POST /api/recipes/g/archive',
      );
    });

    it('goes to the list after deleting a standalone Family Recipe', async () => {
      const user = userEvent.setup();
      setup(recipe({ id: 'g', owner: 'family' }), '/recipes/g', {
        'POST /api/recipes/g/archive': () => Response.json({ id: 'g' }),
      });
      await user.click(await screen.findByRole('button', { name: 'Delete' }));
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(await screen.findByText('All recipes page')).toBeInTheDocument();
    });
  });
});
