import { fireEvent, screen } from '@testing-library/react';
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
  matchConfidence: 0,
  unmatched: true,
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
      <Route path="/scan/review" element={<ReviewPage />} />
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
const reviewNames = async () =>
  (await screen.findAllByRole('region')).map((r) =>
    r.getAttribute('aria-label'),
  );

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

  it('crops and reads three photos one at a time in order, then Finish merges them', async () => {
    const { calls } = setup([
      () => lines('Eggs'),
      () => lines('Milk'),
      () => lines('Rice'),
    ]);
    pick(3);
    await cropDialog();
    expect(screen.getByText('Photo 1 of 3')).toBeInTheDocument();
    await click('Use photo');
    await screen.findByText('Section 1: 1 line found');
    expect(receiptCalls(calls)).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/2 more photos waiting/)).toBeInTheDocument();

    await click('Next photo');
    await cropDialog();
    expect(screen.getByText('Photo 2 of 3')).toBeInTheDocument();
    await click('Use photo');
    await screen.findByText('Section 2: 1 line found');

    await click('Next photo');
    await cropDialog();
    expect(screen.getByText('Photo 3 of 3')).toBeInTheDocument();
    await click('Use photo');
    await screen.findByText('Section 3: 1 line found');
    expect(screen.queryByText(/photos? waiting/)).not.toBeInTheDocument();
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs', 'Milk', 'Rice']);
  });

  it('shows Reading N of M while a photo of the batch is read', async () => {
    let release: (r: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolve) => (release = resolve));
    const { fetchMock } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('/scan/receipt')
        ? pending
        : fetchMock(input, init),
    );
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    pick(2);
    await cropDialog();
    await click('Use photo');
    expect(
      await screen.findByText('Reading photo 1 of 2…'),
    ).toBeInTheDocument();
    release(lines('Eggs'));
    await screen.findByText('Section 1: 1 line found');
  });

  it('refuses a selection that does not fit in the remaining room', async () => {
    setup(Array.from({ length: 8 }, (_, i) => () => lines(`Item ${i}`)));
    for (let i = 0; i < 8; i++) {
      await click('Take photo');
      await screen.findByText(`Section ${i + 1}: 1 line found`);
      await click('Next photo');
    }
    pick(3);
    expect(await screen.findByText(/only 2 more sections/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    pick(2);
    await cropDialog();
    expect(screen.queryByText(/only 2 more sections/)).not.toBeInTheDocument();
  });

  it('stops the queue at a failed photo, lets it be re-cropped, then continues', async () => {
    const { calls } = setup([
      () => lines('Eggs'),
      providerDown,
      () => lines('Milk'),
      () => lines('Rice'),
    ]);
    pick(3);
    await cropDialog();
    await click('Use photo');
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await cropDialog();
    await click('Use photo');
    await screen.findByText('The scan did not finish. Please try again.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(receiptCalls(calls)).toHaveLength(2);

    await click('Retake');
    await cropDialog();
    expect(screen.getByText('Photo 2 of 3')).toBeInTheDocument();
    await click('Use photo');
    await screen.findByText('Section 2: 1 line found');
    await click('Next photo');
    await cropDialog();
    expect(screen.getByText('Photo 3 of 3')).toBeInTheDocument();
    await click('Use photo');
    await screen.findByText('Section 3: 1 line found');
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs', 'Milk', 'Rice']);
  });

  it('cancelling a crop abandons the rest of the batch and sends nothing more', async () => {
    const { calls } = setup([() => lines('Eggs')]);
    pick(3);
    await cropDialog();
    await click('Use photo');
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await cropDialog();
    await click('Cancel');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/photos? waiting/)).not.toBeInTheDocument();
    expect(receiptCalls(calls)).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });

  it('Finish drops the photos still waiting', async () => {
    setup([() => lines('Eggs')]);
    pick(3);
    await cropDialog();
    await click('Use photo');
    await screen.findByText('Section 1: 1 line found');
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs']);
  });

  it('switching the Scan Mode clears the queue', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setup([() => lines('Eggs'), () => lines('Rice')]);
    pick(3);
    await cropDialog();
    await click('Use photo');
    await screen.findByText('Section 1: 1 line found');
    await click('Product');
    await click('Receipt');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/photos? waiting/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next photo' })).toBeNull();
  });
});
