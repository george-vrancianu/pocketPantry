import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { PlateMatch } from '../../lib/plateRecipe';
import type { ProposedLine } from '../../lib/scan';
import { getScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { REVIEW_ROUTE, startReview } from '../../test/review';
import { ReviewPage } from './ReviewPage';

const rice: CatalogSearchResult = {
  owner: 'catalog',
  amountScale: 'medium',
  id: 'rice-id',
  name: 'Rice',
  defaultUnit: 'g',
  leafCategory: { id: 'grain', name: 'Grains' },
  parentCategory: {
    id: 'dry',
    name: 'Dry goods',
    aisle: { id: 'aisle', name: 'Dry goods' },
  },
  defaults: { expiryDays: 300, location: 'cupboard' },
};

const lines: ProposedLine[] = [
  {
    name: 'Rice',
    match: rice,
    lowConfidence: false,
    quantity: 80,
    unit: 'g',
    expiryDate: null,
    sourceText: null,
    productDescription: null,
  },
  {
    name: 'Secret sauce',
    match: null,
    lowConfidence: false,
    quantity: null,
    unit: null,
    expiryDate: null,
    sourceText: null,
    productDescription: null,
  },
];

const matches: PlateMatch[] = [
  { id: 'pilaf-id', title: 'Pilaf', score: 0.9, allergyWarning: null },
  { id: 'risotto-id', title: 'Risotto', score: 0.4, allergyWarning: null },
];

function renderPlate(
  extra: Record<string, (url: URL) => Response> = {},
  found = matches,
  scanLines = lines,
) {
  startReview({ mode: 'plate', lines: scanLines, dishTitle: 'Rice bowl' });
  const { fetchMock, calls } = stubApi({
    'POST /api/recipes/plate-matches': () => Response.json({ matches: found }),
    'POST /api/recipes/from-plate': () => Response.json({ id: 'new-id' }),
    'GET /api/recipes': (url) => {
      const term = url.searchParams.get('search')?.toLowerCase() ?? '';
      return Response.json({
        recipes: [
          { id: 'c1', title: 'Paella', owner: 'catalog', parentId: null },
          {
            id: 'risotto-id',
            title: 'Risotto',
            owner: 'catalog',
            parentId: null,
          },
          { id: 'f1', title: 'Gran paella', owner: 'family', parentId: null },
        ].filter((recipe) => recipe.title.toLowerCase().includes(term)),
      });
    },
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
      <Route path="/recipes/:id" element={<p>recipe screen</p>} />
      <Route path="/scan" element={<p>scan screen</p>} />
    </Routes>,
    { route: REVIEW_ROUTE },
  );
  return calls;
}

const openPanel = async () => {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Save as a Recipe' }),
  );
  return screen.findByRole('group', { name: 'Base Recipe' });
};

const savedParent = (calls: ReturnType<typeof stubApi>['calls']) => {
  const save = calls.find((c) => c.key === 'POST /api/recipes/from-plate');
  return (save?.body as { parentId: unknown } | undefined)?.parentId;
};

afterEach(() => vi.unstubAllGlobals());

describe('Plate Scan: save as a Recipe', () => {
  it('is offered on a Plate Scan only', async () => {
    startReview({ mode: 'product', lines });
    vi.stubGlobal('fetch', stubApi({}).fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/scan/review/:scanId" element={<ReviewPage />} />
      </Routes>,
      { route: REVIEW_ROUTE },
    );
    await screen.findByRole('heading', { name: 'Review' });
    expect(
      screen.queryByRole('button', { name: 'Save as a Recipe' }),
    ).toBeNull();
  });

  it('preselects the closest Base Recipe and saves a Variant with the edited lines', async () => {
    const calls = renderPlate();
    const bases = await openPanel();
    const closestRadio = await within(bases).findByRole('radio', {
      name: 'Pilaf (closest match)',
    });
    expect(closestRadio).toBeChecked();
    expect(within(bases).getByRole('radio', { name: 'Risotto' })).toBeVisible();
    const title = screen.getByLabelText('Recipe title');
    expect(title).toHaveValue('Rice bowl');
    await userEvent.clear(title);
    await userEvent.type(title, 'Our rice bowl');
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByText('recipe screen')).toBeVisible();
    const matchCall = calls.find(
      (c) => c.key === 'POST /api/recipes/plate-matches',
    );
    expect(matchCall?.body).toEqual({
      dishTitle: 'Rice bowl',
      ingredientIds: ['rice-id'],
    });
    expect(
      calls.find((c) => c.key === 'POST /api/recipes/from-plate')?.body,
    ).toEqual({
      title: 'Our rice bowl',
      parentId: 'pilaf-id',
      lines: [
        {
          ingredientId: 'rice-id',
          rawName: null,
          quantity: 80,
          unit: 'g',
          optional: false,
          note: null,
        },
        {
          ingredientId: null,
          rawName: 'Secret sauce',
          quantity: null,
          unit: null,
          optional: false,
          note: null,
        },
      ],
    });
    expect(getScanSession().scans).toHaveLength(0);
  });

  it('saves a standalone Recipe when chosen', async () => {
    const calls = renderPlate();
    const bases = await openPanel();
    await userEvent.click(
      await within(bases).findByRole('radio', {
        name: 'Standalone Recipe (no base)',
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('recipe screen');
    expect(savedParent(calls)).toBeNull();
  });

  it('defaults to standalone when nothing matches', async () => {
    renderPlate({}, []);
    const bases = await openPanel();
    expect(
      await within(bases).findByRole('radio', {
        name: 'Standalone Recipe (no base)',
      }),
    ).toBeChecked();
  });

  it('picks another Base Recipe from the Catalog only', async () => {
    const calls = renderPlate();
    const bases = await openPanel();
    await within(bases).findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Find another Base Recipe' }),
      'pae',
    );
    expect(await screen.findByRole('radio', { name: 'Paella' })).toBeVisible();
    expect(screen.queryByRole('radio', { name: 'Gran paella' })).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Paella' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('recipe screen');
    expect(savedParent(calls)).toBe('c1');
  });

  it('shows a translated error and keeps the Scan card when the save fails', async () => {
    renderPlate({
      'POST /api/recipes/from-plate': () =>
        Response.json(
          { code: 'recipes.parent_not_found', params: {} },
          { status: 404 },
        ),
    });
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByRole('alert')).toBeVisible();
    await waitFor(() => expect(getScanSession().scans).toHaveLength(1));
  });

  it('does not list the full Recipe list before the search term is typed', async () => {
    const calls = renderPlate();
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.type(screen.getByRole('searchbox'), 'p');
    expect(screen.queryByRole('radio', { name: 'Paella' })).toBeNull();
    await screen.findByRole('radio', { name: 'Paella' });
    for (const call of calls.filter((c) => c.key === 'GET /api/recipes'))
      expect(new URLSearchParams(call.search).get('search')).not.toBe(null);
  });

  it('does not repeat a match among the search results', async () => {
    const calls = renderPlate();
    const bases = await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.type(screen.getByRole('searchbox'), 'risotto');
    await waitFor(() =>
      expect(
        calls.some(
          (c) => c.key === 'GET /api/recipes' && c.search.includes('risotto'),
        ),
      ).toBe(true),
    );
    expect(
      await within(bases).findAllByRole('radio', { name: 'Risotto' }),
    ).toHaveLength(1);
  });

  it('puts focus on the panel heading and back on the button when cancelled', async () => {
    renderPlate();
    await openPanel();
    expect(
      screen.getByRole('heading', { name: 'Save as a Recipe' }),
    ).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.getByRole('button', { name: 'Save as a Recipe' }),
    ).toHaveFocus();
  });

  it('says how many matches are hidden by Allergies and brings them back on Show', async () => {
    let asked = 0;
    const calls = renderPlate({
      // The first answer hides one; asking again (with the override) brings it back.
      'POST /api/recipes/plate-matches': () =>
        ++asked > 1
          ? Response.json({
              matches: [
                ...matches,
                {
                  id: 'peanut-id',
                  title: 'Satay',
                  score: 0.3,
                  allergyWarning: null,
                },
              ],
              hiddenByAllergiesCount: 0,
            })
          : Response.json({ matches, hiddenByAllergiesCount: 1 }),
    });
    const bases = await openPanel();
    expect(
      await screen.findByText('1 Recipe hidden by your Allergies'),
    ).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(
      await within(bases).findByRole('radio', { name: 'Satay' }),
    ).toBeVisible();
    expect(screen.queryByText(/hidden by your Allergies/)).toBeNull();
    expect(
      calls.filter((c) => c.key === 'POST /api/recipes/plate-matches').at(-1)
        ?.body,
    ).toMatchObject({ showHidden: true });
  });

  it('announces the search for Base Recipes as a status', async () => {
    renderPlate({
      'POST /api/recipes/plate-matches': () =>
        new Promise<Response>(() => {}) as never,
    });
    await openPanel();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Finding Base Recipes',
    );
  });

  it('sends the edited quantity, unit and Unmatched name', async () => {
    const calls = renderPlate();
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    const name = screen.getByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'House sauce');
    await userEvent.click(await screen.findByRole('button', { name: /Rice/ }));
    // The Unmatched row is to check, so it is shown first; Rice's inputs come last.
    const quantities = screen.getAllByLabelText('Quantity');
    fireEvent.change(quantities[quantities.length - 1], {
      target: { value: '120' },
    });
    const units = screen.getAllByLabelText('Unit');
    await userEvent.selectOptions(units[units.length - 1], 'kg');
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('recipe screen');
    const body = calls.find((c) => c.key === 'POST /api/recipes/from-plate')
      ?.body as { lines: Record<string, unknown>[] };
    expect(body.lines[0]).toMatchObject({
      ingredientId: 'rice-id',
      quantity: 120,
      unit: 'kg',
    });
    expect(body.lines[1]).toMatchObject({ rawName: 'House sauce' });
  });

  it('leaves out excluded lines', async () => {
    const calls = renderPlate();
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Secret sauce' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('recipe screen');
    const body = calls.find((c) => c.key === 'POST /api/recipes/from-plate')
      ?.body as { lines: { rawName: string | null }[] };
    expect(body.lines.map((l) => l.rawName)).toEqual([null]);
  });

  it('does not save while a line is invalid, and focuses the field', async () => {
    const calls = renderPlate({}, matches, lines.slice(0, 1));
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    const row = await screen.findByRole('button', { name: /Rice/ });
    await userEvent.click(row);
    const quantity = screen.getByLabelText('Quantity');
    fireEvent.change(quantity, { target: { value: '0' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Quantity')).toHaveFocus(),
    );
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/recipes/from-plate',
    );
  });

  it('sends the quantity the Member edited', async () => {
    const calls = renderPlate({}, matches, lines.slice(0, 1));
    await openPanel();
    await screen.findByRole('radio', { name: 'Pilaf (closest match)' });
    await userEvent.click(await screen.findByRole('button', { name: /Rice/ }));
    const quantity = screen.getByLabelText('Quantity');
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '120');
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    await screen.findByText('recipe screen');
    const body = calls.find((c) => c.key === 'POST /api/recipes/from-plate')
      ?.body as { lines: { quantity: number | null }[] };
    expect(body.lines[0].quantity).toBe(120);
  });

  it('marks a match whose Recipe contains an Allergy, naming the Allergen', async () => {
    renderPlate({}, [
      {
        ...matches[0],
        allergyWarning: {
          severity: 'strong',
          allergens: [
            {
              id: 'a-pn',
              name: 'Peanuts',
              tier: 'yours',
              severity: 'strong',
              owners: [{ kind: 'own' }],
            },
          ],
          uncheckedCount: 0,
        },
      },
      { ...matches[1], allergyWarning: null },
    ]);
    const bases = await openPanel();
    const indicator = await within(bases).findByRole('img', {
      name: 'Contains Peanuts',
    });
    expect(indicator).toHaveAttribute('data-severity', 'strong');
    expect(within(bases).getAllByRole('img')).toHaveLength(1);
    expect(
      within(bases).getByRole('radio', {
        name: 'Pilaf (closest match) Contains Peanuts',
      }),
    ).toBeChecked();
  });
});
