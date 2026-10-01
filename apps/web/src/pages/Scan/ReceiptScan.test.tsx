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
const cropToReceiptAreaMock = vi.hoisted(() => vi.fn());
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
  cropToReceiptArea: (...args: unknown[]) => {
    cropToReceiptAreaMock(...args);
    return Promise.resolve('data:image/jpeg;base64,Z2FsbGVyeQ==');
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

  it('sends the cropped receipt photo to the Receipt endpoint and lands on Review with its lines', async () => {
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
    expect(screen.getByText(/20 cm above the receipt/)).toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(true);
  });

  it('shows no guide and a default camera in the other modes', () => {
    renderWithProviders(<ScanPage />, { route: '/scan?mode=product' });
    expect(screen.queryByTestId('receipt-guide')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/20 cm above the receipt/),
    ).not.toBeInTheDocument();
    expect(useCameraMock).toHaveBeenLastCalledWith(false);
  });

  describe('gallery photo crop step', () => {
    const uploadPhoto = async () => {
      await userEvent.upload(
        screen.getByTestId('gallery-input'),
        new File(['x'], 'receipt.jpg', { type: 'image/jpeg' }),
      );
    };

    beforeEach(() => {
      cropToReceiptAreaMock.mockClear();
      URL.createObjectURL = () => 'blob:photo';
      URL.revokeObjectURL = () => undefined;
    });

    it('shows the crop step, then sends the cropped photo and lands on Review', async () => {
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
      await uploadPhoto();
      expect(
        await screen.findByRole('dialog', { name: 'Crop receipt' }),
      ).toBeInTheDocument();
      expect(calls.map((c) => c.key)).not.toContain('POST /api/scan/receipt');
      await userEvent.click(
        screen.getByRole('button', { name: 'Rotate right' }),
      );
      await userEvent.click(screen.getByRole('button', { name: 'Use photo' }));
      expect(
        await screen.findByRole('region', { name: 'Eggs' }),
      ).toBeInTheDocument();
      expect(cropToReceiptAreaMock).toHaveBeenCalledWith(
        expect.any(File),
        { x: 10, y: 20, width: 300, height: 900 },
        90,
      );
      expect(
        calls.find((c) => c.key === 'POST /api/scan/receipt')?.body,
      ).toEqual({ receiptImage: 'data:image/jpeg;base64,Z2FsbGVyeQ==' });
    });

    it('sends nothing when the crop step is cancelled', async () => {
      const { fetchMock, calls } = stubApi({
        'GET /api/catalog/parents': () => Response.json({ parents: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
      await uploadPhoto();
      await userEvent.click(
        await screen.findByRole('button', { name: 'Cancel' }),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
      expect(calls.map((c) => c.key)).not.toContain('POST /api/scan/receipt');
    });

    it('skips the crop step in the other modes', async () => {
      const { fetchMock, calls } = stubApi({
        'GET /api/catalog/parents': () => Response.json({ parents: [] }),
        'POST /api/scan/product': () => Response.json({ lines: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<ScanPage />, { route: '/scan?mode=product' });
      await uploadPhoto();
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain('POST /api/scan/product'),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
