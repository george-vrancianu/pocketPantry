import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FamilyRecipeEdit } from '../../lib/familyRecipes';
import type { RecipeFromLink, RecipeFromLinkDraft } from '../../lib/linkRecipe';
import type { Locale } from '../../i18n';
import { renderWithProviders, stubApi } from '../../test/render';
import { NewRecipePage } from './FamilyRecipePages';
import { RecipeFromLinkPage } from './RecipeFromLinkPage';

const filters = {
  cuisines: [{ id: 'c-fr', name: 'French' }],
  methods: [{ id: 'm-pan', name: 'Pan frying' }],
  eatingMoments: [],
};

const read = (
  over: Partial<RecipeFromLinkDraft['draft']> = {},
): RecipeFromLinkDraft => ({
  kind: 'draft',
  draft: {
    title: 'Blog pancakes',
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
        note: '2 large',
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
    steps: [
      { text: 'Whisk and fry', timerSeconds: 120 },
      { text: 'Serve warm', timerSeconds: null },
    ],
    tips: [],
    guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
    ...over,
  },
  sourceLink: 'https://www.example.com/pancakes',
  sourceLanguage: null,
  closestBases: [],
  hiddenByAllergiesCount: 0,
});

const saved = {
  id: 'new-id',
  parentId: null,
  title: 'Blog pancakes',
  servings: 4,
  lines: [],
  steps: [],
} as unknown as FamilyRecipeEdit;

type Routes = Parameters<typeof stubApi>[0];

/** Records the AbortSignal of every request, as the browser would receive it. */
function setup(routes: Routes) {
  const signals: Array<AbortSignal | null | undefined> = [];
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes/filters': () => Response.json(filters),
    ...routes,
  });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    signals.push(init?.signal);
    const response = fetchMock(input, init);
    const signal = init?.signal;
    if (!signal) return response;
    // A real fetch rejects when its signal aborts.
    return Promise.race([
      response,
      new Promise<never>((_, reject) =>
        signal.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        ),
      ),
    ]);
  });
  function Where() {
    return <p>at {useLocation().pathname}</p>;
  }
  const view = renderWithProviders(
    <>
      <Where />
      <Routes>
        <Route path="/recipes" element={<p>recipes list</p>} />
        <Route path="/recipes/from-link" element={<RecipeFromLinkPage />} />
        <Route path="/recipes/new" element={<NewRecipePage />} />
        <Route path="/recipes/:id" element={<p>Detail of the recipe</p>} />
      </Routes>
    </>,
    { route: '/recipes/from-link' },
  );
  return { calls, signals, ...view };
}

/** A read that stays pending until `release` is called. */
function hold(result: RecipeFromLink) {
  let release = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  return {
    release,
    handler: async () => {
      await gate;
      return Response.json(result);
    },
  };
}

const linkField = () => screen.getByLabelText(/^Link to the recipe/);

async function submit(user: ReturnType<typeof userEvent.setup>, url: string) {
  await user.type(linkField(), url);
  await user.click(screen.getByRole('button', { name: 'Read the recipe' }));
}

