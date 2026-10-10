import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders } from '../../test/render';
import { ScanPage } from './ScanPage';

// jsdom has no camera: the camera hook is the seam.
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
  }),
}));

const ORDER = ['Receipt', 'Product', 'Ingredients', 'Plate'];

function renderScan(route = '/scan') {
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route },
  );
}

const dial = () => screen.getByRole('radiogroup', { name: 'Scan mode' });
const item = (name: string) => within(dial()).getByRole('radio', { name });
const selected = () =>
  within(dial())
    .getAllByRole('radio')
    .filter((radio) => radio.getAttribute('aria-checked') === 'true')
    .map((radio) => radio.getAttribute('aria-label') ?? radio.textContent);

describe('Scan mode dial', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('lists Receipt, Product, Ingredients, Plate, each named by its Scan Mode', () => {
    renderScan();
    expect(
      within(dial())
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label') ?? radio.textContent),
    ).toEqual(ORDER);
    for (const name of ORDER) expect(item(name)).toBeInTheDocument();
  });

  it('defaults to Receipt when nothing is stored', () => {
    renderScan();
    expect(selected()).toEqual(['Receipt']);
    expect(item('Receipt')).toBeChecked();
  });

  it('selects a mode when its icon is tapped', async () => {
    renderScan();
    await userEvent.click(item('Ingredients'));
    expect(selected()).toEqual(['Ingredients']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Scan ingredients',
    );
  });

  it('moves one mode with the arrow keys and stops at the ends', async () => {
    renderScan();
    await userEvent.keyboard('{ArrowRight}');
    expect(selected()).toEqual(['Product']);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(selected()).toEqual(['Plate']);
    await userEvent.keyboard('{ArrowRight}');
    expect(selected()).toEqual(['Plate']);
    await userEvent.keyboard('{ArrowLeft}');
    expect(selected()).toEqual(['Ingredients']);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(selected()).toEqual(['Receipt']);
  });

  it('announces the new mode when it changes', async () => {
    renderScan();
    await userEvent.click(item('Plate'));
    const announced = screen
      .getAllByRole('status')
      .map((region) => region.textContent);
    expect(announced.some((text) => text?.includes('Plate'))).toBe(true);
  });

  it('gives the light haptic on a change, not on mount', async () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });
    try {
      renderScan();
      expect(vibrate).not.toHaveBeenCalled();
      await userEvent.click(item('Product'));
      expect(vibrate).toHaveBeenCalledTimes(1);
    } finally {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
  });

  it('works when the browser has no vibration support', async () => {
    renderScan();
    await act(() => userEvent.click(item('Product')));
    expect(selected()).toEqual(['Product']);
  });

  it('restores the last-used mode on the next visit', async () => {
    const first = renderScan();
    await userEvent.click(item('Plate'));
    first.unmount();
    renderScan();
    expect(selected()).toEqual(['Plate']);
  });

  it('lets ?mode= override the last-used mode', async () => {
    const first = renderScan();
    await userEvent.click(item('Plate'));
    first.unmount();
    renderScan('/scan?mode=product');
    expect(selected()).toEqual(['Product']);
  });

  it('ignores an unknown stored mode and falls back to Receipt', () => {
    localStorage.setItem('pocket-pantry.scan-mode', 'barcode');
    renderScan();
    expect(selected()).toEqual(['Receipt']);
  });
});
