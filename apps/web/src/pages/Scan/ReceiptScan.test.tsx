import { screen } from '@testing-library/react';
import { openFirstScanCard, scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
import { findReviewRow } from '../../test/review';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
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
const cropToReceiptAreaMock = vi.hoisted(() => vi.fn());
/** When set, image preparation waits on it, so a test can change the screen mid-preparation. */
const gate = vi.hoisted(() => ({ current: null as Promise<void> | null }));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: async () => {
    await gate.current;
    return 'data:image/jpeg;base64,Y3JvcA==';
  },
  cropToReceiptArea: async (...args: unknown[]) => {
    cropToReceiptAreaMock(...args);
    await gate.current;
    return 'data:image/jpeg;base64,Z2FsbGVyeQ==';
  },
}));
// react-easy-crop measures real image and element sizes, which jsdom cannot do: report a fixed crop.
vi.mock('react-easy-crop', async () => {
  const { useEffect } = await import('react');
  return {
    default: ({
      onCropComplete,
    }: {
      onCropComplete: (
        area: unknown,
        pixels: { x: number; y: number; width: number; height: number },
      ) => void;
    }) => {
      useEffect(() => {
        onCropComplete({}, { x: 10, y: 20, width: 300, height: 900 });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- report once, like the real cropper on load
      }, []);
      return <div data-testid="cropper" />;
    },
  };
});

describe('Receipt Scan on the Scan screen', () => {
  beforeEach(() => {
    clearReview();
    useCameraMock.mockClear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the cropped receipt photo to the Receipt endpoint and reviews its lines on the Scan card', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
      'POST /api/scan/receipt': () =>
        Response.json({
          lines: [
            {
              name: 'Eggs',
              match: null,
              lowConfidence: false,
              quantity: 10,
              unit: 'pcs',
              expiryDate: null,
              productDescription: null,
            },
            {
              name: 'SACOSA',
              match: null,
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
        <Route path="/scan/review" element={<ReviewOverviewPage />} />
        <Route path="/scan/review/:scanId" element={<ReviewPage />} />
      </Routes>,
      { route: '/scan?mode=receipt' },
    );
    scanViaGuide();
    await openFirstScanCard();
    expect(await findReviewRow('Eggs')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Excluded · 1/ }));
    expect(screen.getByText('Not for the Pantry')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/scan/receipt')?.body).toEqual(
      { receiptImage: 'data:image/jpeg;base64,Y3JvcA==' },
    );
    expect(calls.map((c) => c.key)).not.toContain('POST /api/scan/product');
  });

  it('shows the guide with its instruction and asks the camera for high resolution', () => {
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
    expect(screen.getByText(/40 cm above the receipt/)).toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(true);
  });

  it('shows no receipt instruction and a default camera in the other modes', () => {
    renderWithProviders(<ScanPage />, { route: '/scan?mode=product' });
    expect(
      screen.queryByText(/40 cm above the receipt/),
    ).not.toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(false);
  });
});
