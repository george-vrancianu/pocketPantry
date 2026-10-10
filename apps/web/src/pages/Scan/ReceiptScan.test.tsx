import { fireEvent, screen, waitFor } from '@testing-library/react';
import { openFirstScanCard, scanGuide, scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { AppDock } from '../../components/AppDock';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
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

// The Dock links to plain /scan, which opens the last-used Scan Mode.
const switchLastUsedToProduct = () =>
  localStorage.setItem('pocket-pantry.scan-mode', 'product');

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

  describe('gallery photo crop step', () => {
    const eggs = {
      name: 'Eggs',
      match: null,
      lowConfidence: false,
      quantity: 10,
      unit: 'pcs',
      expiryDate: null,
      productDescription: null,
    };
    const uploadPhoto = async () => {
      await userEvent.upload(
        screen.getByTestId('gallery-input'),
        new File(['x'], 'receipt.jpg', { type: 'image/jpeg' }),
      );
    };
    const cropDialog = () =>
      screen.findByRole('dialog', { name: 'Crop receipt' });
    const takeSection = async () => {
      await uploadPhoto();
      await cropDialog();
      await click('Use photo');
    };
    const click = (name: string) =>
      userEvent.click(screen.getByRole('button', { name }));
    const renderScan = (
      responses: Array<{ lines: unknown[] }> = [{ lines: [eggs] }],
    ) => {
      return renderScreen(responses);
    };
    const renderScreen = (
      responses: Array<{ lines: unknown[] }> = [{ lines: [eggs] }],
      withDock = false,
    ) => {
      const queue = [...responses];
      const { fetchMock, calls } = stubApi({
        'GET /api/catalog/parents': () => Response.json({ parents: [] }),
        'POST /api/scan/receipt': () =>
          Response.json(queue.shift() ?? { lines: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);
      const view = renderWithProviders(
        <>
          <Routes>
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/scan/review/draft" element={<ReviewPage />} />
          </Routes>
          {withDock ? <AppDock variant="dark" activeKey="scan" /> : null}
        </>,
        { route: '/scan?mode=receipt' },
      );
      return { calls, view };
    };
    const holdPreparation = () => {
      let release: () => void = () => undefined;
      gate.current = new Promise<void>((resolve) => (release = resolve));
      return async () => {
        release();
        gate.current = null;
        await new Promise((r) => setTimeout(r, 20));
      };
    };
    const receiptCalls = (calls: Array<{ key: string; body?: unknown }>) =>
      calls.filter((c) => c.key === 'POST /api/scan/receipt');
    let createObjectURL: MockInstance<typeof URL.createObjectURL>;
    let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

    beforeEach(() => {
      cropToReceiptAreaMock.mockClear();
      gate.current = null;
      createObjectURL = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:photo');
      revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
    });
    afterEach(() => vi.restoreAllMocks());

    it('shows the crop step, then the cropped photo is read as a Receipt Scan of the Scan Session', async () => {
      const { calls } = renderScan();
      await uploadPhoto();
      expect(await cropDialog()).toBeInTheDocument();
      expect(receiptCalls(calls)).toHaveLength(0);
      await click('Rotate right');
      await click('Use photo');
      await waitFor(() => expect(receiptCalls(calls)).toHaveLength(1));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(cropToReceiptAreaMock).toHaveBeenCalledWith(
        expect.any(File),
        { x: 10, y: 20, width: 300, height: 900 },
        90,
      );
      expect(receiptCalls(calls)[0].body).toEqual({
        receiptImage: 'data:image/jpeg;base64,Z2FsbGVyeQ==',
      });
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:photo');
    });

    it('closes the crop step and revokes the photo URL when the Scan Mode changes', async () => {
      renderScan();
      await uploadPhoto();
      await cropDialog();
      expect(createObjectURL).toHaveBeenCalled();
      await userEvent.click(screen.getByRole('radio', { name: 'Product' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:photo');
    });

    it('closes the crop step on Escape, sends nothing, and gives focus back to the gallery button', async () => {
      const { calls } = renderScan();
      const galleryButton = screen.getByRole('button', {
        name: 'Choose from photos',
      });
      galleryButton.focus();
      // userEvent.upload would focus the hidden input itself, which a real pick does not.
      fireEvent.change(screen.getByTestId('gallery-input'), {
        target: {
          files: [new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })],
        },
      });
      const dialog = await cropDialog();
      expect(dialog).toHaveFocus();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(galleryButton).toHaveFocus();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:photo');
      expect(receiptCalls(calls)).toHaveLength(0);
      expect(scanGuide()).not.toHaveAttribute('aria-disabled');
    });

    it('sends nothing when the crop step is cancelled', async () => {
      const { calls } = renderScan();
      await uploadPhoto();
      await cropDialog();
      await click('Cancel');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(receiptCalls(calls)).toHaveLength(0);
    });

    it('does not send a gallery photo whose crop finishes after the Dock Scan item switched to Product', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      const { calls } = renderScreen([{ lines: [eggs] }], true);
      await uploadPhoto();
      await cropDialog();
      const release = holdPreparation();
      await click('Use photo');
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      expect(screen.getByRole('radio', { name: 'Product' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await release();
      expect(receiptCalls(calls)).toHaveLength(0);
      await userEvent.click(screen.getByRole('radio', { name: 'Receipt' }));
      expect(confirm).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('group', { name: 'Section 1' }),
      ).not.toBeInTheDocument();
    });

    it('does not send a camera frame whose crop finishes after the Dock Scan item switched to Product', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      const { calls } = renderScreen([{ lines: [eggs] }], true);
      const release = holdPreparation();
      await takeSection();
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      await release();
      expect(receiptCalls(calls)).toHaveLength(0);
      await userEvent.click(screen.getByRole('radio', { name: 'Receipt' }));
      expect(confirm).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('group', { name: 'Section 1' }),
      ).not.toBeInTheDocument();
    });

    it('does not send a photo whose crop finishes after the screen was left', async () => {
      const { calls, view } = renderScreen();
      await uploadPhoto();
      await cropDialog();
      const release = holdPreparation();
      await click('Use photo');
      view.unmount();
      await release();
      expect(receiptCalls(calls)).toHaveLength(0);
    });

    it('keeps the Scan Mode buttons disabled while a photo is being prepared', async () => {
      renderScan();
      await uploadPhoto();
      await cropDialog();
      const release = holdPreparation();
      await click('Use photo');
      expect(screen.getByRole('radio', { name: 'Product' })).toBeDisabled();
      await release();
    });

    it('closes the crop step when the Dock Scan item changes the mode through the URL', async () => {
      renderScreen([{ lines: [eggs] }], true);
      await uploadPhoto();
      await cropDialog();
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps Tab focus inside the crop step', async () => {
      renderScan();
      await uploadPhoto();
      await cropDialog();
      const confirm = screen.getByRole('button', { name: 'Use photo' });
      await vi.waitFor(() => expect(confirm).toBeEnabled());
      confirm.focus();
      await userEvent.tab();
      expect(screen.getByRole('slider')).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(confirm).toHaveFocus();
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
