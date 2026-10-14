import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ShoppingList } from '../../lib/shopping';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from './ShoppingPage';

const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };
const produce = { id: 'a1', name: 'Fruit & veg', sortOrder: 1 };

/** A Suggestion as the API now sends it: `since` is a YYYY-MM-DD expiry date, an ISO timestamp (Used Up) or null (Staple). */
const gone = (
  name: string,
  since: string | null,
  aisle: typeof dairy | null = dairy,
) => ({
  ingredientId: `${name.toLowerCase()}-id`,
  name,
  quantity: null,
  unit: null,
  aisle,
  since,
});

const emptyList: ShoppingList = {
  id: 'l1',
  groups: [],
  summary: { remaining: 0, checked: 0 },
};

const milkResult: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'l',
  leafCategory: { id: 'm', name: 'Milk' },
  parentCategory: {
    id: 'd',
    name: 'Dairy',
    aisle: { id: 'a4', name: 'Dairy & eggs' },
  },
  defaults: { expiryDays: 7, location: 'fridge' },
};

type Groups = {
  staples?: ReturnType<typeof gone>[];
  usedUp?: ReturnType<typeof gone>[];
  expired?: ReturnType<typeof gone>[];
};

function stubShopping(
  groups: Groups,
  extra: Record<string, () => Response> = {},
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/shopping-list': () => Response.json(emptyList),
    'GET /api/shopping-list/suggestions': () =>
      Response.json({ staples: [], usedUp: [], expired: [], ...groups }),
    'GET /api/catalog/search': () => Response.json({ results: [milkResult] }),
    'GET /api/shopping-templates': () =>
      Response.json({
        templates: [
          {
            id: 't1',
            name: 'Taco night',
            lineCount: 1,
            previewNames: ['Milk'],
          },
        ],
      }),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

async function openSheet() {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Add items' }),
  );
  return screen.findByRole('dialog', { name: 'Add to list' });
}

/** The tiles in grid order. */
const tileNames = (dialog: HTMLElement) =>
  within(within(dialog).getByRole('region', { name: 'Gone from your Pantry' }))
    .getAllByRole('button')
    .map((tile) => tile.getAttribute('aria-label') ?? tile.textContent);

