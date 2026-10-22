import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { GUIDE_CENTER_Y } from '../../lib/scanGuides';
import { ScanPage } from './ScanPage';

// jsdom has no camera or canvas: the camera hook and image preparation are the seams.
vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
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

/** All CSS emitted into the document, to check rules jsdom cannot evaluate (media queries). */
const cssRules = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');
const classesOf = (el: Element) =>
  Array.from(el.classList).filter((c) => cssRules().includes(`.${c}`));

describe('Scan guides', () => {
  beforeEach(() => {
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
  afterEach(() => vi.unstubAllGlobals());

  it.each([['Receipt'], ['Product'], ['Ingredients'], ['Plate']])(
    'shows no hint under the %s guide (the Info sheet explains the modes)',
    async (mode) => {
      renderScan();
      await userEvent.click(screen.getByRole('radio', { name: mode }));
      expect(screen.queryByTestId('scan-hint')).not.toBeInTheDocument();
      expect(screen.queryByText(/double-tap to scan/)).not.toBeInTheDocument();
    },
  );
});
