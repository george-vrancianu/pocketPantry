import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import type { AdminRecipe } from '../../../lib/adminRecipes';
import { renderWithProviders, stubApi } from '../../../test/render';
import { RecipeEditor } from './RecipeEditor';

const catalog: AdminCatalog = {
  aisles: [],
  cuisines: [],
  methods: [],
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

const base: AdminRecipe = {
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
  lines: [
    {
      id: 'l1',
      ingredientId: 'i-milk',
      quantity: 500,
      unit: 'ml',
      optional: false,
      note: 'warm',
    },
  ],
  steps: [
    { id: 's1', text: 'Chop', timerSeconds: null },
    { id: 's2', text: 'Simmer', timerSeconds: null },
  ],
  tips: [
    { id: 't1', stepId: null, text: 'Serve hot' },
    { id: 't2', stepId: 's1', text: 'Sharp knife' },
    { id: 't3', stepId: null, text: 'Freezes well' },
  ],
  parentTips: null,
  translations: {
    da: {
      title: 'Suppe',
      steps: { s1: 'Hak' },
      lines: {},
      tips: {},
    },
  },
};

const variant: AdminRecipe = {
  ...base,
  id: 'r2',
  parentId: 'r1',
  title: 'Spicy soup',
  tips: [],
  parentTips: [
    { id: 't1', stepId: null, text: 'Serve hot', hidden: false },
    { id: 't3', stepId: null, text: 'Freezes well', hidden: true },
  ],
};

function open(
  recipe: AdminRecipe,
  extra: Record<string, () => Response> = {},
  onOpen = vi.fn(),
) {
  const stub = stubApi({
    [`GET /api/admin/recipes/${recipe.id}`]: () => Response.json(recipe),
    ...extra,
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  renderWithProviders(
    <RecipeEditor
      recipeId={recipe.id}
      catalog={catalog}
      onOpen={onOpen}
      onClose={vi.fn()}
    />,
  );
  return { ...stub, onOpen };
}

describe('RecipeEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('makes a variant from a Base Recipe and opens it', async () => {
    const { calls, onOpen } = open(base, {
      'POST /api/admin/recipes/r1/variants': () =>
        Response.json(variant, { status: 201 }),
    });
    const user = userEvent.setup();

    await user.type(
      await screen.findByLabelText('Variant title'),
      'Spicy soup',
    );
    await user.click(screen.getByRole('button', { name: 'Make a variant' }));

    await vi.waitFor(() => expect(onOpen).toHaveBeenCalledWith('r2'));
    expect(
      calls.find((c) => c.key === 'POST /api/admin/recipes/r1/variants')?.body,
    ).toEqual({ title: 'Spicy soup' });
  });

  it('does not offer a variant of a Variant or of an archived base', async () => {
    open(variant);
    await screen.findByRole('heading', { name: /Spicy soup/ });
    expect(screen.queryByRole('button', { name: 'Make a variant' })).toBeNull();
  });

  it('archives a Recipe after confirmation, then drops the archive and variant actions', async () => {
    let archived = false;
    const { calls } = open(base, {
      'GET /api/admin/recipes/r1': () => Response.json({ ...base, archived }),
      'POST /api/admin/recipes/r1/archive': () => {
        archived = true;
        return Response.json({ ...base, archived });
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Archive Recipe' }),
    );
    expect(calls.some((c) => c.key.endsWith('/archive'))).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('This Recipe is archived.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Archive Recipe' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Make a variant' })).toBeNull();
  });

  it('adds Tips to the Recipe and to a Step, and deletes one', async () => {
    const { calls } = open(base, {
      'POST /api/admin/recipes/r1/tips': () =>
        Response.json({ id: 't9' }, { status: 201 }),
      'DELETE /api/admin/recipes/r1/tips/t1': () =>
        new Response(null, { status: 204 }),
    });
    const user = userEvent.setup();

    const recipeTips = within(
      await screen.findByRole('group', { name: 'Recipe Tips' }),
    );
    await user.type(recipeTips.getByLabelText('New Tip'), 'Use stock');
    await user.click(recipeTips.getByRole('button', { name: 'Add Tip' }));
    await vi.waitFor(() =>
      expect(calls.some((c) => c.key === 'POST /api/admin/recipes/r1/tips')),
    );

    const stepTips = within(
      screen.getByRole('group', { name: 'Tips for step 2' }),
    );
    await user.type(stepTips.getByLabelText('New Tip for step 2'), 'Low heat');
    await user.click(stepTips.getByRole('button', { name: 'Add Tip' }));
    await vi.waitFor(() =>
      expect(
        calls.filter((c) => c.key === 'POST /api/admin/recipes/r1/tips'),
      ).toHaveLength(2),
    );
    const posts = calls.filter(
      (c) => c.key === 'POST /api/admin/recipes/r1/tips',
    );
    expect(posts[0].body).toEqual({ text: 'Use stock', stepId: null });
    expect(posts[1].body).toEqual({ text: 'Low heat', stepId: 's2' });

    await user.click(recipeTips.getByRole('button', { name: 'Delete Tip 1' }));
    await vi.waitFor(() =>
      expect(
        calls.some((c) => c.key === 'DELETE /api/admin/recipes/r1/tips/t1'),
      ).toBe(true),
    );
  });

  it('reorders Recipe Tips by sending every Tip id, step Tips in place', async () => {
    const { calls } = open(base, {
      'PUT /api/admin/recipes/r1/tips/order': () => Response.json({}),
    });
    const user = userEvent.setup();
    const recipeTips = within(
      await screen.findByRole('group', { name: 'Recipe Tips' }),
    );

    await user.click(recipeTips.getByRole('button', { name: 'Move Tip 2 up' }));

    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/admin/recipes/r1/tips/order')
          ?.body,
      ).toEqual({ ids: ['t3', 't2', 't1'] }),
    );
  });

  it('lets a Variant hide inherited Base Recipe Tips', async () => {
    const { calls } = open(variant, {
      'PUT /api/admin/recipes/r2/hidden-tips': () => Response.json({}),
    });
    const user = userEvent.setup();

    const shown = await screen.findByLabelText('Show: Serve hot');
    expect(shown).toBeChecked();
    expect(screen.getByLabelText('Show: Freezes well')).not.toBeChecked();
    await user.click(shown);

    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/admin/recipes/r2/hidden-tips')
          ?.body,
      ).toEqual({ tipIds: ['t3', 't1'] }),
    );
  });

  it('saves one locale of translations, clearing what was blanked', async () => {
    const { calls } = open(base, {
      'PUT /api/admin/recipes/r1/translations/da': () => Response.json({}),
    });
    const user = userEvent.setup();

    const danish = within(await screen.findByRole('group', { name: 'Danish' }));
    expect(danish.getByLabelText('Title (Danish)')).toHaveValue('Suppe');
    expect(danish.getByText('English: warm')).toBeInTheDocument();
    await user.clear(danish.getByLabelText('Step 1 (Danish)'));
    await user.type(danish.getByLabelText('Step 2 (Danish)'), 'Simre');
    await user.type(danish.getByLabelText('Note for Milk (Danish)'), 'varm');
    await user.click(
      danish.getByRole('button', { name: 'Save Danish translations' }),
    );

    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'PUT /api/admin/recipes/r1/translations/da')
          ?.body,
      ).toEqual({
        steps: { s1: null, s2: 'Simre' },
        lines: { l1: 'varm' },
        tips: {},
      }),
    );
  });
});
