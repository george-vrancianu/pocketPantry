import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { dispatchScanSession, resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { scanViaGuide } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

let prepareFails = false;
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
  resizeImage: () =>
    prepareFails
      ? Promise.reject(new Error('unreadable'))
      : Promise.resolve('data:image/jpeg;base64,YQ=='),
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

type Outcome =
  | 'ok'
  | 'network'
  | 'server'
  | 'cap'
  | 'empty'
  | 'tooMany'
  | 'tooLarge'
  | 'hold';

/** What the Nth scan request (1-based) does. */
let outcome: (n: number) => Outcome;
let bodies: unknown[];

function renderScan(route = '/scan?mode=product') {
  bodies = [];
  const stub = stubApi({});
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    if (!url.pathname.startsWith('/api/scan/product'))
      return stub.fetchMock(input, init);
    bodies.push(typeof init?.body === 'string' ? JSON.parse(init.body) : null);
    switch (outcome(bodies.length)) {
      case 'network':
        return Promise.reject(new TypeError('Failed to fetch'));
      case 'server':
        return Promise.resolve(
          Response.json({ code: 'unknown' }, { status: 500 }),
        );
      case 'cap':
        return Promise.resolve(
          Response.json(
            { code: 'scan.cap_reached', params: { cap: 30 } },
            { status: 429 },
          ),
        );
      case 'tooMany':
        return Promise.resolve(
          Response.json(
            { code: 'scan.too_many_items', params: { max: 50 } },
            { status: 400 },
          ),
        );
      case 'tooLarge':
        return Promise.resolve(
          Response.json({ code: 'scan.image_too_large' }, { status: 413 }),
        );
      case 'hold':
        return new Promise<Response>(() => {});
      case 'empty':
        return Promise.resolve(Response.json({ lines: [] }));
      case 'ok':
        return Promise.resolve(Response.json({ lines: [yogurt] }));
    }
  });
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
}

const thumbnails = () => screen.queryAllByTestId('scan-thumbnail');
const states = () => thumbnails().map((t) => t.getAttribute('data-state'));
const flush = () => act(async () => {});
const scanOnce = async () => {
  scanViaGuide();
  await flush();
};

