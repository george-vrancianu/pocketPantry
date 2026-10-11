import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
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
    note: null,
  })),
  steps: [],
  tips: [],
  base: null,
  variants: [],
  diff: null,
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
    expect(within(row(/Milk/)).getByText('On your list')).toBeInTheDocument();
    expect(within(row(/Egg/)).queryByText('On your list')).toBeNull();
  });

  it('marks a Pantry Basic and still shows the status of an optional line', async () => {
    setup();
    await screen.findByText('Short 150 g');
    expect(within(row(/Salt/)).getByText('Pantry Basic')).toBeInTheDocument();
    expect(within(row(/Chives/)).getByText('Missing')).toBeInTheDocument();
    expect(within(row(/Chives/)).getByText(/optional/)).toBeInTheDocument();
  });

  it('summarises what is missing, or that the Recipe can be made', async () => {
    setup();
    expect(await screen.findByText('Missing 2 ingredients')).toBeVisible();
  });

  it('says so when the Recipe can be made', async () => {
    setup(() => match({ canMake: true, shortOrMissingCount: 0, lines: [] }));
    expect(await screen.findByText('You can make this')).toBeVisible();
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
      .click(screen.getByRole('button', { name: 'More servings' }));
    await waitFor(() =>
      expect(
        calls.some(
          (c) =>
            c.key === 'GET /api/recipes/r1/pantry-match' &&
            c.search.includes('servings=3'),
        ),
      ).toBe(true),
    );
    expect(screen.getByText('3 servings')).toBeVisible();
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
    await screen.findByText(/200 g Flour/);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'More servings' }));
    expect(await screen.findByText(/300 g Flour/)).toBeVisible();
  });

  it('adds the missing lines at the current Servings and confirms', async () => {
    const calls = setup();
    const user = userEvent.setup();
    await screen.findByText('Short 150 g');
    await user.click(screen.getByRole('button', { name: 'More servings' }));
    await user.click(
      screen.getByRole('button', { name: 'Add missing to Shopping List' }),
    );
    const post = await vi.waitFor(() => {
      const c = calls.find((x) => x.key === 'POST /api/recipes/r1/add-missing');
      expect(c).toBeDefined();
      return c!;
    });
    expect(post.body).toMatchObject({ servings: 3 });
    expect(post.search).toContain('locale=en');
    expect(
      await screen.findByText('Added 2 items to your Shopping List'),
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
      name: 'Add missing to Shopping List',
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
    await screen.findByText('You can make this');
    expect(
      screen.getByRole('button', { name: 'Add missing to Shopping List' }),
    ).toBeDisabled();
  });

  it('disables the button when every missing line is already on the list', async () => {
    setup(() =>
      match({
        lines: [
          line({ lineId: 'l-egg', status: 'missing', onShoppingList: true }),
        ],
      }),
    );
    await screen.findByText('Missing 2 ingredients');
    expect(
      screen.getByRole('button', { name: 'Add missing to Shopping List' }),
    ).toBeDisabled();
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
        screen.getByRole('button', { name: 'Add missing to Shopping List' }),
      );
    expect(await screen.findByRole('alert')).toBeVisible();
  });
});
