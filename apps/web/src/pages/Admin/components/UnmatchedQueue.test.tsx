import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import type { UnmatchedEntry } from '../../../lib/unmatched';
import { renderWithProviders, stubApi } from '../../../test/render';
import { UnmatchedQueue } from './UnmatchedQueue';

const catalog: AdminCatalog = {
  aisles: [],
  parentCategories: [
    {
      id: 'p1',
      name: 'Dairy',
      aisleId: 'a1',
      defaultExpiryDays: null,
      defaultLocation: null,
      translations: [],
    },
  ],
  leafCategories: [
    {
      id: 'l1',
      name: 'Hard cheese',
      parentId: 'p1',
      isOther: false,
      defaultExpiryDays: null,
      defaultLocation: null,
      translations: [],
    },
  ],
  ingredients: [],
};

const entry: UnmatchedEntry = {
  normalizedName: 'branza ciudata',
  rawName: 'Brânză ciudată',
  count: 3,
  locale: 'ro',
  locales: ['ro'],
  sourceText: null,
  sourceLanguage: null,
  sources: ['manual', 'receipt'],
  dismissed: false,
  references: [],
};

const printedEntry: UnmatchedEntry = {
  ...entry,
  normalizedName: 'ost',
  rawName: 'Cheese',
  locale: 'en',
  locales: ['en'],
  sourceText: 'OST 200G',
  sourceLanguage: 'da',
};

const resolution = {
  ingredientId: 'i1',
  locale: 'en',
  relinkedBatches: 2,
  relinkedShoppingItems: 0,
  synonymAdded: true,
  sourceSynonymAdded: false,
  sourceSynonymSkipped: null,
};

/** Opens the resolver of the printed-text entry and picks Parmesan. */
async function pickParmesan(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', { name: 'Resolve Cheese' }),
  );
  await user.type(
    screen.getByRole('combobox', { name: 'Search ingredients' }),
    'parm',
  );
  await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
}

function stub(routes: Parameters<typeof stubApi>[0] = {}) {
  const api = stubApi({
    'GET /api/admin/unmatched': () => Response.json({ entries: [entry] }),
    'GET /api/catalog/search': () =>
      Response.json({
        results: [
          {
            id: 'i1',
            name: 'Parmesan',
            defaultUnit: 'g',
            leafCategory: { id: 'l1', name: 'Hard cheese' },
            parentCategory: { id: 'p1', name: 'Dairy', aisle: 'Dairy' },
            defaults: { expiryDays: null, location: null },
          },
        ],
      }),
    ...routes,
  });
  vi.stubGlobal('fetch', api.fetchMock);
  return api.calls;
}

