import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import type { InitialEntry } from 'react-router-dom';
import type { NewRecipeState } from './FamilyRecipePages';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  FamilyRecipeDraft,
  FamilyRecipeEdit,
} from '../../lib/familyRecipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { useRecipe } from '../../lib/recipes';
import {
  EditFamilyRecipePage,
  NewRecipePage,
  NewVariantPage,
} from './FamilyRecipePages';

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
  sourceLink: null,
  sourceLanguage: null,
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

/** Reads the Recipe's detail query, as the detail page does, so a save's refresh can be seen. */
function DetailProbe() {
  const { data } = useRecipe('g');
  return (
    <p>{data ? `detail link: ${data.sourceLink ?? 'none'}` : 'loading'}</p>
  );
}

function setup(route: InitialEntry, routes: Parameters<typeof stubApi>[0]) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes/filters': () => Response.json(filters),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route
        path="/recipes/new"
        element={
          <>
            <Link to="/recipes/new">go blank</Link>
            <NewRecipePage />
          </>
        }
      />
      <Route path="/recipes/:id/variant/new" element={<NewVariantPage />} />
      <Route path="/recipes/:id/edit" element={<EditFamilyRecipePage />} />
      <Route
        path="/recipes/:id/edit-and-detail"
        element={
          <>
            <EditFamilyRecipePage />
            <DetailProbe />
          </>
        }
      />
      <Route path="/recipes/:id" element={<p>Detail of the recipe</p>} />
    </Routes>,
    { route },
  );
  return calls;
}

/** Opens one of the editor's tabs by its name ("Details", "Ingredients" or "Steps"). */
async function openTab(
  user: ReturnType<typeof userEvent.setup>,
  name: 'Details' | 'Ingredients' | 'Steps',
) {
  await user.click(
    await screen.findByRole('tab', { name: new RegExp(`^${name}`) }),
  );
}

/** What a read-from-source flow hands the New Recipe page: a draft without a Servings count, and the closest Base Recipes. */
const sourced: NewRecipeState = {
  draft: {
    title: 'Pancakes from a blog',
    servings: null,
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: null,
    cuisineId: 'c-fr',
    methodId: 'm-pan',
    lines: [
      {
        ingredientId: 'egg',
        rawName: null,
        ingredientName: 'Egg',
        quantity: 2,
        unit: 'pcs',
        optional: false,
        note: null,
      },
      {
        ingredientId: null,
        rawName: 'Maple syrup',
        ingredientName: 'Maple syrup',
        quantity: null,
        unit: null,
        optional: false,
        note: 'to serve',
      },
    ],
    steps: [{ text: 'Whisk and fry', timerSeconds: 120 }],
    tips: [],
    guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
  },
  closestBases: [
    { id: 'base-crepes', title: 'Crepes', allergyWarning: null },
    { id: 'base-waffles', title: 'Waffles', allergyWarning: null },
  ],
};

const newRecipeWith = (state: NewRecipeState) => ({
  pathname: '/recipes/new',
  state,
});