describe('Gone from your Pantry (Shopping add sheet)', () => {
  beforeEach(() => {
    // Only the clock is faked, so timers and promises stay real. "Today" is 14 October 2026, local time.
    vi.useFakeTimers({
      toFake: ['Date'],
      now: new Date(2026, 9, 14, 12, 0, 0),
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows a Gone from your Pantry section with the number of tiles', async () => {
    stubShopping({
      expired: [gone('Spinach', '2026-10-13')],
      usedUp: [gone('Eggs', '2026-10-12T12:00:00.000Z')],
      staples: [gone('Flour', null)],
    });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();

    const section = await within(dialog).findByRole('region', {
      name: 'Gone from your Pantry',
    });
    expect(
      within(section).getByRole('heading', { name: /Gone from your Pantry/ }),
    ).toBeVisible();
    expect(within(section).getByText('3')).toBeVisible();
    expect(within(section).getAllByRole('button')).toHaveLength(3);
  });

  it('orders expired (most recent first), then Used Up (most recent first), then missing Staples by name', async () => {
    stubShopping({
      // The API sends each group in Aisle order, so the client has to sort.
      staples: [gone('Flour', null), gone('Apple', null, produce)],
      usedUp: [
        gone('Eggs', '2026-10-12T12:00:00.000Z'),
        gone('Butter', '2026-10-14T08:00:00.000Z'),
      ],
      expired: [
        gone('Yogurt', '2026-10-10'),
        gone('Spinach', '2026-10-13', produce),
      ],
    });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();
    await within(dialog).findByRole('region', {
      name: 'Gone from your Pantry',
    });

    expect(tileNames(dialog)).toEqual([
      'Spinach, expired 1d ago',
      'Yogurt, expired 4d ago',
      'Butter, used up today',
      'Eggs, used up 2d ago',
      'Apple, missing staple',
      'Flour, missing staple',
    ]);
  });

  it('shows at most 8 tiles, dropping the last Staples first, with no "more" control', async () => {
    stubShopping({
      expired: ['E1', 'E2', 'E3'].map((n, i) => gone(n, `2026-10-1${3 - i}`)),
      usedUp: ['U1', 'U2', 'U3', 'U4'].map((n, i) =>
        gone(n, `2026-10-1${3 - i}T12:00:00.000Z`),
      ),
      staples: [gone('S3', null), gone('S1', null), gone('S2', null)],
    });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();
    await within(dialog).findByRole('region', {
      name: 'Gone from your Pantry',
    });

    const names = tileNames(dialog);
    expect(names).toHaveLength(8);
    expect(names.slice(0, 3)).toEqual([
      'E1, expired 1d ago',
      'E2, expired 2d ago',
      'E3, expired 3d ago',
    ]);
    expect(names.at(-1)).toBe('S1, missing staple');
    expect(within(dialog).queryByText(/more/i)).toBeNull();
  });

  it('says why and when on each tile', async () => {
    stubShopping({
      expired: [gone('Spinach', '2026-10-13')],
      usedUp: [gone('Eggs', '2026-10-12T12:00:00.000Z')],
      staples: [gone('Flour', null)],
    });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();

    const spinach = await within(dialog).findByRole('button', {
      name: 'Spinach, expired 1d ago',
    });
    expect(spinach).toHaveTextContent('Spinach');
    expect(spinach).toHaveTextContent(/◷\s?expired · 1d ago/);
    const eggs = within(dialog).getByRole('button', {
      name: 'Eggs, used up 2d ago',
    });
    expect(eggs).toHaveTextContent(/→\s?used up · 2d ago/);
    const flour = within(dialog).getByRole('button', {
      name: 'Flour, missing staple',
    });
    expect(flour).toHaveTextContent(/★\s?staple/);
    expect(flour).not.toHaveTextContent(/·/);
  });

  it('selects the Ingredient on tap, showing the token and the amount panel, and sends no dismissal', async () => {
    const calls = stubShopping({ expired: [gone('Milk', '2026-10-13')] });
    renderWithProviders(<ShoppingPage />);
    const dialog = await openSheet();

    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: 'Milk, expired 1d ago',
      }),
    );

    expect(
      await within(dialog).findByRole('combobox', {
        name: 'Ingredient: Milk. Press Backspace to change',
      }),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('textbox', { name: /Amount of Milk/ }),
    ).toBeVisible();
    expect(calls.filter((c) => /dismiss/.test(c.key))).toEqual([]);
    expect(calls.filter((c) => c.key.startsWith('POST'))).toEqual([]);
  });

  it('says nothing has run out when no Suggestion is gone', async () => {
    stubShopping({});
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();

    const section = await within(dialog).findByRole('region', {
      name: 'Gone from your Pantry',
    });
    expect(
      within(section).getByText('Nothing has run out or expired. Nice.'),
    ).toBeVisible();
    expect(within(section).queryByRole('button')).toBeNull();
  });

  it('keeps the Shopping Templates below the Gone tiles', async () => {
    stubShopping({ expired: [gone('Spinach', '2026-10-13')] });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();

    const section = await within(dialog).findByRole('region', {
      name: 'Gone from your Pantry',
    });
    const templates = await within(dialog).findByRole('button', {
      name: /Taco night/,
    });
    expect(
      section.compareDocumentPosition(templates) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('replaces the old Suggestion chips: nothing to dismiss or add in one tap', async () => {
    stubShopping({ staples: [gone('Flour', null)] });
    renderWithProviders(<ShoppingPage />);

    const dialog = await openSheet();
    await within(dialog).findByRole('button', {
      name: 'Flour, missing staple',
    });

    expect(
      within(dialog).queryByRole('button', { name: 'Dismiss Flour' }),
    ).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: 'Add Flour to the list' }),
    ).toBeNull();
  });
});
