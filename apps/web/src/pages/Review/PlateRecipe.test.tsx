import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ProposedLine } from '../../lib/scan';
import { getScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { REVIEW_ROUTE, startReview } from '../../test/review';
import { ReviewPage } from './ReviewPage';

const rice: CatalogSearchResult = {
  id: 'rice-id',
  name: 'Rice',
  defaultUnit: 'g',
  leafCategory: { id: 'grain', name: 'Grains' },
  parentCategory: { id: 'dry', name: 'Dry goods', aisle: 'Dry goods' },
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

const suggestions = [
  { id: 'pilaf-id', title: 'Pilaf', score: 0.9 },
  { id: 'risotto-id', title: 'Risotto', score: 0.4 },
];

function renderPlate(
  extra: Record<string, (url: URL) => Response> = {},
  found = suggestions,
) {
  startReview({ mode: 'plate', lines, dishTitle: 'Rice bowl' });
  const { fetchMock, calls } = stubApi({
    'POST /api/recipes/plate-suggestions': () =>
      Response.json({ suggestions: found }),
    'POST /api/recipes/from-plate': () => Response.json({ id: 'new-id' }),
    'GET /api/recipes': () =>
      Response.json({
        recipes: [
          { id: 'c1', title: 'Paella', owner: 'catalog', parentId: null },
          { id: 'f1', title: 'Gran paella', owner: 'family', parentId: null },
        ],
      }),
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

const savedParent = (calls: ReturnType<typeof stubApi>['calls']) =>
  (
    calls.find((c) => c.key === 'POST /api/recipes/from-plate')?.body as {
      parentId: unknown;
    }
  ).parentId;

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

  it('preselects the suggested Base Recipe and saves a Variant with the edited lines', async () => {
    const calls = renderPlate();
    const bases = await openPanel();
    const suggested = await within(bases).findByRole('radio', {
      name: 'Pilaf (suggested)',
    });
    expect(suggested).toBeChecked();
    expect(within(bases).getByRole('radio', { name: 'Risotto' })).toBeVisible();
    const title = screen.getByLabelText('Recipe title');
    expect(title).toHaveValue('Rice bowl');
    await userEvent.clear(title);
    await userEvent.type(title, 'Our rice bowl');
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByText('recipe screen')).toBeVisible();
    const suggest = calls.find(
      (c) => c.key === 'POST /api/recipes/plate-suggestions',
    );
    expect(suggest?.body).toEqual({
      locale: 'en',
      dishTitle: 'Rice bowl',
      ingredientIds: ['rice-id'],
    });
    expect(
      calls.find((c) => c.key === 'POST /api/recipes/from-plate')?.body,
    ).toEqual({
      locale: 'en',
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

  it('defaults to standalone when nothing is suggested', async () => {
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
    await within(bases).findByRole('radio', { name: 'Pilaf (suggested)' });
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
    await screen.findByRole('radio', { name: 'Pilaf (suggested)' });
    await userEvent.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByRole('alert')).toBeVisible();
    await waitFor(() => expect(getScanSession().scans).toHaveLength(1));
  });
});
