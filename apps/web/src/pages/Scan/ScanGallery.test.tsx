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
import { resetReads } from '../../lib/scanReads';
import {
  dispatchScanSession,
  getScanSession,
  resetScanSession,
} from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ScanPage } from './ScanPage';

const camera = vi.hoisted(() => ({
  status: 'ready' as string,
  cropFails: false,
}));
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
    camera.cropFails
      ? Promise.reject(new Error('bad photo'))
      : Promise.resolve('data:image/jpeg;base64,Z2FsbGVyeQ=='),
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
    resetReads();
    resetScanSession();
    localStorage.clear();
    camera.status = 'ready';
    camera.cropFails = false;
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

  it('takes picks only up to the Scan Session cap and says so', async () => {
    renderScan();
    for (let i = 0; i < 19; i += 1) {
      dispatchScanSession({
        type: 'enqueue',
        scan: { id: `s${i}`, mode: 'product', image: 'i', thumbnail: 'i' },
      });
    }
    await pick(3);
    expect(getScanSession().scans).toHaveLength(20);
    expect(await screen.findByText(/at most 20 photos/)).toBeInTheDocument();
  });

  it('keeps Add disabled, waiting on the uncropped receipt, until it is removed', async () => {
    renderScan('/scan?mode=receipt');
    await pick();
    await userEvent.click(done());
    const add = screen.getByRole('button', { name: /^Crop 1 receipt first/ });
    expect(add).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(getScanSession().scans).toHaveLength(0);
  });

  describe('a receipt from the gallery', () => {
    const cropButton = () =>
      screen.getByRole('button', { name: /^Crop receipt photo/ });

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

    it('is not shown as read on its thumbnail until it has been cropped and read', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      expect(states()).toEqual(['uncropped']);
      expect(thumbnails()[0]).toHaveAccessibleName(/needs crop/i);
    });

    it('counts as pending: Done stays amber and Review does not say all read', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      expect(within(done()).getByTestId('done-count')).toHaveAttribute(
        'data-reading',
        'true',
      );
      await userEvent.click(done());
      expect(screen.queryByText(/all read/)).not.toBeInTheDocument();
    });

    it('says why and keeps the Crop button when the crop fails', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      await userEvent.click(done());
      const card = within(screen.getByTestId('review-card'));
      await userEvent.click(card.getByRole('button', { name: /^Crop/ }));
      camera.cropFails = true;
      await userEvent.click(
        await screen.findByRole('button', { name: 'Use photo' }),
      );
      expect(await card.findByRole('alert')).toBeInTheDocument();
      expect(card.getByRole('button', { name: /^Crop/ })).toBeInTheDocument();
      expect(held).toHaveLength(0);
    });

    it('returns focus to the card after Use photo', async () => {
      renderScan('/scan?mode=receipt');
      await pick();
      await userEvent.click(done());
      await userEvent.click(
        within(screen.getByTestId('review-card')).getByRole('button', {
          name: /^Crop/,
        }),
      );
      await userEvent.click(
        await screen.findByRole('button', { name: 'Use photo' }),
      );
      await waitFor(() =>
        expect(screen.getByTestId('review-card')).toContainElement(
          document.activeElement as HTMLElement,
        ),
      );
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
