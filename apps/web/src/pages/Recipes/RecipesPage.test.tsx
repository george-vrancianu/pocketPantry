import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CookTonightCard } from '../../lib/cookTonight';
import type { RecipeListItem } from '../../lib/recipes';
import { renderWithProviders, stubApi } from '../../test/render';
import { RecipesPage } from './RecipesPage';

/*
 * DOM contract these tests assume (the implementation must provide it):
 * - The "You can make this" strip is a landmark `region` with that accessible name. Each
 *   tile is a link inside it (href `/recipes/{card.recipe.id}`), with the title, total time
 *   and footer as its text content; "From your Pantry" is another link in the region.
 * - The list is a `list` named by its heading, so its name starts with "All Recipes" or
 *   "Matches"; the count is part of that heading's text. Each row is a `listitem` whose
 *   text holds the title, family pill, "Variant of", meta, pills and time; the row also
 *   contains the one link to `/recipes/{id}`.
 * - Meta parts are joined with " · " in the row's text ("Italian · Baking · Easy · 3 Variants").
 * - Chips are `button`s with `aria-pressed`, named by the Cuisine or Method name; "Clear" is
 *   a `button` shown only while filtering.
 */

const item = (over: Partial<RecipeListItem>): RecipeListItem => ({
  id: 'r',
  title: 'Recipe',
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
  allergyWarning: null,
  ...over,
});

const card = (
  over: Omit<Partial<CookTonightCard>, 'base' | 'recipe'> & {
    base?: Partial<CookTonightCard['base']>;
    recipe?: Partial<CookTonightCard['recipe']>;
  } = {},
): CookTonightCard => ({
  canMake: true,
  missing: null,
  expiringCount: 0,
  otherVariantsCount: 0,
  ...over,
  base: { id: 'o', title: 'Omelette', archived: false, ...over.base },
  recipe: {
    id: 'o',
    title: 'Omelette',
    parentId: null,
    owner: 'catalog',
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    allergyWarning: null,
    ...over.recipe,
  },
});

const omelette = item({ id: 'o', title: 'Omelette', variantCount: 3 });
const soup = item({ id: 's', title: 'Soup', variantCount: 1 });
const frittata = item({
  id: 'f',
  title: 'Frittata',
  parentId: 'o',
  base: { id: 'o', title: 'Omelette' },
  cuisine: { id: 'c-it', name: 'Italian' },
});
const gratin = item({
  id: 'g',
  title: 'Gratin',
  parentId: 'o',
  base: { id: 'o', title: 'Omelette' },
});
const filters = {
  cuisines: [
    { id: 'c-it', name: 'Italian' },
    { id: 'c-gr', name: 'Greek' },
  ],
  methods: [
    { id: 'm-bake', name: 'Baking' },
    { id: 'm-grill', name: 'Grilling' },
  ],
};

function setup(
  list: (url: URL) => RecipeListItem[],
  cards: CookTonightCard[] = [],
  /** Holds every filtered list response until it resolves. */
  gate?: Promise<void>,
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes': (url) => Response.json({ recipes: list(url) }),
    'GET /api/recipes/filters': () => Response.json(filters),
    'GET /api/recipes/cook-tonight': () => Response.json({ cards }),
  });
  vi.stubGlobal(
    'fetch',
    gate
      ? async (input: RequestInfo | URL, init?: RequestInit) => {
          const response = await fetchMock(input, init);
          const url = new URL(String(input), window.location.origin);
          if (url.pathname === '/api/recipes' && filtered(url)) await gate;
          return response;
        }
      : fetchMock,
  );
  renderWithProviders(
    <Routes>
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/new" element={<p>new recipe page</p>} />
      <Route path="/recipes/:id" element={<p>detail page</p>} />
    </Routes>,
    { route: '/recipes' },
  );
  return calls;
}

type Calls = ReturnType<typeof setup>;

const filtered = (url: URL) =>
  ['cuisineId', 'methodId', 'search'].some((key) => url.searchParams.has(key));

const lastQuery = (calls: Calls) =>
  new URLSearchParams(
    calls.filter((c) => c.key === 'GET /api/recipes').at(-1)!.search,
  );

const ALL = /^All Recipes/;
const MATCHES = /^Matches/;

