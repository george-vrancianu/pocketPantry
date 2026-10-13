import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import type { AdminRecipe } from '../../../lib/adminRecipes';
import { renderWithProviders, stubApi } from '../../../test/render';
import { RecipeForm } from './RecipeForm';

const catalog: AdminCatalog = {
  aisles: [],
  cuisines: [{ id: 'cu1', name: 'Italian', translations: [] }],
  methods: [{ id: 'me1', name: 'Baking', translations: [] }],
  eatingMoments: [],
  parentCategories: [],
  leafCategories: [],
  ingredients: [
    {
      id: 'i-salt',
      name: 'Salt',
      leafCategoryId: 'l1',
      defaultUnit: 'g',
      pantryBasic: false,
      translations: [],
    },
    {
      id: 'i-milk',
      name: 'Milk',
      leafCategoryId: 'l1',
      defaultUnit: 'ml',
      pantryBasic: false,
      translations: [],
    },
  ],
};

const milk = {
  id: 'i-milk',
  name: 'Milk',
  defaultUnit: 'ml',
  leafCategory: { id: 'l1', name: 'Milk' },
  parentCategory: {
    id: 'p1',
    name: 'Dairy',
    aisle: { id: 'aisle', name: 'Dairy' },
  },
  defaults: { expiryDays: 7, location: 'fridge' },
};

const saved: AdminRecipe = {
  id: 'r1',
  parentId: null,
  title: 'Soup',
  servings: 4,
  prepMinutes: 10,
  cookMinutes: null,
  difficulty: 'easy',
  cuisineId: null,
  methodId: null,
  archived: false,
  lines: [
    {
      id: 'l1',
      ingredientId: 'i-salt',
      quantity: null,
      unit: null,
      optional: false,
      note: null,
    },
    {
      id: 'l2',
      ingredientId: 'i-milk',
      quantity: 500,
      unit: 'ml',
      optional: true,
      note: 'warm',
    },
  ],
  steps: [
    { id: 's1', text: 'Chop', timerSeconds: null },
    { id: 's2', text: 'Simmer', timerSeconds: 600 },
  ],
  tips: [],
  parentTips: null,
  nutritionNote: null,
  pairings: [],
  eatingMoments: [],
  translations: {},
};