describe('UnmatchedQueue', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists each name with how many rows carry it, where it came from, and its locale', async () => {
    stub();
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);

    const item = await screen.findByRole('listitem');
    expect(within(item).getByText('Brânză ciudată')).toBeVisible();
    expect(within(item).getByText(/3 rows/)).toBeVisible();
    expect(within(item).getByText(/Receipt, Typed/)).toBeVisible();
    expect(within(item).getByText(/Romanian/)).toBeVisible();
  });

  it('shows an empty state', async () => {
    stub({ 'GET /api/admin/unmatched': () => Response.json({ entries: [] }) });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    expect(await screen.findByText('Nothing to review.')).toBeVisible();
  });

  it('dismisses an entry without resolving', async () => {
    const calls = stub({
      'POST /api/admin/unmatched/dismiss': () =>
        new Response(null, { status: 204 }),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Dismiss Brânză ciudată' }),
    );

    await vi.waitFor(() =>
      expect(
        calls.some((c) => c.key === 'POST /api/admin/unmatched/dismiss'),
      ).toBe(true),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/admin/unmatched/dismiss')?.body,
    ).toEqual({ normalizedName: 'branza ciudata' });
  });

  it('resolves to an existing Ingredient chosen from search, in the entry locale', async () => {
    const calls = stub({
      'POST /api/admin/unmatched/resolve': () =>
        Response.json(
          {
            ingredientId: 'i1',
            locale: 'ro',
            relinkedBatches: 2,
            relinkedShoppingItems: 1,
            synonymAdded: true,
          },
          { status: 201 },
        ),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Resolve Brânză ciudată' }),
    ).toHaveFocus();
    // Nothing to confirm until an Ingredient is picked.
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeDisabled();

    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    await vi.waitFor(() =>
      expect(
        calls.some((c) => c.key === 'POST /api/admin/unmatched/resolve'),
      ).toBe(true),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/admin/unmatched/resolve')?.body,
    ).toEqual({
      normalizedName: 'branza ciudata',
      ingredientId: 'i1',
      locale: 'ro',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Linked 3 rows to Parmesan',
    );
    // Focus lands on the result message, not on the page body.
    expect(screen.getByRole('status')).toHaveFocus();
  });

  it('returns focus to the Resolve button when the resolver is cancelled', async () => {
    stub();
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    ).toHaveFocus();
  });

  it('resolves to a new Ingredient prefilled with the raw name', async () => {
    const calls = stub({
      'POST /api/admin/unmatched/resolve': () =>
        Response.json(
          {
            ingredientId: 'new',
            locale: 'ro',
            relinkedBatches: 3,
            relinkedShoppingItems: 0,
            synonymAdded: true,
          },
          { status: 201 },
        ),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    );
    await user.click(screen.getByRole('button', { name: 'New Ingredient' }));
    const name = screen.getByLabelText(/Name \(English\)/);
    expect(name).toHaveValue('Brânză ciudată');
    await user.clear(name);
    await user.type(name, 'Odd cheese');
    await user.selectOptions(screen.getByLabelText('Default unit'), 'kg');
    await user.selectOptions(screen.getByLabelText('Synonym language'), 'en');
    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    await vi.waitFor(() =>
      expect(
        calls.some((c) => c.key === 'POST /api/admin/unmatched/resolve'),
      ).toBe(true),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/admin/unmatched/resolve')?.body,
    ).toEqual({
      normalizedName: 'branza ciudata',
      newIngredient: {
        name: 'Odd cheese',
        leafCategoryId: 'l1',
        defaultUnit: 'kg',
      },
      locale: 'en',
    });
  });

  it('shows a translated API error and stays on the entry', async () => {
    stub({
      'POST /api/admin/unmatched/resolve': () =>
        Response.json(
          { code: 'unmatched.name_taken', params: {} },
          { status: 409 },
        ),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    );
    await user.click(screen.getByRole('button', { name: 'New Ingredient' }));
    await user.click(screen.getByRole('button', { name: 'Resolve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /already belongs to another Ingredient/,
    );
  });

  it('switches to dismissed entries', async () => {
    const calls = stub({
      'GET /api/admin/unmatched': () => Response.json({ entries: [] }),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Dismissed' }));
    await vi.waitFor(() => expect(calls.length).toBeGreaterThan(1));
  });

  it('shows the printed text with its Scan Language next to the raw name', async () => {
    stub({
      'GET /api/admin/unmatched': () =>
        Response.json({ entries: [printedEntry] }),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const item = await screen.findByRole('listitem');
    expect(within(item).getByText('Cheese')).toBeVisible();
    expect(within(item).getByText('Printed: OST 200G (Danish)')).toBeVisible();
  });

  it('shows no printed text for an entry that has none', async () => {
    stub();
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const item = await screen.findByRole('listitem');
    expect(within(item).queryByText(/Printed:/)).not.toBeInTheDocument();
  });

  it('offers the printed text as a Synonym, unchecked by default, and sends the choice', async () => {
    const calls = stub({
      'GET /api/admin/unmatched': () =>
        Response.json({ entries: [printedEntry] }),
      'POST /api/admin/unmatched/resolve': () =>
        Response.json(
          { ...resolution, sourceSynonymAdded: true },
          { status: 201 },
        ),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await pickParmesan(user);

    const box = screen.getByRole('checkbox', {
      name: 'Also add the printed text as a Synonym (Danish)',
    });
    expect(box).not.toBeChecked();
    await user.click(box);
    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Linked 2 rows to Parmesan. Added "OST 200G" as a Danish Synonym.',
    );
    expect(
      calls.find((c) => c.key === 'POST /api/admin/unmatched/resolve')?.body,
    ).toEqual({
      normalizedName: 'ost',
      ingredientId: 'i1',
      locale: 'en',
      sourceSynonym: true,
    });
  });

  it('does not ask for the printed-text Synonym unless it is ticked', async () => {
    const calls = stub({
      'GET /api/admin/unmatched': () =>
        Response.json({ entries: [printedEntry] }),
      'POST /api/admin/unmatched/resolve': () =>
        Response.json(resolution, { status: 201 }),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await pickParmesan(user);
    await user.click(screen.getByRole('button', { name: 'Resolve' }));
    await screen.findByRole('status');
    expect(
      calls.find((c) => c.key === 'POST /api/admin/unmatched/resolve')?.body,
    ).not.toHaveProperty('sourceSynonym');
  });

  it.each([
    ['exists', /already a Synonym of this Ingredient/],
    ['taken', /belongs to another Ingredient/],
    ['none', /had no printed text/],
  ] as const)(
    'says why the printed text was not added as a Synonym (%s)',
    async (skipped, message) => {
      stub({
        'GET /api/admin/unmatched': () =>
          Response.json({ entries: [printedEntry] }),
        'POST /api/admin/unmatched/resolve': () =>
          Response.json(
            { ...resolution, sourceSynonymSkipped: skipped },
            { status: 201 },
          ),
      });
      renderWithProviders(<UnmatchedQueue catalog={catalog} />);
      const user = userEvent.setup();
      await pickParmesan(user);
      await user.click(
        screen.getByRole('checkbox', { name: /Also add the printed text/ }),
      );
      await user.click(screen.getByRole('button', { name: 'Resolve' }));
      expect(await screen.findByRole('status')).toHaveTextContent(message);
    },
  );

  it('offers no printed-text Synonym when there is no printed text', async () => {
    stub();
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Resolve Brânză ciudată' }),
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('offers only catalog languages for the Synonym of the raw name', async () => {
    stub({
      'GET /api/admin/unmatched': () =>
        Response.json({ entries: [printedEntry] }),
    });
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Resolve Cheese' }),
    );
    const options = within(screen.getByLabelText('Synonym language'))
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(options).toEqual(['English', 'Romanian']);
  });
});
