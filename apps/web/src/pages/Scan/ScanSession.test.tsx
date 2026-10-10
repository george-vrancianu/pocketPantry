import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import {
  dispatchScanSession,
  getScanSession,
  resetScanSession,
} from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { scanViaGuide } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ScanPage } from './ScanPage';

vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
  }),
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

const yogurt = {
  name: 'Greek yogurt',
  match: null,
  lowConfidence: false,
  quantity: 1,
  unit: 'pcs',
  expiryDate: null,
  sourceText: null,
  productDescription: null,
};

type Held = {
  key: string;
  search: string;
  body: unknown;
  respond: (lines?: unknown[]) => void;
};

/** Scan endpoints answer only when the test says so; every request is recorded in `held`. */
let held: Held[];
let calls: ReturnType<typeof stubApi>['calls'];
function renderScan(route = '/scan?mode=product') {
  held = [];
  const stub = stubApi({});
  calls = stub.calls;
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const key = `${init?.method ?? 'GET'} ${url.pathname}`;
    if (!key.startsWith('POST /api/scan/')) return stub.fetchMock(input, init);
    calls.push({
      key,
      search: url.search,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    });
    return new Promise<Response>((resolve) => {
      held.push({
        key,
        search: url.search,
        body: calls[calls.length - 1].body,
        respond: (lines = [yogurt]) => resolve(Response.json({ lines })),
      });
    });
  });
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
    </Routes>,
    { route },
  );
}

const thumbnails = () => screen.queryAllByTestId('scan-thumbnail');
const states = () => thumbnails().map((t) => t.getAttribute('data-state'));
const done = () => screen.getByRole('button', { name: /Done$/ });
const flush = () => act(async () => {});
const scanOnce = async () => {
  scanViaGuide();
  await flush();
};
const answer = async (index: number, lines?: unknown[]) => {
  await act(async () => held[index].respond(lines));
};