describe('RecipeForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a Base Recipe from title, an Ingredient with its default unit, and a Step', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/search': () => Response.json({ results: [milk] }),
      'POST /api/admin/recipes': () => Response.json(saved, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onSaved = vi.fn();
    renderWithProviders(
      <RecipeForm catalog={catalog} onSaved={onSaved} onCancel={vi.fn()} />,
    );
    const user = userEvent.setup();

    expect(
      screen.getByRole('heading', { name: 'New Base Recipe' }),
    ).toHaveFocus();
    await user.type(screen.getByLabelText(/Title \(English\)/), ' Pancakes ');
    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Medium');
    await user.selectOptions(screen.getByLabelText('Cuisine'), 'Italian');
    await user.selectOptions(screen.getByLabelText('Method'), 'Baking');
    await user.type(screen.getByLabelText('Prep (minutes)'), '5');

    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'milk',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    expect(screen.getByLabelText('Unit of Milk')).toHaveValue('ml');
    await user.type(screen.getByLabelText('Quantity of Milk'), '250');
    await user.click(screen.getByLabelText('Optional: Milk'));
    await user.type(screen.getByLabelText('Note for Milk'), 'cold');

    await user.click(screen.getByRole('button', { name: 'Add a Step' }));
    await user.type(screen.getByLabelText('Step 1'), 'Whisk it');
    await user.type(screen.getByLabelText(/Timer for Step 1/), '1.5');
    await user.click(screen.getByRole('button', { name: 'Create Recipe' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
    expect(
      calls.find((c) => c.key === 'POST /api/admin/recipes')?.body,
    ).toEqual({
      title: 'Pancakes',
      servings: 4,
      prepMinutes: 5,
      cookMinutes: null,
      difficulty: 'medium',
      cuisineId: 'cu1',
      methodId: 'me1',
      lines: [
        {
          ingredientId: 'i-milk',
          quantity: 250,
          unit: 'ml',
          optional: true,
          note: 'cold',
        },
      ],
      steps: [{ text: 'Whisk it', timerSeconds: 90 }],
    });
  });

  it('edits a saved Recipe keeping ids, order and "to taste" lines', async () => {
    const { fetchMock, calls } = stubApi({
      'PUT /api/admin/recipes/r1': () => Response.json(saved),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onSaved = vi.fn();
    renderWithProviders(
      <RecipeForm
        recipe={saved}
        catalog={catalog}
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    // The unit of a line without a quantity still shows the Ingredient's default.
    expect(screen.getByLabelText('Unit of Salt')).toHaveValue('g');
    expect(screen.getByLabelText('Timer for Step 2 (minutes)')).toHaveValue(
      '10',
    );
    await user.click(screen.getByRole('button', { name: 'Move Step 2 up' }));
    await user.click(screen.getByRole('button', { name: 'Move Milk up' }));
    await user.click(screen.getByRole('button', { name: 'Remove Step 2' }));
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      key: 'PUT /api/admin/recipes/r1',
      body: {
        lines: [
          { id: 'l2', ingredientId: 'i-milk', quantity: 500, unit: 'ml' },
          {
            id: 'l1',
            ingredientId: 'i-salt',
            quantity: null,
            unit: null,
            optional: false,
          },
        ],
        steps: [{ id: 's2', text: 'Simmer', timerSeconds: 600 }],
      },
    });
  });

  it('blocks a bad quantity and shows the API error for a refused save', async () => {
    const { fetchMock } = stubApi({
      'PUT /api/admin/recipes/r1': () =>
        Response.json(
          { code: 'recipes.parent_archived', params: {} },
          { status: 409 },
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <RecipeForm
        recipe={saved}
        catalog={catalog}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    const quantity = screen.getByLabelText('Quantity of Milk');
    await user.clear(quantity);
    await user.type(quantity, 'lots');
    expect(screen.getByRole('button', { name: 'Save Recipe' })).toBeDisabled();
    expect(screen.getByText(/Quantity must be/)).toBeInTheDocument();

    await user.clear(quantity);
    await user.type(quantity, '1,5');
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /archived, so it cannot get new Variants/,
    );
  });

  it('shows field errors for out-of-range values, blank title and blank Step', async () => {
    vi.stubGlobal('fetch', stubApi({}).fetchMock);
    renderWithProviders(
      <RecipeForm
        recipe={saved}
        catalog={catalog}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const save = screen.getByRole('button', { name: 'Save Recipe' });

    await user.clear(screen.getByLabelText(/Title \(English\)/));
    expect(screen.getByText('Enter a title.')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Title \(English\)/), 'Soup');

    await user.clear(screen.getByLabelText('Step 1'));
    expect(screen.getByText('Enter the Step text.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Step 1'), 'Chop');

    const timer = screen.getByLabelText('Timer for Step 1 (minutes)');
    await user.type(timer, '0.001');
    expect(save).toBeDisabled();
    await user.clear(timer);
    await user.type(timer, '0.0167');
    expect(save).toBeEnabled();
    await user.clear(timer);

    await user.type(screen.getByLabelText('Prep (minutes)'), '100001');
    expect(save).toBeDisabled();
    await user.clear(screen.getByLabelText('Prep (minutes)'));
    const quantity = screen.getByLabelText('Quantity of Milk');
    await user.clear(quantity);
    await user.type(quantity, '1000001');
    expect(save).toBeDisabled();
  });

  it('shows timers in tidy minutes', () => {
    vi.stubGlobal('fetch', stubApi({}).fetchMock);
    renderWithProviders(
      <RecipeForm
        recipe={{
          ...saved,
          steps: [{ id: 's1', text: 'Chop', timerSeconds: 100 }],
        }}
        catalog={catalog}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Timer for Step 1 (minutes)')).toHaveValue(
      '1.67',
    );
  });

  it('warns before removing a saved Step that has Tips', async () => {
    vi.stubGlobal('fetch', stubApi({}).fetchMock);
    renderWithProviders(
      <RecipeForm
        recipe={{
          ...saved,
          tips: [{ id: 't1', stepId: 's1', text: 'Sharp knife' }],
        }}
        catalog={catalog}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Remove Step 2' }));
    expect(screen.queryByLabelText('Step 2')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Remove Step 1' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Removing Step 1 deletes its 1 Tip when you save.',
    );
    expect(screen.getByLabelText('Step 1')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Remove Step and Tips' }),
    );
    expect(screen.queryByLabelText('Step 1')).toBeNull();
  });
});
