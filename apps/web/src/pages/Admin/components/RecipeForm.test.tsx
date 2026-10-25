import { act, waitFor, screen } from '@testing-library/react';
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
  allergens: [],
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
      allergenIds: [],
      allergensReviewPending: false,
      translations: [],
    },
    {
      id: 'i-milk',
      name: 'Milk',
      leafCategoryId: 'l1',
      defaultUnit: 'ml',
      pantryBasic: false,
      allergenIds: [],
      allergensReviewPending: false,
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

  it('searches the shared Catalog only, and offers no Use as typed', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/search': () => Response.json({ results: [milk] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <RecipeForm catalog={catalog} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    const user = userEvent.setup();

    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mi',
    );
    await screen.findByRole('option', { name: /Milk/ });

    expect(screen.queryByRole('option', { name: /as typed/ })).toBeNull();
    const searches = calls.filter((c) => c.key === 'GET /api/catalog/search');
    expect(searches.length).toBeGreaterThan(0);
    for (const call of searches) {
      expect(new URLSearchParams(call.search).get('scope')).toBe('shared');
    }
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
    await user.click(screen.getByRole('button', { name: 'More for Milk' }));
    await user.click(screen.getByRole('switch', { name: 'Optional: Milk' }));
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
    await user.click(screen.getByRole('button', { name: 'More for Milk' }));
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
    // Each typed character re-renders the whole form; only the final value matters here, so paste it.
    const enter = async (field: HTMLElement, text: string) => {
      await user.click(field);
      await user.paste(text);
    };

    await user.clear(screen.getByLabelText(/Title \(English\)/));
    expect(screen.getByText('Enter a title.')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Title \(English\)/), 'Soup');

    await user.clear(screen.getByLabelText('Step 1'));
    expect(screen.getByText('Enter the Step text.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Step 1'), 'Chop');

    const timer = screen.getByLabelText('Timer for Step 1 (minutes)');
    await enter(timer, '0.001');
    expect(save).toBeDisabled();
    await user.clear(timer);
    await enter(timer, '0.0167');
    expect(save).toBeEnabled();
    await user.clear(timer);

    await enter(screen.getByLabelText('Prep (minutes)'), '100001');
    expect(save).toBeDisabled();
    await user.clear(screen.getByLabelText('Prep (minutes)'));
    const quantity = screen.getByLabelText('Quantity of Milk');
    await user.clear(quantity);
    await enter(quantity, '1000001');
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

describe('RecipeForm Browse by aisle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows Browse by aisle, and its Aisle searches stay on the shared Catalog', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/aisles': () =>
        Response.json({
          aisles: [{ id: 'a1', name: 'Dairy & eggs', parentCategories: [] }],
        }),
      'GET /api/catalog/search': () => Response.json({ results: [milk] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <RecipeForm catalog={catalog} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    );
    expect(await screen.findByText('Browse by aisle')).toBeVisible();
    await user.click(
      await screen.findByRole('button', { name: 'Dairy & eggs' }),
    );

    await vi.waitFor(() => {
      const search = calls.filter((c) => c.key === 'GET /api/catalog/search');
      const params = new URLSearchParams(search.at(-1)?.search);
      expect(params.get('aisleId')).toBe('a1');
      expect(params.get('scope')).toBe('shared');
    });
    for (const call of calls.filter(
      (c) => c.key === 'GET /api/catalog/aisles',
    )) {
      expect(new URLSearchParams(call.search).get('scope')).toBe('shared');
    }
  });
});

describe('RecipeForm: no Add to your catalog (#270)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('offers neither the button nor the option when nothing matches', async () => {
    const { fetchMock } = stubApi({
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <RecipeForm catalog={catalog} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'kombucha',
    );

    expect(await screen.findByText('No match for “kombucha”')).toBeVisible();
    expect(screen.queryByText(/to your catalog/)).toBeNull();
    expect(
      screen.queryByRole('button', { name: /to your catalog/ }),
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: /to your catalog/ }),
    ).toBeNull();
  });
});

describe('RecipeForm Ingredient Lines (#589)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const renderSaved = () => {
    const { fetchMock } = stubApi({});
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <RecipeForm
        recipe={saved}
        catalog={catalog}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
  };

  it('shows a row with a subline, opens one strip at a time and moves a line', async () => {
    renderSaved();
    const user = userEvent.setup({ delay: null });
    expect(screen.getByText('optional \u00b7 warm')).toBeVisible();
    const salt = screen.getByRole('button', { name: 'More for Salt' });
    const milk = screen.getByRole('button', { name: 'More for Milk' });
    await user.click(salt);
    expect(salt).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Move Salt up' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await user.click(milk);
    expect(salt).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('button', { name: 'Move Milk down' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', { name: 'Move Milk up' }));
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Milk');
  });

  it('removes a line with Undo that puts it back, and drops the toast after the window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSaved();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'More for Salt' }));
    await user.click(screen.getByRole('button', { name: 'Remove Salt' }));
    expect(screen.queryByLabelText('Quantity of Salt')).toBeNull();
    expect(
      (await screen.findByText('Removed Salt')).closest('[role="status"]'),
    ).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Salt');

    await user.click(screen.getByRole('button', { name: 'More for Salt' }));
    await user.click(screen.getByRole('button', { name: 'Remove Salt' }));
    await screen.findByText('Removed Salt');
    await act(() => vi.advanceTimersByTimeAsync(6000));
    await waitFor(() => expect(screen.queryByText('Removed Salt')).toBeNull());
  });
});
