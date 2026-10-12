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

/** The value paired with a fact label (a `<dl>`: each term is followed by its definition). */
function fact(label: string): HTMLElement {
  const term = screen
    .getAllByRole('term')
    .find((candidate) => candidate.textContent === label);
  if (!term) throw new Error(`No fact labelled ${label}`);
  const definition = term.nextElementSibling as HTMLElement | null;
  if (!definition || definition.tagName !== 'DD')
    throw new Error(`Fact ${label} has no definition`);
  return definition;
}

/** Opens the "More actions" menu on a Family Recipe. */
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'More actions' }));
  return screen.findByRole('menu');
}

describe('RecipeDetailPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the header, ingredients and steps in the Member locale', async () => {
    const calls = setup(recipe({}));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Omelette' }),
    ).toBeInTheDocument();
    expect(calls[0]!.search).toContain('locale=en');
    const ingredients = screen.getByRole('list', { name: 'Ingredients' });
    expect(within(ingredients).getByText(/Egg/)).toBeInTheDocument();
    expect(within(ingredients).getByText(/optional/)).toBeInTheDocument();
    expect(screen.getByText('Whisk the eggs')).toBeInTheDocument();
  });

  it('puts the family pill in the H1 of a Family Recipe', async () => {
    setup(recipe({ owner: 'family' }));
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: /Omelette/,
    });
    expect(within(heading).getByText("Your family's")).toBeInTheDocument();
  });

  describe('Header', () => {
    it('goes back to the list from the Back link, with no Home button or All Recipes link', async () => {
      setup(recipe({}));
      expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/recipes',
      );
      expect(screen.queryByRole('link', { name: 'All Recipes' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Home' })).toBeNull();
    });

    it('offers Make a Variant straight in the header of a Catalog Recipe, with no menu', async () => {
      setup(recipe({}));
      expect(
        await screen.findByRole('link', { name: 'Make a Variant' }),
      ).toHaveAttribute('href', '/recipes/o/variant/new');
      expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    });

    it('offers no header action on an archived Recipe', async () => {
      setup(recipe({ id: 'g', owner: 'family', archived: true }));
      await screen.findByText('This Recipe is archived.');
      expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Make a Variant' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
    });
  });

  describe('Hero', () => {
    it('shows the facts: Time, Serves, Level and Style', async () => {
      setup(recipe({}));
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
      expect(fact('Time')).toHaveTextContent('15 min');
      expect(fact('Serves')).toHaveTextContent('2');
      expect(fact('Level')).toHaveTextContent('Easy');
      expect(fact('Style')).toHaveTextContent('French');
      expect(fact('Style')).toHaveTextContent('Pan frying');
    });

    it('omits the Time fact when neither prep nor cook time is known', async () => {
      setup(recipe({ prepMinutes: null, cookMinutes: null }));
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
      expect(
        screen.queryByRole('term', { name: 'Time' }),
      ).not.toBeInTheDocument();
      expect(fact('Serves')).toBeInTheDocument();
    });

    it('sums prep and cook time when only one is known', async () => {
      setup(recipe({ prepMinutes: null, cookMinutes: 10 }));
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
      expect(fact('Time')).toHaveTextContent('10 min');
    });

    it('updates Serves when the Servings stepper is raised', async () => {
      const user = userEvent.setup();
      setup(recipe({}));
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
      await user.click(screen.getByRole('button', { name: 'More Servings' }));
      expect(fact('Serves')).toHaveTextContent('3');
    });

    it("links a Variant's eyebrow to its Base Recipe", async () => {
      setup(
        recipe({
          id: 'f',
          title: 'Frittata',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
        }),
      );
      expect(
        await screen.findByRole('link', { name: /Variant of Omelette/ }),
      ).toHaveAttribute('href', '/recipes/o');
    });
  });

  it('shows no pill in the title of a Catalog Recipe', async () => {
    setup(recipe({ owner: 'catalog' }));
    const heading = await screen.findByRole('heading', { name: 'Omelette' });
    expect(within(heading).queryByText("Your family's")).toBeNull();
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
    it('offers Make a Variant but not Edit or Delete on a Catalog Recipe', async () => {
      setup(recipe({}));
      await screen.findByRole('link', { name: 'Make a Variant' });
      expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
      expect(screen.queryByRole('menuitem')).toBeNull();
    });

    it("keeps the actions in a menu on the Family's own Recipe", async () => {
      setup(
        recipe({
          id: 'g',
          owner: 'family',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
        }),
      );
      const button = await screen.findByRole('button', {
        name: 'More actions',
      });
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    });

    it("offers Make a Variant, Edit and Delete in the menu of the Family's own Variant", async () => {
      const user = userEvent.setup();
      setup(
        recipe({
          id: 'g',
          owner: 'family',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: false },
        }),
      );
      const menu = await openMenu(user);
      expect(
        within(menu).getByRole('menuitem', { name: 'Make a Variant' }),
      ).toHaveAttribute('href', '/recipes/g/variant/new');
      expect(
        within(menu).getByRole('menuitem', { name: 'Edit' }),
      ).toHaveAttribute('href', '/recipes/g/edit');
      expect(
        within(menu).getByRole('menuitem', { name: 'Delete' }),
      ).toBeInTheDocument();
    });

    it('opens the menu from the keyboard', async () => {
      const user = userEvent.setup();
      setup(recipe({ id: 'g', owner: 'family' }));
      const button = await screen.findByRole('button', {
        name: 'More actions',
      });
      button.focus();
      await user.keyboard('{Enter}');
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Edit' }),
      ).toBeInTheDocument();
    });

    it('closes the menu on Escape', async () => {
      const user = userEvent.setup();
      setup(recipe({ id: 'g', owner: 'family' }));
      await openMenu(user);
      await user.keyboard('{Escape}');
      await vi.waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('closes the menu on a click outside it', async () => {
      const user = userEvent.setup();
      setup(recipe({ id: 'g', owner: 'family' }));
      const menu = await openMenu(user);
      // The invisible layer the menu sits in front of: the first child of the menu's presentation root.
      const outside = menu.closest('[role="presentation"]')!.firstElementChild!;
      await user.click(outside);
      await vi.waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('renders a Family Recipe with a typed-name line, its Pantry status and the menu button', async () => {
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
      expect(
        screen.getByRole('button', { name: 'More actions' }),
      ).toBeInTheDocument();
    });

    it('hides Make a Variant in the menu of a Family standalone Recipe', async () => {
      const user = userEvent.setup();
      setup(recipe({ id: 'g', owner: 'family' }));
      const menu = await openMenu(user);
      expect(
        within(menu).getByRole('menuitem', { name: 'Edit' }),
      ).toBeInTheDocument();
      expect(
        within(menu).queryByRole('menuitem', { name: 'Make a Variant' }),
      ).toBeNull();
    });

    it('hides Make a Variant when the Recipe is archived', async () => {
      setup(recipe({ archived: true }));
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
      expect(screen.queryByRole('link', { name: 'Make a Variant' })).toBeNull();
    });

    it('hides Make a Variant when the Base Recipe is archived', async () => {
      setup(
        recipe({
          id: 'v',
          parentId: 'o',
          base: { id: 'o', title: 'Omelette', archived: true },
        }),
      );
      await screen.findByRole('heading', { level: 1, name: 'Omelette' });
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
      const menu = await openMenu(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
      expect(
        calls.some((call) => call.key === 'POST /api/recipes/g/archive'),
      ).toBe(false);
      await user.click(await screen.findByRole('button', { name: 'Confirm' }));
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
      const menu = await openMenu(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
      await user.click(await screen.findByRole('button', { name: 'Confirm' }));
      expect(await screen.findByText('All recipes page')).toBeInTheDocument();
    });
  });
});
