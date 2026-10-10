import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { resetReads } from '../../lib/scanReads';
import { resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ScanPage } from './ScanPage';

const camera = vi.hoisted(() => ({ status: 'ready' as string }));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: camera.status,
    torchSupported: false,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(false),
  }),
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
  cropToReceiptArea: () =>
    Promise.resolve('data:image/jpeg;base64,Z2FsbGVyeQ=='),
}));
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

type Held = { key: string; body: unknown; respond: () => void };
let held: Held[];
let calls: ReturnType<typeof stubApi>['calls'];

/** Scan endpoints answer only when the test says so; every request is recorded in `held`. */
function renderScan(route = '/scan?mode=product') {
  held = [];
  const stub = stubApi({});
  calls = stub.calls;
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const key = `${init?.method ?? 'GET'} ${url.pathname}`;
    if (!key.startsWith('POST /api/scan/')) return stub.fetchMock(input, init);
    const body =
      typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    calls.push({ key, search: url.search, body });
    return new Promise<Response>((resolve) => {
      held.push({
        key,
        body,
        respond: () => resolve(Response.json({ lines: [yogurt] })),
      });
    });
  });
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
    </Routes>,
    { route },
  );
}

const files = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => new File(['x'], `photo${i}.jpg`, { type: 'image/jpeg' }),
  );
const pick = async (count = 1) => {
  await act(async () => {
    fireEvent.change(screen.getByTestId('gallery-input'), {
      target: { files: files(count) },
    });
  });
};
const thumbnails = () => screen.queryAllByTestId('scan-thumbnail');
const states = () => thumbnails().map((t) => t.getAttribute('data-state'));
const done = () => screen.getByRole('button', { name: /^Done/ });

describe('Gallery import into the Scan Session', () => {
  beforeEach(() => {
    clearReview();
    resetReads();
    resetScanSession();
    localStorage.clear();
    camera.status = 'ready';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('adds a picked file as a thumbnail and reads it in the background, staying on the camera', async () => {
    renderScan();
    await pick();
    expect(states()).toEqual(['reading']);
    expect(held.map((h) => h.key)).toEqual(['POST /api/scan/product']);
    expect(held[0].body).toEqual({
      productImage: 'data:image/jpeg;base64,YQ==',
    });
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
    expect(screen.queryByTestId('review-overview')).not.toBeInTheDocument();
  });

  it('marks the thumbnail read when the read comes back', async () => {
    renderScan();
    await pick();
    await act(async () => held[0].respond());
    expect(states()).toEqual(['read']);
  });

  it('adds every picked file, in every Scan Mode, as its own Scan', async () => {
    renderScan('/scan?mode=ingredients');
    expect(screen.getByTestId('gallery-input')).toHaveAttribute('multiple');
    await pick(3);
    expect(thumbnails()).toHaveLength(3);
    expect(held.map((h) => h.key)).toEqual([
      'POST /api/scan/ingredients',
      'POST /api/scan/ingredients',
    ]);
    expect(done()).toHaveAccessibleName('Done, 3 photos');
  });

  it('joins the same Scan Session as frames taken with the camera', async () => {
    renderScan();
    await pick();
    expect(thumbnails()).toHaveLength(1);
    expect(done()).toHaveAccessibleName('Done, 1 photo');
  });

  it('still works when the camera is not available', async () => {
    camera.status = 'unavailable';
    renderScan();
    expect(screen.getByText(/The camera is not available/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Choose from photos' }),
    ).toBeEnabled();
    await pick();
    expect(states()).toEqual(['reading']);
    expect(held).toHaveLength(1);
  });

  describe('a receipt from the gallery', () => {
    const cropButton = () => screen.getByRole('button', { name: /^Crop/ });

    it('is not cropped or read on the Scan screen', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(held).toHaveLength(0);
      expect(thumbnails()).toHaveLength(1);
    });

    it('is cropped from its card in Review, then read', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      await userEvent.click(done());
      const card = within(screen.getByTestId('review-card'));
      expect(held).toHaveLength(0);
      await userEvent.click(card.getByRole('button', { name: /^Crop/ }));
      expect(
        await screen.findByRole('dialog', { name: 'Crop receipt' }),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Use photo' }));
      await waitFor(() => expect(held).toHaveLength(1));
      expect(held[0].key).toBe('POST /api/scan/receipt');
      expect(held[0].body).toEqual({
        receiptImage: 'data:image/jpeg;base64,Z2FsbGVyeQ==',
      });
      await act(async () => held[0].respond());
      expect(await screen.findByTestId('review-overview')).toBeInTheDocument();
      expect(
        within(await screen.findByTestId('review-card')).getByTestId(
          'card-chip',
        ),
      ).toHaveTextContent('Greek yogurt');
    });

    it('stays uncropped and unread when the crop is cancelled', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      await userEvent.click(done());
      await userEvent.click(cropButton());
      await userEvent.click(
        await screen.findByRole('button', { name: 'Cancel' }),
      );
      expect(held).toHaveLength(0);
      expect(screen.getAllByTestId('review-card')).toHaveLength(1);
      expect(cropButton()).toBeInTheDocument();
    });

    it('makes one card per picked file, each cropped on its own', async () => {
      renderScan('/scan?mode=receipt');
      await pick(2);
      await userEvent.click(done());
      expect(screen.getAllByTestId('review-card')).toHaveLength(2);
      expect(held).toHaveLength(0);
      await userEvent.click(
        within(screen.getAllByTestId('review-card')[0]).getByRole('button', {
          name: /^Crop/,
        }),
      );
      await userEvent.click(
        await screen.findByRole('button', { name: 'Use photo' }),
      );
      await waitFor(() => expect(held).toHaveLength(1));
      expect(
        within(screen.getAllByTestId('review-card')[1]).getByRole('button', {
          name: /^Crop/,
        }),
      ).toBeInTheDocument();
    });
  });
});
