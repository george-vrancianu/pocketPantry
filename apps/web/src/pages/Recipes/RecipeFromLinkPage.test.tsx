import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FamilyRecipeEdit } from '../../lib/familyRecipes';
import type { RecipeFromLink } from '../../lib/linkRecipe';
import type { Locale } from '../../i18n';
import { renderWithProviders, stubApi } from '../../test/render';
import { NewRecipePage } from './FamilyRecipePages';
import { RecipeFromLinkPage } from './RecipeFromLinkPage';

const filters = {
  cuisines: [{ id: 'c-fr', name: 'French' }],
  methods: [{ id: 'm-pan', name: 'Pan frying' }],
  eatingMoments: [],
};

const read = (over: Partial<RecipeFromLink['draft']> = {}): RecipeFromLink => ({
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
      const submitName = { ro: 'Citește rețeta', da: 'Læs opskriften' }[
        locale as 'ro' | 'da'
      ];
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
      await user.click(screen.getByRole('button', { name: submitName }));
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

  describe('pasting text instead', () => {
    const textField = () => screen.getByLabelText(/^Recipe text/);
    const fromLink = (calls: ReturnType<typeof setup>['calls']) =>
      calls.find((c) => c.key === 'POST /api/recipes/from-link')?.body;
    const failing = (code: string, status = 422) => ({
      'POST /api/recipes/from-link': () =>
        Response.json({ code, params: {} }, { status }),
    });

    it('swaps the link field for a text field and sends the text with the language, no url', async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        'POST /api/recipes/from-link': () =>
          Response.json({ ...read({ servings: 4 }), sourceLink: null }),
      });
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      expect(textField()).toHaveFocus();
      expect(screen.queryByLabelText(/^Link to the recipe/)).toBeNull();
      expect(screen.getByRole('radiogroup')).toBeVisible();
      const submitButton = screen.getByRole('button', {
        name: 'Read the recipe',
      });
      expect(submitButton).toBeDisabled();
      await user.click(
        screen.getByRole('radio', { name: "Keep the page's language" }),
      );
      await user.type(textField(), '  2 eggs, whisk and fry  ');
      await user.click(submitButton);
      expect(await screen.findByLabelText(/^Title/)).toHaveValue(
        'Blog pancakes',
      );
      expect(fromLink(calls)).toEqual({
        text: '2 eggs, whisk and fry',
        language: 'source',
      });
      expect(screen.queryByRole('link', { name: /^From / })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Remove link' })).toBeNull();
    });

    it('saves a pasted draft without a sourceLink', async () => {
      const user = userEvent.setup({ delay: null });
      const { calls } = setup({
        'POST /api/recipes/from-link': () =>
          Response.json({ ...read({ servings: 4 }), sourceLink: null }),
        'POST /api/recipes': () => Response.json(saved, { status: 201 }),
      });
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      await user.type(textField(), 'eggs');
      await user.click(screen.getByRole('button', { name: 'Read the recipe' }));
      await user.click(
        await screen.findByRole('button', { name: 'Save Recipe' }),
      );
      await screen.findByText('Detail of the recipe');
      const body = calls.find((c) => c.key === 'POST /api/recipes')?.body;
      expect(body).toMatchObject({ servings: 4 });
      expect(body).not.toHaveProperty('sourceLink');
    });

    it('keeps the link and the text when switching back and forth', async () => {
      const user = userEvent.setup({ delay: null });
      setup({});
      await user.type(linkField(), 'https://example.com/a');
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      await user.type(textField(), 'two eggs');
      await user.click(
        screen.getByRole('button', { name: 'Use a link instead' }),
      );
      expect(linkField()).toHaveValue('https://example.com/a');
      expect(linkField()).toHaveFocus();
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      expect(textField()).toHaveValue('two eggs');
      expect(textField()).toHaveFocus();
    });

    it('shows progress and aborts on Cancel just like a link', async () => {
      const user = userEvent.setup({ delay: null });
      const pending = hold(read());
      const { signals } = setup({
        'POST /api/recipes/from-link': pending.handler,
      });
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      await user.type(textField(), 'eggs');
      await user.click(screen.getByRole('button', { name: 'Read the recipe' }));
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Reading the recipe',
      );
      expect(textField()).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(signals.at(-1)?.aborted).toBe(true);
      expect(textField()).toHaveValue('eggs');
      expect(textField()).toHaveFocus();
      pending.release();
    });

    it.each([
      ['link.unreadable', /could not open that page/],
      ['link.no_recipe', /could not find a recipe on that page/],
    ])(
      'offers to paste the text after %s, keeping the link',
      async (code, copy) => {
        const user = userEvent.setup({ delay: null });
        setup(failing(code));
        await submit(user, 'https://example.com/a');
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(copy);
        await user.click(
          within(alert).getByRole('button', {
            name: 'Paste the recipe text instead',
          }),
        );
        expect(textField()).toHaveFocus();
        expect(screen.queryByRole('alert')).toBeNull();
        await user.click(
          screen.getByRole('button', { name: 'Use a link instead' }),
        );
        expect(linkField()).toHaveValue('https://example.com/a');
      },
    );

    it('says no recipe in the text, with no paste offer, in paste mode', async () => {
      const user = userEvent.setup({ delay: null });
      setup(failing('link.no_recipe'));
      await user.click(
        screen.getByRole('button', { name: 'Paste text instead' }),
      );
      await user.type(textField(), 'hello');
      await user.click(screen.getByRole('button', { name: 'Read the recipe' }));
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/could not find a recipe in that text/);
      expect(alert).not.toHaveTextContent(/page/);
      expect(
        screen.queryByRole('button', { name: 'Paste the recipe text instead' }),
      ).toBeNull();
      expect(textField()).toHaveValue('hello');
    });

    it.each([
      ['link.invalid', 400],
      ['link.cap_reached', 429],
      ['scan.provider_unavailable', 502],
    ])('does not offer to paste after %s', async (code, status) => {
      const user = userEvent.setup({ delay: null });
      setup(failing(code, status));
      await submit(user, 'https://example.com/a');
      await screen.findByRole('alert');
      expect(
        screen.queryByRole('button', { name: 'Paste the recipe text instead' }),
      ).toBeNull();
    });
  });
});