describe('NewRecipePage with a supplied draft', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('opens filled from the draft and requires Servings before saving', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(sourced), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    expect(await screen.findByLabelText(/^Title/)).toHaveValue(
      'Pancakes from a blog',
    );
    expect(screen.getByRole('tab', { name: 'Ingredients, 2' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Steps, 1' })).toBeVisible();
    await openTab(user, 'Ingredients');
    expect(screen.getByLabelText('Quantity of Egg')).toHaveValue('2');
    expect(screen.getByText('Maple syrup')).toBeVisible();
    await openTab(user, 'Steps');
    expect(screen.getByDisplayValue('Whisk and fry')).toBeVisible();
    await openTab(user, 'Details');
    const servings = screen.getByLabelText(/^Servings/);
    expect(servings).toHaveValue('');
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();

    await user.type(servings, '4');
    expect(save).toBeEnabled();
    await user.click(save);
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        title: 'Pancakes from a blog',
        servings: 4,
        prepMinutes: 10,
        cookMinutes: 15,
        cuisineId: 'c-fr',
        methodId: 'm-pan',
      }),
    );
  });

  it('saves a Variant of the closest Base Recipe by default', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(sourced), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    expect(screen.getByRole('radio', { name: /Crepes/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Detail of the recipe')).toBeVisible();
    expect(
      calls.find((c) => c.key === 'POST /api/recipes')?.body,
    ).toMatchObject({ parentId: 'base-crepes' });
  });

  it('saves a Variant of another picked Base Recipe', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(sourced), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('radio', { name: 'Waffles' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: 'base-waffles' }),
    );
  });

  it('saves a standalone Base Recipe when standalone is picked', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(sourced), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('radio', { name: /standalone/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: null }),
    );
  });

  const fromLink: NewRecipeState = {
    ...sourced,
    sourceLink: 'https://www.example.com/tortilla',
    sourceLanguage: 'es',
  };

  it('saves a Variant of the picked base with the Source Link and language', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(fromLink), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('radio', { name: 'Waffles' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        parentId: 'base-waffles',
        sourceLink: 'https://www.example.com/tortilla',
        sourceLanguage: 'es',
      }),
    );
  });

  it('saves a standalone Base Recipe with the Source Link and no parent', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(fromLink), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('radio', { name: /standalone/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        parentId: null,
        sourceLink: 'https://www.example.com/tortilla',
      }),
    );
  });

  it('drops the Source Link and language, keeping the pick, when the link is removed', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith(fromLink), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('button', { name: 'Remove link' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(calls.some((c) => c.key === 'POST /api/recipes')).toBe(true),
    );
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body as {
      parentId: string;
    };
    expect(body.parentId).toBe('base-crepes');
    expect(body).not.toHaveProperty('sourceLink');
    expect(body).not.toHaveProperty('sourceLanguage');
  });

  it('says how many matches Allergies hid, and Show offers them from the draft as it arrived', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(
      newRecipeWith({ ...fromLink, hiddenByAllergiesCount: 1 }),
      {
        'POST /api/recipes/plate-matches': () =>
          Response.json({
            matches: [
              {
                id: 'base-satay',
                title: 'Satay',
                score: 0.9,
                allergyWarning: null,
              },
              ...(sourced.closestBases ?? []).map((b) => ({
                ...b,
                score: 0.3,
              })),
            ],
            hiddenByAllergiesCount: 0,
          }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      },
    );
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    // Edits to the form do not change what is asked.
    await user.type(screen.getByLabelText(/^Title/), ' edited');
    expect(screen.getByText('1 Recipe hidden by your Allergies')).toBeVisible();
    expect(calls.some((c) => c.key === 'POST /api/recipes/plate-matches')).toBe(
      false,
    );
    expect(screen.getByRole('radio', { name: /Crepes/ })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(await screen.findByRole('radio', { name: /Satay/ })).toBeVisible();
    expect(screen.queryByText(/hidden by your Allergies/)).toBeNull();
    expect(
      calls.find((c) => c.key === 'POST /api/recipes/plate-matches')?.body,
    ).toEqual({
      dishTitle: 'Pancakes from a blog',
      ingredientIds: ['egg'],
      showHidden: true,
    });
    // The pick made before Show stays, though Satay now ranks first.
    expect(screen.getByRole('radio', { name: 'Crepes' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: 'base-crepes' }),
    );
  });

  it('keeps a picked base the revealed list no longer holds', async () => {
    const user = userEvent.setup({ delay: null });
    const five = ['a', 'b', 'c', 'd', 'e'].map((k, i) => ({
      id: `base-${k}`,
      title: `Base ${k}`,
      allergyWarning: null,
      score: 1 - i / 10,
    }));
    const calls = setup(
      newRecipeWith({
        ...sourced,
        closestBases: five,
        hiddenByAllergiesCount: 1,
      }),
      {
        'POST /api/recipes/plate-matches': () =>
          Response.json({
            matches: [
              {
                id: 'base-hidden',
                title: 'Hidden one',
                score: 2,
                allergyWarning: null,
              },
              ...five.slice(0, 4),
            ],
            hiddenByAllergiesCount: 0,
          }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      },
    );
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    await user.click(screen.getByRole('radio', { name: 'Base e' }));
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(
      await screen.findByRole('radio', { name: /Hidden one/ }),
    ).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Base e' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: 'base-e' }),
    );
  });

  it('says it is looking between Show and the answer', async () => {
    const user = userEvent.setup({ delay: null });
    setup(newRecipeWith({ ...fromLink, hiddenByAllergiesCount: 1 }), {
      'POST /api/recipes/plate-matches': () =>
        new Promise<Response>(() => {}) as never,
    });
    await user.click(await screen.findByRole('button', { name: 'Show' }));
    expect(await screen.findByText('Finding Base Recipes…')).toBeVisible();
  });

  it('asks again when Show failed and is pressed again', async () => {
    const user = userEvent.setup({ delay: null });
    let asked = 0;
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    setup(newRecipeWith({ ...fromLink, hiddenByAllergiesCount: 1 }), {
      'POST /api/recipes/plate-matches': () =>
        ++asked === 1
          ? Response.json({ code: 'boom' }, { status: 500 })
          : gate.then(() =>
              Response.json({
                matches: [
                  {
                    id: 'base-satay',
                    title: 'Satay',
                    score: 1,
                    allergyWarning: null,
                  },
                ],
                hiddenByAllergiesCount: 0,
              }),
            ),
    });
    await user.click(await screen.findByRole('button', { name: 'Show' }));
    await vi.waitFor(() => expect(asked).toBeGreaterThanOrEqual(1));
    // Settled in error: the loading text is gone before Show is pressed again.
    await vi.waitFor(() =>
      expect(screen.queryByText('Finding Base Recipes…')).toBeNull(),
    );
    await user.click(await screen.findByRole('button', { name: 'Show' }));
    expect(await screen.findByText('Finding Base Recipes…')).toBeVisible();
    release();
    expect(await screen.findByRole('radio', { name: /Satay/ })).toBeVisible();
  });

  it('shows the picker for the hidden note and Show even when no base is left', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(
      newRecipeWith({
        ...sourced,
        closestBases: [],
        hiddenByAllergiesCount: 2,
      }),
      {
        'POST /api/recipes/plate-matches': () =>
          Response.json({
            matches: [
              {
                id: 'base-satay',
                title: 'Satay',
                score: 0.9,
                allergyWarning: null,
              },
            ],
            hiddenByAllergiesCount: 0,
          }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      },
    );
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    expect(
      screen.getByText('2 Recipes hidden by your Allergies'),
    ).toBeVisible();
    expect(screen.getByRole('radio', { name: /standalone/i })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(await screen.findByRole('radio', { name: /Satay/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /standalone/i })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: null }),
    );
  });

  it('ignores route state whose hidden count is not a number', async () => {
    setup(
      {
        pathname: '/recipes/new',
        state: { ...sourced, hiddenByAllergiesCount: 'many' },
      },
      {},
    );
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
  });

  it('shows the Source Link on the filled form', async () => {
    setup(
      newRecipeWith({ ...sourced, sourceLink: 'https://www.example.com/p' }),
      {},
    );
    const link = await screen.findByRole('link', {
      name: 'From example.com ↗',
    });
    expect(link).toHaveAttribute('href', 'https://www.example.com/p');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('ignores route state whose Source Link is not text', async () => {
    setup(
      {
        pathname: '/recipes/new',
        state: { ...sourced, sourceLink: { href: 'x' } },
      },
      {},
    );
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
  });

  it('ignores route state whose source language is not text', async () => {
    setup(
      {
        pathname: '/recipes/new',
        state: {
          ...sourced,
          sourceLink: 'https://www.example.com/p',
          sourceLanguage: 7,
        },
      },
      {},
    );
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
  });

  it.each([
    ['tips', { tips: 'nope' }],
    ['guidance', { guidance: 'nope' }],
    ['guidance (null)', { guidance: null }],
  ])('ignores route state whose draft %s is malformed', async (_name, bad) => {
    setup(
      newRecipeWith({
        ...sourced,
        draft: { ...sourced.draft, ...bad },
      } as unknown as NewRecipeState),
      {},
    );
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
  });

  it('ignores route state whose Source Link is not a web address', async () => {
    setup(newRecipeWith({ ...sourced, sourceLink: 'not a link' }), {});
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Remove link' })).toBeNull();
  });

  it('shows no Base Recipe picker when there are no closest Base Recipes', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup(newRecipeWith({ ...sourced, closestBases: [] }), {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Servings/), '4');
    expect(screen.queryByRole('radio')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({ parentId: null }),
    );
  });

  it('ignores route state that is not a supplied draft', async () => {
    setup({ pathname: '/recipes/new', state: { from: 'elsewhere' } }, {});
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('starts afresh when navigated to again without a draft', async () => {
    const user = userEvent.setup({ delay: null });
    setup(newRecipeWith(sourced), {});
    expect(await screen.findByLabelText(/^Title/)).toHaveValue(
      'Pancakes from a blog',
    );
    await user.click(screen.getByRole('link', { name: 'go blank' }));
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('shows no Base Recipe picker on the blank page', async () => {
    setup('/recipes/new', {});
    await screen.findByLabelText(/^Title/);
    expect(screen.queryByRole('radio')).toBeNull();
  });
});

describe('NewRecipePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts blank and saves a Base Recipe with no parent', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/new', {
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    const title = await screen.findByLabelText(/^Title/);
    expect(title).toHaveValue('');
    await user.type(title, 'Gran stew');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Detail of the recipe')).toBeVisible();
    const post = calls.find((c) => c.key === 'POST /api/recipes');
    expect(post?.body).toMatchObject({ parentId: null, title: 'Gran stew' });
  });

  it('adds an ingredient line by Use as typed, saved by its name with no Ingredient', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/new', {
      'GET /api/catalog/search': () => Response.json({ results: [] }),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');

    await openTab(user, 'Ingredients');
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'Dragon fruit',
    );
    const useTyped = await screen.findByRole('option', {
      name: /Use “Dragon fruit” as typed/,
    });
    expect(useTyped).toHaveTextContent(
      'Not in the catalog · saved as an unmatched item',
    );
    await user.click(useTyped);

    expect(
      await screen.findByLabelText('Quantity of Dragon fruit'),
    ).toBeVisible();
    expect(screen.getByText(/Not in the Catalog/)).toBeVisible();
    // The search is ready for the next ingredient.
    expect(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    ).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        lines: [{ ingredientId: null, rawName: 'Dragon fruit' }],
      }),
    );
  });

  it("offers Use as typed in a new Recipe's search, still on the Family scope", async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/new', {
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    await openTab(user, 'Ingredients');
    await user.type(
      await screen.findByRole('combobox', { name: 'Search ingredients' }),
      'zzz',
    );
    await screen.findByRole('option', { name: /as typed/ });

    const searches = calls.filter((c) => c.key === 'GET /api/catalog/search');
    expect(searches.length).toBeGreaterThan(0);
    for (const call of searches) {
      expect(new URLSearchParams(call.search).get('scope')).not.toBe('shared');
    }
  });

  it('words the Guidance hint and the editor hint for a Recipe, not a Variant', async () => {
    setup('/recipes/new', {});
    await screen.findByLabelText(/^Title/);
    expect(
      screen.getByText(/Pairings, a Nutrition Note and Eating Moments\./),
    ).not.toHaveTextContent(/Variant/);
    expect(
      screen.getByText(
        "Kept as your draft until you save it as one of your family's Recipes.",
      ),
    ).toBeInTheDocument();
  });

  it('blocks saving without a title', async () => {
    setup('/recipes/new', {});
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows a coded error in the Member locale and stays on the form', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      // The Recipe Draft saves quietly; an unanswered one would show its own error.
      'POST /api/recipe-drafts': () =>
        Response.json({ id: 'draft-id', version: 1 }, { status: 201 }),
      'POST /api/recipes': () =>
        Response.json(
          { code: 'recipes.parent_archived', params: {} },
          { status: 409 },
        ),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This Base Recipe is archived, so it cannot get new Variants.',
    );
    expect(screen.queryByText('Detail of the recipe')).not.toBeInTheDocument();
  });
});