describe('RecipeFromLinkPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the link and shows a progress state while reading', async () => {
    const user = userEvent.setup({ delay: null });
    const pending = hold(read());
    const { calls } = setup({
      'POST /api/recipes/from-link': pending.handler,
    });
    await submit(user, 'https://www.example.com/pancakes');
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Reading the recipe',
    );
    expect(linkField()).toBeDisabled();
    expect(
      calls.find((c) => c.key === 'POST /api/recipes/from-link')?.body,
    ).toEqual({ url: 'https://www.example.com/pancakes', language: 'catalog' });
    pending.release();
    await screen.findByLabelText(/^Title/);
  });

  it('cannot be submitted without a link', async () => {
    setup({});
    expect(
      screen.getByRole('button', { name: 'Read the recipe' }),
    ).toBeDisabled();
    expect(linkField()).not.toHaveFocus();
  });

  it('aborts the read when the Member leaves the step', async () => {
    const user = userEvent.setup({ delay: null });
    const pending = hold(read());
    const { signals, unmount } = setup({
      'POST /api/recipes/from-link': pending.handler,
    });
    await submit(user, 'https://example.com/a');
    await screen.findByRole('status');
    const signal = signals.at(-1);
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
    pending.release();
  });

  it('moves focus to Cancel while reading, then back to the field after Cancel', async () => {
    const user = userEvent.setup({ delay: null });
    const pending = hold(read());
    setup({ 'POST /api/recipes/from-link': pending.handler });
    await submit(user, 'https://example.com/a');
    expect(await screen.findByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(linkField()).toHaveFocus();
    pending.release();
  });

  it('moves focus back to the field after an error', async () => {
    const user = userEvent.setup({ delay: null });
    setup({
      'POST /api/recipes/from-link': () =>
        Response.json({ code: 'link.invalid', params: {} }, { status: 400 }),
    });
    await submit(user, 'https://example.com/a');
    await screen.findByRole('alert');
    expect(linkField()).toHaveFocus();
  });

  it('aborts the read, shows no error and stays on the step when cancelled', async () => {
    const user = userEvent.setup({ delay: null });
    const pending = hold(read());
    const { signals } = setup({
      'POST /api/recipes/from-link': pending.handler,
    });
    await submit(user, 'https://example.com/a');
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(signals.at(-1)?.aborted).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(linkField()).toHaveValue('https://example.com/a');
    expect(screen.getByText('at /recipes/from-link')).toBeVisible();
    pending.release();
    // The late answer is ignored: still on the step.
    await waitFor(() =>
      expect(screen.getByText('at /recipes/from-link')).toBeVisible(),
    );
  });

  it.each([
    ['link.invalid', 400, /not a web address we can open/],
    ['link.unreadable', 422, /could not open that page/],
    ['link.no_recipe', 422, /could not find a recipe on that page/],
    [
      'scan.provider_unavailable',
      502,
      /cannot read recipes from links right now/,
    ],
    ['scan.provider_refused', 502, /could not read a recipe from that page/],
    ['scan.provider_incomplete', 502, /could not read a recipe from that page/],
    ['scan.result_invalid', 502, /could not read a recipe from that page/],
  ])(
    'says what went wrong for %s and keeps the link',
    async (code, status, copy) => {
      const user = userEvent.setup({ delay: null });
      setup({
        'POST /api/recipes/from-link': () =>
          Response.json({ code, params: {} }, { status }),
      });
      await submit(user, 'https://example.com/a');
      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
      expect(linkField()).toHaveValue('https://example.com/a');
      expect(linkField()).toBeEnabled();
      expect(screen.getByText('at /recipes/from-link')).toBeVisible();
    },
  );

  it.each([
    ['ro', 'link.no_recipe', /Nu am găsit nicio rețetă/],
    ['da', 'link.unreadable', /Vi kunne ikke åbne den side/],
  ] as [Locale, string, RegExp][])(
    'words %s errors in that language',
    async (locale, code, copy) => {
      const user = userEvent.setup({ delay: null });
      vi.stubGlobal(
        'fetch',
        stubApi({
          'POST /api/recipes/from-link': () =>
            Response.json({ code, params: {} }, { status: 422 }),
        }).fetchMock,
      );
      renderWithProviders(<RecipeFromLinkPage />, {
        locale,
        route: '/recipes/from-link',
      });
      await user.type(screen.getByRole('textbox'), 'https://example.com/a');
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
    },
  );

  it('opens the New Recipe page filled in from the read', async () => {
    const user = userEvent.setup({ delay: null });
    setup({
      'POST /api/recipes/from-link': () => Response.json(read()),
    });
    await submit(user, 'https://www.example.com/pancakes#top');
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Blog pancakes');
    expect(screen.getByText('at /recipes/new')).toBeVisible();
    // Matched line with the original amount in its note, and an Unmatched name.
    expect(screen.getByLabelText('Quantity of Egg')).toHaveValue('2');
    expect(screen.getByDisplayValue('2 large')).toBeVisible();
    expect(screen.getByText('Maple syrup')).toBeVisible();
    expect(screen.getByDisplayValue('to serve')).toBeVisible();
    // Steps with their timers.
    expect(screen.getByDisplayValue('Whisk and fry')).toBeVisible();
    expect(screen.getByDisplayValue('Serve warm')).toBeVisible();
    expect(screen.getByLabelText('Timer for Step 1 (minutes)')).toHaveValue(
      '2',
    );
    expect(screen.getByLabelText('Timer for Step 2 (minutes)')).toHaveValue('');
    // Where it came from, opening in a new tab; no empty Base Recipe picker.
    const source = screen.getByRole('link', { name: 'From example.com ↗' });
    expect(source).toHaveAttribute('href', 'https://www.example.com/pancakes');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('needs Servings when the page had none, then saves with the Source Link', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () => Response.json(read()),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await submit(user, 'https://www.example.com/pancakes');
    const servings = await screen.findByLabelText(/^Servings/);
    expect(servings).toHaveValue('');
    const save = screen.getByRole('button', { name: 'Save Recipe' });
    expect(save).toBeDisabled();
    await user.type(servings, '4');
    await user.click(save);
    expect(await screen.findByText('Detail of the recipe')).toBeVisible();
    expect(
      calls.find((c) => c.key === 'POST /api/recipes')?.body,
    ).toMatchObject({
      parentId: null,
      title: 'Blog pancakes',
      servings: 4,
      sourceLink: 'https://www.example.com/pancakes',
    });
  });

  describe('closest Base Recipes', () => {
    const bases = [
      {
        id: 'base-omelette',
        title: 'Omelette',
        score: 0.8,
        allergyWarning: null,
      },
      { id: 'base-crepes', title: 'Crepes', score: 0.4, allergyWarning: null },
    ];

    it('offers them in the picker and saves a Variant of the closest with the Source Link', async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        'POST /api/recipes/from-link': () =>
          Response.json({ ...read({ servings: 4 }), closestBases: bases }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      });
      await submit(user, 'https://www.example.com/pancakes');
      expect(
        await screen.findByRole('radio', { name: /Omelette/ }),
      ).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Crepes' })).not.toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
      expect(await screen.findByText('Detail of the recipe')).toBeVisible();
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        parentId: 'base-omelette',
        sourceLink: 'https://www.example.com/pancakes',
      });
    });

    it('saves a Base Recipe with the Source Link when standalone is picked', async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        'POST /api/recipes/from-link': () =>
          Response.json({ ...read({ servings: 4 }), closestBases: bases }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      });
      await submit(user, 'https://www.example.com/pancakes');
      await user.click(
        await screen.findByRole('radio', { name: /standalone/i }),
      );
      await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
      expect(await screen.findByText('Detail of the recipe')).toBeVisible();
      expect(
        calls.find((c) => c.key === 'POST /api/recipes')?.body,
      ).toMatchObject({
        parentId: null,
        sourceLink: 'https://www.example.com/pancakes',
      });
    });

    it('carries the hidden-by-Allergies count to the picker note', async () => {
      const user = userEvent.setup({ delay: null });
      setup({
        'POST /api/recipes/from-link': () =>
          Response.json({
            ...read({ servings: 4 }),
            closestBases: [],
            hiddenByAllergiesCount: 1,
          }),
      });
      await submit(user, 'https://www.example.com/pancakes');
      expect(
        await screen.findByText('1 Recipe hidden by your Allergies'),
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Show' })).toBeVisible();
    });
  });

  it('saves without the Source Link once the Member removes it', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () => Response.json(read({ servings: 4 })),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await submit(user, 'https://www.example.com/pancakes');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    expect(screen.queryByRole('link', { name: /^From / })).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('Detail of the recipe');
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
    expect(body).toMatchObject({ servings: 4 });
    expect(body).not.toHaveProperty('sourceLink');
  });

  describe('the Link Cap', () => {
    afterEach(() => vi.useRealTimers());

    it("says when the reads start again, in the Member's own time", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date('2026-05-01T10:00:00Z'));
      const user = userEvent.setup({ delay: null });
      const resetsAt = '2026-05-02T00:00:00.000Z';
      setup({
        'POST /api/recipes/from-link': () =>
          Response.json(
            { code: 'link.cap_reached', params: { cap: 20, resetsAt } },
            { status: 429 },
          ),
      });
      await submit(user, 'https://example.com/a');
      const when = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
      }).format(Date.parse(resetsAt));
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        `You have used all 20 recipe reads from links for today. Your reads reset on ${when}.`,
      );
      expect(linkField()).toHaveFocus();
    });

    it('leaves the number out when the cap is missing', async () => {
      const user = userEvent.setup({ delay: null });
      setup({
        'POST /api/recipes/from-link': () =>
          Response.json(
            { code: 'link.cap_reached', params: {} },
            { status: 429 },
          ),
      });
      await submit(user, 'https://example.com/a');
      expect(await screen.findByRole('alert')).toHaveTextContent(
        "You have used all of today's recipe reads from links. Try again tomorrow.",
      );
    });

    it('says to try tomorrow when the reset time is missing', async () => {
      const user = userEvent.setup({ delay: null });
      setup({
        'POST /api/recipes/from-link': () =>
          Response.json(
            { code: 'link.cap_reached', params: { cap: 20 } },
            { status: 429 },
          ),
      });
      await submit(user, 'https://example.com/a');
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'You have used all 20 recipe reads from links for today. Try again tomorrow.',
      );
    });
  });

  describe('language choice', () => {
    const preferences = (catalog: Locale) => ({
      'GET /api/settings/preferences': () =>
        Response.json({
          locale: 'en',
          catalogLanguage: catalog,
          effectiveCatalogLanguage: catalog,
        }),
    });
    const sent = (calls: ReturnType<typeof setup>['calls']) =>
      calls.find((c) => c.key === 'POST /api/recipes/from-link')?.body;

    it('defaults to the Catalog Language and names it, even when it is not English', async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        ...preferences('da'),
        'POST /api/recipes/from-link': () => Response.json(read()),
      });
      const catalog = await screen.findByRole('radio', { name: 'In Danish' });
      expect(catalog).toBeChecked();
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName(
        'Language of the recipe',
      );
      await submit(user, 'https://www.example.com/pancakes');
      await screen.findByLabelText(/^Title/);
      expect(sent(calls)).toMatchObject({ language: 'catalog' });
    });

    it("sends 'source' after switching to Keep the page's language", async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        ...preferences('ro'),
        'POST /api/recipes/from-link': () => Response.json(read()),
      });
      await user.click(
        await screen.findByRole('radio', { name: "Keep the page's language" }),
      );
      await submit(user, 'https://www.example.com/pancakes');
      await screen.findByLabelText(/^Title/);
      expect(sent(calls)).toMatchObject({ language: 'source' });
    });

    it('says "På dansk" and "În engleză" in lower case in the Member\'s UI Language', async () => {
      vi.stubGlobal(
        'fetch',
        stubApi({
          'GET /api/settings/preferences': () =>
            Response.json({ effectiveCatalogLanguage: 'da' }),
        }).fetchMock,
      );
      renderWithProviders(<RecipeFromLinkPage />, { locale: 'da' });
      expect(
        await screen.findByRole('radio', { name: 'På dansk' }),
      ).toBeChecked();
      cleanup();
      vi.stubGlobal(
        'fetch',
        stubApi({
          'GET /api/settings/preferences': () =>
            Response.json({ effectiveCatalogLanguage: 'en' }),
        }).fetchMock,
      );
      renderWithProviders(<RecipeFromLinkPage />, { locale: 'ro' });
      expect(
        await screen.findByRole('radio', { name: 'În engleză' }),
      ).toBeChecked();
    });

    it('names the UI Language until the Preferences arrive', async () => {
      setup({
        'GET /api/settings/preferences': () => new Promise<Response>(() => {}),
      });
      expect(
        await screen.findByRole('radio', { name: 'In English' }),
      ).toBeChecked();
    });
  });

  it('carries the source language to the create request', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () =>
        Response.json({ ...read({ servings: 4 }), sourceLanguage: 'fr' }),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await submit(user, 'https://www.example.com/pancakes');
    expect(await screen.findByText(/Translated from French/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('Detail of the recipe');
    expect(
      calls.find((c) => c.key === 'POST /api/recipes')?.body,
    ).toMatchObject({
      sourceLink: 'https://www.example.com/pancakes',
      sourceLanguage: 'fr',
    });
  });

  it('sends no source language when the page needed no translation', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () => Response.json(read({ servings: 4 })),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await submit(user, 'https://www.example.com/pancakes');
    await user.click(
      await screen.findByRole('button', { name: 'Save Recipe' }),
    );
    await screen.findByText('Detail of the recipe');
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
    expect(body).toHaveProperty('sourceLink');
    expect(body).not.toHaveProperty('sourceLanguage');
  });

  it('drops the source language along with the removed Source Link', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () =>
        Response.json({ ...read({ servings: 4 }), sourceLanguage: 'fr' }),
      'POST /api/recipes': () => Response.json(saved, { status: 201 }),
    });
    await submit(user, 'https://www.example.com/pancakes');
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' }),
    );
    expect(screen.queryByText(/Translated from/)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('Detail of the recipe');
    const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
    expect(body).not.toHaveProperty('sourceLink');
    expect(body).not.toHaveProperty('sourceLanguage');
  });
});

