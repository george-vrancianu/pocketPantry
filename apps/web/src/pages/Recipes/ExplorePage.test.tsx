import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeListItem } from '../../lib/recipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { ExplorePage } from './ExplorePage';

/*
 * DOM contract these tests assume:
 * - The list is a `list` named "All Recipes (n)" or "Matches (n)"; each row is a `listitem`.
 * - Each row has one add control: a `button` named "Add {title} to your Recipes", which once the
 *   Recipe is added becomes a `link` to `/recipes/{copyId}` named "{title} is in your Recipes. Open it".
 *   The row then also shows the text "In your Recipes".
 * - The toast is a `status` ("Added {title} to your Recipes", with an Undo button); an error toast
 *   is an `alert`.
 */

const soup: RecipeListItem = {
  id: 'soup',
  title: 'Soup',
  parentId: null,
  base: null,
  cuisine: null,
  method: null,
  variantCount: 0,
  servings: 2,
  prepMinutes: 10,
  cookMinutes: 20,
  difficulty: 'easy',
  owner: 'catalog',
  familyCopyId: null,
  copiedFromId: null,
  allergyWarning: null,
};

type Options = {
  /** Answers the copy request. */
  copy?: () => Response;
};

function setup({ copy = () => Response.json({ id: 'copy-1' }) }: Options = {}) {
  // What the server says about Soup: its copy, once added, until it is archived.
  let copyId: string | null = null;
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes': () =>
      Response.json({
        recipes: [{ ...soup, familyCopyId: copyId }],
        hiddenByAllergiesCount: 0,
      }),
    'GET /api/recipes/filters': () =>
      Response.json({ cuisines: [], methods: [] }),
    'POST /api/recipes/soup/copy': () => {
      const response = copy();
      if (response.ok) copyId = 'copy-1';
      return response;
    },
    'POST /api/recipes/copy-1/archive': () => {
      copyId = null;
      return Response.json({ id: 'copy-1' });
    },
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/recipes/explore" element={<ExplorePage />} />
      <Route path="/recipes/:id" element={<p>detail page</p>} />
    </Routes>,
    { route: '/recipes/explore' },
  );
  return calls;
}

const row = async () => {
  const list = await screen.findByRole('list', { name: /^All Recipes/ });
  return within(list).getByRole('listitem');
};
const addButton = () =>
  screen.findByRole('button', { name: 'Add Soup to your Recipes' });

describe('ExplorePage add to Family', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('lists Catalog Recipes from the catalog scope', async () => {
    const calls = setup();
    await addButton();
    const list = calls.filter((c) => c.key === 'GET /api/recipes');
    expect(new URLSearchParams(list[0].search).get('scope')).toBe('catalog');
  });

  it('adds with one tap: the check, the pill and a polite toast with Undo', async () => {
    const calls = setup();
    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(await addButton());

    const open = await screen.findByRole('link', {
      name: 'Soup is in your Recipes. Open it',
    });
    expect(open).toHaveAttribute('href', '/recipes/copy-1');
    expect(within(await row()).getByText('In your Recipes')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Added Soup to your Recipes',
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
    expect(calls.some((c) => c.key === 'POST /api/recipes/soup/copy')).toBe(
      true,
    );
    // The Explore list is refetched, and keeps the check from the server's answer.
    await waitFor(() =>
      expect(
        calls.filter((c) => c.key === 'GET /api/recipes').length,
      ).toBeGreaterThan(1),
    );
    expect(
      await screen.findByRole('link', {
        name: 'Soup is in your Recipes. Open it',
      }),
    ).toBeVisible();
  });

  it('Undo archives the copy and restores the row', async () => {
    const calls = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(await addButton());
    await screen.findByRole('link', { name: /is in your Recipes/ });

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(await addButton()).toBeVisible();
    expect(within(await row()).queryByText('In your Recipes')).toBeNull();
    expect(
      calls.some((c) => c.key === 'POST /api/recipes/copy-1/archive'),
    ).toBe(true);
    // The server's answer (no copy) agrees once the list has refetched.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(await addButton()).toBeVisible();
  });

  it('rolls back a failed add and says so', async () => {
    setup({
      copy: () =>
        Response.json({ code: 'recipes.copy_archived' }, { status: 409 }),
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(await addButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't add Soup. Try again.",
    );
    expect(await addButton()).toBeVisible();
    expect(within(await row()).queryByText('In your Recipes')).toBeNull();
  });

  it('opens the copy when the added check is tapped', async () => {
    setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(await addButton());
    fireEvent.click(
      await screen.findByRole('link', { name: /is in your Recipes/ }),
    );
    expect(await screen.findByText('detail page')).toBeVisible();
  });
});
