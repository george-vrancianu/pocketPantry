import { act, fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { dispatchScanSession, resetScanSession } from '../../lib/scanSession';
import { ScanPage } from './ScanPage';
import { fakeCamera } from '../../test/scan';

const image = vi.hoisted(() => ({ resize: null as null | Promise<string> }));
vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () =>
    image.resize ?? Promise.resolve('data:image/jpeg;base64,YQ=='),
}));

let fetchCalls: ReturnType<typeof stubApi>['calls'];
function renderScan() {
  const { fetchMock, calls } = stubApi({
    'POST /api/scan/product': () => Response.json({ lines: [] }),
  });
  fetchCalls = calls;
  vi.stubGlobal('fetch', fetchMock);
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route: '/scan?mode=product' },
  );
}
const scans = () =>
  fetchCalls.filter((c) => c.key === 'POST /api/scan/product');
const flush = () => act(async () => {});
const dial = () => screen.getByRole('radiogroup', { name: 'Scan mode' });
const current = () => within(dial()).getByRole('radio', { name: 'Product' });
const hold = () => screen.queryByTestId('mode-dial-hold');

let now = 0;
const base = { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0 };
const press = (x = 200, y = 500) =>
  fireEvent.pointerDown(current(), { ...base, clientX: x, clientY: y });
const lift = (x = 200, y = 500) =>
  fireEvent.pointerUp(current(), { ...base, clientX: x, clientY: y });
const advance = (ms: number) =>
  act(() => {
    now += ms;
    vi.advanceTimersByTime(ms);
  });

const cssRules = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');
const noAnimation = (el: Element) =>
  Array.from(el.classList).some((c) =>
    cssRules().includes(
      `@media (prefers-reduced-motion: reduce){.${c}{-webkit-animation:none;animation:none;}}`,
    ),
  );

describe('Scan page: Scan by the mode dial', () => {
  const vibrate = vi.fn(() => true);
  beforeEach(() => {
    localStorage.clear();
    resetScanSession();
    now = 1000;
    fakeCamera.focusSupported = true;
    image.resize = null;
    vibrate.mockClear();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('a double tap on the current mode sends one Scan with the guide feedback', async () => {
    renderScan();
    press();
    lift();
    now += 150;
    press();
    lift();
    await flush();
    expect(scans()).toHaveLength(1);
    expect(screen.getByTestId('scan-flash')).toBeInTheDocument();
    expect(screen.getByTestId('scan-guide')).toHaveAttribute(
      'data-pulse',
      'true',
    );
    expect(vibrate).toHaveBeenCalledWith(12);
  });

  it('a tap right after a dial drag does not count towards a double tap', async () => {
    renderScan();
    press(300);
    fireEvent.pointerMove(current(), { ...base, clientX: 285, clientY: 500 });
    fireEvent.pointerMove(current(), { ...base, clientX: 280, clientY: 500 });
    fireEvent.pointerUp(current(), { ...base, clientX: 280, clientY: 500 });
    now += 50;
    press();
    lift();
    now += 100;
    press();
    lift();
    await flush();
    expect(scans()).toHaveLength(0);
  });

  it('a hold ticks 6 ms, fills the ring, focuses, and sends one Scan on release', async () => {
    renderScan();
    press();
    await advance(301);
    expect(vibrate).toHaveBeenCalledWith(6);
    expect(hold()).toBeInTheDocument();
    expect(fakeCamera.focuses).toBe(1);
    lift();
    await flush();
    expect(scans()).toHaveLength(0);
    fakeCamera.finishFocus();
    await flush();
    expect(scans()).toHaveLength(1);
    expect(vibrate).toHaveBeenCalledWith(12);
    expect(screen.getByTestId('scan-flash')).toBeInTheDocument();
  });

  it('moving off after the hold started cancels with no Scan and no drag', async () => {
    renderScan();
    press();
    await advance(301);
    fireEvent.pointerMove(current(), { ...base, clientX: 150, clientY: 500 });
    fireEvent.pointerMove(current(), { ...base, clientX: 60, clientY: 500 });
    lift(60);
    fakeCamera.finishFocus();
    await flush();
    expect(fakeCamera.cancels).toBe(1);
    expect(scans()).toHaveLength(0);
    expect(
      within(dial()).getByRole('radio', { name: 'Product' }),
    ).toBeChecked();
  });

  it('does not arm either gesture once the Scan Cap is reached', async () => {
    dispatchScanSession({
      type: 'enqueue',
      scan: {
        id: 'held',
        mode: 'product',
        scanLanguage: 'en',
        image: 'data:image/jpeg;base64,YQ==',
        thumbnail: 'data:image/jpeg;base64,YQ==',
      },
    });
    dispatchScanSession({ type: 'fail', id: 'held', reason: 'cap' });
    renderScan();
    press();
    lift();
    now += 100;
    press();
    lift();
    now += 1000;
    press();
    await advance(500);
    expect(hold()).toBeNull();
    expect(fakeCamera.focuses).toBe(0);
    lift();
    fakeCamera.finishFocus();
    await flush();
    expect(vibrate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('scan-flash')).toBeNull();
    expect(scans()).toHaveLength(0);
  });

  it('sends no Scan from a double tap or a hold while a Scan is being read', async () => {
    image.resize = new Promise<string>(() => {});
    renderScan();
    press();
    lift();
    now += 100;
    press();
    lift();
    await flush();
    expect(screen.getByText('Reading your photo')).toBeInTheDocument();
    const focusesBefore = fakeCamera.focuses;
    now += 1000;
    press();
    lift();
    now += 100;
    press();
    lift();
    now += 1000;
    press();
    await advance(500);
    expect(hold()).toBeNull();
    lift();
    fakeCamera.finishFocus();
    await flush();
    expect(fakeCamera.focuses).toBe(focusesBefore);
    expect(scans()).toHaveLength(0);
  });

  it('with reduced motion the ring fill does not animate', async () => {
    renderScan();
    press();
    await advance(301);
    expect(noAnimation(hold()!)).toBe(true);
  });
});
