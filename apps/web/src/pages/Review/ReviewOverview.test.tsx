import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ProposedLine, ScanMode } from '../../lib/scan';
import { dispatchScanSession, resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { ScanPage } from '../Scan/ScanPage';
import { ReviewOverviewPage } from './ReviewOverviewPage';
import { ReviewPage } from './ReviewPage';

vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
  }),
}));

const milk: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'l',
  leafCategory: { id: 'milk', name: 'Milk' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 7, location: 'fridge' },
};

const line = (
  name: string,
  extra: Partial<ProposedLine> = {},
): ProposedLine => ({
  name,
  match: { ...milk, name },
  lowConfidence: false,
  quantity: 1,
  unit: 'pcs',
  expiryDate: null,
  sourceText: null,
  productDescription: null,
  ...extra,
});

const yogurt = line('Greek yogurt');
const shelf = [
  line('Rice'),
  line('Flour', { lowConfidence: true }),
  line('Mystery tin', { match: null }),
];
const receipt = [line('Eggs'), line('Butter')];

/** Puts a Scan in the Scan Session as the Scan screen would: queued, started and, unless told otherwise, read. */
const seed = (
  id: string,
  mode: ScanMode,
  lines: ProposedLine[] | 'reading',
  scanLanguage: 'en' | 'ro' | 'da' = 'en',
) =>
  act(() => {
    dispatchScanSession({
      type: 'enqueue',
      scan: {
        id,
        mode,
        scanLanguage,
        image: 'data:image/jpeg;base64,YQ==',
        thumbnail: 'data:image/jpeg;base64,YQ==',
      },
    });
    dispatchScanSession({ type: 'start' });
    if (lines !== 'reading') dispatchScanSession({ type: 'read', id, lines });
  });