/** The list row holding `title`, once the list has rendered it. */
async function findRow(title: string, name: RegExp = ALL) {
  const list = await screen.findByRole('list', { name });
  const text = await within(list).findByText(title);
  return text.closest('li')!;
}

const findStrip = () =>
  screen.findByRole('region', { name: 'You can make this' });
const queryStrip = () =>
  screen.queryByRole('region', { name: 'You can make this' });
const tilesOf = (strip: HTMLElement) =>
  within(strip)
    .queryAllByRole('link')
    .filter((link) => link.getAttribute('href')?.startsWith('/recipes/'));
const chip = (name: string) => screen.findByRole('button', { name });

describe('RecipesPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  describe('rows', () => {
    it('lists the Recipes in the order the API returned them', async () => {
      setup(() => [soup, omelette]);
      const list = await screen.findByRole('list', { name: ALL });
      await within(list).findByText('Soup');
      const rows = within(list).getAllByRole('listitem');
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent('Soup');
      expect(rows[1]).toHaveTextContent('Omelette');
    });

    it('opens the New Recipe page from the header plus', async () => {
      setup(() => [omelette]);
      await userEvent.click(
        await screen.findByRole('link', { name: 'New Recipe' }),
      );
      expect(screen.getByText('new recipe page')).toBeInTheDocument();
    });

    it('opens a Recipe when its row is tapped', async () => {
      setup(() => [omelette]);
      const row = await findRow('Omelette');
      const link = within(row).getByRole('link');
      expect(link).toHaveAttribute('href', '/recipes/o');
      await userEvent.click(link);
      expect(screen.getByText('detail page')).toBeInTheDocument();
    });

    it('shows the meta parts that exist, joined by dots, with the pluralised Variant count', async () => {
      setup(() => [
        item({
          id: 'a',
          title: 'Moussaka',
          cuisine: { id: 'c-gr', name: 'Greek' },
          method: { id: 'm-bake', name: 'Baking' },
          difficulty: 'medium',
          variantCount: 3,
        }),
        item({ id: 'b', title: 'Toast', difficulty: 'hard', variantCount: 1 }),
        item({ id: 'c', title: 'Water', difficulty: null }),
      ]);
      expect(await findRow('Moussaka')).toHaveTextContent(
        'Greek · Baking · Medium · 3 Variants',
      );
      const toast = await findRow('Toast');
      expect(toast).toHaveTextContent('Hard · 1 Variant');
      expect(toast).not.toHaveTextContent('1 Variants');
      expect(await findRow('Water')).not.toHaveTextContent('·');
    });

    it('shows the total time in minutes, or a dash when the Recipe has no times', async () => {
      setup(() => [
        item({ id: 'a', title: 'Both', prepMinutes: 10, cookMinutes: 20 }),
        item({
          id: 'b',
          title: 'CookOnly',
          prepMinutes: null,
          cookMinutes: 15,
        }),
        item({
          id: 'c',
          title: 'Neither',
          prepMinutes: null,
          cookMinutes: null,
        }),
      ]);
      expect(await findRow('Both')).toHaveTextContent(/30\s*min/);
      expect(await findRow('CookOnly')).toHaveTextContent(/15\s*min/);
      const neither = await findRow('Neither');
      expect(neither).toHaveTextContent('—');
      expect(neither).not.toHaveTextContent('min');
    });

    it('badges a Family Recipe', async () => {
      setup(() => [item({ id: 'x', title: 'Gran stew', owner: 'family' })]);
      expect(await findRow('Gran stew')).toHaveTextContent("Your family's");
    });

    it('shows no badge on a Catalog Recipe', async () => {
      setup(() => [item({ id: 'c', title: 'Plain stew', owner: 'catalog' })]);
      expect(await findRow('Plain stew')).not.toHaveTextContent(
        "Your family's",
      );
    });

    it('labels a Variant with its Base Recipe only while filtering', async () => {
      setup(() => [frittata]);
      expect(await findRow('Frittata')).not.toHaveTextContent('Variant of');

      await userEvent.click(await chip('Italian'));
      expect(await findRow('Frittata', MATCHES)).toHaveTextContent(
        'Variant of Omelette',
      );
    });
  });

  describe('headings, hints and empty states', () => {
    it('heads the list "All Recipes" with its count and shows the Variants hint', async () => {
      setup(() => [omelette, soup]);
      const heading = await screen.findByRole('heading', { name: ALL });
      expect(heading).toHaveTextContent(/^All Recipes · 2$/i);
      expect(
        screen.getByText(
          'Search or pick a filter to see Variants on their own.',
        ),
      ).toBeInTheDocument();
    });

    it('heads the list "Matches" with its count and drops the hint while filtering', async () => {
      setup((url) => (filtered(url) ? [frittata] : [omelette, soup]));
      await findRow('Omelette');
      await userEvent.click(await chip('Italian'));
      const heading = await screen.findByRole('heading', { name: MATCHES });
      expect(heading).toHaveTextContent(/^Matches · 1$/i);
      expect(
        screen.queryByRole('heading', { name: ALL }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'Search or pick a filter to see Variants on their own.',
        ),
      ).not.toBeInTheDocument();
    });

    it('shows an empty state with a hint', async () => {
      setup(() => []);
      expect(await screen.findByText('No Recipes yet.')).toBeInTheDocument();
      expect(
        screen.getByText('Scan a plate or make one from a photo.'),
      ).toBeInTheDocument();
    });

    it('shows a no-matches state with a hint while filtering', async () => {
      setup((url) => (filtered(url) ? [] : [omelette]));
      await findRow('Omelette');
      await userEvent.click(await chip('Italian'));
      expect(await screen.findByText('No Recipes match.')).toBeInTheDocument();
      expect(
        screen.getByText('Try another word or clear a filter.'),
      ).toBeInTheDocument();
    });

    it('shows an error when the list fails to load', async () => {
      const { fetchMock } = stubApi({
        'GET /api/recipes/filters': () => Response.json(filters),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<RecipesPage />, { route: '/recipes' });
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
  });

  describe('search and filter chips', () => {
    it('offers Cuisines and Methods as toggle buttons, none pressed at first', async () => {
      setup(() => [omelette]);
      for (const name of ['Italian', 'Greek', 'Baking', 'Grilling']) {
        expect(await chip(name)).toHaveAttribute('aria-pressed', 'false');
      }
      expect(
        screen.queryByRole('button', { name: 'Clear' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Cuisine')).not.toBeInTheDocument();
    });

    it('filters by a tapped chip and clears it when the active chip is tapped again', async () => {
      const calls = setup((url) => (filtered(url) ? [frittata] : [omelette]));
      const user = userEvent.setup();
      const italian = await chip('Italian');

      await user.click(italian);
      expect(italian).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => {
        const query = lastQuery(calls);
        expect(query.get('cuisineId')).toBe('c-it');
        expect(query.get('locale')).toBe('en');
      });

      await user.click(italian);
      expect(italian).toHaveAttribute('aria-pressed', 'false');
      await waitFor(() =>
        expect(lastQuery(calls).has('cuisineId')).toBe(false),
      );
      expect(
        await screen.findByRole('heading', { name: ALL }),
      ).toBeInTheDocument();
    });

    it('keeps at most one Cuisine and one Method active', async () => {
      const calls = setup(() => [omelette]);
      const user = userEvent.setup();
      const italian = await chip('Italian');
      const greek = await chip('Greek');
      const baking = await chip('Baking');
      const grilling = await chip('Grilling');

      await user.click(italian);
      await user.click(greek);
      expect(italian).toHaveAttribute('aria-pressed', 'false');
      expect(greek).toHaveAttribute('aria-pressed', 'true');

      await user.click(baking);
      await user.click(grilling);
      expect(baking).toHaveAttribute('aria-pressed', 'false');
      expect(grilling).toHaveAttribute('aria-pressed', 'true');
      // A Cuisine and a Method can be active together.
      expect(greek).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => {
        const query = lastQuery(calls);
        expect(query.get('cuisineId')).toBe('c-gr');
        expect(query.get('methodId')).toBe('m-grill');
      });
    });

    it('keeps the previous rows on screen while the next search loads', async () => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      setup((url) => (filtered(url) ? [frittata] : [omelette]), [], gate);
      const user = userEvent.setup();
      await findRow('Omelette');

      await user.click(await chip('Italian'));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Italian' })).toHaveAttribute(
          'aria-pressed',
          'true',
        ),
      );
      // The filtered response is still held: the old rows stay listed.
      expect(screen.getByText('Omelette')).toBeInTheDocument();
      expect(screen.queryByText('Frittata')).not.toBeInTheDocument();

      release();
      await findRow('Frittata', MATCHES);
      expect(screen.queryByText('Omelette')).not.toBeInTheDocument();
    });

    it('sends the search text after a pause', async () => {
      const calls = setup(() => [omelette]);
      await screen.findByRole('list', { name: ALL });
      await userEvent.type(screen.getByLabelText('Search Recipes'), 'frit');
      await vi.waitFor(() => {
        expect(lastQuery(calls).get('search')).toBe('frit');
      });
      const searched = calls
        .filter((c) => c.key === 'GET /api/recipes')
        .map((c) => new URLSearchParams(c.search).get('search'))
        .filter(Boolean);
      expect(new Set(searched)).toEqual(new Set(['frit']));
    });

    it('shows Clear only while filtering, and Clear resets the search and both filters', async () => {
      const calls = setup((url) => (filtered(url) ? [frittata] : [omelette]));
      const user = userEvent.setup();
      const search = await screen.findByLabelText('Search Recipes');
      const italian = await chip('Italian');
      const baking = await chip('Baking');
      expect(
        screen.queryByRole('button', { name: 'Clear' }),
      ).not.toBeInTheDocument();

      await user.type(search, 'frit');
      await user.click(italian);
      await user.click(baking);
      await waitFor(() => {
        const query = lastQuery(calls);
        expect(query.get('search')).toBe('frit');
        expect(query.get('cuisineId')).toBe('c-it');
        expect(query.get('methodId')).toBe('m-bake');
      });

      await user.click(screen.getByRole('button', { name: 'Clear' }));
      expect(search).toHaveValue('');
      expect(italian).toHaveAttribute('aria-pressed', 'false');
      expect(baking).toHaveAttribute('aria-pressed', 'false');
      expect(
        screen.queryByRole('button', { name: 'Clear' }),
      ).not.toBeInTheDocument();
      await waitFor(() => {
        const query = lastQuery(calls);
        expect(query.has('search')).toBe(false);
        expect(query.has('cuisineId')).toBe(false);
        expect(query.has('methodId')).toBe(false);
      });
      expect(
        await screen.findByRole('heading', { name: ALL }),
      ).toBeInTheDocument();
    });

    it('shows Clear while only a search is active', async () => {
      setup(() => [omelette]);
      await userEvent.type(await screen.findByLabelText('Search Recipes'), 'o');
      expect(await chip('Clear')).toBeInTheDocument();
    });
  });

  describe('"You can make this" strip', () => {
    const spicy = card({
      recipe: { id: 'v1', title: 'Spicy omelette', parentId: 'o' },
      expiringCount: 2,
      otherVariantsCount: 3,
    });
    const soupCard = card({
      base: { id: 's', title: 'Soup' },
      recipe: { id: 's', title: 'Soup', prepMinutes: null, cookMinutes: null },
    });

    it("has a tile for each Can Make card, linking to the card's Recipe (which may be a Variant)", async () => {
      setup(() => [omelette, soup], [spicy, soupCard]);
      const strip = await findStrip();
      expect(tilesOf(strip)).toHaveLength(2);
      expect(
        within(strip).getByRole('link', { name: /Spicy omelette/ }),
      ).toHaveAttribute('href', '/recipes/v1');
      expect(within(strip).getByRole('link', { name: /Soup/ })).toHaveAttribute(
        'href',
        '/recipes/s',
      );
    });

    it('leaves a card that is one ingredient short out of the strip but marks its row', async () => {
      const near = card({
        base: { id: 's', title: 'Soup' },
        recipe: { id: 's', title: 'Soup' },
        canMake: false,
        missing: { ingredientId: 'i-feta', name: 'Feta' },
      });
      setup(() => [omelette, soup], [card(), near]);
      const strip = await findStrip();
      expect(tilesOf(strip)).toHaveLength(1);
      expect(within(strip).queryByText(/Soup/)).not.toBeInTheDocument();
      expect(within(strip).queryByText(/Feta/)).not.toBeInTheDocument();
      expect(await findRow('Soup')).toHaveTextContent('Missing Feta');
    });

    it('shows the total time and the expiring count, preferring it to the Variants count', async () => {
      setup(() => [omelette], [spicy]);
      const tile = within(await findStrip()).getByRole('link', {
        name: /Spicy omelette/,
      });
      expect(tile).toHaveTextContent(/25\s*min/);
      expect(tile).toHaveTextContent('2 expiring');
      expect(tile).not.toHaveTextContent('Variants');
    });

    it('shows the other Variants count when nothing is expiring', async () => {
      setup(
        () => [omelette],
        [card({ expiringCount: 0, otherVariantsCount: 3 })],
      );
      const tile = within(await findStrip()).getByRole('link', {
        name: /Omelette/,
      });
      expect(tile).toHaveTextContent('+3 Variants');
      expect(tile).not.toHaveTextContent('expiring');
    });

    it('shows neither an expiring nor a Variants footer when there is nothing to say', async () => {
      setup(() => [omelette], [card()]);
      const tile = within(await findStrip()).getByRole('link', {
        name: /Omelette/,
      });
      expect(tile).toHaveTextContent(/25\s*min/);
      expect(tile).not.toHaveTextContent('expiring');
      expect(tile).not.toHaveTextContent('Variant');
    });

    it('omits the time when the Recipe has none', async () => {
      setup(() => [soup], [soupCard]);
      const tile = within(await findStrip()).getByRole('link', {
        name: /Soup/,
      });
      expect(tile).not.toHaveTextContent('min');
    });

    it('links to the Pantry', async () => {
      setup(() => [omelette], [card()]);
      const strip = await findStrip();
      expect(
        within(strip).getByRole('link', { name: 'From your Pantry' }),
      ).toHaveAttribute('href', '/pantry');
    });

    it('is hidden when no card can be made', async () => {
      setup(
        () => [omelette],
        [
          card({
            canMake: false,
            missing: { ingredientId: null, name: 'Feta' },
          }),
        ],
      );
      await findRow('Omelette');
      expect(queryStrip()).not.toBeInTheDocument();
      expect(screen.queryByText('You can make this')).not.toBeInTheDocument();
    });

    it('is hidden when there are no cards', async () => {
      setup(() => [omelette], []);
      await findRow('Omelette');
      expect(queryStrip()).not.toBeInTheDocument();
    });

    it('is hidden while searching and while a chip filters, and returns after Clear', async () => {
      setup((url) => (filtered(url) ? [frittata] : [omelette]), [card()]);
      const user = userEvent.setup();
      await findStrip();

      await user.type(screen.getByLabelText('Search Recipes'), 'frit');
      await waitFor(() => expect(queryStrip()).not.toBeInTheDocument());

      await user.click(await chip('Clear'));
      await findStrip();

      await user.click(await chip('Italian'));
      await waitFor(() => expect(queryStrip()).not.toBeInTheDocument());
      await user.click(await chip('Italian'));
      await findStrip();
    });
  });

  describe('status pills on rows', () => {
    it('marks a Recipe that is itself the best match as "Can Make"', async () => {
      setup(() => [omelette, soup], [card()]);
      const row = await findRow('Omelette');
      expect(within(row).getByText('Can Make')).toBeInTheDocument();
      expect(await findRow('Soup')).not.toHaveTextContent('Can Make');
    });

    it('names the Variant on a Base Recipe row whose best match is that Variant', async () => {
      setup(
        () => [omelette],
        [
          card({
            recipe: { id: 'v1', title: 'Spicy omelette', parentId: 'o' },
          }),
        ],
      );
      const row = await findRow('Omelette');
      expect(
        within(row).getByText('Can Make Spicy omelette'),
      ).toBeInTheDocument();
      expect(within(row).queryByText('Can Make')).not.toBeInTheDocument();
    });

    it("prefers a Recipe's own card to its base's, and gives no pill to a Variant row without its own card", async () => {
      const calls = setup(
        (url) => (filtered(url) ? [frittata, gratin] : [omelette]),
        [card({ recipe: { id: 'f', title: 'Frittata', parentId: 'o' } })],
      );
      await findRow('Omelette');
      await userEvent.click(await chip('Italian'));
      await waitFor(() =>
        expect(lastQuery(calls).get('cuisineId')).toBe('c-it'),
      );
      const own = await findRow('Frittata', MATCHES);
      expect(within(own).getByText('Can Make')).toBeInTheDocument();
      expect(await findRow('Gratin', MATCHES)).not.toHaveTextContent(
        'Can Make',
      );
    });

    it('shows "Missing {name}" for a near miss, without a "Can Make" pill', async () => {
      setup(
        () => [omelette],
        [
          card({
            canMake: false,
            missing: { ingredientId: 'i', name: 'Feta' },
          }),
        ],
      );
      const row = await findRow('Omelette');
      expect(within(row).getByText('Missing Feta')).toBeInTheDocument();
      expect(row).not.toHaveTextContent('Can Make');
    });

    it('shows an "{n} expiring" pill next to the status', async () => {
      setup(
        () => [omelette, soup],
        [
          card({ expiringCount: 2 }),
          card({
            base: { id: 's', title: 'Soup' },
            recipe: { id: 's', title: 'Soup' },
            canMake: false,
            missing: { ingredientId: null, name: 'Leek' },
            expiringCount: 1,
          }),
        ],
      );
      const row = await findRow('Omelette');
      expect(within(row).getByText('Can Make')).toBeInTheDocument();
      expect(within(row).getByText('2 expiring')).toBeInTheDocument();
      const nearRow = await findRow('Soup');
      expect(within(nearRow).getByText('Missing Leek')).toBeInTheDocument();
      expect(within(nearRow).getByText('1 expiring')).toBeInTheDocument();
    });

    it('shows no pill on a row without a card', async () => {
      setup(() => [omelette, soup], [card()]);
      await findStrip();
      const row = await findRow('Soup');
      expect(row).not.toHaveTextContent('Can Make');
      expect(row).not.toHaveTextContent('Missing');
      expect(row).not.toHaveTextContent('expiring');
    });
  });

  describe('allergen indicator', () => {
    const peanuts = (
      severity: 'strong' | 'soft',
    ): NonNullable<RecipeListItem['allergyWarning']> => ({
      severity,
      allergens: [
        { id: 'a-pn', name: 'Peanuts', tier: 'yours', severity },
        { id: 'a-mk', name: 'Milk', tier: 'members', severity },
      ],
      uncheckedCount: 0,
    });

    it('marks a row strongly, naming the Allergens for a screen reader', async () => {
      setup(() => [
        item({ id: 'o', title: 'Omelette', allergyWarning: peanuts('strong') }),
        soup,
      ]);
      const row = await findRow('Omelette');
      const indicator = within(row).getByRole('img', {
        name: 'Contains Peanuts, Milk',
      });
      expect(indicator).toHaveAttribute('data-severity', 'strong');
      expect(within(await findRow('Soup')).queryByRole('img')).toBeNull();
    });

    it('marks a row softly when only optional lines contain the Allergen', async () => {
      setup(() => [
        item({ id: 'o', title: 'Omelette', allergyWarning: peanuts('soft') }),
      ]);
      const row = await findRow('Omelette');
      expect(
        within(row).getByRole('img', { name: 'May contain Peanuts, Milk' }),
      ).toHaveAttribute('data-severity', 'soft');
    });

    it('says when lines could not be checked, without claiming anything is free of Allergens', async () => {
      setup(() => [
        item({
          id: 'o',
          title: 'Omelette',
          allergyWarning: {
            severity: 'soft',
            allergens: [],
            uncheckedCount: 2,
          },
        }),
      ]);
      const row = await findRow('Omelette');
      expect(
        within(row).getByRole('img', {
          name: "2 ingredients couldn't be checked for allergens",
        }),
      ).toBeVisible();
    });

    it('marks a Can Make tile, and names the Allergen in the tile link', async () => {
      setup(
        () => [omelette],
        [card({ recipe: { allergyWarning: peanuts('strong') } })],
      );
      const strip = await findStrip();
      expect(
        within(strip).getByRole('img', { name: 'Contains Peanuts, Milk' }),
      ).toHaveAttribute('data-severity', 'strong');
      expect(tilesOf(strip)[0].getAttribute('aria-label')).toContain(
        'Contains Peanuts, Milk',
      );
    });
  });
});