describe('NewVariantPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prefills from the draft', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
    });
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Omelette');
    expect(
      screen.getByText(
        /^Copied from .*\. It becomes a Recipe when you save it\.$/,
      ),
    ).toBeInTheDocument();
    // No owner, and nothing about the Variant not being saved yet.
    expect(screen.queryByText(/Catalog|Nothing is saved/)).toBeNull();
    await openTab(user, 'Ingredients');
    expect(screen.getByLabelText('Quantity of Egg')).toHaveValue('3');
    await openTab(user, 'Steps');
    expect(screen.getByLabelText('Step 1')).toHaveValue('Whisk the eggs');
    expect(screen.getByLabelText('Timer for Step 1 (minutes)')).toHaveValue(
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
    await openTab(user, 'Steps');
    expect(await screen.findByText('Room-temperature eggs')).toBeVisible();
    expect(screen.getByText('Medium heat')).toBeVisible();

    // Reordering moves the Tips with their step.
    await user.click(screen.getByRole('button', { name: 'Move Step 2 up' }));
    // The step "Plate" and its Tip are dropped together.
    await user.click(screen.getByRole('button', { name: 'Remove Step 3' }));
    // Its copied Tip is counted in the warning before anything is dropped.
    expect(
      screen.getByText('Removing Step 3 deletes its 1 Tip when you save.'),
    ).toBeVisible();
    expect(screen.getByText('Warm plate')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^Remove Step and/ }));
    expect(screen.queryByText('Warm plate')).not.toBeInTheDocument();
    expect(screen.queryByText('Do not stir')).toBeInTheDocument();
    // The Member removes one Tip before saving.
    await user.click(
      screen.getByRole('button', { name: 'Remove Tip 1 of Step 1' }),
    );
    expect(screen.queryByText('Medium heat')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));

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
      'GET /api/catalog/search': () => Response.json({ results: [] }),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    fireEvent.change(await screen.findByLabelText(/^Title/), {
      target: { value: "Grandma's omelette" },
    });
    fireEvent.change(screen.getByLabelText('Cuisine'), {
      target: { value: 'c-fr' },
    });
    await openTab(user, 'Ingredients');
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'Gran’s herbs',
    );
    await user.click(
      await screen.findByRole('option', {
        name: /Use “Gran’s herbs” as typed/,
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    const post = calls.find((call) => call.key === 'POST /api/recipes')!;
    expect(post.body).toMatchObject({
      parentId: 'base',
      title: "Grandma's omelette",
      cuisineId: 'c-fr',
      lines: [
        { ingredientId: 'egg', rawName: null, quantity: 3, unit: 'pcs' },
        { ingredientId: null, rawName: 'Gran’s herbs', quantity: null },
      ],
      steps: [{ text: 'Whisk the eggs', timerSeconds: 90 }],
    });
  });

  it('neither shows nor sends the Source Link of a linked source Recipe', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
      'GET /api/recipes/x': () =>
        Response.json({
          ...sourceDetail,
          sourceLink: 'https://www.example.com/p',
          sourceLanguage: 'fr',
        }),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await screen.findByLabelText(/^Title/);
    expect(
      screen.queryByRole('link', { name: /From example\.com/ }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Remove link' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
    expect(body).toMatchObject({ parentId: 'base' });
    expect(body).not.toHaveProperty('sourceLink');
    expect(body).not.toHaveProperty('sourceLanguage');
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
    await user.click(screen.getByRole('button', { name: 'Save' }));
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
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
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
    // Unsaved guidance edits must survive the document save and a change of tab.
    fireEvent.change(await screen.findByLabelText('Nutrition Note'), {
      target: { value: 'Still here' },
    });
    await openTab(user, 'Details');
    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: 'Better omelette' },
    });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Recipe saved.')).toBeInTheDocument();
    await openTab(user, 'Steps');
    expect(screen.getByLabelText('Nutrition Note')).toHaveValue('Still here');
    expect(
      screen.getByRole('link', { name: 'View the Recipe' }),
    ).toHaveAttribute('href', '/recipes/g');
    const put = calls.find((call) => call.key === 'PUT /api/recipes/g')!;
    expect(put.body).toMatchObject({
      title: 'Better omelette',
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
    await openTab(user, 'Ingredients');
    await user.clear(await screen.findByLabelText('Quantity of Egg'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
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

  it('links a Pairing to an Ingredient with a search that has no Use as typed', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    await user.selectOptions(
      await screen.findByLabelText('Link of Pairing 1'),
      'ingredient',
    );
    await user.type(
      await screen.findByRole('combobox', {
        name: 'Linked Ingredient of Pairing 1',
      }),
      'zzz',
    );

    expect(await screen.findByText('No match for “zzz”')).toBeVisible();
    expect(screen.queryByRole('option', { name: /as typed/ })).toBeNull();
    for (const call of calls.filter(
      (c) => c.key === 'GET /api/catalog/search',
    )) {
      expect(new URLSearchParams(call.search).get('scope')).not.toBe('shared');
    }
  });

  it('adds a Tip and hides an inherited one straight away', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'POST /api/recipes/g/tips': () => Response.json(saved, { status: 201 }),
      'PUT /api/recipes/g/hidden-tips': () => Response.json(saved),
    });
    const tips = await screen.findByRole('region', { name: 'Tips' });
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
    expect(calls.some((c) => c.key === 'POST /api/recipes/g/tips')).toBe(true);
  });
});

