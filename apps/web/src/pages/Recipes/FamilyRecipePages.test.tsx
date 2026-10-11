import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  FamilyRecipeDraft,
  FamilyRecipeEdit,
} from '../../lib/familyRecipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { EditFamilyRecipePage, NewVariantPage } from './FamilyRecipePages';

const filters = {
  cuisines: [{ id: 'c-fr', name: 'French' }],
  methods: [{ id: 'm-pan', name: 'Pan frying' }],
};

const draft: FamilyRecipeDraft = {
  parentId: 'base',
  title: 'Omelette',
  servings: 2,
  prepMinutes: 5,
  cookMinutes: null,
  difficulty: 'easy',
  cuisineId: null,
  methodId: null,
  lines: [
    {
      ingredientId: 'egg',
      rawName: null,
      ingredientName: 'Egg',
      quantity: 3,
      unit: 'pcs',
      optional: false,
      note: null,
    },
  ],
  steps: [{ text: 'Whisk the eggs', timerSeconds: 90 }],
};

const saved: FamilyRecipeEdit = {
  id: 'g',
  parentId: 'base',
  title: "Grandma's omelette",
  servings: 2,
  prepMinutes: 5,
  cookMinutes: null,
  difficulty: 'easy',
  cuisineId: null,
  methodId: null,
  archived: false,
  lines: [
    {
      id: 'l1',
      ingredientId: 'egg',
      rawName: null,
      ingredientName: 'Egg',
      quantity: 3,
      unit: 'pcs',
      optional: false,
      note: null,
    },
    {
      id: 'l2',
      ingredientId: null,
      rawName: 'Gran’s herbs',
      ingredientName: 'Gran’s herbs',
      quantity: null,
      unit: null,
      optional: false,
      note: null,
    },
  ],
  steps: [{ id: 's1', text: 'Whisk the eggs', timerSeconds: 90 }],
  tips: [{ id: 't1', stepId: null, text: 'Use butter' }],
  parentTips: [
    { id: 'bt1', stepId: null, text: 'Nonstick pan', hidden: false },
  ],
};

function setup(route: string, routes: Parameters<typeof stubApi>[0]) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes/filters': () => Response.json(filters),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes/:id/variant/new" element={<NewVariantPage />} />
      <Route path="/recipes/:id/edit" element={<EditFamilyRecipePage />} />
      <Route path="/recipes/:id" element={<p>Detail of the recipe</p>} />
    </Routes>,
    { route },
  );
  return calls;
}

describe('NewVariantPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prefills from the draft and saves a Variant under the draft parent', async () => {
    const user = userEvent.setup();
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    const title = await screen.findByLabelText(/^Title/);
    expect(title).toHaveValue('Omelette');
    expect(screen.getByLabelText('Quantity of Egg')).toHaveValue('3');
    expect(screen.getByLabelText('Step 1')).toHaveValue('Whisk the eggs');
    expect(screen.getByLabelText('Timer for step 1 (minutes)')).toHaveValue(
      '1.5',
    );

    await user.clear(title);
    await user.type(title, "Grandma's omelette");
    await user.selectOptions(screen.getByLabelText('Cuisine'), 'c-fr');
    await user.type(
      screen.getByLabelText('Or add an ingredient by name'),
      'Gran’s herbs',
    );
    await user.click(screen.getByRole('button', { name: 'Add name' }));
    await user.click(screen.getByRole('button', { name: 'Save variant' }));

    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    const post = calls.find((call) => call.key === 'POST /api/recipes')!;
    expect(post.body).toMatchObject({
      parentId: 'base',
      locale: 'en',
      title: "Grandma's omelette",
      cuisineId: 'c-fr',
      lines: [
        { ingredientId: 'egg', rawName: null, quantity: 3, unit: 'pcs' },
        { ingredientId: null, rawName: 'Gran’s herbs', quantity: null },
      ],
      steps: [{ text: 'Whisk the eggs', timerSeconds: 90 }],
    });
  });

  it('shows a coded error in the Member locale', async () => {
    setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () =>
        Response.json(
          { code: 'recipes.parent_archived', params: {} },
          { status: 409 },
        ),
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This Base Recipe is archived, so it cannot get new Variants.',
    );
  });

  it('blocks saving without a title', async () => {
    setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () =>
        Response.json({ ...draft, title: '' }),
    });
    expect(
      await screen.findByRole('button', { name: 'Save variant' }),
    ).toBeDisabled();
  });
});

describe('EditFamilyRecipePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('saves the edited document keeping line and Step ids', async () => {
    const user = userEvent.setup();
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'PUT /api/recipes/g': () => Response.json(saved),
    });
    const title = await screen.findByLabelText(/^Title/);
    await user.clear(title);
    await user.type(title, 'Better omelette');
    await user.click(screen.getByRole('button', { name: 'Save recipe' }));
    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    const put = calls.find((call) => call.key === 'PUT /api/recipes/g')!;
    expect(put.body).toMatchObject({
      title: 'Better omelette',
      locale: 'en',
      lines: [
        { id: 'l1', ingredientId: 'egg', rawName: null },
        { id: 'l2', ingredientId: null, rawName: 'Gran’s herbs' },
      ],
      steps: [{ id: 's1' }],
    });
  });

  it('adds a Tip and hides an inherited one straight away', async () => {
    const user = userEvent.setup();
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'POST /api/recipes/g/tips': () => Response.json(saved, { status: 201 }),
      'PUT /api/recipes/g/hidden-tips': () => Response.json(saved),
    });
    await screen.findByLabelText(/^Title/);
    const tips = screen.getByRole('region', { name: 'Tips' });
    await user.type(within(tips).getByLabelText('New Tip'), 'Rest it');
    await user.click(
      within(tips).getAllByRole('button', { name: 'Add Tip' })[0]!,
    );
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes/g/tips')?.body,
      ).toEqual({ text: 'Rest it', stepId: null }),
    );
    await user.click(
      within(tips).getByRole('checkbox', { name: 'Show: Nonstick pan' }),
    );
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/recipes/g/hidden-tips')?.body,
      ).toEqual({ tipIds: ['bt1'] }),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/recipes/g/tips')!.search,
    ).toContain('locale=en');
  });
});
