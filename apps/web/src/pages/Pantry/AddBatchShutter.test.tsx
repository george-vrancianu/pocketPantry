import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';
import { fakeCamera } from '../../test/scan';

// jsdom has no camera or canvas: the camera hook and image preparation are the seams.
vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
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
const shutter = () => screen.getByRole('button', { name: 'Take photo' });
const press = () =>
  fireEvent.pointerDown(shutter(), { ...base, clientX: 100, clientY: 100 });
const release = () =>
  fireEvent.pointerUp(shutter(), { ...base, clientX: 100, clientY: 100 });
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const flush = () => act(async () => {});

describe('Scanning from the add-Batch camera overlay by the shutter', () => {
  beforeEach(() => {
    localStorage.clear();
    fakeCamera.focusSupported = true;
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(() => true),
      configurable: true,
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  /** The overlay opens on real timers; the gestures then run on fake ones. */
  const gesturesOnFakeTimers = () =>
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  it('has the v3 chrome: the shutter and a slider with Product and Barcode only', async () => {
    stubPantry();
    await openOverlay('product');
    expect(shutter()).toBeInTheDocument();
    expect(
      screen.getAllByRole('radio').map((radio) => radio.textContent),
    ).toEqual(['Product', 'Barcode']);
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();
  });

  it('uses the shared top bar and footer, with an empty stack cell and no Import', async () => {
    stubPantry();
    await openOverlay('product');
    const bar = within(screen.getByTestId('scan-top-bar'));
    expect(bar.getByRole('button', { name: 'Close scanner' })).toBeVisible();
    expect(bar.getByRole('button', { name: /^Torch/ })).toBeVisible();
    expect(bar.getByRole('combobox', { name: 'Reading as' })).toBeVisible();
    const footer = within(screen.getByTestId('scan-footer'));
    expect(footer.getByRole('button', { name: 'Take photo' })).toBeVisible();
    expect(screen.queryByTestId('photo-stack')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Import from photos' }),
    ).toBeNull();
  });

  it('hides the Scan Language chip in Barcode', async () => {
    stubPantry();
    await openOverlay('barcode');
    expect(
      screen.queryByRole('combobox', { name: 'Reading as' }),
    ).not.toBeInTheDocument();
  });

  it('a tap on the shutter sends a Scan, with the guide haptic', async () => {
    const calls = stubPantry();
    await openOverlay('product');
    fireEvent.click(shutter());
    await flush();
    expect(scans(calls)).toHaveLength(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  it('holding the shutter focuses, then sends exactly one Scan on release', async () => {
    const calls = stubPantry();
    await openOverlay('product');
    gesturesOnFakeTimers();
    press();
    await advance(301);
    expect(fakeCamera.focuses).toBe(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(6);
    release();
    expect(scans(calls)).toHaveLength(0);
    fakeCamera.finishFocus();
    await flush();
    expect(scans(calls)).toHaveLength(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  it('shows a ring that takes no input in Barcode Lookup', async () => {
    const calls = stubPantry();
    await openOverlay('barcode');
    expect(
      screen.queryByRole('button', { name: 'Take photo' }),
    ).not.toBeInTheDocument();
    const ring = screen.getByTestId('shutter-ring');
    expect(ring).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(ring);
    await flush();
    expect(fakeCamera.focuses).toBe(0);
    expect(screen.queryByTestId('scan-flash')).toBeNull();
    expect(scans(calls)).toHaveLength(0);
  });
});
