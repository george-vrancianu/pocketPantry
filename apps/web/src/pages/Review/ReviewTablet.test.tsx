import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview, startReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubViewport } from '../../test/viewport';
import { ReviewPage } from './ReviewPage';
import { tabletTemplate } from './components/layout';

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
  quantity: 200,
  unit: 'g',
  expiryDate: '2026-12-24',
  sourceText: 'GRANA PAD 200G',
  productDescription: 'Grana Padano 200g',
  ...overrides,
});

function renderReview(
  lines: ProposedLine[],
  mode: 'product' | 'plate' = 'product',
) {
  startReview({ mode, lines });
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/search': () => Response.json({ results: [milk] }),
    'GET /api/catalog/parents': () =>
      Response.json({ parents: [{ id: 'dairy-id', name: 'Dairy' }] }),
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    'POST /api/shopping-list/items/bulk': () => Response.json({ items: [] }),
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

/** The table row of a line, found by its Remove button, which every row has and names the line. */
const rowOf = (name: string) =>
  screen
    .getByRole('button', { name: `Remove ${name}` })
    .closest('[role="row"]') as HTMLElement;

describe('Review on a tablet or laptop', () => {
  beforeEach(() => {
    clearReview();
    stubViewport(1180);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is a table with column headers and group rows, with counters and no sticky bar', () => {
    renderReview([
      line(),
      line({ match: milk, name: 'Beer', lowConfidence: true }),
    ]);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('columnheader')
        .map((h) => h.textContent)
        .filter(Boolean),
    ).toEqual(
      expect.arrayContaining([
        'Product',
        'Qty',
        'Location',
        'Expires',
        'Confidence',
      ]),
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'To check · 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Confident · 1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('to save').parentElement).toHaveTextContent('2');
    expect(
      screen.getByText('Sure rows are collapsed. Tap a row to edit it.'),
    ).toBeInTheDocument();
  });

  it('edits a row to check in place, with name, source and Description lines and swap + delete actions', async () => {
    renderReview([line({ match: milk, name: 'Beer', lowConfidence: true })]);
    const row = rowOf('Milk');
    expect(within(row).getByText('Read: GRANA PAD 200G')).toBeInTheDocument();
    expect(within(row).getByLabelText('Product description: Milk')).toHaveValue(
      'Grana Padano 200g',
    );
    expect(within(row).getByText('Low')).toBeInTheDocument();
    expect(
      within(row).getByRole('img', { name: 'Low confidence' }),
    ).toBeInTheDocument();
    expect(
      within(row).getByRole('button', { name: 'Change match for Milk' }),
    ).toBeInTheDocument();
    expect(
      within(row).getByRole('button', { name: 'Remove Milk' }),
    ).toBeInTheDocument();
    const qty = within(row).getByLabelText('Quantity: Milk');
    await userEvent.clear(qty);
    await userEvent.type(qty, '3');
    expect(qty).toHaveValue(3);
    expect(within(row).getByLabelText('Expiry date: Milk')).toHaveValue(
      '24.12.2026',
    );
  });

  it('keeps a missing-quantity row in To check while typed, then Confirm moves it to Confident', async () => {
    renderReview([line({ quantity: null, unit: null })]);
    const row = rowOf('Parmesan');
    expect(within(row).getByText('No quantity')).toBeInTheDocument();
    await userEvent.type(
      within(row).getByLabelText('Quantity: Parmesan'),
      '25',
    );
    expect(
      within(rowOf('Parmesan')).getByLabelText('Quantity: Parmesan'),
    ).toHaveValue(25);
    expect(
      screen.getByRole('heading', { level: 2, name: 'To check · 1' }),
    ).toBeInTheDocument();
    expect(within(rowOf('Parmesan')).getByText('High')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm Parmesan' }),
    );
    expect(
      screen.queryByRole('heading', { name: /To check/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Confident · 1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('to check').parentElement).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: 'Edit Parmesan' })).toHaveFocus();
  });

  it('blocks Confirm on an invalid value and focuses it', async () => {
    renderReview([line({ lowConfidence: true })]);
    const qty = screen.getByLabelText('Quantity: Parmesan');
    await userEvent.clear(qty);
    await userEvent.type(qty, '0');
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm Parmesan' }),
    );
    expect(screen.getByLabelText('Quantity: Parmesan')).toHaveFocus();
    expect(
      screen.getByRole('heading', { level: 2, name: 'To check · 1' }),
    ).toBeInTheDocument();
  });

  it('does not reopen a collapsed Confident group when a row to check is typed in', async () => {
    renderReview([line(), line({ name: 'B', match: milk, quantity: null })]);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    await userEvent.type(screen.getByLabelText('Quantity: Milk'), '2');
    expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
  });

  it('shows a sure row as read-only text until the row or its pencil is clicked', async () => {
    renderReview([line(), line({ match: milk, name: 'Milk', unit: 'ml' })]);
    const row = rowOf('Parmesan');
    expect(within(row).queryByRole('textbox')).not.toBeInTheDocument();
    expect(row).toHaveTextContent('200 g');
    expect(row).toHaveTextContent('24.12.2026');
    expect(row).toHaveTextContent('Read: GRANA PAD 200G');
    expect(row).toHaveTextContent('Grana Padano 200g');
    expect(within(row).getByText('High')).toBeInTheDocument();
    await userEvent.click(row);
    expect(
      within(rowOf('Parmesan')).getByLabelText('Quantity: Parmesan'),
    ).toBeInTheDocument();
    expect(
      within(rowOf('Parmesan')).getByLabelText('Product description: Parmesan'),
    ).toBeInTheDocument();
    await userEvent.click(
      within(rowOf('Milk')).getByRole('button', { name: 'Edit Milk' }),
    );
    expect(
      within(rowOf('Milk')).getByLabelText('Quantity: Milk'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Finish editing Milk' }),
    );
    expect(
      within(rowOf('Milk')).queryByLabelText('Quantity: Milk'),
    ).not.toBeInTheDocument();
  });

  it('lets an Unmatched row edit its Name and Category in place', async () => {
    const calls = renderReview([line({ match: null, name: 'Mystery' })]);
    const row = rowOf('Mystery');
    const name = within(row).getByLabelText('Name: Mystery');
    await userEvent.clear(name);
    await userEvent.type(name, 'Zaatar');
    expect(within(row).getByText('Low')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(row).getByRole('option', { name: 'Dairy' }),
      ).toBeInTheDocument(),
    );
    await userEvent.selectOptions(
      within(row).getByLabelText('Category: Zaatar'),
      'Dairy',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    await screen.findByText('pantry screen');
    const body = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk')
      ?.body as { batches: object[] };
    expect(body.batches[0]).toMatchObject({
      rawName: 'Zaatar',
      parentCategoryId: 'dairy-id',
    });
  });

  it('swaps the Match in the dialog, keeps the row in To check and returns focus to the trigger', async () => {
    renderReview([line({ lowConfidence: true })]);
    const trigger = screen.getByRole('button', {
      name: 'Change match for Parmesan',
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', {
      name: 'Change match for Parmesan',
    });
    await userEvent.type(
      within(dialog).getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'To check · 1' }),
    ).toBeInTheDocument();
    expect(rowOf('Milk')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Change match for Milk' }),
    ).toHaveFocus();
  });

  it('lets a sure row, and a confirmed Unmatched row, choose a Match', async () => {
    renderReview([line(), line({ match: null, name: 'Mystery' })]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm Mystery' }),
    );
    await userEvent.click(rowOf('Mystery'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose match for Mystery' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('removes a row to Excluded and adds it back', async () => {
    renderReview([line(), line({ match: milk, name: 'Milk' })]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Parmesan' }),
    );
    expect(
      screen.getByRole('button', { name: 'Save 1 item' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Excluded · 1/ }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Add Parmesan back' }),
    );
    expect(
      screen.getByRole('button', { name: 'Save 2 items' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Parmesan' })).toHaveFocus();
  });

  it('blocks Save on an invalid date, opening the sure row and focusing the field', async () => {
    const calls = renderReview([line()]);
    await userEvent.click(rowOf('Parmesan'));
    const expiry = screen.getByLabelText('Expiry date: Parmesan');
    await userEvent.clear(expiry);
    await userEvent.type(expiry, '0810');
    await userEvent.click(
      screen.getByRole('button', { name: 'Finish editing Parmesan' }),
    );
    expect(screen.getByLabelText('Expiry date: Parmesan')).toHaveFocus();
    expect(
      screen.getByText('Enter a real date as dd.mm.yyyy.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('focuses the first invalid field of a collapsed sure row when Save is blocked', async () => {
    renderReview([
      line({ expiryDate: '2026-12-24' }),
      line({ name: 'B', match: milk }),
    ]);
    await userEvent.click(rowOf('Milk'));
    const qty = screen.getByLabelText('Quantity: Milk');
    await userEvent.clear(qty);
    await userEvent.type(qty, '0');
    await userEvent.click(rowOf('Parmesan'));
    await userEvent.click(screen.getByRole('button', { name: 'Save 2 items' }));
    expect(screen.getByLabelText('Quantity: Milk')).toHaveFocus();
    expect(
      screen.getByText(
        'Enter an amount from 0.001 to 1,000,000, with up to 3 decimals and no exponent.',
      ),
    ).toBeInTheDocument();
  });

  it('hides Location and Expiry for Plate', () => {
    renderReview([line({ lowConfidence: true })], 'plate');
    expect(
      screen.queryByRole('columnheader', { name: 'Location' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Expires' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Expiry date/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Location/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add 1 item to shopping list' }),
    ).toBeInTheDocument();
  });

  it('saves from the footer', async () => {
    const calls = renderReview([line()]);
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    await screen.findByText('pantry screen');
    expect(calls.map((c) => c.key)).toContain('POST /api/pantry/batches/bulk');
  });
});

describe('Review layout breakpoint', () => {
  beforeEach(() => clearReview());
  afterEach(() => vi.unstubAllGlobals());

  it('is the phone layout at 899 px', () => {
    stubViewport(899);
    renderReview([line({ lowConfidence: true })]);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('to check')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    expect(
      screen.queryByText('Sure rows are collapsed. Tap a row to edit it.'),
    ).not.toBeInTheDocument();
  });

  it('is the table at 900 px', () => {
    stubViewport(900);
    renderReview([line({ lowConfidence: true })]);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('tablet column template', () => {
  it('uses fixed widths so Produs takes the remainder', () => {
    expect(tabletTemplate(false)).toBe(
      '24px minmax(0,1fr) 120px 104px 112px 112px 144px',
    );
    expect(tabletTemplate(true)).toBe('24px minmax(0,1fr) 120px 112px 144px');
    expect(tabletTemplate(false, true)).toBe(
      '24px minmax(0,1fr) 150px 150px 150px 120px 144px',
    );
  });
});
