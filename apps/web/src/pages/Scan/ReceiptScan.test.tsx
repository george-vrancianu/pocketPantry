import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

const useCameraMock = vi.hoisted(() => vi.fn());
vi.mock('../../lib/camera', () => ({
  useCamera: (highResolution?: boolean) => {
    useCameraMock(highResolution);
    return {
      videoRef: { current: null },
      status: 'ready',
      torchSupported: true,
      capture: () =>
        Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
      setTorch: () => Promise.resolve(true),
    };
  },
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

describe('Receipt Scan on the Scan screen', () => {
  beforeEach(() => {
    clearReview();
    useCameraMock.mockClear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the cropped receipt photo to the Receipt endpoint and, on Finish, lands on Review with its lines', async () => {
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
              excluded: { reason: 'other' },
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Finish' }),
    );
    expect(
      await screen.findByRole('region', { name: 'Eggs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Not a pantry item')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/scan/receipt')?.body).toEqual(
      { receiptImage: 'data:image/jpeg;base64,Y3JvcA==' },
    );
    expect(calls.map((c) => c.key)).not.toContain('POST /api/scan/product');
  });

  it('shows the 1:3 guide with its instruction and asks the camera for high resolution', () => {
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    expect(screen.getByTestId('receipt-guide')).toBeInTheDocument();
    expect(screen.getByText(/40 cm above the receipt/)).toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(true);
  });

  it('shows no guide and a default camera in the other modes', () => {
    renderWithProviders(<ScanPage />, { route: '/scan?mode=product' });
    expect(screen.queryByTestId('receipt-guide')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/40 cm above the receipt/),
    ).not.toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(false);
  });

  it('sends a gallery photo in receipt mode resized, not cropped', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
      'POST /api/scan/receipt': () => Response.json({ lines: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    await userEvent.upload(
      screen.getByTestId('gallery-input'),
      new File(['x'], 'receipt.jpg', { type: 'image/jpeg' }),
    );
    await vi.waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/scan/receipt')?.body,
      ).toEqual({ receiptImage: 'data:image/jpeg;base64,YQ==' }),
    );
  });
});
