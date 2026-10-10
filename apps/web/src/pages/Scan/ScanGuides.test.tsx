import { act, fireEvent, screen, within } from '@testing-library/react';
import { scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
import { GUIDE_CENTER_Y } from '../../lib/scanGuides';
import { ScanPage } from './ScanPage';

// jsdom has no camera or canvas: the camera hook and image preparation are the seams.
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
  }),
}));
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,AAAA'),
}));

function renderScan(
  route = '/scan',
  routes: Parameters<typeof stubApi>[0] = {},
) {
  const { fetchMock } = stubApi(routes);
  vi.stubGlobal('fetch', fetchMock);
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route },
  );
}

const guide = () => screen.getByTestId('scan-guide');
const hint = () => screen.queryByTestId('scan-hint');

/** All CSS emitted into the document, to check rules jsdom cannot evaluate (media queries). */
const cssRules = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');
const classesOf = (el: Element) =>
  Array.from(el.classList).filter((c) => cssRules().includes(`.${c}`));

describe('Scan guides', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([
    ['Receipt', '52%', '64%'],
    ['Product', '60%', '48%'],
    ['Ingredients', '88%', '42%'],
    ['Plate', '80%', '50%'],
  ])('sizes the %s guide to %s x %s of the screen', async (mode, w, h) => {
    renderScan();
    await userEvent.click(screen.getByRole('radio', { name: mode }));
    const style = getComputedStyle(guide());
    expect(style.width).toBe(w);
    expect(style.height).toBe(h);
  });

  it('centres the guide at 46% of the screen height', () => {
    renderScan();
    const style = getComputedStyle(guide());
    expect(style.top).toBe('46%');
    expect(style.left).toBe('50%');
  });

  it('places the guide top from GUIDE_CENTER_Y', () => {
    renderScan();
    expect(getComputedStyle(guide()).top).toBe(`${GUIDE_CENTER_Y * 100}%`);
  });

  it('draws four corner brackets', () => {
    renderScan();
    expect(within(guide()).getAllByTestId('scan-guide-corner')).toHaveLength(4);
  });

  it('morphs the size over 400 ms', () => {
    renderScan();
    const rules = cssRules();
    const className = classesOf(guide()).find((c) =>
      new RegExp(`\\.${c}\\{[^}]*transition:[^;}]*400ms`).test(rules),
    );
    expect(className).toBeDefined();
  });

  it('drops the morph and the armed colour fade for reduced motion', () => {
    renderScan();
    const rules = cssRules();
    const noTransition = (el: Element) =>
      classesOf(el).some((c) =>
        rules.includes(
          `@media (prefers-reduced-motion: reduce){.${c}{-webkit-transition:none;transition:none;}}`,
        ),
      );
    expect(noTransition(guide())).toBe(true);
    expect(
      noTransition(within(guide()).getAllByTestId('scan-guide-corner')[0]),
    ).toBe(true);
  });
});

describe('Scan guide armed state', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('flashes armed on pointer down for 320 ms', () => {
    renderScan();
    expect(guide()).not.toHaveAttribute('data-armed', 'true');
    fireEvent.pointerDown(guide());
    expect(guide()).toHaveAttribute('data-armed', 'true');
    act(() => {
      vi.advanceTimersByTime(319);
    });
    expect(guide()).toHaveAttribute('data-armed', 'true');
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(guide()).not.toHaveAttribute('data-armed', 'true');
  });

  it('re-arms on the next press', () => {
    renderScan();
    fireEvent.pointerDown(guide());
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.pointerDown(guide());
    expect(guide()).toHaveAttribute('data-armed', 'true');
  });
});

describe('Scan guide hint', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['Receipt', 'Lay flat, double-tap to scan'],
    ['Product', 'Frame the product and its date'],
    ['Ingredients', 'Lay them out, fit them all in'],
    ['Plate', 'Fit the whole plate'],
  ])('shows the %s hint', async (mode, text) => {
    renderScan();
    await userEvent.click(screen.getByRole('radio', { name: mode }));
    expect(hint()).toHaveTextContent(text);
  });

  it.each([
    ['Receipt', 'Fit the whole receipt in the frame'],
    ['Product', 'Point at a barcode or label'],
    ['Ingredients', 'Spread items out on the counter'],
    ['Plate', 'Hold steady above your plate'],
  ])(
    'no longer shows the old %s hint in the controls area',
    async (mode, old) => {
      renderScan();
      await userEvent.click(screen.getByRole('radio', { name: mode }));
      expect(screen.queryByText(old)).not.toBeInTheDocument();
      expect(screen.getAllByTestId('scan-hint')).toHaveLength(1);
    },
  );

  it('exposes the guide hint to assistive tech', () => {
    renderScan();
    expect(hint()?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('sits below the guides, not in the controls area', () => {
    renderScan();
    expect(guide()).toContainElement(hint());
  });

  it('hides after the first Scan, even when it fails, and stays hidden on a mode change', async () => {
    renderScan('/scan?mode=product', {
      'POST /api/scan/product': () =>
        Response.json(
          { code: 'scan.image_too_large', params: {} },
          { status: 413 },
        ),
    });
    expect(hint()).toBeInTheDocument();
    scanViaGuide();
    await screen.findByTestId('scan-thumbnail');
    expect(hint()).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Plate' }));
    expect(hint()).not.toBeInTheDocument();
  });
});
