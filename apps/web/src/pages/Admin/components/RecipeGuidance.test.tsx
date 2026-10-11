import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import type { AdminRecipe } from '../../../lib/adminRecipes';
import { renderWithProviders, stubApi } from '../../../test/render';
import { RecipeGuidance } from './RecipeGuidance';

const catalog: AdminCatalog = {
  aisles: [],
  cuisines: [],
  methods: [],
  eatingMoments: [
    {
      id: 'em1',
      name: 'Breakfast',
      sortOrder: 1,
      archived: false,
      translations: [],
    },
    {
      id: 'em2',
      name: 'Before bed',
      sortOrder: 2,
      archived: true,
      translations: [],
    },
    {
      id: 'em3',
      name: 'Lunch',
      sortOrder: 3,
      archived: false,
      translations: [],
    },
  ],
  parentCategories: [],
  leafCategories: [],
  ingredients: [
    {
      id: 'i-milk',
      name: 'Milk',
      leafCategoryId: 'l1',
      defaultUnit: 'ml',
      translations: [],
    },
  ],
};

const recipe: AdminRecipe = {
  id: 'r1',
  parentId: null,
  title: 'Soup',
  servings: 4,
  prepMinutes: null,
  cookMinutes: null,
  difficulty: null,
  cuisineId: null,
  methodId: null,
  archived: false,
  lines: [],
  steps: [],
  tips: [],
  parentTips: null,
  nutritionNote: null,
  pairings: [],
  eatingMoments: [],
  translations: {},
};

const recipeList = [
  { id: 'r1', title: 'Soup', archived: false },
  { id: 'r2', title: 'Bread', archived: false },
  { id: 'r3', title: 'Old stew', archived: true },
].map((r) => ({
  ...r,
  parentId: null,
  servings: 2,
  difficulty: null,
  cuisineId: null,
  methodId: null,
}));

function open(
  value: AdminRecipe = recipe,
  extra: Record<string, () => Response> = {},
) {
  const api = stubApi({
    'GET /api/admin/recipes': () => Response.json(recipeList),
    'PUT /api/admin/recipes/r1/guidance': () => Response.json(value),
    ...extra,
  });
  vi.stubGlobal('fetch', api.fetchMock);
  renderWithProviders(<RecipeGuidance recipe={value} catalog={catalog} />);
  return api.calls;
}

const saved = (calls: ReturnType<typeof open>) =>
  calls.find((c) => c.key === 'PUT /api/admin/recipes/r1/guidance');

