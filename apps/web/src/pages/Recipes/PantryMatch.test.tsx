import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { suggestionsQueryKey } from '../../lib/queryKeys';
import { shoppingListQueryKey } from '../../lib/shopping';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PantryLine, PantryMatch } from '../../lib/recipes';
import type { RecipeDetail } from '../../lib/recipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { RecipeDetailPage } from './RecipeDetailPage';

const detail: RecipeDetail = {
  id: 'r1',
  parentId: null,
  owner: 'catalog',
  title: 'Pancakes',
  servings: 2,
  prepMinutes: null,
  cookMinutes: null,
  difficulty: null,
  cuisine: null,
  method: null,
  archived: false,
  lines: [
    ['l-flour', 'Flour', 200, 'g', false],
    ['l-egg', 'Egg', 2, 'pcs', false],
    ['l-milk', 'Milk', 300, 'ml', false],
    ['l-salt', 'Salt', 1, 'g', false],
    ['l-chive', 'Chives', null, null, true],
  ].map(([id, ingredientName, quantity, unit, optional]) => ({
    id: id as string,
    ingredientId: id as string,
    ingredientName: ingredientName as string,
    quantity: quantity as number | null,
    unit: unit as 'g' | null,
    optional: optional as boolean,
    note: id === 'l-chive' ? 'chopped' : null,
  })),
  steps: [],
  tips: [],
  base: null,
  variants: [],
  diff: null,
  guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
};

const line = (over: Partial<PantryLine> & { lineId: string }): PantryLine => ({
  ingredientId: over.lineId,
  name: null,
  status: 'covered',
  optional: false,
  pantryBasic: false,
  quantity: null,
  unit: null,
  shortfall: null,
  usesExpiringSoon: false,
  onShoppingList: false,
  ...over,
});

const match = (over: Partial<PantryMatch> = {}): PantryMatch => ({
  servings: 2,
  canMake: false,
  shortOrMissingCount: 2,
  expiringCoveredCount: 0,
  coverageRatio: 0.5,
  lines: [
    line({
      lineId: 'l-flour',
      status: 'short',
      quantity: 200,
      unit: 'g',
      shortfall: { quantity: 150, unit: 'g' },
    }),
    line({ lineId: 'l-egg', status: 'missing', quantity: 2, unit: 'pcs' }),
    line({
      lineId: 'l-milk',
      status: 'missing',
      quantity: 300,
      unit: 'ml',
      onShoppingList: true,
    }),
    line({
      lineId: 'l-salt',
      pantryBasic: true,
      quantity: 1,
      unit: 'g',
    }),
    line({ lineId: 'l-chive', status: 'missing', optional: true }),
  ],
  ...over,
});

function setup(
  respond: (url: URL) => PantryMatch = () => match(),
  addMissing: () => Response = () => Response.json({ items: [] }),
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes/r1': () => Response.json(detail),
    'GET /api/recipes/r1/pantry-match': (url) => Response.json(respond(url)),
    'POST /api/recipes/r1/add-missing': addMissing,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes/:id" element={<RecipeDetailPage />} />
    </Routes>,
    { route: '/recipes/r1' },
  );
  return calls;
}

const row = (name: RegExp) => {
  const list = screen.getByRole('list', { name: 'Ingredients' });
  return within(list)
    .getAllByRole('listitem')
    .find((li) => name.test(li.textContent ?? ''))!;
};

/** The top-row heading of the Ingredients tab (the tab badge also says "{n} to buy"). */
const toBuyHeading = async (text: string) =>
  within(await screen.findByRole('tabpanel')).findByText(text);

