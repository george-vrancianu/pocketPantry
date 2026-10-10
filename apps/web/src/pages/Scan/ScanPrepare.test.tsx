import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetReads } from '../../lib/scanReads';
import { getScanSession, resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { scanViaGuide } from '../../test/scan';
import { ScanPage } from './ScanPage';

const prep = vi.hoisted(() => ({ release: () => {} }));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: false,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(false),
  }),
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  cropToReceiptGuide: () =>
    new Promise<string>((resolve) => {
      prep.release = () => resolve('data:image/jpeg;base64,Y3JvcA==');
    }),
}));

function renderScan() {
  const { fetchMock, calls } = stubApi({
    'POST /api/scan/receipt': () => Response.json({ lines: [] }),
    'POST /api/scan/product': () => Response.json({ lines: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  const view = renderWithProviders(
    <Routes>
      <Route
        path="/scan"
        element={
          <>
            <Link to="/scan?mode=product">to product</Link>
            <ScanPage />
          </>
        }
      />
    </Routes>,
    { route: '/scan?mode=receipt' },
  );
  return { calls, view };
}

const release = () => act(async () => prep.release());

describe('a camera receipt photo being prepared', () => {
  beforeEach(() => {
    resetReads();
    resetScanSession();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the Scan Mode buttons disabled until it is ready', async () => {
    renderScan();
    scanViaGuide();
    await act(async () => {});
    expect(screen.getByRole('radio', { name: 'Product' })).toBeDisabled();
    await release();
    expect(screen.getByRole('radio', { name: 'Product' })).toBeEnabled();
  });

  it('is discarded when the Dock Scan item switches the mode before it is ready', async () => {
    const { calls } = renderScan();
    scanViaGuide();
    await act(async () => {});
    await userEvent.click(screen.getByRole('link', { name: 'to product' }));
    await release();
    expect(calls.filter((c) => c.key.startsWith('POST /api/scan/'))).toEqual(
      [],
    );
    expect(getScanSession().scans).toHaveLength(0);
  });

  it('is discarded when the screen is left before it is ready', async () => {
    const { calls, view } = renderScan();
    scanViaGuide();
    await act(async () => {});
    view.unmount();
    await release();
    expect(calls.filter((c) => c.key.startsWith('POST /api/scan/'))).toEqual(
      [],
    );
    expect(getScanSession().scans).toHaveLength(0);
  });
});