function renderOverview() {
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/parents': () =>
      Response.json({ parents: [{ id: 'other-id', name: 'Other' }] }),
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    'POST /api/scan/receipt/confirm': () =>
      Response.json({ batches: [], matchedShoppingItemIds: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
      <Route path="/pantry" element={<p>pantry screen</p>} />
    </Routes>,
    { route: '/scan/review' },
  );
  return calls;
}

const cards = () => screen.getAllByTestId('review-card');

describe('Review overview', () => {
  beforeEach(() => {
    resetScanSession();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows one card per Scan, in capture order, with its mode as the eyebrow', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'ingredients', shelf);
    await seed('c', 'receipt', receipt);
    renderOverview();
    expect(cards()).toHaveLength(3);
    expect(cards().map((card) => card.textContent)).toEqual([
      expect.stringContaining('Product'),
      expect.stringContaining('Ingredients'),
      expect.stringContaining('Receipt'),
    ]);
  });

  it('words the result line per mode', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'ingredients', shelf);
    await seed('c', 'receipt', receipt);
    renderOverview();
    const [product, ingredients, receiptCard] = cards().map((card) =>
      within(card).getByTestId('card-result'),
    );
    expect(product).toHaveTextContent('Greek yogurt');
    expect(ingredients).toHaveTextContent('3 items');
    expect(receiptCard).toHaveTextContent('2 items');
  });

  it('shows the items read as chips', async () => {
    await seed('b', 'ingredients', shelf);
    renderOverview();
    expect(
      within(cards()[0])
        .getAllByTestId('card-chip')
        .map((chip) => chip.textContent),
    ).toEqual(expect.arrayContaining(['Rice', 'Flour', 'Mystery tin']));
  });

  it('says "Check N items" for low-confidence and unmatched lines only', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'ingredients', shelf);
    renderOverview();
    expect(within(cards()[0]).queryByText(/Check \d+ item/)).toBeNull();
    expect(within(cards()[1]).getByText('Check 2 items')).toBeInTheDocument();
  });

  it('says how many photos there are and whether any is still reading', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'product', 'reading');
    renderOverview();
    expect(screen.getByText('2 photos · 1 still reading')).toBeInTheDocument();
  });

  it('says "all read" when nothing is reading', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'product', [yogurt]);
    renderOverview();
    expect(screen.getByText('2 photos · all read')).toBeInTheDocument();
  });

  it('shows a Scan still being read as "Reading photo…" with no remove button', async () => {
    vi.stubGlobal('fetch', () => new Promise<Response>(() => {}));
    await seed('a', 'product', 'reading');
    renderOverview();
    const card = cards()[0];
    expect(within(card).getByText('Reading photo…')).toBeInTheDocument();
    expect(
      within(card).queryByRole('button', { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  it('removes a card with its ×', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'ingredients', shelf);
    renderOverview();
    await userEvent.click(
      within(cards()[0]).getByRole('button', { name: /remove/i }),
    );
    expect(cards()).toHaveLength(1);
    expect(within(cards()[0]).getByText('Ingredients')).toBeInTheDocument();
  });

  it('goes back to the camera with the Scan Session intact', async () => {
    await seed('a', 'product', [yogurt]);
    await seed('b', 'ingredients', shelf);
    renderOverview();
    await userEvent.click(screen.getByRole('link', { name: 'Camera' }));
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
    expect(screen.getAllByTestId('scan-thumbnail')).toHaveLength(2);
  });

  describe('opening a card', () => {
    it('opens the line editor for that Scan only', async () => {
      await seed('a', 'product', [yogurt]);
      await seed('b', 'ingredients', shelf);
      renderOverview();
      await userEvent.click(within(cards()[1]).getByTestId('card-result'));
      expect(
        screen.getByText('Scanned ingredients · 3 lines read'),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('review-overview')).not.toBeInTheDocument();
    });

    it('saves only that card through the bulk endpoint, in its Scan Language, and removes it', async () => {
      await seed('a', 'product', [yogurt], 'ro');
      await seed('b', 'ingredients', [line('Rice')], 'da');
      const calls = renderOverview();
      await userEvent.click(within(cards()[1]).getByTestId('card-result'));
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save 1 item' }),
      );
      await waitFor(() =>
        expect(screen.getByTestId('review-overview')).toBeInTheDocument(),
      );
      const saves = calls.filter(
        (c) => c.key === 'POST /api/pantry/batches/bulk',
      );
      expect(saves).toHaveLength(1);
      expect(new URLSearchParams(saves[0].search).get('scanLanguage')).toBe(
        'da',
      );
      expect((saves[0].body as { batches: unknown[] }).batches).toHaveLength(1);
      expect(cards()).toHaveLength(1);
      expect(within(cards()[0]).getByText('Product')).toBeInTheDocument();
    });

    it('saves a Receipt card through the receipt confirm endpoint', async () => {
      await seed('a', 'product', [yogurt]);
      await seed('b', 'receipt', receipt);
      const calls = renderOverview();
      await userEvent.click(within(cards()[1]).getByTestId('card-result'));
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save 2 items' }),
      );
      await waitFor(() =>
        expect(screen.getByTestId('review-overview')).toBeInTheDocument(),
      );
      expect(
        calls.filter((c) => c.key === 'POST /api/scan/receipt/confirm'),
      ).toHaveLength(1);
      expect(
        calls.filter((c) => c.key === 'POST /api/pantry/batches/bulk'),
      ).toHaveLength(0);
      expect(cards()).toHaveLength(1);
    });
  });

  describe('merging receipt cards', () => {
    it('offers Merge with previous only on a receipt card below another receipt card', async () => {
      await seed('a', 'receipt', receipt);
      await seed('b', 'receipt', [line('Jam')]);
      await seed('c', 'product', [yogurt]);
      renderOverview();
      const merge = /merge with previous/i;
      expect(
        within(cards()[0]).queryByRole('button', { name: merge }),
      ).toBeNull();
      expect(
        within(cards()[1]).getByRole('button', { name: merge }),
      ).toBeInTheDocument();
      expect(
        within(cards()[2]).queryByRole('button', { name: merge }),
      ).toBeNull();
    });

    it('does not offer it while a receipt is still reading', async () => {
      await seed('a', 'receipt', receipt);
      await seed('b', 'receipt', 'reading');
      renderOverview();
      expect(
        screen.queryByRole('button', { name: /merge with previous/i }),
      ).toBeNull();
    });

    it('joins the cards into one with the lines of both, and Split undoes it', async () => {
      await seed('a', 'receipt', receipt);
      await seed('b', 'receipt', [line('Jam')]);
      renderOverview();
      await userEvent.click(
        within(cards()[1]).getByRole('button', {
          name: /merge with previous/i,
        }),
      );
      expect(cards()).toHaveLength(1);
      expect(within(cards()[0]).getByTestId('card-result')).toHaveTextContent(
        '3 items',
      );
      await userEvent.click(
        within(cards()[0]).getByRole('button', { name: 'Split' }),
      );
      expect(cards()).toHaveLength(2);
      expect(within(cards()[0]).getByTestId('card-result')).toHaveTextContent(
        '2 items',
      );
      expect(within(cards()[1]).getByTestId('card-result')).toHaveTextContent(
        '1 item',
      );
    });

    it('confirms a merged receipt as one Receipt Scan', async () => {
      await seed('a', 'receipt', receipt);
      await seed('b', 'receipt', [line('Jam')]);
      const calls = renderOverview();
      await userEvent.click(
        within(cards()[1]).getByRole('button', {
          name: /merge with previous/i,
        }),
      );
      await userEvent.click(within(cards()[0]).getByTestId('card-result'));
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save 3 items' }),
      );
      // It was the only card, so saving it lands on the Pantry.
      expect(await screen.findByText('pantry screen')).toBeInTheDocument();
      const confirms = calls.filter(
        (c) => c.key === 'POST /api/scan/receipt/confirm',
      );
      expect(confirms).toHaveLength(1);
      expect((confirms[0].body as { batches: unknown[] }).batches).toHaveLength(
        3,
      );
    });
  });
});
