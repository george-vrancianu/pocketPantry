import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview, startReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubViewport } from '../../test/viewport';
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

function renderReview(
  lines: ProposedLine[],
  extra = {},
  mode: 'product' | 'plate' = 'product',
  scanLanguage?: 'en' | 'ro' | 'da',
) {
  startReview({ mode, lines, scanLanguage });
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
    'POST /api/shopping-list/items/bulk': () => Response.json({ items: [] }),
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

/** A confident, complete line: starts shut, in "Confident". */
const sure = (overrides: Partial<ProposedLine> = {}) =>
  line({ quantity: 200, unit: 'g', ...overrides });

/** A row's own button (not the Match or Remove buttons that mention the same name). */
const row = (name: string, index = 0) =>
  screen
    .getAllByRole('button')
    .filter(
      (button) =>
        button.querySelector('[id$="-title"]') !== null &&
        button.textContent?.includes(name),
    )[index];

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

  it('says how many lines were read, per Scan Mode', () => {
    renderReview([sure(), line({ match: null, name: 'Mystery' })]);
    expect(
      screen.getByText('Scanned product · 2 lines read'),
    ).toBeInTheDocument();
  });

  it('shows a confident line as one shut row with its quantity, Location and short date', () => {
    renderReview([sure()]);
    const button = row('Parmesan');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).not.toHaveAttribute('aria-controls');
    expect(button).toHaveTextContent('200 g');
    expect(button).toHaveTextContent('Fridge');
    expect(button).toHaveTextContent('24.12.26');
    expect(button).toHaveTextContent('Read: GRANA PAD 200G');
    expect(
      screen.getByRole('img', { name: 'High confidence' }),
    ).toBeInTheDocument();
  });

  it('shows what the Scan read under the name, and nothing without it', () => {
    renderReview([sure(), sure({ name: 'Plate thing', sourceText: null })]);
    expect(screen.getAllByText('Read: GRANA PAD 200G')).toHaveLength(1);
    expect(screen.getAllByText(/^Read:/)).toHaveLength(1);
  });

  it('opens low-confidence and Unmatched rows, and leaves a missing quantity shut with an amber pill', () => {
    renderReview([
      line({ quantity: null }),
      line({ match: milk, name: 'Beer', lowConfidence: true, quantity: 1 }),
      line({ match: null, name: 'Mystery', quantity: 1 }),
    ]);
    expect(row('Parmesan')).toHaveAttribute('aria-expanded', 'false');
    expect(row('Parmesan')).toHaveTextContent('? g');
    expect(
      screen.getByRole('img', { name: 'Quantity missing' }),
    ).toBeInTheDocument();
    expect(row('Mystery')).toHaveAttribute('aria-expanded', 'true');
    const buttons = screen.getAllByRole('button', { expanded: true });
    expect(buttons.filter((b) => b.id.startsWith('review-line-'))).toHaveLength(
      2,
    );
    expect(screen.getAllByRole('note').map((n) => n.textContent)).toEqual([
      expect.stringMatching(/Low confidence/),
      expect.stringMatching(/No match/),
    ]);
  });

  it('puts rows to check first (low, then missing quantity) and counts them', () => {
    renderReview([
      sure({ name: 'Sure one' }),
      line({ name: 'No qty', quantity: null }),
      line({ match: milk, name: 'Beer', lowConfidence: true, quantity: 1 }),
    ]);
    const labels = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    expect(labels).toEqual(['To check · 2', 'Confident · 1']);
    const tiles = screen.getByText('to check').parentElement;
    expect(tiles).toHaveTextContent('2');
  });

  it('collapses Confident to one line of names, and shows it again', async () => {
    renderReview([sure(), sure({ match: milk, name: 'Milk', unit: 'ml' })]);
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    expect(screen.getByText('Parmesan, Milk')).toBeInTheDocument();
    expect(row('Parmesan')).toBeUndefined();
    await userEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(row('Parmesan')).toBeInTheDocument();
  });

  it('confirming moves a row from To check to Confident and updates the counters', async () => {
    renderReview([
      sure({ name: 'Milk', match: milk }),
      line({ lowConfidence: true, quantity: 1 }),
    ]);
    expect(
      screen.getByRole('heading', { level: 2, name: 'To check · 1' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(
      screen.queryByRole('heading', { name: /To check/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Confident · 2' }),
    ).toBeInTheDocument();
    expect(row('Parmesan')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps an edited confident row confident, and calls its button Done', async () => {
    renderReview([sure()]);
    await userEvent.click(row('Parmesan'));
    await userEvent.clear(screen.getByLabelText('Quantity'));
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(
      screen.getByRole('heading', { level: 2, name: 'Confident · 1' }),
    ).toBeInTheDocument();
  });

  it('removes a row to Excluded and adds it back, focusing it', async () => {
    renderReview([sure(), sure({ name: 'Other', match: milk })]);
    expect(
      screen.getByRole('button', { name: 'Save 2 items' }),
    ).toBeInTheDocument();
    await userEvent.click(row('Parmesan'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Parmesan' }),
    );
    expect(row('Parmesan')).toBeUndefined();
    expect(
      screen.getByRole('button', { name: 'Save 1 item' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Excluded · 1/ }));
    expect(screen.getByText('Removed by you')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add Parmesan back' }),
    );
    expect(
      screen.getByRole('button', { name: 'Save 2 items' }),
    ).toBeInTheDocument();
    expect(row('Parmesan')).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: /Excluded/ }),
    ).not.toBeInTheDocument();
  });

  it('adds a confident line back into a collapsed Confident group and focuses it', async () => {
    renderReview([sure(), sure({ match: milk, name: 'Milk', unit: 'ml' })]);
    await userEvent.click(row('Parmesan'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Parmesan' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    await userEvent.click(screen.getByRole('button', { name: /Excluded · 1/ }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Add Parmesan back' }),
    );
    expect(row('Parmesan')).toHaveFocus();
  });

  it('moves focus to the next row after a Remove, else to the Excluded button', async () => {
    renderReview([sure(), sure({ match: milk, name: 'Milk', unit: 'ml' })]);
    await userEvent.click(row('Parmesan'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Parmesan' }),
    );
    expect(row('Milk')).toHaveFocus();
    await userEvent.click(row('Milk'));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Milk' }));
    expect(screen.getByRole('button', { name: /Excluded · 2/ })).toHaveFocus();
  });

  it('after a Remove with Confident collapsed, focus falls back to the Excluded button', async () => {
    renderReview([
      line({ match: milk, name: 'Beer', lowConfidence: true, quantity: 1 }),
      sure(),
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Milk' }));
    expect(screen.getByRole('button', { name: /Excluded · 1/ })).toHaveFocus();
  });

  it('blocks Save on a half-typed date without a blur, focusing it and saying why', async () => {
    const calls = renderReview([sure()]);
    await userEvent.click(row('Parmesan'));
    const expiry = screen.getByLabelText('Expiry date');
    await userEvent.clear(expiry);
    await userEvent.type(expiry, '0810');
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    expect(screen.getByLabelText('Expiry date')).toHaveFocus();
    expect(
      screen.getByText('Enter a real date as dd.mm.yyyy.'),
    ).toBeInTheDocument();
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('shows expiry day-first in full when open, and takes a typed date back as ISO', async () => {
    const calls = renderReview([sure()]);
    await userEvent.click(row('Parmesan'));
    const expiry = screen.getByLabelText('Expiry date');
    expect(expiry).toHaveValue('24.12.2026');
    expect(expiry).toHaveAttribute('inputmode', 'numeric');
    expect(expiry).toHaveAttribute('placeholder', 'dd.mm.yyyy');
    await userEvent.clear(expiry);
    await userEvent.type(expiry, '01022027');
    expect(expiry).toHaveValue('01.02.2027');
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    await screen.findByText('pantry screen');
    const body = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk')
      ?.body as { batches: object[] };
    expect(body.batches[0]).toMatchObject({ expiryDate: '2027-02-01' });
  });

  it('saves in the Scan Language of the scan, with the printed text of Unmatched lines only', async () => {
    const calls = renderReview(
      [
        line({ name: 'Cheese', match: null, sourceText: 'OST 200G' }),
        sure(),
        line({ name: 'Typed', match: null, sourceText: null }),
      ],
      {},
      'product',
      'da',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save 3 items' }));
    await screen.findByText('pantry screen');
    const save = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk');
    expect(new URLSearchParams(save?.search).get('scanLanguage')).toBe('da');
    const { batches } = (save?.body ?? {}) as { batches: object[] };
    expect(batches[0]).toMatchObject({
      rawName: 'Cheese',
      sourceText: 'OST 200G',
    });
    expect(batches[1]).not.toHaveProperty('sourceText');
    expect(batches[2]).not.toHaveProperty('sourceText');
  });

  it('saves no expiry when the date is cleared', async () => {
    const calls = renderReview([sure()]);
    await userEvent.click(row('Parmesan'));
    await userEvent.clear(screen.getByLabelText('Expiry date'));
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    await screen.findByText('pantry screen');
    const body = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk')
      ?.body as { batches: object[] };
    expect(body.batches[0]).toMatchObject({ expiryDate: null });
  });

  it('rejects an impossible date inline and focuses it instead of saving', async () => {
    const calls = renderReview([
      sure(),
      sure({ name: 'Milk', match: milk, unit: 'ml' }),
    ]);
    await userEvent.click(row('Milk'));
    const expiry = screen.getByLabelText('Expiry date');
    await userEvent.clear(expiry);
    await userEvent.type(expiry, '31022027');
    expect(
      screen.queryByText('Enter a real date as dd.mm.yyyy.'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    expect(
      screen.getByText('Enter a real date as dd.mm.yyyy.'),
    ).toBeInTheDocument();
    await userEvent.click(row('Milk'));
    expect(row('Milk')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Save 2 items' }));
    expect(row('Milk')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Expiry date')).toHaveFocus();
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('focuses the first invalid field in display order when Save is blocked', async () => {
    renderReview([
      line({ quantity: 5 }),
      line({ match: milk, name: 'Beer', lowConfidence: true, quantity: 1 }),
    ]);
    // Beer is to check (shown first); make both invalid.
    await userEvent.click(row('Parmesan'));
    const quantities = screen.getAllByLabelText('Quantity');
    fireEvent.change(quantities[0], { target: { value: '0' } });
    fireEvent.change(quantities[1], { target: { value: '0' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save 2 items' }));
    expect(screen.getAllByLabelText('Quantity')[0]).toHaveFocus();
    expect(screen.getAllByText(/Enter an amount from 0.001/)).toHaveLength(2);
  });

  it('Confirm with an invalid field focuses it instead of shutting the row', async () => {
    renderReview([line({ lowConfidence: true, quantity: 1 })]);
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '0' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(row('Parmesan')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Quantity')).toHaveFocus();
  });

  it('pre-fills a matched line from the proposal and the Catalog defaults', async () => {
    renderReview([sure()]);
    await userEvent.click(row('Parmesan'));
    const panel = screen.getByRole('group', { name: 'Parmesan' });
    expect(within(panel).getByLabelText('Location')).toHaveValue('fridge');
    expect(within(panel).getByLabelText('Unit')).toHaveValue('g');
    expect(within(panel).getByLabelText('Product description')).toHaveValue(
      'Grana Padano 200g',
    );
    expect(
      within(panel).getByRole('button', { name: /Parmesan.*Change/ }),
    ).toBeInTheDocument();
    expect(within(panel).queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('changes the Match in a dialog, taking the new defaults', async () => {
    renderReview([
      line({ expiryDate: null, lowConfidence: true, quantity: 1 }),
    ]);
    await userEvent.click(
      screen.getByRole('button', { name: /Parmesan.*Change/ }),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Change match for Parmesan',
    });
    const search = within(dialog).getByRole('combobox', {
      name: 'Search ingredients',
    });
    expect(search).toHaveFocus();
    await userEvent.type(search, 'milk');
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    const panel = screen.getByRole('group', { name: 'Milk' });
    expect(within(panel).getByLabelText('Unit')).toHaveValue('ml');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    // The row's Match button keeps focus after the swap.
    expect(
      within(panel).getByRole('button', { name: /Milk.*Change/ }),
    ).toHaveFocus();
  });

  it('tells repeated names apart by position, and only then', async () => {
    renderReview([
      line({ match: null, name: 'Tomato', quantity: 1 }),
      line({ match: null, name: 'Tomato', quantity: 1 }),
      sure(),
    ]);
    expect(
      screen.getByRole('button', { name: 'Remove Tomato (1 of 2)' }),
    ).toBeInTheDocument();
    await userEvent.click(row('Parmesan'));
    expect(
      screen.getByRole('button', { name: 'Remove Parmesan' }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Tomato (2 of 2)' }),
    );
    expect(
      screen.getByRole('button', { name: 'Remove Tomato' }),
    ).toBeInTheDocument();
  });

  it('returns focus to the row when the opener was never focused (Safari)', async () => {
    renderReview([line({ quantity: 1, lowConfidence: true })]);
    // fireEvent.click does not focus the button, as a tap in Safari does not.
    fireEvent.click(screen.getByRole('button', { name: /Parmesan.*Change/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(row('Parmesan')).toHaveFocus());
  });

  it('opens and works as a bottom sheet at 899 px, the widest phone layout', async () => {
    stubViewport(899);
    renderReview([line({ quantity: 1, lowConfidence: true })]);
    await userEvent.click(
      screen.getByRole('button', { name: /Parmesan.*Change/ }),
    );
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'milk',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));
    expect(
      await screen.findByRole('group', { name: 'Milk' }),
    ).toBeInTheDocument();
  });

  it('turns an Unmatched line into a matched one when an Ingredient is chosen', async () => {
    renderReview([line({ match: null, name: 'Mystery jar', quantity: 1 })]);
    const opener = screen.getByRole('button', { name: /No match · Choose/ });
    await userEvent.click(opener);
    expect(
      screen.getByRole('dialog', { name: 'Change match for Mystery jar' }),
    ).toBeInTheDocument();
    // Cancelling an Unmatched line returns focus to the same button.
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(opener).toHaveFocus();
    await userEvent.click(opener);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'milk',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));
    const panel = await screen.findByRole('group', { name: 'Milk' });
    expect(within(panel).queryByLabelText('Name')).not.toBeInTheDocument();
    expect(within(panel).getByLabelText('Unit')).toHaveValue('ml');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it.each([
    [
      'Cancel',
      () => userEvent.click(screen.getByRole('button', { name: 'Cancel' })),
    ],
    ['Escape', () => userEvent.keyboard('{Escape}')],
  ])(
    'leaves the line unchanged and returns focus when %s closes the dialog',
    async (_how, close) => {
      renderReview([sure({ quantity: 2 })]);
      await userEvent.click(row('Parmesan'));
      const before = ['Unit', 'Location', 'Expiry date'].map(
        (label) => (screen.getByLabelText(label) as HTMLInputElement).value,
      );
      const opener = screen.getByRole('button', { name: /Parmesan.*Change/ });
      await userEvent.click(opener);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await close();
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(opener).toHaveFocus();
      expect(
        screen.getByRole('group', { name: 'Parmesan' }),
      ).toBeInTheDocument();
      expect(
        ['Unit', 'Location', 'Expiry date'].map(
          (label) => (screen.getByLabelText(label) as HTMLInputElement).value,
        ),
      ).toEqual(before);
    },
  );

  it('shows an Unmatched line as "No match", with a Name and a Category', async () => {
    renderReview([line({ match: null, name: 'Mystery jar', quantity: 1 })]);
    const panel = screen.getByRole('group', { name: 'Mystery jar' });
    expect(
      within(panel).getByRole('button', { name: /No match · Choose/ }),
    ).toBeInTheDocument();
    expect(within(panel).getByLabelText('Name')).toHaveValue('Mystery jar');
    await within(panel).findByRole('option', { name: 'Dairy' });
    expect(within(panel).getByLabelText('Category')).toBeInTheDocument();
  });

  it('saves the edited lines as Batches, Unmatched ones under their name', async () => {
    const calls = renderReview([
      line(),
      line({ match: null, name: 'Mystery jar' }),
    ]);
    await userEvent.click(row('Parmesan'));
    await userEvent.type(screen.getAllByLabelText('Quantity')[1], '200');
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
          sourceText: 'GRANA PAD 200G',
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
      sure(),
      line({ match: null, name: 'Mystery jar' }),
    ]);
    await userEvent.click(row('Parmesan'));
    expect(
      within(screen.getByRole('group', { name: 'Parmesan' })).queryByLabelText(
        'Category',
      ),
    ).not.toBeInTheDocument();
    const panel = screen.getByRole('group', { name: 'Mystery jar' });
    await within(panel).findByRole('option', { name: 'Dairy' });
    await userEvent.selectOptions(
      within(panel).getByLabelText('Category'),
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

  it('flags a blank Unmatched name inline and will not save it', async () => {
    renderReview([line({ match: null, name: 'Mystery jar' })]);
    await userEvent.clear(screen.getByLabelText('Name'));
    expect(screen.getByText('Enter a name.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save 1 item' }));
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it.each(['0', '1e3', '2000000'])(
    'will not save a quantity the server rejects (%s)',
    async (bad) => {
      const calls = renderReview([line({ lowConfidence: true })]);
      fireEvent.change(screen.getByLabelText('Quantity'), {
        target: { value: bad },
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'Save 1 item' }),
      );
      expect(screen.getByLabelText('Quantity')).toHaveFocus();
      expect(screen.getByLabelText('Quantity')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      expect(calls.map((c) => c.key)).not.toContain(
        'POST /api/pantry/batches/bulk',
      );
    },
  );

  it('shows the action bar in place of the dock, and discards back to Scan', async () => {
    renderReview([sure()]);
    expect(screen.getByRole('button', { name: 'Save 1 item' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.getByText('scan screen')).toBeInTheDocument();
  });

  it('shows a save error', async () => {
    renderReview([sure()], {
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

  describe('Plate', () => {
    it('hides Location, expiry and description, and saves to the Shopping List', async () => {
      const calls = renderReview(
        [line({ quantity: 2, unit: 'g' })],
        {},
        'plate',
      );
      await userEvent.click(row('Parmesan'));
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.queryByLabelText('Location')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Expiry date')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Product description'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Fridge')).not.toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('button', { name: 'Add 1 item to shopping list' }),
      );
      await waitFor(() =>
        expect(calls.map((c) => c.key)).toContain(
          'POST /api/shopping-list/items/bulk',
        ),
      );
    });
  });
});