describe('Recipe detail Pantry status', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows each line as covered, short (with the shortfall) or missing', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Flour/)).getByText('Short 150 g')).toBeInTheDocument();
    expect(within(row(/Egg/)).getByText('Missing')).toBeInTheDocument();
    expect(within(row(/Milk/)).getByText('Missing')).toBeInTheDocument();
  });

  it('hints that a missing line is on the Shopping List', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Milk/)).getByText(/on list/)).toBeInTheDocument();
    expect(within(row(/Milk/)).getByText('Missing')).toBeInTheDocument();
    expect(within(row(/Egg/)).queryByText(/on list/)).toBeNull();
  });

  it('adds no on-list hint to a covered line that is on the Shopping List', async () => {
    setup(() =>
      match({
        lines: [
          line({
            lineId: 'l-flour',
            quantity: 200,
            unit: 'g',
            onShoppingList: true,
          }),
          line({ lineId: 'l-egg', status: 'missing' }),
        ],
      }),
    );
    await toBuyHeading('2 to buy');
    expect(
      within(row(/Flour/)).getByText('In your Pantry'),
    ).toBeInTheDocument();
    expect(within(row(/Flour/)).queryByText(/on list/)).toBeNull();
  });

  it('reads a covered Pantry Basic as Pantry Basic, not In your Pantry', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Salt/)).getByText('Pantry Basic')).toBeInTheDocument();
    expect(within(row(/Salt/)).queryByText('In your Pantry')).toBeNull();
  });

  it('says In your Pantry on a covered line', async () => {
    setup(() =>
      match({
        lines: [line({ lineId: 'l-flour', quantity: 200, unit: 'g' })],
      }),
    );
    await toBuyHeading('2 to buy');
    expect(
      within(row(/Flour/)).getByText('In your Pantry'),
    ).toBeInTheDocument();
  });

  it('shows a quantity tag after the name: unit amounts, a bare number for pieces, none without a quantity', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Flour/)).getByText('200 g')).toBeInTheDocument();
    expect(within(row(/Milk/)).getByText('300 ml')).toBeInTheDocument();
    expect(within(row(/Egg/)).getByText('2')).toBeInTheDocument();
    expect(within(row(/Egg/)).queryByText(/pcs/)).toBeNull();
    expect(row(/Chives/).textContent).not.toMatch(/\d/);
  });

  it('shows the note and optional under the name', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Chives/)).getByText(/chopped/)).toBeInTheDocument();
    expect(within(row(/Chives/)).getByText(/optional/)).toBeInTheDocument();
    expect(within(row(/Flour/)).queryByText(/optional/)).toBeNull();
  });

  it('marks a Pantry Basic and still shows the status of an optional line', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Salt/)).getByText('Pantry Basic')).toBeInTheDocument();
    expect(within(row(/Chives/)).getByText('Missing')).toBeInTheDocument();
    expect(within(row(/Chives/)).getByText(/optional/)).toBeInTheDocument();
  });

  it('heads the Ingredients tab with how many lines to buy', async () => {
    setup();
    expect(await toBuyHeading('2 to buy')).toBeVisible();
    expect(screen.queryByText(/Missing \d+ ingredient/)).toBeNull();
  });

  it('says so when the Recipe can be made', async () => {
    setup(() => match({ canMake: true, shortOrMissingCount: 0, lines: [] }));
    expect(await toBuyHeading('You can make this')).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).queryByText(/to buy/),
    ).toBeNull();
  });

  it('asks for the match at the Servings picked, with the Member date', async () => {
    const calls = setup((url) =>
      match({ servings: Number(url.searchParams.get('servings')) }),
    );
    await screen.findByText('Short 150 g');
    const first = calls.find(
      (c) => c.key === 'GET /api/recipes/r1/pantry-match',
    )!;
    expect(first.search).toMatch(/servings=2/);
    expect(first.search).toMatch(/today=\d{4}-\d{2}-\d{2}/);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'More Servings' }));
    await waitFor(() =>
      expect(
        calls.some(
          (c) =>
            c.key === 'GET /api/recipes/r1/pantry-match' &&
            c.search.includes('servings=3'),
        ),
      ).toBe(true),
    );
    expect(screen.getByText('3 Servings')).toBeVisible();
  });

  it('shows the quantities the match scaled to the Servings', async () => {
    setup((url) =>
      match({
        servings: Number(url.searchParams.get('servings')),
        lines: [
          line({
            lineId: 'l-flour',
            quantity: Number(url.searchParams.get('servings')) * 100,
            unit: 'g',
          }),
        ],
      }),
    );
    await vi.waitFor(() =>
      expect(within(row(/Flour/)).getByText('200 g')).toBeInTheDocument(),
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'More Servings' }));
    expect(await within(row(/Flour/)).findByText('300 g')).toBeVisible();
  });

  it('adds the missing lines at the current Servings and confirms', async () => {
    const calls = setup();
    const user = userEvent.setup();
    await screen.findByText('Short 150 g');
    await user.click(screen.getByRole('button', { name: 'More Servings' }));
    await user.click(
      screen.getByRole('button', { name: 'Add 3 missing to Shopping List' }),
    );
    const post = await vi.waitFor(() => {
      const c = calls.find((x) => x.key === 'POST /api/recipes/r1/add-missing');
      expect(c).toBeDefined();
      return c!;
    });
    expect(post.body).toMatchObject({ servings: 3 });
    expect(post.search).toContain('locale=en');
    expect(
      await screen.findByText('Added 3 items to your Shopping List'),
    ).toBeVisible();
  });

  it('disables the button while adding', async () => {
    let finish: (r: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => (finish = resolve));
    const { fetchMock } = stubApi({
      'GET /api/recipes/r1': () => Response.json(detail),
      'GET /api/recipes/r1/pantry-match': () => Response.json(match()),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      init?.method === 'POST' ? pending : fetchMock(input, init),
    );
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/r1' },
    );
    await screen.findByText('Short 150 g');
    const button = screen.getByRole('button', {
      name: 'Add 3 missing to Shopping List',
    });
    await userEvent.setup().click(button);
    await waitFor(() => expect(button).toBeDisabled());
    finish(Response.json({ items: [] }));
  });

  it('disables the button when nothing would be added', async () => {
    setup(() =>
      match({
        canMake: true,
        shortOrMissingCount: 0,
        lines: [
          line({ lineId: 'l-flour' }),
          line({ lineId: 'l-salt', pantryBasic: true }),
          line({ lineId: 'l-chive', status: 'missing', optional: true }),
        ],
      }),
    );
    await toBuyHeading('You can make this');
    const button = screen.queryByRole('button', {
      name: /^Add \d+ missing to Shopping List$/,
    });
    if (button) expect(button).toBeDisabled();
  });

  it('counts only the addable lines in the button', async () => {
    setup(() =>
      match({
        lines: [
          line({ lineId: 'l-egg', status: 'missing' }),
          line({ lineId: 'l-chive', status: 'missing', optional: true }),
          line({ lineId: 'l-salt', status: 'missing', pantryBasic: true }),
        ],
      }),
    );
    await toBuyHeading('2 to buy');
    expect(
      screen.getByRole('button', { name: 'Add 1 missing to Shopping List' }),
    ).toBeEnabled();
  });

  it('disables the button while the match for the picked Servings loads', async () => {
    const { fetchMock } = stubApi({
      'GET /api/recipes/r1': () => Response.json(detail),
      'GET /api/recipes/r1/pantry-match': () => Response.json(match()),
    });
    let finish: (r: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => (finish = resolve));
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('servings=3') ? pending : fetchMock(input, init),
    );
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/r1' },
    );
    await screen.findByText('Short 150 g');
    const button = screen.getByRole('button', {
      name: 'Add 3 missing to Shopping List',
    });
    expect(button).toBeEnabled();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'More Servings' }));
    expect(button).toBeDisabled();
    finish(Response.json(match({ servings: 3 })));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('reads Added to your list and stays disabled after adding', async () => {
    setup();
    const user = userEvent.setup();
    await screen.findByText('Short 150 g');
    await user.click(
      screen.getByRole('button', { name: 'Add 3 missing to Shopping List' }),
    );
    expect(
      await screen.findByText('Added 3 items to your Shopping List'),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Added to your list' }),
    ).toBeDisabled();
  });

  it('still allows adding lines already on the list, with a warning', async () => {
    setup(() =>
      match({
        lines: [
          line({ lineId: 'l-egg', status: 'missing', onShoppingList: true }),
        ],
      }),
    );
    await toBuyHeading('2 to buy');
    expect(
      screen.getByRole('button', { name: 'Add 1 missing to Shopping List' }),
    ).toBeEnabled();
    expect(
      screen.getByText(
        'Some of these are already on your list; adding them again increases the amount.',
      ),
    ).toBeVisible();
  });

  it('does not warn when none of the missing lines is on the list', async () => {
    setup(() =>
      match({ lines: [line({ lineId: 'l-egg', status: 'missing' })] }),
    );
    await toBuyHeading('2 to buy');
    expect(screen.queryByText(/already on your list/)).toBeNull();
  });

  it('shows the error when adding fails', async () => {
    setup(
      () => match(),
      () => Response.json({ code: 'not_found', params: {} }, { status: 404 }),
    );
    await screen.findByText('Short 150 g');
    await userEvent
      .setup()
      .click(
        screen.getByRole('button', { name: 'Add 3 missing to Shopping List' }),
      );
    const summary = (await screen.findByRole('alert')).parentElement!;
    expect(
      within(summary).getByRole('button', {
        name: 'Add 3 missing to Shopping List',
      }),
    ).toBeVisible();
  });

  it('keeps the stepper within 1 and the API maximum', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/recipes/r1': () => Response.json({ ...detail, servings: 1 }),
      'GET /api/recipes/r1/pantry-match': () => Response.json(match()),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/r1' },
    );
    await screen.findByText('Short 150 g');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Fewer Servings' }));
    expect(screen.getByText('1 Serving')).toBeVisible();
    expect(calls.some((c) => c.search.includes('servings=0'))).toBe(false);
  });

  it('stops at the maximum Servings', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/recipes/r1': () => Response.json({ ...detail, servings: 100 }),
      'GET /api/recipes/r1/pantry-match': () => Response.json(match()),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/r1' },
    );
    await screen.findByText('Short 150 g');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'More Servings' }));
    expect(screen.getByText('100 Servings')).toBeVisible();
    expect(calls.some((c) => c.search.includes('servings=101'))).toBe(false);
  });

  it('starts a Recipe fresh when navigating from a Variant to its base', async () => {
    const variant = {
      ...detail,
      id: 'v1',
      parentId: 'r1',
      title: 'Vegan pancakes',
      servings: 4,
      base: { id: 'r1', title: 'Pancakes', archived: false },
    };
    const { fetchMock, calls } = stubApi({
      'GET /api/recipes/r1': () => Response.json(detail),
      'GET /api/recipes/v1': () => Response.json(variant),
      'GET /api/recipes/r1/pantry-match': (url) =>
        Response.json(
          match({ servings: Number(url.searchParams.get('servings')) }),
        ),
      'GET /api/recipes/v1/pantry-match': (url) =>
        Response.json(
          match({ servings: Number(url.searchParams.get('servings')) }),
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/v1' },
    );
    const user = userEvent.setup();
    await screen.findByText('Short 150 g');
    await user.click(screen.getByRole('button', { name: 'More Servings' }));
    expect(screen.getByText('5 Servings')).toBeVisible();
    await user.click(screen.getByRole('link', { name: /Variant of Pancakes/ }));
    expect(await screen.findByText('2 Servings')).toBeVisible();
    const baseMatches = calls.filter(
      (c) => c.key === 'GET /api/recipes/r1/pantry-match',
    );
    expect(baseMatches.every((c) => c.search.includes('servings=2'))).toBe(
      true,
    );
  });

  it('puts the answer in the Shopping List cache and refreshes the match and Suggestions', async () => {
    let suggestionFetches = 0;
    const { fetchMock, calls } = stubApi({
      'GET /api/recipes/r1': () => Response.json(detail),
      'GET /api/recipes/r1/pantry-match': () => Response.json(match()),
      'GET /api/shopping-list/suggestions': () => {
        suggestionFetches += 1;
        return Response.json({ staples: [], usedUp: [] });
      },
      'POST /api/recipes/r1/add-missing': () =>
        Response.json({ items: [{ id: 'i1' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <>
        <CacheProbe />
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </>,
      { route: '/recipes/r1' },
    );
    await screen.findByText('Short 150 g');
    await vi.waitFor(() => expect(suggestionFetches).toBe(1));
    const matchFetches = () =>
      calls.filter((c) => c.key === 'GET /api/recipes/r1/pantry-match').length;
    const before = matchFetches();
    await userEvent
      .setup()
      .click(
        screen.getByRole('button', { name: 'Add 3 missing to Shopping List' }),
      );
    expect(await screen.findByText('list items: 1')).toBeVisible();
    await vi.waitFor(() => expect(suggestionFetches).toBe(2));
    await vi.waitFor(() => expect(matchFetches()).toBeGreaterThan(before));
  });
});

/** Reads the cached English Shopping List and keeps a Suggestions query mounted. */
function CacheProbe() {
  const queryClient = useQueryClient();
  useQuery({
    queryKey: [...suggestionsQueryKey, 'en', 'today'],
    queryFn: () => apiRequest('/shopping-list/suggestions'),
  });
  const list = useQuery({
    queryKey: [...shoppingListQueryKey, 'en'],
    queryFn: () => new Promise<{ items: unknown[] }>(() => {}),
    enabled: false,
  });
  void queryClient;
  return <p>list items: {list.data?.items.length ?? 0}</p>;
}