describe('EditFamilyRecipePage Source Link', () => {
  afterEach(() => vi.unstubAllGlobals());

  const linked: FamilyRecipeEdit = {
    ...saved,
    sourceLink: 'https://www.example.com/p',
    sourceLanguage: 'fr',
  };
  const putBody = (calls: ReturnType<typeof setup>) =>
    calls.find((c) => c.key === 'PUT /api/recipes/g')?.body as
      Record<string, unknown> | undefined;

  it('shows the link and the translation note, with no way to change the link', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(linked),
    });
    await openTab(user, 'Details');
    const link = await screen.findByRole('link', {
      name: 'From example.com ↗',
    });
    expect(link).toHaveAttribute('href', 'https://www.example.com/p');
    expect(
      screen.getByText('Translated from French', { exact: false }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remove link' })).toBeVisible();
    // The link is shown, never offered for editing.
    expect(
      screen
        .getAllByRole('textbox')
        .some((box) => (box as HTMLInputElement).value.includes('example.com')),
    ).toBe(false);
  });

  it('shows no link row on a Recipe without a Source Link', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
    });
    await openTab(user, 'Details');
    await screen.findByLabelText(/^Title/);
    expect(screen.queryByRole('button', { name: 'Remove link' })).toBeNull();
    expect(screen.queryByText(/From .* ↗/)).toBeNull();
  });

  it('removes the link on Save: hides it at once, sends null, moves focus to the heading', async () => {
    const user = userEvent.setup({ delay: null });
    let current = linked;
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(current),
      'PUT /api/recipes/g': () => {
        current = { ...linked, sourceLink: null, sourceLanguage: null };
        return Response.json(current);
      },
    });
    await openTab(user, 'Details');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    expect(
      screen.queryByRole('link', { name: /From example\.com/ }),
    ).toBeNull();
    expect(screen.queryByText(/Translated from/)).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    // Nothing is sent until Save.
    expect(putBody(calls)).toBeUndefined();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Recipe saved.')).toBeInTheDocument();
    expect(putBody(calls)).toHaveProperty('sourceLink', null);
    expect(screen.queryByRole('button', { name: 'Remove link' })).toBeNull();
  });

  it('does not send the link when Save is pressed without removing it', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(linked),
      'PUT /api/recipes/g': () => Response.json(linked),
    });
    await openTab(user, 'Details');
    await screen.findByRole('link', { name: 'From example.com ↗' });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Recipe saved.')).toBeInTheDocument();
    expect(putBody(calls)).not.toHaveProperty('sourceLink');
    expect(putBody(calls)).not.toHaveProperty('sourceLanguage');
    expect(
      screen.getByRole('link', { name: 'From example.com ↗' }),
    ).toBeVisible();
  });

  it('sends the removal once: a second Save leaves the link out', async () => {
    const user = userEvent.setup({ delay: null });
    let current = linked;
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(current),
      'PUT /api/recipes/g': () => {
        current = { ...linked, sourceLink: null, sourceLanguage: null };
        return Response.json(current);
      },
    });
    await openTab(user, 'Details');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(calls.filter((c) => c.key === 'PUT /api/recipes/g')).toHaveLength(
        1,
      ),
    );
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(calls.filter((c) => c.key === 'PUT /api/recipes/g')).toHaveLength(
        2,
      ),
    );
    const puts = calls.filter((c) => c.key === 'PUT /api/recipes/g');
    expect(puts[0].body).toHaveProperty('sourceLink', null);
    expect(puts[1].body).not.toHaveProperty('sourceLink');
  });

  it('keeps the link and sends nothing when the removal is cancelled', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(linked),
      'PUT /api/recipes/g': () => Response.json(linked),
    });
    await openTab(user, 'Details');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    await user.click(screen.getByRole('link', { name: 'Back' }));
    expect(await screen.findByText('Detail of the recipe')).toBeInTheDocument();
    expect(putBody(calls)).toBeUndefined();
  });

  it('still sends the removal on the next Save after a failed one', async () => {
    const user = userEvent.setup({ delay: null });
    let attempts = 0;
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(linked),
      'PUT /api/recipes/g': () =>
        ++attempts === 1
          ? Response.json({ code: 'recipes.not_found' }, { status: 404 })
          : Response.json({
              ...linked,
              sourceLink: null,
              sourceLanguage: null,
            }),
    });
    await openTab(user, 'Details');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(attempts).toBe(1));
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Recipe saved.')).toBeInTheDocument();
    expect(attempts).toBe(2);
    const puts = calls.filter((c) => c.key === 'PUT /api/recipes/g');
    expect(
      puts.map((c) => (c.body as { sourceLink?: unknown }).sourceLink),
    ).toEqual([null, null]);
  });

  it('refreshes the Recipe detail after the link is removed', async () => {
    const user = userEvent.setup({ delay: null });
    let removed = false;
    setup('/recipes/g/edit-and-detail', {
      'GET /api/recipes/g/edit': () => Response.json(linked),
      'GET /api/recipes/g': () =>
        Response.json({
          ...sourceDetail,
          sourceLink: removed ? null : 'https://www.example.com/p',
        }),
      'PUT /api/recipes/g': () => {
        removed = true;
        return Response.json({
          ...linked,
          sourceLink: null,
          sourceLanguage: null,
        });
      },
    });
    expect(
      await screen.findByText('detail link: https://www.example.com/p'),
    ).toBeVisible();
    await openTab(user, 'Details');
    await user.click(screen.getByRole('button', { name: 'Remove link' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('detail link: none')).toBeVisible();
  });
});

describe('Family Recipe Browse by aisle', () => {
  afterEach(() => vi.unstubAllGlobals());
  const browseAisles = {
    aisles: [
      {
        id: 'aisle-dairy',
        name: 'Dairy & eggs',
        parentCategories: [{ id: 'p-dairy', name: 'Dairy' }],
      },
    ],
  };
  const aisleRoutes = {
    'GET /api/catalog/aisles': () => Response.json(browseAisles),
    'GET /api/catalog/search': () => Response.json({ results: [] }),
  };

  it('shows Browse by aisle in the ingredient search of the recipe form', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', aisleRoutes);

    await openTab(user, 'Ingredients');
    await user.click(
      await screen.findByRole('combobox', { name: 'Search ingredients' }),
    );

    expect(await screen.findByText('Browse by aisle')).toBeVisible();
    expect(
      await screen.findByRole('button', { name: 'Dairy & eggs' }),
    ).toBeVisible();
  });

  it('shows Browse by aisle in the Guidance link search', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      ...aisleRoutes,
    });
    await user.selectOptions(
      await screen.findByLabelText('Link of Pairing 1'),
      'ingredient',
    );

    await user.click(
      await screen.findByRole('combobox', {
        name: 'Linked Ingredient of Pairing 1',
      }),
    );

    expect(await screen.findByText('Browse by aisle')).toBeVisible();
  });
});