describe('Scan Session reads that fail', () => {
  beforeEach(() => {
    clearReview();
    resetScanSession();
    localStorage.clear();
    prepareFails = false;
  });
  afterEach(() => vi.unstubAllGlobals());

  describe('network errors', () => {
    it('are retried once, automatically, before the Scan counts as failed', async () => {
      outcome = (n) => (n === 1 ? 'network' : 'ok');
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['read']));
      expect(bodies).toHaveLength(2);
      expect(bodies[1]).toEqual(bodies[0]);
    });

    it('show the failed state when the retry fails too, and stop there', async () => {
      outcome = () => 'network';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      await flush();
      expect(bodies).toHaveLength(2);
    });
  });

  describe('other failures', () => {
    it('are not retried by themselves', async () => {
      outcome = () => 'server';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      await flush();
      expect(bodies).toHaveLength(1);
    });

    it('include a photo with nothing in it', async () => {
      outcome = () => 'empty';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      expect(bodies).toHaveLength(1);
      expect(thumbnails()[0]).toHaveAccessibleName(
        /We could not spot any ingredients/,
      );
      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
    });

    it.each([
      ['tooMany', /more than 50 items/],
      ['tooLarge', /That photo is too large/],
    ] as const)(
      'with a reason that cannot change (%s) say why and offer no retry',
      async (kind, reason) => {
        outcome = () => kind;
        renderScan();
        await scanOnce();
        await waitFor(() => expect(states()).toEqual(['failed']));
        expect(thumbnails()[0]).toHaveAccessibleName(reason);
        expect(
          screen.queryByRole('button', { name: /retry/i }),
        ).not.toBeInTheDocument();
        expect(bodies).toHaveLength(1);
      },
    );

    it('announce themselves politely', async () => {
      outcome = () => 'server';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      expect(
        screen
          .getAllByRole('status')
          .some((el) => /could not read photo/i.test(el.textContent ?? '')),
      ).toBe(true);
    });

    it('keep the failed thumbnail in place and do not raise an alert', async () => {
      outcome = (n) => (n === 1 ? 'server' : 'ok');
      renderScan();
      await scanOnce();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed', 'read']));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('a failed thumbnail', () => {
    it('is read again with the same image when tapped', async () => {
      outcome = (n) => (n === 1 ? 'server' : 'ok');
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      await userEvent.click(
        within(thumbnails()[0]).getByRole('button', { name: /retry/i }),
      );
      await waitFor(() => expect(states()).toEqual(['read']));
      expect(bodies).toHaveLength(2);
      expect(bodies[1]).toEqual(bodies[0]);
    });

    it('can fail again and be tapped again', async () => {
      outcome = (n) => (n < 3 ? 'server' : 'ok');
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      const retry = () =>
        userEvent.click(
          within(thumbnails()[0]).getByRole('button', { name: /retry/i }),
        );
      await retry();
      await waitFor(() => expect(bodies).toHaveLength(2));
      await waitFor(() => expect(states()).toEqual(['failed']));
      await retry();
      await waitFor(() => expect(states()).toEqual(['read']));
      expect(bodies).toHaveLength(3);
    });

    it('waits for a free read slot when 2 reads are running', async () => {
      outcome = (n) => (n === 1 ? 'server' : 'hold');
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      await scanOnce();
      await scanOnce();
      await waitFor(() => expect(bodies).toHaveLength(3));
      await userEvent.click(
        within(thumbnails()[0]).getByRole('button', { name: /retry/i }),
      );
      await flush();
      expect(bodies).toHaveLength(3);
    });

    it('is not offered on Scans that are reading or read', async () => {
      outcome = () => 'ok';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['read']));
      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('the Scan Cap', () => {
    it('fails the Scan, says the daily limit is reached and stops scanning', async () => {
      outcome = () => 'cap';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      expect(screen.getByText('Daily scan limit reached')).toBeInTheDocument();
      // Not retried by itself: the cap is not a network error.
      expect(bodies).toHaveLength(1);
      await scanOnce();
      await flush();
      expect(thumbnails()).toHaveLength(1);
      expect(bodies).toHaveLength(1);
    });

    it('starts scanning again once the capped Scan is removed in Review', async () => {
      outcome = (n) => (n === 1 ? 'cap' : 'ok');
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      await userEvent.click(screen.getByRole('button', { name: /^Done/ }));
      await userEvent.click(
        within(await screen.findByTestId('review-card')).getByRole('button', {
          name: 'Remove photo',
        }),
      );
      await userEvent.click(screen.getByRole('link', { name: 'Camera' }));
      expect(
        screen.queryByText('Daily scan limit reached'),
      ).not.toBeInTheDocument();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['read']));
    });

    it('does not show the limit message for other failures', async () => {
      outcome = () => 'server';
      renderScan();
      await scanOnce();
      await waitFor(() => expect(states()).toEqual(['failed']));
      expect(
        screen.queryByText('Daily scan limit reached'),
      ).not.toBeInTheDocument();
    });
  });

  describe('a Scan that cannot be enqueued', () => {
    it('shows a toast and adds no thumbnail', async () => {
      outcome = () => 'ok';
      prepareFails = true;
      renderScan();
      await scanOnce();
      expect(
        await screen.findByText(/could not be added/i),
      ).toBeInTheDocument();
      expect(thumbnails()).toHaveLength(0);
      expect(bodies).toHaveLength(0);
    });
  });

  describe('Review', () => {
    const seedFailed = (id = 'x', code?: string, params = {}) =>
      act(() => {
        dispatchScanSession({
          type: 'enqueue',
          scan: {
            id,
            mode: 'product',
            scanLanguage: 'en',
            image: 'data:image/jpeg;base64,YQ==',
            thumbnail: 'data:image/jpeg;base64,YQ==',
          },
        });
        dispatchScanSession({ type: 'start' });
        dispatchScanSession({
          type: 'fail',
          id,
          reason: 'error',
          code,
          params,
        });
      });

    it('shows a failed Scan as a card that says to retake, with a remove button', async () => {
      outcome = () => 'ok';
      renderScan('/scan/review');
      seedFailed();
      const card = await screen.findByTestId('review-card');
      expect(card).toHaveTextContent("Couldn't read, retake");
      expect(within(card).queryByTestId('card-result')).not.toBeInTheDocument();
      expect(within(card).queryByRole('status')).not.toBeInTheDocument();
      await userEvent.click(
        within(card).getByRole('button', { name: 'Remove photo' }),
      );
      expect(screen.queryByTestId('review-card')).not.toBeInTheDocument();
    });

    it('says why a Scan could not be read, when the reason is known', async () => {
      outcome = () => 'ok';
      renderScan('/scan/review');
      seedFailed('x', 'scan.too_many_items', { max: 50 });
      const card = await screen.findByTestId('review-card');
      expect(card).toHaveTextContent("Couldn't read, retake");
      expect(card).toHaveTextContent(/more than 50 items/);
    });

    it('does not count a failed Scan as still reading', async () => {
      outcome = () => 'ok';
      renderScan('/scan/review');
      seedFailed();
      await screen.findByTestId('review-card');
      expect(screen.getByTestId('review-overview')).not.toHaveTextContent(
        'still reading',
      );
    });
  });

  describe('a Review of a Scan that is not there', () => {
    it('goes back to the overview', () => {
      outcome = () => 'ok';
      renderScan('/scan/review/gone');
      expect(screen.getByTestId('review-overview')).toBeInTheDocument();
    });
  });
});
