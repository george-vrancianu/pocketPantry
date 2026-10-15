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
import { getScanSession, resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { scanViaGuide } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

// jsdom has no camera: the camera module is the seam. Its photo barcode reader answers when the test says so.
const camera = vi.hoisted(() => ({
  decodes: [] as Array<{
    source: Blob;
    resolve: (code: string | null) => void;
    reject: (error: Error) => void;
  }>,
}));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: false,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
    watchBarcodes: () => () => {},
  }),
  readBarcode: (source: Blob) =>
    new Promise<string | null>((resolve, reject) =>
      camera.decodes.push({ source, resolve, reject }),
    ),
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

const yogurt = {
  owner: 'catalog',
  amountScale: 'medium',
  id: 'yogurt-id',
  name: 'Yogurt',
  defaultUnit: 'g',
  leafCategory: { id: 'leaf', name: 'Leaf' },
  parentCategory: {
    id: 'dairy',
    name: 'Dairy',
    aisle: { id: 'aisle', name: 'Dairy & eggs' },
  },
  defaults: { expiryDays: 10, location: 'fridge' },
};
const line = (name: string) => ({
  name,
  sourceText: null,
  match: { ...yogurt, name },
  lowConfidence: false,
  quantity: 1,
  unit: 'g',
  expiryDate: null,
  productDescription: null,
});
const CODE = '5941234567890';

let calls: ReturnType<typeof stubApi>['calls'];
let readLines: object[];

function renderScan(route = '/scan?mode=product') {
  camera.decodes = [];
  readLines = [line('Yogurt')];
  const stub = stubApi({
    'POST /api/scan/product': () => Response.json({ lines: readLines }),
    'POST /api/scan/ingredients': () => Response.json({ lines: readLines }),
    'POST /api/scan/receipt': () => Response.json({ lines: readLines }),
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    'GET /api/catalog/search': () =>
      Response.json({
        results: [yogurt, { ...yogurt, id: 'skyr-id', name: 'Skyr' }],
      }),
    'GET /api/catalog/allergens': () => Response.json({ allergens: [] }),
  });
  calls = stub.calls;
  vi.stubGlobal('fetch', stub.fetchMock);
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
}

const flush = () => act(async () => {});
const states = () =>
  screen
    .queryAllByTestId('scan-thumbnail')
    .map((t) => t.getAttribute('data-state'));
const saves = () =>
  calls
    .filter((call) => call.key === 'POST /api/pantry/batches/bulk')
    .flatMap((call) => (call.body as { batches: object[] }).batches);
/** The camera's frame is decoded: the nth pending decode answers. */
const decoded = async (code: string | null, nth = 0) => {
  await waitFor(() => expect(camera.decodes.length).toBeGreaterThan(nth));
  await act(async () => camera.decodes[nth].resolve(code));
};
async function addAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /^Done/ }));
  await user.click(await screen.findByRole('button', { name: 'Add all' }));
  await waitFor(() => expect(saves().length).toBeGreaterThan(0));
}

