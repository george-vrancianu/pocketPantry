import { fireEvent, screen, within } from '@testing-library/react';
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
  eatingMoments: [
    { id: 'em1', name: 'Breakfast' },
    { id: 'em2', name: 'Lunch' },
  ],
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
  tips: [],
  guidance: {
    nutritionNote: 'Rich in protein',
    pairings: [
      {
        kind: 'drink',
        label: 'Orange juice',
        reason: 'Fresh against the butter',
        principle: null,
        linkedIngredientId: null,
        linkedRecipeId: null,
      },
    ],
    eatingMoments: [
      { eatingMomentId: 'em1', polarity: 'good_for', reason: 'Quick start' },
    ],
  },
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
  nutritionNote: 'Rich in protein',
  pairings: [
    {
      id: 'p1',
      kind: 'drink',
      label: 'Orange juice',
      reason: 'Fresh against the butter',
      principle: null,
      linkedIngredientId: 'i-oj',
      linkedRecipeId: null,
      linkedIngredientName: 'Orange',
      linkedRecipeTitle: null,
    },
    {
      id: 'p2',
      kind: 'food',
      label: 'Toast',
      reason: 'Soaks it up',
      principle: null,
      linkedIngredientId: null,
      linkedRecipeId: 'r-toast',
      linkedIngredientName: null,
      linkedRecipeTitle: 'Buttered toast',
    },
  ],
  eatingMoments: [
    { eatingMomentId: 'em1', polarity: 'good_for', reason: 'Quick start' },
  ],
};

/** The source Recipe's own view, which names the links of a Variant draft. */
const sourceDetail = {
  id: 'x',
  guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
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

  it('prefills from the draft', async () => {
    setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
    });
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Omelette');
    expect(
      screen.getByText(
        /Copied Tips stay with their Steps; add your own after saving the Variant\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity of Egg')).toHaveValue('3');
    expect(screen.getByLabelText('Step 1')).toHaveValue('Whisk the eggs');
    expect(screen.getByLabelText('Timer for step 1 (minutes)')).toHaveValue(
      '1.5',
    );
  });

  it('shows the copied step Tips, keeps them with their step and sends them', async () => {
    const user = userEvent.setup({ delay: null });
    const twoSteps: FamilyRecipeDraft = {
      ...draft,
      steps: [
        { text: 'Whisk the eggs', timerSeconds: null },
        { text: 'Fry', timerSeconds: null },
        { text: 'Plate', timerSeconds: null },
      ],
      tips: [
        { stepIndex: 0, text: 'Room-temperature eggs' },
        { stepIndex: 1, text: 'Medium heat' },
        { stepIndex: 1, text: 'Do not stir' },
        { stepIndex: 2, text: 'Warm plate' },
      ],
    };
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(twoSteps),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    expect(await screen.findByText('Room-temperature eggs')).toBeVisible();
    expect(screen.getByText('Medium heat')).toBeVisible();

    // Reordering moves the Tips with their step.
    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));
    // The step "Plate" and its Tip are dropped together.
    await user.click(screen.getByRole('button', { name: 'Remove step 3' }));
    // Its copied Tip is counted in the warning before anything is dropped.
    expect(
      screen.getByText('Removing step 3 deletes its 1 Tip when you save.'),
    ).toBeVisible();
    expect(screen.getByText('Warm plate')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^Remove step and/ }));
    expect(screen.queryByText('Warm plate')).not.toBeInTheDocument();
    expect(screen.queryByText('Do not stir')).toBeInTheDocument();
    // The Member removes one Tip before saving.
    await user.click(
      screen.getByRole('button', { name: 'Remove Tip 1 of step 1' }),
    );
    expect(screen.queryByText('Medium heat')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save Variant' }));

    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    const post = calls.find((call) => call.key === 'POST /api/recipes')!;
    expect(post.body).toMatchObject({
      steps: [{ text: 'Fry' }, { text: 'Whisk the eggs' }],
      tips: [
        { stepIndex: 0, text: 'Do not stir' },
        { stepIndex: 1, text: 'Room-temperature eggs' },
      ],
    });
  });

  it('saves a Variant under the draft parent and opens it', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    fireEvent.change(await screen.findByLabelText(/^Title/), {
      target: { value: "Grandma's omelette" },
    });
    fireEvent.change(screen.getByLabelText('Cuisine'), {
      target: { value: 'c-fr' },
    });
    fireEvent.change(screen.getByLabelText('Or add an ingredient by name'), {
      target: { value: 'Gran’s herbs' },
    });
    await user.click(screen.getByRole('button', { name: 'Add name' }));
    await user.click(screen.getByRole('button', { name: 'Save Variant' }));

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

  it('shows the draft guidance and posts it with the Variant', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    const note = await screen.findByLabelText('Nutrition Note');
    expect(note).toHaveValue('Rich in protein');
    expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue(
      'Orange juice',
    );
    expect(await screen.findByLabelText('Reason for Breakfast')).toHaveValue(
      'Quick start',
    );
    // Breakfast is used already; only Lunch is left to add.
    const pick = screen.getByLabelText('Add an Eating Moment');
    expect(
      within(pick).queryByRole('option', { name: 'Breakfast' }),
    ).toBeNull();
    await user.selectOptions(pick, 'em2');
    expect(await screen.findByLabelText('Reason for Lunch')).toBeVisible();

    await user.clear(note);
    await user.type(note, 'Light');
    await user.click(screen.getByRole('button', { name: 'Save Variant' }));
    await vi.waitFor(() =>
      expect(
        calls.find((call) => call.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        guidance: {
          nutritionNote: 'Light',
          pairings: [{ kind: 'drink', label: 'Orange juice' }],
          eatingMoments: [
            {
              eatingMomentId: 'em1',
              polarity: 'good_for',
              reason: 'Quick start',
            },
            { eatingMomentId: 'em2', polarity: 'good_for', reason: null },
          ],
        },
      }),
    );
  });

  it('names the draft Pairing links from the source Recipe', async () => {
    const linked = {
      ...draft,
      guidance: {
        ...draft.guidance,
        pairings: [
          { ...draft.guidance.pairings[0]!, linkedIngredientId: 'i-oj' },
          {
            ...draft.guidance.pairings[0]!,
            label: 'Toast',
            linkedRecipeId: 'r-toast',
          },
        ],
      },
    };
    setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(linked),
      'GET /api/recipes/x': () =>
        Response.json({
          ...sourceDetail,
          guidance: {
            ...sourceDetail.guidance,
            pairings: [
              {
                link: { type: 'ingredient', id: 'i-oj', name: 'Orange' },
              },
              {
                link: {
                  type: 'recipe',
                  id: 'r-toast',
                  title: 'Buttered toast',
                },
              },
            ],
          },
        }),
    });
    expect(
      await screen.findByText('Linked Ingredient: Orange'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'Buttered toast' }),
    ).toBeInTheDocument();
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
      await screen.findByRole('button', { name: 'Save Variant' }),
    ).toBeDisabled();
  });
});

