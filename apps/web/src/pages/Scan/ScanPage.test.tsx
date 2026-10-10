import { screen, waitFor } from '@testing-library/react';
import { scanGuide, openFirstScanCard, scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { findReviewRow } from '../../test/review';
import { PantryPage } from '../Pantry/PantryPage';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

const IMAGE = 'data:image/jpeg;base64,YQ==';

// jsdom has no camera or canvas: the camera and the resizer are the seams.
const camera = vi.hoisted(() => ({ torchSupported: true }));
vi.mock('../../lib/camera', async () => {
  const { useEffect, useState } = await import('react');
  return {
    // Like the real hook, restarts (status 'starting', then 'ready') when the resolution flips.
    useCamera: (highResolution: boolean) => {
      const [status, setStatus] = useState('ready');
      useEffect(() => {
        setStatus('starting');
        const timer = setTimeout(() => setStatus('ready'), 0);
        return () => clearTimeout(timer);
      }, [highResolution]);
      return {
        videoRef: { current: null },
        status,
        torchSupported: camera.torchSupported,
        capture: () =>
          Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
        setTorch: () => Promise.resolve(true),
      };
    },
  };
});
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
}));

/** The camera restarts when the mode changes: wait until the guide takes Scans again. */
const shoot = async () => {
  await waitFor(() => expect(scanGuide()).not.toHaveAttribute('aria-disabled'));
  scanViaGuide();
};

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hard', name: 'Hard cheese' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 60, location: 'fridge' },
};

const proposed: ProposedLine = {
  name: 'Grana Padano',
  match: parmesan,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: '2026-12-24',
  sourceText: 'GRANA PAD 200G',
  productDescription: 'Grana Padano 200g',
};

function renderScan(
  routes: Record<string, () => Response>,
  route = '/scan?mode=product',
) {
  const { fetchMock, calls } = stubApi(routes);
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
  return calls;
}

describe('ScanPage', () => {
  beforeEach(() => {
    clearReview();
    camera.torchSupported = true;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('has the camera controls, with Receipt selected among all four modes', () => {
    renderScan({}, '/scan');
    expect(
      screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label')),
    ).toEqual(['Receipt', 'Product', 'Ingredients', 'Plate']);
    expect(screen.getByRole('radio', { name: 'Receipt' })).toBeChecked();
    for (const name of [
      'Close scanner',
      'Toggle flash',
      'Choose from photos',
      'Add manually',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('hides the flash toggle when the camera has no torch', () => {
    camera.torchSupported = false;
    renderScan({});
    expect(
      screen.queryByRole('button', { name: 'Toggle flash' }),
    ).not.toBeInTheDocument();
  });

  it('opens manual entry on the Pantry from the manual-add button', async () => {
    const { fetchMock } = stubApi({
      'GET /api/pantry': () => Response.json({ batches: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/pantry" element={<PantryPage />} />
      </Routes>,
      { route: '/scan?mode=product' },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add manually' }));
    expect(
      await screen.findByRole('form', { name: 'Add to Pantry' }),
    ).toBeInTheDocument();
  });

  it('toggles the flash', async () => {
    renderScan({});
    const flash = screen.getByRole('button', { name: 'Toggle flash' });
    expect(flash).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(flash);
    expect(flash).toHaveAttribute('aria-pressed', 'true');
  });

  it('turns the flash off when switching into Receipt mode restarts the camera', async () => {
    renderScan({});
    const flash = screen.getByRole('button', { name: 'Toggle flash' });
    await userEvent.click(flash);
    expect(flash).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('radio', { name: 'Receipt' }));
    await waitFor(() => expect(flash).toHaveAttribute('aria-pressed', 'false'));
  });

  it.each(['Product', 'Receipt', 'Plate', 'Ingredients'])(
    'enables the shutter in %s mode',
    async (mode) => {
      renderScan({});
      await userEvent.click(screen.getByRole('radio', { name: mode }));
      expect(screen.getByRole('radio', { name: mode })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(scanGuide()).not.toHaveAttribute('aria-disabled');
      expect(
        screen.getByRole('button', { name: 'Choose from photos' }),
      ).toBeEnabled();
    },
  );

  it('turns a gallery photo into a proposed line on the Review screen', async () => {
    const calls = renderScan({
      'POST /api/scan/product': () => Response.json({ lines: [proposed] }),
    });
    await userEvent.upload(
      screen.getByTestId('gallery-input'),
      new File(['x'], 'cheese.jpg', { type: 'image/jpeg' }),
    );
    expect(await findReviewRow('Parmesan')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/scan/product')?.body).toEqual(
      { productImage: IMAGE },
    );
    await userEvent.click(await findReviewRow('Parmesan'));
    expect(screen.getByLabelText('Expiry date')).toHaveValue('24.12.2026');
  });

  it('turns a camera shot into a proposed line on the Review screen', async () => {
    renderScan({
      'POST /api/scan/product': () => Response.json({ lines: [proposed] }),
    });
    await shoot();
    await openFirstScanCard();
    expect(await findReviewRow('Parmesan')).toBeInTheDocument();
  });

  it('shows the daily limit and stops scanning when the Scan Cap is reached', async () => {
    renderScan({
      'POST /api/scan/product': () =>
        Response.json(
          { code: 'scan.cap_reached', params: { cap: 30 } },
          { status: 429 },
        ),
    });
    await shoot();
    expect(
      await screen.findByText('Daily scan limit reached'),
    ).toBeInTheDocument();
    expect(scanGuide()).toHaveAttribute('aria-disabled', 'true');
  });

  it('fails the Scan for a rejected image', async () => {
    renderScan({
      'POST /api/scan/product': () =>
        Response.json(
          { code: 'scan.image_too_large', params: {} },
          { status: 413 },
        ),
    });
    await shoot();
    expect(await screen.findByTestId('scan-thumbnail')).toHaveAccessibleName(
      /too large/,
    );
    expect(
      screen.queryByRole('button', { name: /retry/i }),
    ).not.toBeInTheDocument();
  });
});