describe('Family Recipe form: Add to your catalog (#270)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('offers it in the ingredient search, above Use as typed', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    await openTab(user, 'Ingredients');

    await user.click(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    );
    await user.paste('kombucha');

    // Only the search listbox's options: the form's native selects have options too.
    const options = within(await screen.findByRole('listbox')).getAllByRole(
      'option',
    );
    expect(options[0]).toHaveAccessibleName(/Add “kombucha” to your catalog/);
    expect(options[1]).toHaveAccessibleName(/Use “kombucha” as typed/);
  });

  it('offers it in a Guidance link search, which has no Use as typed', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
      'GET /api/catalog/search': () => Response.json({ results: [] }),
    });
    await user.selectOptions(
      await screen.findByLabelText('Link of Pairing 1'),
      'ingredient',
    );

    await user.click(
      await screen.findByRole('combobox', {
        name: 'Linked Ingredient of Pairing 1',
      }),
    );
    await user.paste('kombucha');

    const options = within(await screen.findByRole('listbox')).getAllByRole(
      'option',
    );
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAccessibleName(/Add “kombucha” to your catalog/);
  });
});

describe('Suggest Guidance', () => {
  afterEach(() => vi.unstubAllGlobals());

  const NOTE = 'Rich in protein, light on fibre.';
  const suggestRoute = 'POST /api/recipes/suggest-guidance';
  const idea = {
    kind: 'food',
    label: 'Fresh berries',
    reason: 'Their tartness cuts the richness.',
    principle: 'acid_cuts_fat',
    linkedIngredientId: null,
    linkedRecipeId: null,
  };
  const moment = {
    eatingMomentId: 'em1',
    polarity: 'avoid',
    reason: 'Too heavy first thing.',
  };
  const proposal = () =>
    Response.json({
      guidance: {
        nutritionNote: NOTE,
        pairings: [idea],
        eatingMoments: [moment],
      },
      noSuggestions: [],
    });
  const noteOnly = () =>
    Response.json({ guidance: { nutritionNote: NOTE }, noSuggestions: [] });
  const pairingsGroup = () => screen.getByRole('group', { name: /Pairings/ });
  const noteField = () => screen.getByLabelText('Nutrition Note');
  const suggestButton = () =>
    screen.getByRole('button', { name: 'Suggest Guidance' });
  const noNote: FamilyRecipeDraft = {
    ...draft,
    guidance: { ...draft.guidance, nutritionNote: null },
  };
  const unfilled: FamilyRecipeEdit = { ...saved, nutritionNote: null };

  it('fills an empty Nutrition Note from the page as it is now, marked Suggested, and sends ordinary Guidance on save', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/new', {
      [suggestRoute]: proposal,
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');

    await user.click(suggestButton());

    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
    expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue(
      'Fresh berries',
    );
    const asked = calls.find((c) => c.key === suggestRoute)?.body;
    expect(asked).toMatchObject({
      recipe: { title: 'Gran stew', servings: 4 },
      guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
    });
    expect(
      within(screen.getByRole('group', { name: /Nutrition Note/ })).getByText(
        'Suggested',
      ),
    ).toBeVisible();
    // The Eating Moment is a row marked Suggested too, with its polarity and reason.
    const moments = within(
      screen.getByRole('group', { name: /Eating Moments/ }),
    );
    expect(moments.getByText('Suggested')).toBeVisible();
    expect(moments.getByLabelText('Good for or Avoid: Breakfast')).toHaveValue(
      'avoid',
    );
    expect(moments.getByLabelText('Reason for Breakfast')).toHaveValue(
      moment.reason,
    );
    // Nothing is stored by suggesting.
    expect(calls.some((c) => c.key === 'POST /api/recipes')).toBe(false);
    // Every covered field is filled now: the button says why it is off.
    expect(suggestButton()).toBeDisabled();
    expect(suggestButton()).toHaveAccessibleDescription(/already filled/);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(calls.some((c) => c.key === 'POST /api/recipes')).toBe(true),
    );
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
    expect(body).toMatchObject({
      guidance: { nutritionNote: NOTE, eatingMoments: [moment] },
    });
    expect(JSON.stringify(body)).not.toMatch(/suggested/i);
  });

  it('clears the mark once the Member edits the note', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', { [suggestRoute]: noteOnly });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());
    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));

    await user.type(noteField(), '!');

    expect(screen.queryByText('Suggested')).not.toBeInTheDocument();
    expect(noteField()).toHaveValue(`${NOTE}!`);
  });

  it('clears the mark of an Eating Moment once the Member edits its reason or polarity', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      [suggestRoute]: () =>
        Response.json({
          guidance: {
            eatingMoments: [
              moment,
              { ...moment, eatingMomentId: 'em2', polarity: 'good_for' },
            ],
          },
          noSuggestions: [],
        }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());
    await screen.findByLabelText('Reason for Lunch');
    expect(screen.getAllByText('Suggested')).toHaveLength(2);

    await user.type(screen.getByLabelText('Reason for Breakfast'), '!');
    expect(screen.getAllByText('Suggested')).toHaveLength(1);
    await user.selectOptions(
      screen.getByLabelText('Good for or Avoid: Lunch'),
      'avoid',
    );
    expect(screen.queryByText('Suggested')).not.toBeInTheDocument();
  });

  it('keeps Eating Moments the Member already added', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(noNote),
      'GET /api/recipes/x': () => Response.json(sourceDetail),
      [suggestRoute]: () =>
        Response.json({
          guidance: { nutritionNote: NOTE, eatingMoments: [moment] },
          noSuggestions: [],
        }),
    });
    await screen.findByLabelText(/^Title/);
    await user.click(suggestButton());
    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
    expect(calls.some((c) => c.key === suggestRoute)).toBe(true);
    // The Variant draft carries "Breakfast" as Good for already: untouched, not marked.
    expect(screen.getByLabelText('Reason for Breakfast')).toHaveValue(
      'Quick start',
    );
    expect(
      within(screen.getByRole('group', { name: /Eating Moments/ })).queryByText(
        'Suggested',
      ),
    ).not.toBeInTheDocument();
  });

  it('is disabled with a hint when the Nutrition Note is filled, and never asks', async () => {
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(draft),
      'GET /api/recipes/x': () => Response.json(sourceDetail),
      [suggestRoute]: proposal,
    });
    expect(await screen.findByLabelText('Nutrition Note')).toHaveValue(
      'Rich in protein',
    );
    expect(suggestButton()).toBeDisabled();
    expect(suggestButton()).toHaveAccessibleDescription(/already filled/);
    fireEvent.click(suggestButton());
    expect(calls.some((c) => c.key === suggestRoute)).toBe(false);
  });

  it('works on a Variant, reading the copied ingredients and Steps', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/x/variant/new', {
      'GET /api/recipes/x/variant-draft': () => Response.json(noNote),
      'GET /api/recipes/x': () => Response.json(sourceDetail),
      [suggestRoute]: proposal,
    });
    await screen.findByLabelText(/^Title/);
    await user.click(suggestButton());
    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
    expect(calls.find((c) => c.key === suggestRoute)?.body).toMatchObject({
      recipe: {
        title: 'Omelette',
        lines: [{ ingredientId: 'egg', quantity: 3, unit: 'pcs' }],
        steps: [{ text: 'Whisk the eggs' }],
      },
      guidance: {
        pairings: [{ label: 'Orange juice' }],
        eatingMoments: [{ eatingMomentId: 'em1' }],
      },
    });
  });

  it('shows a working state and sends one request however often it is pressed', async () => {
    const user = userEvent.setup({ delay: null });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const calls = setup('/recipes/new', {
      [suggestRoute]: async () => {
        await gate;
        return proposal();
      },
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());

    const working = await screen.findByRole('button', { name: 'Suggesting…' });
    expect(working).toBeDisabled();
    fireEvent.click(working);
    release();
    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
    expect(calls.filter((c) => c.key === suggestRoute)).toHaveLength(1);
  });

  it('does not overwrite a note the Member typed while the request was in flight', async () => {
    const user = userEvent.setup({ delay: null });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    setup('/recipes/new', {
      [suggestRoute]: async () => {
        await gate;
        return noteOnly();
      },
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());
    await screen.findByRole('button', { name: 'Suggesting…' });

    await user.type(noteField(), 'Mine');
    release();

    await screen.findByRole('button', { name: 'Suggest Guidance' });
    expect(noteField()).toHaveValue('Mine');
    expect(screen.queryByText('Suggested')).not.toBeInTheDocument();
  });

  it('says "No suggestions for ..." in a status when nothing was worth proposing', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      [suggestRoute]: () =>
        Response.json({ guidance: {}, noSuggestions: ['nutritionNote'] }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());

    await screen.findByText('No suggestions for Nutrition Note.');
    expect(
      screen
        .getAllByRole('status')
        .some((s) => s.textContent === 'No suggestions for Nutrition Note.'),
    ).toBe(true);
    expect(noteField()).toHaveValue('');
    // Typing in the field makes the message redundant.
    await user.type(noteField(), 'x');
    expect(screen.queryByText(/No suggestions for/)).not.toBeInTheDocument();
  });

  it('says "No suggestions for Eating Moments" in a status when none was worth proposing', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      [suggestRoute]: () =>
        Response.json({ guidance: {}, noSuggestions: ['eatingMoments'] }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());

    await screen.findByText('No suggestions for Eating Moments.');
    expect(
      screen
        .getAllByRole('status')
        .some((s) => s.textContent === 'No suggestions for Eating Moments.'),
    ).toBe(true);
    expect(screen.getByText('No Eating Moments yet.')).toBeVisible();
  });

  it('shows a polite error and leaves the form untouched when suggesting fails', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      [suggestRoute]: () =>
        Response.json(
          { code: 'scan.provider_unavailable', params: {} },
          { status: 502 },
        ),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(suggestButton());

    const toast = await screen.findByText(
      'Suggest Guidance is not working right now. Please try again in a moment.',
    );
    expect(toast.closest('[role="status"]')).not.toBeNull();
    expect(noteField()).toHaveValue('');
    expect(screen.getByLabelText(/^Title/)).toHaveValue('Gran stew');
    // It can be tried again.
    expect(suggestButton()).toBeEnabled();
  });

  describe('the Guidance Cap', () => {
    afterEach(() => vi.useRealTimers());

    const pressAtCap = async (params: object) => {
      const user = userEvent.setup({ delay: null });
      setup('/recipes/new', {
        [suggestRoute]: () =>
          Response.json(
            { code: 'guidance.cap_reached', params },
            { status: 429 },
          ),
      });
      await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
      await user.click(suggestButton());
    };

    it("says when Suggest Guidance is available again, in the Member's own time, and leaves the form untouched", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date('2026-05-01T10:00:00Z'));
      const resetsAt = '2026-05-02T00:00:00.000Z';
      await pressAtCap({ cap: 20, resetsAt });
      const when = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
      }).format(Date.parse(resetsAt));
      const toast = await screen.findByText(
        `You have used all 20 Suggest Guidance requests for today. Your requests reset on ${when}.`,
      );
      expect(toast.closest('[role="status"]')).not.toBeNull();
      expect(noteField()).toHaveValue('');
      expect(screen.getByLabelText(/^Title/)).toHaveValue('Gran stew');
    });

    it('says to try tomorrow when the reset time is missing', async () => {
      await pressAtCap({ cap: 20 });
      expect(
        await screen.findByText(
          'You have used all 20 Suggest Guidance requests for today. Try again tomorrow.',
        ),
      ).toBeInTheDocument();
    });

    it('leaves the number out when the cap is missing', async () => {
      await pressAtCap({});
      expect(
        await screen.findByText(
          "You have used all of today's Suggest Guidance requests. Try again tomorrow.",
        ),
      ).toBeInTheDocument();
    });
  });

  it('on the edit page reads unsaved edits and names the Recipe being edited', async () => {
    const user = userEvent.setup({ delay: null });
    const calls = setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(unfilled),
      [suggestRoute]: proposal,
    });
    await openTab(user, 'Details');
    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: 'Unsaved title' },
    });
    await openTab(user, 'Steps');

    await user.click(suggestButton());

    await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
    expect(calls.find((c) => c.key === suggestRoute)?.body).toMatchObject({
      recipeId: 'g',
      recipe: { title: 'Unsaved title' },
      guidance: { pairings: [{ id: 'p1' }, { id: 'p2' }] },
    });
  });

  describe('Pairings', () => {
    const titleAndSuggest = async (routes: Record<string, () => Response>) => {
      const user = userEvent.setup({ delay: null });
      const calls = setup('/recipes/new', routes);
      await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
      return { user, calls };
    };

    it('lands linked Pairings marked Suggested, naming the Ingredient and the Recipe they link to', async () => {
      const { user, calls } = await titleAndSuggest({
        [suggestRoute]: () =>
          Response.json({
            guidance: {
              pairings: [
                {
                  ...idea,
                  label: 'Butter',
                  linkedIngredientId: 'butter',
                  linkedIngredientName: 'Butter',
                },
                {
                  ...idea,
                  kind: 'drink',
                  label: 'Tea',
                  principle: null,
                  linkedRecipeId: 'tea',
                  linkedRecipeTitle: 'Iced tea',
                },
              ],
            },
            noSuggestions: ['nutritionNote'],
          }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      });
      await user.click(suggestButton());

      await screen.findByText('Linked Ingredient: Butter');
      expect(within(pairingsGroup()).getAllByText('Suggested')).toHaveLength(2);
      expect(
        screen.getByLabelText('Linked Recipe of Pairing 2'),
      ).toHaveDisplayValue('Iced tea');
      expect(
        screen.getByText('No suggestions for Nutrition Note.'),
      ).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(calls.some((c) => c.key === 'POST /api/recipes')).toBe(true),
      );
      const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
      expect(body).toMatchObject({
        guidance: {
          pairings: [
            { label: 'Butter', linkedIngredientId: 'butter' },
            { label: 'Tea', linkedRecipeId: 'tea', linkedIngredientId: null },
          ],
        },
      });
      expect(JSON.stringify(body)).not.toMatch(/suggested|linkedRecipeTitle/i);
    });

    it('says "No suggestions for Pairings." when the server has none', async () => {
      const { user } = await titleAndSuggest({
        [suggestRoute]: () =>
          Response.json({ guidance: {}, noSuggestions: ['pairings'] }),
      });
      await user.click(suggestButton());

      await screen.findByText('No suggestions for Pairings.');
      expect(
        screen.queryByLabelText('Label of Pairing 1'),
      ).not.toBeInTheDocument();
    });

    it('treats blank Pairing rows as empty: sends none, and the proposal replaces them', async () => {
      const { user, calls } = await titleAndSuggest({
        [suggestRoute]: proposal,
      });
      await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
      expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue('');
      expect(suggestButton()).toBeEnabled();

      await user.click(suggestButton());

      await vi.waitFor(() =>
        expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue(
          'Fresh berries',
        ),
      );
      expect(calls.find((c) => c.key === suggestRoute)?.body).toMatchObject({
        guidance: { pairings: [] },
      });
      expect(
        screen.queryByLabelText('Label of Pairing 2'),
      ).not.toBeInTheDocument();
    });

    it('clears the Suggested chip of a Pairing once the Member edits it', async () => {
      const { user } = await titleAndSuggest({
        [suggestRoute]: () =>
          Response.json({
            guidance: { pairings: [idea, { ...idea, label: 'Toast' }] },
            noSuggestions: ['nutritionNote'],
          }),
      });
      await user.click(suggestButton());
      await screen.findByLabelText('Label of Pairing 2');
      expect(within(pairingsGroup()).getAllByText('Suggested')).toHaveLength(2);

      await user.type(screen.getByLabelText('Label of Pairing 1'), '!');
      expect(within(pairingsGroup()).getAllByText('Suggested')).toHaveLength(1);
    });

    it("keeps a partly typed Pairing row as the Member's own: Pairings are not proposed beside it", async () => {
      const { user, calls } = await titleAndSuggest({
        [suggestRoute]: noteOnly,
      });
      await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
      await user.type(screen.getByLabelText('Label of Pairing 1'), 'Half way');

      await user.click(suggestButton());

      await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
      expect(calls.find((c) => c.key === suggestRoute)?.body).toMatchObject({
        guidance: { pairings: [{ label: 'Half way' }] },
      });
      expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue(
        'Half way',
      );
      expect(
        screen.queryByLabelText('Label of Pairing 2'),
      ).not.toBeInTheDocument();
      expect(
        within(pairingsGroup()).queryByText('Suggested'),
      ).not.toBeInTheDocument();
    });

    it('keeps a Pairing the Member has filled in: it is not asked for again', async () => {
      const { user } = await titleAndSuggest({ [suggestRoute]: proposal });
      await user.click(screen.getByRole('button', { name: 'Add a Pairing' }));
      await user.type(screen.getByLabelText('Label of Pairing 1'), 'Mine');
      await user.type(screen.getByLabelText('Reason for Pairing 1'), 'Because');

      await user.click(suggestButton());

      await vi.waitFor(() => expect(noteField()).toHaveValue(NOTE));
      expect(screen.getByLabelText('Label of Pairing 1')).toHaveValue('Mine');
      expect(
        screen.queryByLabelText('Label of Pairing 2'),
      ).not.toBeInTheDocument();
    });
  });
});

