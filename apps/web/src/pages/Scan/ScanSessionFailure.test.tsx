import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { scanViaGuide } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ReviewPage } from '../Review/ReviewPage';
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
}));

const flush = () => act(async () => {});

function renderScan(route: string) {
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
}

describe('Scan Session reads that fail', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('drops the Scan, says why, and lets the next one take its place', async () => {
    let requests = 0;
    let fail: () => void = () => {};
    vi.stubGlobal('fetch', () => {
      requests += 1;
      return requests === 1
        ? new Promise<Response>((resolve) => {
            fail = () =>
              resolve(
                Response.json(
                  { code: 'scan.cap_reached', params: { cap: 30 } },
                  { status: 429 },
                ),
              );
          })
        : new Promise<Response>(() => {});
    });
    renderScan('/scan?mode=product');
    for (let i = 0; i < 3; i += 1) {
      scanViaGuide();
      await flush();
    }
    expect(requests).toBe(2);
    await act(async () => fail());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You have used all 30 scans for today',
    );
    expect(screen.getAllByTestId('scan-thumbnail')).toHaveLength(2);
    expect(requests).toBe(3);
  });
});

describe('Review of a Scan that is not there', () => {
  it('goes back to the overview', () => {
    renderScan('/scan/review/gone');
    expect(screen.getByTestId('review-overview')).toBeInTheDocument();
  });
});
