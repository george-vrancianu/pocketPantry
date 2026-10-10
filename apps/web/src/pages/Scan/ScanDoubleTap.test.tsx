import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
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
}));

let fetchCalls: ReturnType<typeof stubApi>['calls'];
function renderScan(route = '/scan?mode=product') {
  const { fetchMock, calls } = stubApi({
    'POST /api/scan/product': () => Response.json({ lines: [] }),
  });
  fetchCalls = calls;
  vi.stubGlobal('fetch', fetchMock);
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route },
  );
}

const guide = () => screen.getByTestId('scan-guide');
const scans = () =>
  fetchCalls.filter((c) => c.key === 'POST /api/scan/product');
const flash = () => screen.queryByTestId('scan-flash');
const flush = () => act(async () => {});

let now = 0;
const tap = (target: Element, x = 200, y = 300, after = 0) => {
  now += after;
  const base = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
  };
  fireEvent.pointerDown(target, { ...base, clientX: x, clientY: y });
  fireEvent.pointerUp(target, { ...base, clientX: x, clientY: y });
};
const advance = (ms: number) =>
  act(() => {
    now += ms;
    vi.advanceTimersByTime(ms);
  });

const cssRules = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');
const classesOf = (el: Element) =>
  Array.from(el.classList).filter((c) => cssRules().includes(`.${c}`));
const noAnimation = (el: Element) =>
  classesOf(el).some((c) =>
    cssRules().includes(
      `@media (prefers-reduced-motion: reduce){.${c}{-webkit-animation:none;animation:none;}}`,
    ),
  );

describe('Scan by double-tapping the guides', () => {
  const vibrate = vi.fn(() => true);
  beforeEach(() => {
    clearReview();
    localStorage.clear();
    now = 1000;
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

  it('scans on two taps inside the guides within 320 ms', async () => {
    renderScan();
    tap(guide());
    tap(guide(), 205, 305, 200);
    await flush();
    expect(scans()).toHaveLength(1);
  });

  it('does nothing on a single tap', async () => {
    renderScan();
    tap(guide());
    await advance(1000);
    await flush();
    expect(scans()).toHaveLength(0);
    expect(flash()).toBeNull();
  });

  it('does nothing when the second tap is too late or too far', async () => {
    renderScan();
    tap(guide());
    tap(guide(), 200, 300, 321);
    tap(guide(), 300, 300, 100);
    await flush();
    expect(scans()).toHaveLength(0);
  });

  it('does nothing for a double-tap outside the guides', async () => {
    renderScan();
    tap(document.body);
    tap(document.body, 200, 300, 100);
    tap(screen.getByRole('radiogroup', { name: 'Scan mode' }));
    tap(screen.getByRole('radiogroup', { name: 'Scan mode' }), 200, 300, 100);
    await flush();
    expect(scans()).toHaveLength(0);
  });

  it('ignores a double-tap that follows a dial drag', async () => {
    renderScan();
    const dial = screen.getByRole('radiogroup', { name: 'Scan mode' });
    const base = {
      pointerId: 2,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
    };
    fireEvent.pointerDown(dial, { ...base, clientX: 200, clientY: 500 });
    fireEvent.pointerMove(dial, { ...base, clientX: 150, clientY: 500 });
    fireEvent.pointerMove(dial, { ...base, clientX: 100, clientY: 500 });
    fireEvent.pointerUp(dial, { ...base, clientX: 100, clientY: 500 });
    tap(guide(), 200, 300, 50);
    tap(guide(), 200, 300, 100);
    await flush();
    expect(scans()).toHaveLength(0);
  });

  it('gives the full feedback: flash, white fill, 6 pt brackets, pulse and a 12 ms haptic', async () => {
    renderScan();
    tap(guide());
    tap(guide(), 200, 300, 100);
    await flush();
    expect(flash()).toBeInTheDocument();
    expect(guide()).toHaveAttribute('data-shutter', 'true');
    expect(screen.getByTestId('scan-guide-fill')).toBeInTheDocument();
    expect(
      getComputedStyle(screen.getAllByTestId('scan-guide-corner')[0])
        .borderTopWidth,
    ).toBe('6px');
    expect(vibrate).toHaveBeenCalledWith(12);
  });

  it('ends the pulse after 360 ms and the flash after 420 ms', async () => {
    renderScan();
    tap(guide());
    tap(guide(), 200, 300, 100);
    await flush();
    await advance(359);
    expect(guide()).toHaveAttribute('data-shutter', 'true');
    await advance(2);
    expect(guide()).not.toHaveAttribute('data-shutter', 'true');
    await advance(58);
    expect(flash()).toBeInTheDocument();
    await advance(3);
    expect(flash()).toBeNull();
    expect(
      getComputedStyle(screen.getAllByTestId('scan-guide-corner')[0])
        .borderTopWidth,
    ).toBe('3.5px');
  });

  it('removes the shutter button', () => {
    renderScan();
    expect(
      screen.queryByRole('button', { name: 'Take photo' }),
    ).not.toBeInTheDocument();
  });

  it('drops the flash and pulse animations under reduced motion but keeps the haptic', async () => {
    renderScan();
    tap(guide());
    tap(guide(), 200, 300, 100);
    await flush();
    expect(noAnimation(flash() as Element)).toBe(true);
    expect(noAnimation(guide())).toBe(true);
    expect(noAnimation(screen.getByTestId('scan-guide-fill'))).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(12);
  });
});

describe('Scan by keyboard on the guides', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('makes the guides a focusable button', () => {
    renderScan();
    expect(guide()).toHaveAttribute('role', 'button');
    expect(guide()).toHaveAttribute('tabindex', '0');
    expect(guide()).toHaveAccessibleName();
  });

  it.each(['{Enter}', ' '])('scans on %j', async (key) => {
    renderScan();
    guide().focus();
    await userEvent.keyboard(key);
    await vi.waitFor(() => expect(scans()).toHaveLength(1));
  });

  it('does not scan on other keys', async () => {
    renderScan();
    guide().focus();
    await userEvent.keyboard('a{Tab}');
    await flush();
    expect(scans()).toHaveLength(0);
  });
});