describe('Recipe editor shell', () => {
  afterEach(() => vi.unstubAllGlobals());

  const variantRoutes = {
    'GET /api/recipes/x/variant-draft': () => Response.json(draft),
    'POST /api/recipe-drafts': () =>
      Response.json({ id: 'draft-1', version: 1 }, { status: 201 }),
  };

  it('opens New Recipe on Details with Back to the Recipes, the title and Save', async () => {
    setup('/recipes/new', {});
    expect(
      await screen.findByRole('tab', { name: /^Details/ }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'New Recipe',
    );
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/recipes',
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    // The editor's own heading and bottom buttons are gone.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    // Back, not Home, is the way out.
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
  });

  it('opens Make a Variant on Details with Back to the Recipe', async () => {
    setup('/recipes/x/variant/new', variantRoutes);
    expect(
      await screen.findByRole('tab', { name: /^Details/ }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/recipes/x',
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('opens Edit on Steps with Back to the Recipe and no Recipe Draft status', async () => {
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
    });
    expect(await screen.findByRole('tab', { name: /^Steps/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/recipes/g',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Edit Recipe',
    );
    expect(screen.queryByText('Draft saved')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Discard draft' })).toBeNull();
  });

  it('keeps a Suggest Guidance answer and its Suggested marks across a tab switch', async () => {
    const user = userEvent.setup({ delay: null });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    setup('/recipes/new', {
      'POST /api/recipes/suggest-guidance': async () => {
        await gate;
        return Response.json({
          guidance: { nutritionNote: 'Rich in protein.' },
          noSuggestions: [],
        });
      },
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await user.click(screen.getByRole('button', { name: 'Suggest Guidance' }));
    await screen.findByRole('button', { name: 'Suggesting…' });

    // Away while the request is in flight, and back after it lands.
    await user.click(screen.getByRole('tab', { name: /^Ingredients/ }));
    release();
    await user.click(screen.getByRole('tab', { name: /^Details/ }));

    await vi.waitFor(() =>
      expect(screen.getByLabelText('Nutrition Note')).toHaveValue(
        'Rich in protein.',
      ),
    );
    // The mark stays through another round trip.
    await user.click(screen.getByRole('tab', { name: /^Steps/ }));
    await user.click(screen.getByRole('tab', { name: /^Details/ }));
    expect(
      within(screen.getByRole('group', { name: /Nutrition Note/ })).getByText(
        'Suggested',
      ),
    ).toBeVisible();
  });

  it('keeps a Back to the Recipes when the resumed Recipe Draft cannot be read', async () => {
    setup('/recipes/new?draft=gone', {
      'GET /api/recipe-drafts/gone': () =>
        Response.json({ error: 'not_found' }, { status: 404 }),
    });
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/recipes',
    );
  });

  it('counts Ingredients and Steps in the tab names', async () => {
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(saved),
    });
    expect(
      await screen.findByRole('tab', { name: 'Ingredients, 2' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Steps, 1' })).toBeVisible();
  });

  it('marks Details with "!" while Serves is blank, and while the touched title is blank', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {});
    const details = await screen.findByRole('tab', { name: /^Details/ });
    await user.clear(screen.getByLabelText(/^Servings/));
    expect(details).toHaveAccessibleName('Details, Needs attention');
    await user.type(screen.getByLabelText(/^Servings/), '4');
    // An untouched blank title does not nag yet.
    expect(details).toHaveAccessibleName('Details');
    await user.click(screen.getByLabelText(/^Title/));
    await user.tab();
    expect(details).toHaveAccessibleName('Details, Needs attention');
    await user.type(screen.getByLabelText(/^Title/), 'Stew');
    expect(details).toHaveAccessibleName('Details');
  });

  it('moves between tabs with the arrow keys and scrolls to the top', async () => {
    const user = userEvent.setup({ delay: null });
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    setup('/recipes/new', {});
    const details = await screen.findByRole('tab', { name: /^Details/ });
    details.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /^Ingredients/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /^Steps/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(details).toHaveAttribute('aria-selected', 'true');
  });

  it('puts the fields in their tabs and links on with Ingredients › and Steps ›', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/x/variant/new', variantRoutes);
    expect(await screen.findByLabelText(/^Title/)).toBeVisible();
    expect(screen.getByRole('region', { name: 'Guidance' })).toBeVisible();
    // The other tabs stay mounted but hidden.
    expect(screen.getByLabelText('Quantity of Egg')).not.toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Step 1' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Ingredients ›' }));
    expect(screen.getByRole('tab', { name: /^Ingredients/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Quantity of Egg')).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    ).toBeVisible();
    expect(screen.getByLabelText(/^Title/)).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Steps ›' }));
    expect(screen.getByLabelText('Step 1')).toBeVisible();
  });

  it('words the hints for a New Recipe and a Variant', async () => {
    setup('/recipes/new', {});
    expect(
      await screen.findByText(
        "Kept as your draft until you save it as one of your family's Recipes.",
      ),
    ).toBeVisible();
  });

  it('words the Variant hint with the source and no owner', async () => {
    setup('/recipes/x/variant/new', {
      ...variantRoutes,
      'GET /api/recipes/x': () =>
        Response.json({ ...sourceDetail, title: 'Classic omelette' }),
    });
    expect(
      await screen.findByText(
        'Copied from Classic omelette. It becomes a Recipe when you save it.',
      ),
    ).toBeVisible();
  });

  it('shows the Recipe Draft status under the title, not beside Save', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: 'draft-1', version: 1 }, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Stew');
    const status = await within(screen.getByRole('banner')).findByRole(
      'status',
    );
    expect(
      screen.getByRole('heading', { level: 1 }).parentElement,
    ).toContainElement(status);
    expect(screen.getByRole('button', { name: 'Save' })).not.toContainElement(
      status,
    );
  });

  it('puts Discard draft at the end of Details only, once the draft exists', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: 'draft-1', version: 1 }, { status: 201 }),
    });
    expect(screen.queryByRole('button', { name: 'Discard draft' })).toBeNull();
    await user.type(await screen.findByLabelText(/^Title/), 'Stew');
    expect(
      await screen.findByRole(
        'button',
        { name: 'Discard draft' },
        { timeout: 4000 },
      ),
    ).toBeVisible();
    await user.click(screen.getByRole('tab', { name: /^Steps/ }));
    expect(screen.queryByRole('button', { name: 'Discard draft' })).toBeNull();
  });
});

