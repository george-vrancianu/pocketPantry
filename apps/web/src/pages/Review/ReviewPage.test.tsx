import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview, startReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewPage } from './ReviewPage';

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hard', name: 'Hard cheese' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 60, location: 'fridge' },
};
const milk: CatalogSearchResult = {
  ...parmesan,
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  defaults: { expiryDays: 7, location: 'fridge' },
};

const line = (overrides: Partial<ProposedLine> = {}): ProposedLine => ({
  name: 'Grana Padano',
  match: parmesan,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: '2026-12-24',
  sourceText: 'GRANA PAD 200G',
  productDescription: 'Grana Padano 200g',
  ...overrides,
});

function renderReview(lines: ProposedLine[], extra = {}) {
  startReview({ mode: 'product', lines });
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/search': () => Response.json({ results: [milk] }),
    'GET /api/catalog/parents': () =>
      Response.json({
        parents: [
          { id: 'dairy-id', name: 'Dairy' },
          { id: 'other-id', name: 'Other' },
        ],
      }),
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan/review" element={<ReviewPage />} />
      <Route path="/scan" element={<p>scan screen</p>} />
      <Route path="/pantry" element={<p>pantry screen</p>} />
    </Routes>,
    { route: '/scan/review' },
  );
  return calls;
}

describe('ReviewPage', () => {
  beforeEach(() => clearReview());
  afterEach(() => vi.unstubAllGlobals());

  it('goes back to Scan when there is nothing to review', () => {
    vi.stubGlobal('fetch', stubApi({}).fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/scan/review" element={<ReviewPage />} />
        <Route path="/scan" element={<p>scan screen</p>} />
      </Routes>,
      { route: '/scan/review' },
    );
    expect(screen.getByText('scan screen')).toBeInTheDocument();
  });

  it('pre-fills a matched line from the proposal and the Catalog defaults', () => {
    renderReview([line()]);
    const card = screen.getByRole('region', { name: 'Parmesan' });
    expect(within(card).getByLabelText('Location')).toHaveValue('fridge');
    expect(within(card).getByLabelText('Unit')).toHaveValue('g');
    expect(within(card).getByLabelText('Expiry date')).toHaveValue(
      '2026-12-24',
    );
    expect(within(card).getByLabelText('Product description')).toHaveValue(
      'Grana Padano 200g',
    );
    expect(within(card).queryByRole('note')).not.toBeInTheDocument();
  });

  it('shows what the Scan read under the name, and nothing without it', () => {
    renderReview([line(), line({ name: 'Plate thing', sourceText: null })]);
    expect(screen.getByText('Read: GRANA PAD 200G')).toBeInTheDocument();
    expect(screen.getAllByText(/^Read:/)).toHaveLength(1);
  });

  it('flags Unmatched and low-confidence lines', () => {
    renderReview([
      line({ match: null, name: 'Mystery' }),
      line({ lowConfidence: true }),
    ]);
    const notes = screen.getAllByRole('note').map((n) => n.textContent);
    expect(notes[0]).toMatch(/Unmatched/);
    expect(notes[1]).toMatch(/Low confidence/);
  });

  it('changes the Match through Catalog search, taking the new defaults', async () => {
    renderReview([line({ expiryDate: null })]);
    await userEvent.click(screen.getByRole('button', { name: 'Change match' }));
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'milk',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));
    const card = screen.getByRole('region', { name: 'Milk' });
    expect(within(card).getByLabelText('Unit')).toHaveValue('ml');
  });

  it('drops a line', async () => {
    renderReview([line(), line({ name: 'Other', match: milk })]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Drop Parmesan' }),
    );
    expect(
      screen.queryByRole('region', { name: 'Parmesan' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Milk' })).toBeInTheDocument();
  });

  it('saves the edited lines as Batches, Unmatched ones under their name', async () => {
    const calls = renderReview([
      line(),
      line({ match: null, name: 'Mystery jar' }),
    ]);
    const parmesanCard = screen.getByRole('region', { name: 'Parmesan' });
    await userEvent.type(
      within(parmesanCard).getByLabelText('Quantity'),
      '200',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save 2 items' }));

    expect(await screen.findByText('pantry screen')).toBeInTheDocument();
    const body = calls.find(
      (c) => c.key === 'POST /api/pantry/batches/bulk',
    )?.body;
    expect(body).toEqual({
      batches: [
        {
          ingredientId: 'parmesan-id',
          quantity: 200,
          unit: 'g',
          location: 'fridge',
          expiryDate: '2026-12-24',
          productDescription: 'Grana Padano 200g',
        },
        {
          rawName: 'Mystery jar',
          source: 'product',
          quantity: null,
          unit: null,
          location: 'cupboard',
          expiryDate: '2026-12-24',
          productDescription: 'Grana Padano 200g',
        },
      ],
    });
  });

  it('lets the Member place an Unmatched line in a Parent Category, and not a matched one', async () => {
    const calls = renderReview([
      line(),
      line({ match: null, name: 'Mystery jar' }),
    ]);
    expect(
      within(screen.getByRole('region', { name: 'Parmesan' })).queryByLabelText(
        'Category',
      ),
    ).not.toBeInTheDocument();
    const card = screen.getByRole('region', { name: 'Mystery jar' });
    await within(card).findByRole('option', { name: 'Dairy' });
    await userEvent.selectOptions(
      within(card).getByLabelText('Category'),
      'Dairy',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save 2 items' }));
    await screen.findByText('pantry screen');
    const body = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk')
      ?.body as { batches: object[] };
    expect(body.batches[0]).not.toHaveProperty('parentCategoryId');
    expect(body.batches[1]).toMatchObject({
      rawName: 'Mystery jar',
      parentCategoryId: 'dairy-id',
    });
  });

  it('will not save an invalid quantity', async () => {
    renderReview([line()]);
    await userEvent.type(screen.getByLabelText('Quantity'), '0');
    expect(screen.getByRole('button', { name: 'Save 1 item' })).toBeDisabled();
  });

  it.each(['1e3', '2000000'])(
    'will not save a quantity the server rejects (%s)',
    (bad) => {
      renderReview([line()]);
      fireEvent.change(screen.getByLabelText('Quantity'), {
        target: { value: bad },
      });
      expect(
        screen.getByRole('button', { name: 'Save 1 item' }),
      ).toBeDisabled();
    },
  );

  it('discards the draft and returns to Scan', async () => {
    renderReview([line()]);
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.getByText('scan screen')).toBeInTheDocument();
  });

  it('shows a save error', async () => {
    renderReview([line()], {
      'POST /api/pantry/batches/bulk': () =>
        Response.json(
          { code: 'pantry.ingredient_not_found', params: {} },
          { status: 404 },
        ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not find that ingredient',
    );
  });
});