describe('Scan Session on the Scan screen', () => {
  beforeEach(() => {
    clearReview();
    resetScanSession();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('adds the Scan at once, shows a reading thumbnail and stays on the camera', async () => {
    renderScan();
    await scanOnce();
    expect(states()).toEqual(['reading']);
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
    expect(screen.queryByTestId('review-overview')).not.toBeInTheDocument();
  });

  it('sends the prepared image to the endpoint of the Scan Mode', async () => {
    renderScan();
    await scanOnce();
    expect(held).toHaveLength(1);
    expect(held[0].key).toBe('POST /api/scan/product');
    expect(held[0].body).toEqual({
      productImage: 'data:image/jpeg;base64,YQ==',
    });
  });

  it('marks the thumbnail read when the read comes back', async () => {
    renderScan();
    await scanOnce();
    await answer(0);
    expect(states()).toEqual(['read']);
  });

  it('keeps scanning while earlier Scans are still being read', async () => {
    renderScan();
    await scanOnce();
    await scanOnce();
    expect(states()).toEqual(['reading', 'reading']);
  });

  it('stacks thumbnails in capture order, oldest first', async () => {
    renderScan();
    await scanOnce();
    await scanOnce();
    await answer(1);
    expect(states()).toEqual(['reading', 'read']);
  });

  it('reads at most 2 Scans at once and starts the next when one finishes', async () => {
    renderScan();
    await scanOnce();
    await scanOnce();
    await scanOnce();
    expect(thumbnails()).toHaveLength(3);
    expect(held).toHaveLength(2);
    await answer(0);
    await waitFor(() => expect(held).toHaveLength(3));
    expect(states()).toEqual(['read', 'reading', 'reading']);
  });

  it('gives every Scan the mode and Scan Language it was taken in', async () => {
    renderScan('/scan?mode=product');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /Reading as/ }),
      'ro',
    );
    await scanOnce();
    await userEvent.click(
      within(screen.getByRole('radiogroup', { name: 'Scan mode' })).getByRole(
        'radio',
        { name: 'Ingredients' },
      ),
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /Reading as/ }),
      'da',
    );
    await scanOnce();
    expect(held.map((h) => h.key)).toEqual([
      'POST /api/scan/product',
      'POST /api/scan/ingredients',
    ]);
    expect(new URLSearchParams(held[0].search).get('scanLanguage')).toBe('ro');
    expect(new URLSearchParams(held[1].search).get('scanLanguage')).toBe('da');
    expect(thumbnails()).toHaveLength(2);
  });

  it('queues a single-photo Receipt Scan like the others', async () => {
    renderScan('/scan?mode=receipt');
    await scanOnce();
    expect(held.map((h) => h.key)).toEqual(['POST /api/scan/receipt']);
    expect(held[0].body).toEqual({
      receiptImage: 'data:image/jpeg;base64,Y3JvcA==',
    });
    expect(states()).toEqual(['reading']);
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
  });

  it('keeps the Scan Session when the mode changes', async () => {
    renderScan();
    await scanOnce();
    await userEvent.click(
      within(screen.getByRole('radiogroup', { name: 'Scan mode' })).getByRole(
        'radio',
        { name: 'Ingredients' },
      ),
    );
    expect(thumbnails()).toHaveLength(1);
  });

  it('keeps the title for screen readers but hides it visually', () => {
    renderScan();
    const title = screen.getByRole('heading', { level: 1 });
    const style = getComputedStyle(title);
    expect(style.position).toBe('absolute');
    expect(style.width).toBe('1px');
    expect(style.height).toBe('1px');
    expect(style.overflow).toBe('hidden');
  });

  it('does not start a third read when a reading Scan is removed but its request is still out', async () => {
    renderScan();
    await scanOnce();
    await scanOnce();
    await scanOnce();
    expect(held).toHaveLength(2);
    await act(async () =>
      dispatchScanSession({ type: 'remove', id: getScanSession().scans[0].id }),
    );
    await scanOnce();
    expect(held).toHaveLength(2);
    await answer(0);
    await waitFor(() => expect(held).toHaveLength(3));
  });

  describe('a read that fails', () => {
    const nothingFound = /We could not spot any ingredients/;

    it('is reported on the Scan screen the Member returns to', async () => {
      renderScan();
      await scanOnce();
      await userEvent.click(done());
      await userEvent.click(screen.getByRole('link', { name: 'Camera' }));
      await answer(0, []);
      expect(await screen.findByText(nothingFound)).toBeInTheDocument();
      expect(thumbnails()).toHaveLength(0);
    });

    it('is reported when the Member comes back after it failed', async () => {
      renderScan();
      await scanOnce();
      await userEvent.click(done());
      await answer(0, []);
      // An empty overview may send the Member back on its own.
      const camera = screen.queryByRole('link', { name: 'Camera' });
      if (camera) await userEvent.click(camera);
      expect(await screen.findByText(nothingFound)).toBeInTheDocument();
    });
  });

  describe('Done', () => {
    it('puts the count badge before the label', async () => {
      renderScan();
      await scanOnce();
      expect(done().firstElementChild).toBe(
        within(done()).getByTestId('done-count'),
      );
      expect(done().textContent).toMatch(/^1\s*Done/);
    });

    it('is disabled while the Scan Session is empty', () => {
      renderScan();
      expect(done()).toBeDisabled();
    });

    it('shows how many Scans there are, amber while any is reading', async () => {
      renderScan();
      await scanOnce();
      await scanOnce();
      const badge = within(done()).getByTestId('done-count');
      expect(badge).toHaveTextContent('2');
      expect(badge).toHaveAttribute('data-reading', 'true');
      await answer(0);
      expect(badge).toHaveAttribute('data-reading', 'true');
      await answer(1);
      expect(badge).toHaveTextContent('2');
      expect(badge).toHaveAttribute('data-reading', 'false');
    });

    it('opens the Review overview, even while a Scan is still reading', async () => {
      renderScan();
      await scanOnce();
      expect(done()).toBeEnabled();
      await userEvent.click(done());
      expect(screen.getByTestId('review-overview')).toBeInTheDocument();
      expect(screen.getAllByTestId('review-card')).toHaveLength(1);
    });
  });

  it('finishes a read that was in flight when the Member left for the overview', async () => {
    renderScan();
    await scanOnce();
    await userEvent.click(done());
    expect(screen.getByText('Reading photo…')).toBeInTheDocument();
    await answer(0);
    expect(screen.queryByText('Reading photo…')).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('review-card')).getByTestId('card-result'),
    ).toHaveTextContent('Greek yogurt');
  });
});