describe('Recipe editor Steps (#591)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const twoSteps: FamilyRecipeEdit = {
    ...saved,
    steps: [
      { id: 's1', text: 'Whisk the eggs', timerSeconds: 90 },
      { id: 's2', text: 'Fry', timerSeconds: null },
    ],
    tips: [{ id: 't2', stepId: 's1', text: 'Low heat' }],
  };
  const edit = () =>
    setup('/recipes/g/edit', {
      'GET /api/recipes/g/edit': () => Response.json(twoSteps),
    });

  it('turns the Timer chip into a minutes field starting at 5, and back with ×', async () => {
    const user = userEvent.setup({ delay: null });
    edit();
    await openTab(user, 'Steps');
    expect(screen.getByLabelText('Timer for Step 1 (minutes)')).toHaveValue(
      '1.5',
    );
    expect(screen.getAllByText('min')).toHaveLength(1);
    await user.click(
      screen.getByRole('button', { name: 'Add a timer to Step 2' }),
    );
    const timer = screen.getByLabelText('Timer for Step 2 (minutes)');
    expect(timer).toHaveValue('5');
    expect(screen.getAllByText('min')).toHaveLength(2);
    await user.clear(timer);
    expect(screen.queryByText(/The timer must be a positive/)).toBeNull();
    await user.type(timer, 'x');
    expect(
      screen.getByText(/The timer must be a positive number of minutes/),
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Remove the timer from Step 2' }),
    );
    expect(screen.queryByLabelText('Timer for Step 2 (minutes)')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Add a timer to Step 2' }),
    ).toBeVisible();
  });

  it('shows the placeholder and flags a touched blank Step', async () => {
    const user = userEvent.setup({ delay: null });
    edit();
    await openTab(user, 'Steps');
    expect(screen.getByLabelText('Step 2')).toHaveAttribute(
      'placeholder',
      'What to do in Step 2',
    );
    await user.clear(screen.getByLabelText('Step 2'));
    expect(screen.getByText('Enter the Step text.')).toBeVisible();
  });

  it('adds a Step at the start and at the end, focusing its text', async () => {
    const user = userEvent.setup({ delay: null });
    edit();
    await openTab(user, 'Steps');
    await user.click(screen.getByRole('button', { name: 'Add a Step' }));
    expect(screen.getByLabelText('Step 3')).toHaveFocus();
    expect(screen.getByLabelText('Step 3')).toHaveValue('');

    await user.click(
      screen.getByRole('button', { name: 'Add a Step at the start' }),
    );
    expect(screen.getByLabelText('Step 1')).toHaveFocus();
    expect(screen.getByLabelText('Step 1')).toHaveValue('');
    expect(screen.getByLabelText('Step 2')).toHaveValue('Whisk the eggs');
    expect(screen.getByLabelText('Step 4')).toHaveValue('');
  });

  it('offers only "Add the first Step" when there are no Steps', async () => {
    const user = userEvent.setup({ delay: null });
    setup('/recipes/new', {});
    await openTab(user, 'Steps');
    expect(
      screen.queryByRole('button', { name: 'Add a Step at the start' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add a Step' })).toBeNull();
    await user.click(
      screen.getByRole('button', { name: 'Add the first Step' }),
    );
    expect(screen.getByLabelText('Step 1')).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Add the first Step' }),
    ).toBeNull();
  });

  it('confirms inline before removing a saved Step with Tips, with no Undo', async () => {
    const user = userEvent.setup({ delay: null });
    edit();
    await openTab(user, 'Steps');
    await user.click(screen.getByRole('button', { name: 'Remove Step 1' }));
    expect(
      screen.getByText('Removing Step 1 deletes its 1 Tip when you save.'),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Keep Step' }));
    expect(screen.getByLabelText('Step 1')).toHaveValue('Whisk the eggs');
    await user.click(screen.getByRole('button', { name: 'Remove Step 1' }));
    await user.click(
      screen.getByRole('button', { name: 'Remove Step and Tips' }),
    );
    expect(screen.getByLabelText('Step 1')).toHaveValue('Fry');
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });

  it('removes a Step with a polite Undo toast that restores it at its old index', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      delay: null,
      advanceTimers: vi.advanceTimersByTime,
    });
    edit();
    await openTab(user, 'Steps');
    await user.click(screen.getByRole('button', { name: 'Add a Step' }));
    await user.type(screen.getByLabelText('Step 3'), 'Plate');
    await user.click(screen.getByRole('button', { name: 'Remove Step 2' }));
    expect(screen.getByLabelText('Step 2')).toHaveValue('Plate');
    expect(
      screen.getByText('Removed Step 2').closest('[role="status"]'),
    ).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByLabelText('Step 2')).toHaveValue('Fry');
    expect(screen.getByLabelText('Step 3')).toHaveValue('Plate');
  });
});
