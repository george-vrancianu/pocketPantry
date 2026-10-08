import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from '../Pantry/PantryPage';
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

function renderScan(routes: Record<string, () => Response>) {
  const { fetchMock, calls } = stubApi(routes);
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewPage />} />
    </Routes>,
    { route: '/scan' },
  );
  return calls;
}

describe('ScanPage', () => {
  beforeEach(() => {
    clearReview();
    camera.torchSupported = true;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('has the camera controls, with Product selected among all four mode pills', () => {
    renderScan({});
    const modes = screen.getByRole('group', { name: 'Scan mode' });
    expect(
      Array.from(modes.querySelectorAll('button')).map((b) => b.textContent),
    ).toEqual(['Product', 'Receipt', 'Plate', 'Ingredients']);
    expect(screen.getByRole('button', { name: 'Product' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const name of [
      'Close scanner',
      'Toggle flash',
      'Choose from photos',
      'Take photo',
      'Add manually',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('disables the flash toggle when the camera has no torch', () => {
    camera.torchSupported = false;
    renderScan({});
    expect(screen.getByRole('button', { name: 'Toggle flash' })).toBeDisabled();
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
      { route: '/scan' },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add manually' }));
    expect(
      await screen.findByRole('form', { name: 'Add to pantry' }),
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
    await userEvent.click(screen.getByRole('button', { name: 'Receipt' }));
    await waitFor(() => expect(flash).toHaveAttribute('aria-pressed', 'false'));
  });

  it.each(['Product', 'Receipt', 'Plate', 'Ingredients'])(
    'has %s wired: no coming-soon notice and the shutter works',
    async (mode) => {
      renderScan({});
      await userEvent.click(screen.getByRole('button', { name: mode }));
      expect(screen.getByRole('button', { name: mode })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('status')).not.toHaveTextContent(/coming soon/i);
      expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
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
    expect(
      await screen.findByRole('region', { name: 'Parmesan' }),
    ).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/scan/product')?.body).toEqual(
      { productImage: IMAGE },
    );
    expect(screen.getByLabelText('Expiry date')).toHaveValue('2026-12-24');
  });

  it('turns a camera shot into a proposed line on the Review screen', async () => {
    renderScan({
      'POST /api/scan/product': () => Response.json({ lines: [proposed] }),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(
      await screen.findByRole('region', { name: 'Parmesan' }),
    ).toBeInTheDocument();
  });

  it('shows a localised message when the Scan Cap is reached', async () => {
    renderScan({
      'POST /api/scan/product': () =>
        Response.json(
          { code: 'scan.cap_reached', params: { cap: 30 } },
          { status: 429 },
        ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You have used all 30 scans for today',
    );
    // Still on the Scan screen.
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });

  it('shows the localised message for a rejected image', async () => {
    renderScan({
      'POST /api/scan/product': () =>
        Response.json(
          { code: 'scan.image_too_large', params: {} },
          { status: 413 },
        ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('too large'),
    );
  });

  it('disables the scan line animation for reduced motion', () => {
    renderScan({});
    const line = screen.getByTestId('scan-line');
    const rules = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const className = Array.from(line.classList).find((c) =>
      rules.includes(`.${c}`),
    );
    expect(className).toBeDefined();
    expect(rules).toContain(
      `@media (prefers-reduced-motion: reduce){.${className}{-webkit-animation:none;animation:none;}}`,
    );
  });
});