describe('Already in your Recipes', () => {
  afterEach(() => vi.unstubAllGlobals());

  const duplicate = { kind: 'duplicate', recipeId: 'r-1' };
  const link = 'https://www.example.com/pancakes';

  it('offers Open and Read again instead of the form, with focus on the heading', async () => {
    const user = userEvent.setup({ delay: null });
    setup({ 'POST /api/recipes/from-link': () => Response.json(duplicate) });
    await submit(user, link);
    const heading = await screen.findByRole('heading', {
      name: 'Already in your Recipes',
    });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Read again' })).toBeVisible();
    expect(screen.getByText('at /recipes/from-link')).toBeVisible();
  });

  it('Open goes to that Recipe', async () => {
    const user = userEvent.setup({ delay: null });
    const { calls } = setup({
      'POST /api/recipes/from-link': () => Response.json(duplicate),
    });
    await submit(user, link);
    await user.click(await screen.findByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Detail of the recipe')).toBeVisible();
    expect(screen.getByText('at /recipes/r-1')).toBeVisible();
    expect(
      calls.filter((c) => c.key === 'POST /api/recipes/from-link'),
    ).toHaveLength(1);
  });

  it('Read again sends the same request with force and opens the draft', async () => {
    const user = userEvent.setup({ delay: null });
    let first = true;
    const { calls } = setup({
      'POST /api/recipes/from-link': () => {
        const answer = first ? duplicate : read({ servings: 4 });
        first = false;
        return Response.json(answer);
      },
    });
    await submit(user, link);
    await user.click(await screen.findByRole('button', { name: 'Read again' }));
    expect(await screen.findByDisplayValue('Blog pancakes')).toBeVisible();
    const bodies = calls
      .filter((c) => c.key === 'POST /api/recipes/from-link')
      .map((c) => c.body);
    expect(bodies[0]).toEqual({ url: link, language: 'catalog' });
    expect(bodies[1]).toEqual({ url: link, language: 'catalog', force: true });
  });

  it('Read again that fails shows the error and clears the panel', async () => {
    const user = userEvent.setup({ delay: null });
    let first = true;
    setup({
      'POST /api/recipes/from-link': () => {
        if (first) {
          first = false;
          return Response.json(duplicate);
        }
        return Response.json(
          { code: 'link.unreadable', message: 'x' },
          { status: 422 },
        );
      },
    });
    await submit(user, link);
    await user.click(await screen.findByRole('button', { name: 'Read again' }));
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.queryByText('Already in your Recipes')).toBeNull();
    expect(linkField()).toHaveFocus();
  });

  it('editing the link or the language clears the panel', async () => {
    const user = userEvent.setup({ delay: null });
    setup({ 'POST /api/recipes/from-link': () => Response.json(duplicate) });
    await submit(user, link);
    await screen.findByText('Already in your Recipes');
    await user.type(linkField(), '2');
    expect(screen.queryByText('Already in your Recipes')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Read the recipe' }),
    ).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Read the recipe' }));
    await screen.findByText('Already in your Recipes');
    await user.click(
      screen.getByRole('radio', { name: "Keep the page's language" }),
    );
    expect(screen.queryByText('Already in your Recipes')).toBeNull();
  });
});
