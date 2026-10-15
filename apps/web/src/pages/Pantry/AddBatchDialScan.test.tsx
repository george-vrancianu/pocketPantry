import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

// jsdom has no camera or canvas: the camera hook and image preparation are the seams.
const camera = vi.hoisted(() => ({
  focuses: 0,
  cancels: 0,
}));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: false,
    focusSupported: false,
    focusForScan: () => {
      camera.focuses += 1;
      return {
        done: new Promise<void>((resolve) => setTimeout(resolve, 400)),
        cancel: () => (camera.cancels += 1),
      };
    },
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
    watchBarcodes: () => () => {},
  }),
  readBarcode: () => Promise.resolve(null),
}));
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,AAAA'),
}));

function stubPantry() {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () => Response.json({ batches: [], runningLow: [] }),
    'GET /api/staples': () => Response.json({ staples: [] }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/catalog/search': () => Response.json({ results: [] }),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'POST /api/scan/product': () => Response.json({ lines: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}
const scans = (calls: ReturnType<typeof stubPantry>) =>
  calls.filter((call) => call.key === 'POST /api/scan/product');

async function openOverlay(mode: 'product' | 'barcode') {
  localStorage.setItem('pocket-pantry.camera-overlay-mode', mode);
  const user = userEvent.setup();
  renderWithProviders(<PantryPage />);
  await user.click(await screen.findByRole('button', { name: 'Add batch' }));
  await user.click(
    screen.getByRole('button', { name: 'Fill from the camera' }),
  );
}

const base = { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0 };
const current = () => screen.getByRole('radio', { checked: true });
const press = (target: Element) =>
  fireEvent.pointerDown(target, { ...base, clientX: 100, clientY: 100 });
const release = (target: Element) =>
  fireEvent.pointerUp(target, { ...base, clientX: 100, clientY: 100 });
const wait = (ms: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

describe('Scanning from the add-Batch camera overlay by the mode dial', () => {
  beforeEach(() => {
    localStorage.clear();
    camera.focuses = 0;
    camera.cancels = 0;
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(() => true),
      configurable: true,
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
    vi.unstubAllGlobals();
  });

  it('double-tapping the current mode sends a Scan, with the guide flash', async () => {
    const calls = stubPantry();
    await openOverlay('product');
    for (let i = 0; i < 2; i++) {
      press(current());
      release(current());
    }
    await screen.findByTestId('scan-flash');
    expect(scans(calls)).toHaveLength(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  it('holding the current mode focuses, then sends exactly one Scan on release', async () => {
    const calls = stubPantry();
    await openOverlay('product');
    press(current());
    await wait(320);
    expect(camera.focuses).toBe(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(6);
    expect(screen.getByTestId('mode-dial-hold')).toBeInTheDocument();
    release(current());
    await waitFor(() => expect(scans(calls)).toHaveLength(1));
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  it('sends nothing for either gesture in Barcode Lookup', async () => {
    const calls = stubPantry();
    await openOverlay('barcode');
    for (let i = 0; i < 2; i++) {
      press(current());
      release(current());
    }
    press(current());
    await wait(320);
    release(current());
    await wait(450);
    expect(camera.focuses).toBe(0);
    expect(screen.queryByTestId('scan-flash')).toBeNull();
    expect(scans(calls)).toHaveLength(0);
  });
});