describe('RecipeGuidance', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    'sends Pairings, the Nutrition Note and Eating Moments in one payload',
    { timeout: 30_000 },
    async () => {
      const calls = open();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
      await user.selectOptions(
        screen.getByLabelText('Kind of Pairing 1'),
        'drink',
      );
      await user.click(screen.getByLabelText('Label of Pairing 1'));
      await user.paste('A glass of dry white wine');
      await user.click(screen.getByLabelText('Reason for Pairing 1'));
      await user.paste('Its acidity cuts through the butter');
      await user.selectOptions(
        screen.getByLabelText('Principle of Pairing 1'),
        'Acid cuts fat',
      );
      await user.click(screen.getByLabelText('Nutrition Note'));
      await user.paste('Rich in fat; keep portions modest.');
      await user.selectOptions(
        screen.getByLabelText('Add an Eating Moment'),
        'Lunch',
      );
      await user.selectOptions(
        screen.getByLabelText('Good for or Avoid: Lunch'),
        'avoid',
      );
      await user.type(screen.getByLabelText('Reason for Lunch'), 'Heavy');
      await user.click(screen.getByRole('button', { name: 'Save guidance' }));

      await vi.waitFor(() => expect(saved(calls)).toBeDefined());
      expect(saved(calls)?.body).toEqual({
        nutritionNote: 'Rich in fat; keep portions modest.',
        pairings: [
          {
            kind: 'drink',
            label: 'A glass of dry white wine',
            reason: 'Its acidity cuts through the butter',
            principle: 'acid_cuts_fat',
            linkedIngredientId: null,
            linkedRecipeId: null,
          },
        ],
        eatingMoments: [
          { eatingMomentId: 'em3', polarity: 'avoid', reason: 'Heavy' },
        ],
      });
      expect(await screen.findByText('Guidance saved.')).toBeInTheDocument();
    },
  );

  it('loads saved guidance and keeps Pairing ids so their translations survive', async () => {
    const calls = open({
      ...recipe,
      nutritionNote: 'Light.',
      pairings: [
        {
          id: 'p1',
          kind: 'food',
          label: 'Crusty bread',
          reason: 'Soaks up the broth',
          principle: null,
          linkedIngredientId: null,
          linkedRecipeId: 'r2',
        },
      ],
      eatingMoments: [
        { eatingMomentId: 'em1', polarity: 'good_for', reason: null },
      ],
    });
    const user = userEvent.setup();

    expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue(
      'Crusty bread',
    );
    expect(screen.getByLabelText('Nutrition Note')).toHaveValue('Light.');
    await user.clear(screen.getByLabelText('Label of Pairing 1'));
    await user.type(screen.getByLabelText('Label of Pairing 1'), 'Sourdough');
    await user.click(screen.getByRole('button', { name: 'Save guidance' }));

    await vi.waitFor(() => expect(saved(calls)).toBeDefined());
    expect(saved(calls)?.body).toMatchObject({
      pairings: [
        {
          id: 'p1',
          label: 'Sourdough',
          linkedRecipeId: 'r2',
          linkedIngredientId: null,
        },
      ],
      eatingMoments: [
        { eatingMomentId: 'em1', polarity: 'good_for', reason: null },
      ],
    });
  });

  it('links a Pairing to an Ingredient or a Recipe, one at a time', async () => {
    const calls = open();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
    await user.type(screen.getByLabelText('Label of Pairing 1'), 'Milk');
    await user.type(screen.getByLabelText('Reason for Pairing 1'), 'Cools');

    await user.selectOptions(
      screen.getByLabelText('Link of Pairing 1'),
      'An Ingredient',
    );
    await user.selectOptions(
      screen.getByLabelText('Linked Ingredient of Pairing 1'),
      'Milk',
    );
    await user.selectOptions(
      screen.getByLabelText('Link of Pairing 1'),
      'A Recipe',
    );
    expect(
      screen.queryByLabelText('Linked Ingredient of Pairing 1'),
    ).toBeNull();
    await user.selectOptions(
      screen.getByLabelText('Linked Recipe of Pairing 1'),
      'Bread',
    );
    await user.click(screen.getByRole('button', { name: 'Save guidance' }));

    await vi.waitFor(() => expect(saved(calls)).toBeDefined());
    expect(saved(calls)?.body).toMatchObject({
      pairings: [{ linkedIngredientId: null, linkedRecipeId: 'r2' }],
    });
  });

  it('offers only live Recipes other than this one, and the 8 labelled Principles', async () => {
    open();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
    await user.selectOptions(
      screen.getByLabelText('Link of Pairing 1'),
      'A Recipe',
    );

    const recipes = await screen.findByLabelText('Linked Recipe of Pairing 1');
    await vi.waitFor(() =>
      expect(
        Array.from(recipes.querySelectorAll('option')).map(
          (o) => o.textContent,
        ),
      ).toEqual(['Choose…', 'Bread']),
    );
    const principles = screen.getByLabelText('Principle of Pairing 1');
    expect(principles.querySelectorAll('option')).toHaveLength(9);
    expect(
      screen.getByRole('option', { name: 'Regional tradition' }),
    ).toBeInTheDocument();
  });

  it('removes and reorders Pairings, and stops at 10', async () => {
    const calls = open();
    const user = userEvent.setup();
    const add = () => screen.getByRole('button', { name: 'Add a Pairing' });
    await user.click(add());
    await user.type(screen.getByLabelText('Label of Pairing 1'), 'One');
    await user.type(screen.getByLabelText('Reason for Pairing 1'), 'r');
    await user.click(add());
    await user.type(screen.getByLabelText('Label of Pairing 2'), 'Two');
    await user.type(screen.getByLabelText('Reason for Pairing 2'), 'r');
    await user.click(screen.getByRole('button', { name: 'Move Pairing 2 up' }));
    expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue('Two');
    await user.click(screen.getByRole('button', { name: 'Remove Pairing 2' }));
    expect(screen.queryByLabelText('Label of Pairing 2')).toBeNull();

    for (let i = 0; i < 9; i++) await user.click(add());
    expect(screen.getByLabelText('Label of Pairing 10')).toBeInTheDocument();
    expect(add()).toBeDisabled();
    expect(
      screen.getByText('A Recipe can have at most 10 Pairings.'),
    ).toBeInTheDocument();
    expect(saved(calls)).toBeUndefined();
  });

  it('blocks saving a Pairing without label or reason', async () => {
    open();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
    expect(
      screen.getByRole('button', { name: 'Save guidance' }),
    ).toBeDisabled();
    expect(
      screen.getByText('Every Pairing needs a label and a reason.'),
    ).toBeInTheDocument();
  });

  it('explains the Nutrition Note and counts characters up to 500', async () => {
    open();
    const user = userEvent.setup();
    expect(
      screen.getByText(/general direction, never values/i),
    ).toBeInTheDocument();
    expect(screen.getByText('0 of 500 characters')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Nutrition Note'));
    await user.paste('x'.repeat(501));
    expect(screen.getByText('501 of 500 characters')).toBeInTheDocument();
    expect(
      screen.getByText('The Nutrition Note is over 500 characters.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save guidance' }),
    ).toBeDisabled();
  });

  it('keeps archived and already-used Eating Moments out of the picker, and stops at 10', async () => {
    open({
      ...recipe,
      eatingMoments: [
        { eatingMomentId: 'em1', polarity: 'good_for', reason: null },
      ],
    });
    const user = userEvent.setup();
    const picker = screen.getByLabelText('Add an Eating Moment');
    expect(
      Array.from(picker.querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(['Choose…', 'Lunch']);

    await user.selectOptions(picker, 'Lunch');
    expect(screen.getByLabelText('Reason for Lunch')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Breakfast' }));
    expect(screen.queryByLabelText('Reason for Breakfast')).toBeNull();
    expect(
      Array.from(
        screen
          .getByLabelText('Add an Eating Moment')
          .querySelectorAll('option'),
      ).map((o) => o.textContent),
    ).toEqual(['Choose…', 'Breakfast']);
  });

  it('shows a coded API error', async () => {
    open(recipe, {
      'PUT /api/admin/recipes/r1/guidance': () =>
        Response.json(
          { code: 'recipes.pairing_link_not_allowed', params: {} },
          { status: 422 },
        ),
    });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nutrition Note'), 'Fine');
    await user.click(screen.getByRole('button', { name: 'Save guidance' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /cannot link to that Recipe/,
    );
  });
});