describe('Product Scans teach the Known Barcode decoded from their photo', () => {
  beforeEach(() => {
    resetScanSession();
    resetReads();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the barcode found in the photo with the saved Batch, without Open Food Facts credit', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await decoded(CODE);
    await addAll(user);

    expect(saves()).toEqual([
      expect.objectContaining({ ingredientId: 'yogurt-id', barcode: CODE }),
    ]);
  });

  it('decodes the full captured frame, not the resized photo', async () => {
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(camera.decodes).toHaveLength(1));
    expect(await camera.decodes[0].source.text()).toBe('frame');
  });

  it('keeps the barcode after the Member changes the Ingredient in Review', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await decoded(CODE);
    await user.click(screen.getByRole('button', { name: /^Done/ }));
    await user.click(await screen.findByTestId('card-result'));
    await user.click(await screen.findByRole('button', { name: /Yogurt/ }));
    await user.click(
      await screen.findByRole('button', { name: /Yogurt.*Change/ }),
    );
    const search = within(
      screen.getByRole('dialog', { name: 'Change match for Yogurt' }),
    ).getByRole('combobox', { name: 'Search ingredients' });
    await user.type(search, 'skyr');
    await user.click(await screen.findByRole('option', { name: /Skyr/ }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /^Save/ }));

    await waitFor(() => expect(saves().length).toBeGreaterThan(0));
    expect(saves()).toEqual([
      expect.objectContaining({ ingredientId: 'skyr-id', barcode: CODE }),
    ]);
  });

  it('attaches a barcode that settles while the Member is already editing the card', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await user.click(screen.getByRole('button', { name: /^Done/ }));
    await user.click(await screen.findByTestId('card-result'));
    await screen.findByRole('button', { name: /Yogurt/ });
    await decoded(CODE);
    await user.click(screen.getByRole('button', { name: /^Save/ }));

    await waitFor(() => expect(saves().length).toBeGreaterThan(0));
    expect(saves()).toEqual([expect.objectContaining({ barcode: CODE })]);
  });

  it('attaches a barcode that settles before the read answers', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await decoded(CODE);
    await waitFor(() => expect(states()).toEqual(['read']));
    await addAll(user);

    expect(saves()).toEqual([expect.objectContaining({ barcode: CODE })]);
  });

  it('sends no barcode when the photo has none', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await decoded(null);
    await addAll(user);

    expect(saves()[0]).not.toHaveProperty('barcode');
  });

  it('sends no barcode when the Product Scan read as more than one line', async () => {
    const user = userEvent.setup();
    renderScan();
    readLines = [line('Yogurt'), line('Skyr')];
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await decoded(CODE);
    await addAll(user);

    expect(saves()).toHaveLength(2);
    saves().forEach((batch) => expect(batch).not.toHaveProperty('barcode'));
  });

  it('reads the card without waiting for a slow decode, and a failed decode does not fail it', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    // The decode never answers, yet the card is read.
    await waitFor(() => expect(states()).toEqual(['read']));
    await act(async () =>
      camera.decodes[0].reject(new Error('no detector here')),
    );
    await flush();
    expect(states()).toEqual(['read']);
    await addAll(user);

    expect(saves()[0]).not.toHaveProperty('barcode');
  });

  it('ignores a decode that settles after the card was removed', async () => {
    const user = userEvent.setup();
    renderScan();
    scanViaGuide();
    await waitFor(() => expect(states()).toEqual(['read']));
    await user.click(screen.getByRole('button', { name: /^Done/ }));
    await user.click(await screen.findByRole('button', { name: /Remove/ }));
    await waitFor(() => expect(getScanSession().scans).toEqual([]));

    await decoded(CODE);
    await flush();

    expect(getScanSession().scans).toEqual([]);
  });

  it('decodes Product photos imported from the gallery', async () => {
    const user = userEvent.setup();
    renderScan();
    const photo = new File(['gallery'], 'pack.jpg', { type: 'image/jpeg' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('gallery-input'), {
        target: { files: [photo] },
      });
    });
    await waitFor(() => expect(states()).toEqual(['read']));
    await waitFor(() => expect(camera.decodes).toHaveLength(1));
    expect(camera.decodes[0].source).toBe(photo);
    await decoded(CODE);
    await addAll(user);

    expect(saves()).toEqual([expect.objectContaining({ barcode: CODE })]);
  });

  it.each(['receipt', 'ingredients', 'plate'])(
    'does not decode %s Scans for a barcode',
    async (mode) => {
      renderScan(`/scan?mode=${mode}`);
      scanViaGuide();
      await waitFor(() =>
        expect(screen.queryAllByTestId('scan-thumbnail')).toHaveLength(1),
      );
      await flush();
      expect(camera.decodes).toHaveLength(0);
    },
  );
});
