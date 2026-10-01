import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
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
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
}));

describe('Receipt Scan on the Scan screen', () => {
  beforeEach(() => clearReview());
  afterEach(() => vi.unstubAllGlobals());

  it('sends the receipt photo to the Receipt endpoint and lands on Review with its lines', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
      'POST /api/scan/receipt': () =>
        Response.json({
          lines: [
            {
              name: 'Eggs',
              match: null,
              matchConfidence: 0,
              unmatched: true,
              lowConfidence: false,
              quantity: 10,
              unit: 'pcs',
              expiryDate: null,
              productDescription: null,
            },
            {
              name: 'SACOSA',
              match: null,
              matchConfidence: 0,
              unmatched: true,
              lowConfidence: false,
              quantity: null,
              unit: null,
              expiryDate: null,
              productDescription: null,
              excluded: { reason: 'Carrier bag' },
            },
          ],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/scan/review" element={<ReviewPage />} />
      </Routes>,
      { route: '/scan?mode=receipt' },
    );
    expect(screen.getByRole('status')).not.toHaveTextContent(/coming soon/i);
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(
      await screen.findByRole('region', { name: 'Eggs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Carrier bag')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/scan/receipt')?.body).toEqual(
      { receiptImage: 'data:image/jpeg;base64,YQ==' },
    );
    expect(calls.map((c) => c.key)).not.toContain('POST /api/scan/product');
  });
});
