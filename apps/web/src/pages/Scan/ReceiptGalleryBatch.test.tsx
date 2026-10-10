import { fireEvent, screen, waitFor } from '@testing-library/react';
import { scanGuide } from '../../test/scan';
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

const line = (name: string) => ({
  name,
  match: null,
  lowConfidence: false,
  quantity: 1,
  unit: 'pcs',
  expiryDate: null,
  productDescription: null,
});
const lines = (...names: string[]) => Response.json({ lines: names.map(line) });
const providerDown = () =>
  Response.json(
    { code: 'scan.provider_incomplete', params: {} },
    { status: 502 },
  );

function setup(responses: Array<() => Response>, route = '/scan?mode=receipt') {
  const queue = [...responses];
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    'POST /api/scan/receipt': () => (queue.shift() ?? providerDown)(),
    'POST /api/scan/product': () => lines('Milk'),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review/draft" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
  return { calls };
}

const photos = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => new File(['x'], `part${i}.jpg`, { type: 'image/jpeg' }),
  );
const pick = (count: number) =>
  fireEvent.change(screen.getByTestId('gallery-input'), {
    target: { files: photos(count) },
  });
const click = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }));
const cropDialog = () => screen.findByRole('dialog', { name: 'Crop receipt' });
const receiptCalls = (calls: Array<{ key: string }>) =>
  calls.filter((c) => c.key === 'POST /api/scan/receipt');
describe('Receipt gallery multi-select', () => {
  beforeEach(() => {
    clearReview();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('allows several files in Receipt mode only', () => {
    setup([]);
    expect(screen.getByTestId('gallery-input')).toHaveAttribute('multiple');
  });

  it('keeps single selection in the other modes', async () => {
    const { calls } = setup([], '/scan?mode=product');
    expect(screen.getByTestId('gallery-input')).not.toHaveAttribute('multiple');
    pick(3);
    await new Promise((r) => setTimeout(r, 20));
    expect(
      calls.filter((c) => c.key === 'POST /api/scan/product'),
    ).toHaveLength(1);
  });

  it('crops each photo of the selection in order and sends each as its own Scan', async () => {
    const { calls } = setup([
      () => lines('Eggs'),
      () => lines('Milk'),
      () => lines('Rice'),
    ]);
    pick(3);
    for (const number of [1, 2, 3]) {
      await cropDialog();
      expect(screen.getByText(`Photo ${number} of 3`)).toBeInTheDocument();
      await click('Use photo');
      await waitFor(() => expect(receiptCalls(calls)).toHaveLength(number));
    }
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('cancelling a crop abandons the rest of the selection', async () => {
    const { calls } = setup([() => lines('Eggs')]);
    pick(3);
    await cropDialog();
    await click('Use photo');
    await cropDialog();
    await click('Cancel');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(receiptCalls(calls)).toHaveLength(1);
    expect(scanGuide()).not.toHaveAttribute('aria-disabled');
  });
});