describe('EditFamilyRecipePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('saves the edited document keeping line and Step ids', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'PUT /api/recipes/g': () => Response.json(saved),
    });
    const title = await screen.findByLabelText(/^Title/);
    fireEvent.change(title, { target: { value: 'Better omelette' } });
    // Unsaved guidance edits must survive the document save.
    fireEvent.change(screen.getByLabelText('Nutrition Note'), {
      target: { value: 'Still here' },
    });
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByText('Recipe saved.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nutrition Note')).toHaveValue('Still here');
    expect(
      screen.getByRole('link', { name: 'View the Recipe' }),
    ).toHaveAttribute('href', '/recipes/g');
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

  it('says an archived Recipe cannot be edited', async () => {
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () =>
        Response.json({ ...saved, archived: true }),
    });
    expect(
      await screen.findByText('This Recipe cannot be edited.'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Title/)).toBeNull();
  });

  it('sends no unit when a Catalog line has its quantity cleared', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'PUT /api/recipes/g': () => Response.json(saved),
    });
    await user.clear(await screen.findByLabelText('Quantity of Egg'));
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/recipes/g')?.body,
      ).toMatchObject({
        lines: [{ id: 'l1', quantity: null, unit: null }, {}],
      }),
    );
  });

  it('saves guidance on its own, keeping Pairing ids and Eating Moments', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'PUT /api/recipes/g/guidance': () => Response.json(saved),
    });
    const note = await screen.findByLabelText('Nutrition Note');
    await user.clear(note);
    await user.type(note, 'Light');
    expect(await screen.findByLabelText('Reason for Breakfast')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save guidance' }));
    expect(await screen.findByText('Guidance saved.')).toBeInTheDocument();
    const put = calls.find((c) => c.key === 'PUT /api/recipes/g/guidance')!;
    expect(put.search).toContain('locale=en');
    expect(put.body).toEqual({
      nutritionNote: 'Light',
      pairings: [
        {
          id: 'p1',
          kind: 'drink',
          label: 'Orange juice',
          reason: 'Fresh against the butter',
          principle: null,
          linkedIngredientId: 'i-oj',
          linkedRecipeId: null,
        },
        {
          id: 'p2',
          kind: 'food',
          label: 'Toast',
          reason: 'Soaks it up',
          principle: null,
          linkedIngredientId: null,
          linkedRecipeId: 'r-toast',
        },
      ],
      eatingMoments: [
        { eatingMomentId: 'em1', polarity: 'good_for', reason: 'Quick start' },
      ],
    });
    // The document save does not carry guidance.
    expect(calls.some((c) => c.key === 'PUT /api/recipes/g')).toBe(false);
  });

  it('names the linked Ingredient and Recipe of saved Pairings', async () => {
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
    });
    expect(
      await screen.findByText('Linked Ingredient: Orange'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'Buttered toast' }),
    ).toBeInTheDocument();
  });

  it('links a Pairing to a Recipe found by search', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'GET /api/recipes': () =>
        Response.json({
          recipes: [
            {
              id: 'r9',
              title: 'Pancakes',
              parentId: null,
              base: null,
              cuisine: null,
              method: null,
              variantCount: 0,
              servings: 4,
              prepMinutes: null,
              cookMinutes: null,
              difficulty: null,
              owner: 'catalog',
            },
          ],
        }),
      'PUT /api/recipes/g/guidance': () => Response.json(saved),
    });
    await user.selectOptions(
      await screen.findByLabelText('Link of Pairing 1'),
      'recipe',
    );
    await user.selectOptions(
      await screen.findByLabelText('Linked Recipe of Pairing 1'),
      'r9',
    );
    await user.click(screen.getByRole('button', { name: 'Save guidance' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/recipes/g/guidance')?.body,
      ).toMatchObject({
        pairings: [
          { id: 'p1', linkedRecipeId: 'r9', linkedIngredientId: null },
          { id: 'p2', linkedRecipeId: 'r-toast' },
        ],
      }),
    );
  });

  it('adds a Tip and hides an inherited one straight away', async () => {
    const user = userEvent.setup({ delay: null });
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
