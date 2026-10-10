import { act, fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { ScanPage } from './ScanPage';

vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
  }),
}));

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
    .map((radio) => radio.getAttribute('aria-label'));

let now = 0;
beforeEach(() => {
  localStorage.clear();
  now = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
});
afterEach(() => vi.restoreAllMocks());

/** Pointer drag on the dial: down at (0,0), move to (dx,dy), release after `ms`. */
function drag(
  target: Element,
  {
    dx,
    dy = 0,
    ms = 600,
    release = true,
    pointerType = 'touch',
  }: {
    dx: number;
    dy?: number;
    ms?: number;
    release?: boolean;
    pointerType?: string;
  },
) {
  const base = {
    pointerId: 1,
    pointerType,
    isPrimary: true,
    button: 0,
  };
  fireEvent.pointerDown(target, { ...base, clientX: 200, clientY: 500 });
  now += ms / 2;
  fireEvent.pointerMove(target, {
    ...base,
    clientX: 200 + dx / 2,
    clientY: 500 + dy / 2,
  });
  now += ms / 2;
  fireEvent.pointerMove(target, {
    ...base,
    clientX: 200 + dx,
    clientY: 500 + dy,
  });
  if (release)
    fireEvent.pointerUp(target, {
      ...base,
      clientX: 200 + dx,
      clientY: 500 + dy,
    });
}

describe('Scan mode dial gestures', () => {
  it('a slow horizontal drag of more than half an item moves to the next mode', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -50 });
    expect(selected()).toEqual(['Ingredients']);
  });

  it('dragging right moves to the previous mode', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: 120 });
    expect(selected()).toEqual(['Receipt']);
  });

  it('a short slow drag snaps back to the same mode', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -30 });
    expect(selected()).toEqual(['Product']);
  });

  it('a quick short flick advances exactly one step', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -20, ms: 20 });
    expect(selected()).toEqual(['Ingredients']);
  });

  it('a vertical drag does not change mode', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -8, dy: 120 });
    expect(selected()).toEqual(['Product']);
  });

  it('under 10 pt of movement is not a drag', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -9, ms: 20 });
    expect(selected()).toEqual(['Product']);
  });

  it('dragging past the last item stays on the last item', () => {
    renderScan('/scan?mode=plate');
    drag(item('Plate'), { dx: -300 });
    expect(selected()).toEqual(['Plate']);
  });

  it('dragging past the first item stays on the first item', () => {
    renderScan('/scan?mode=receipt');
    drag(item('Receipt'), { dx: 300 });
    expect(selected()).toEqual(['Receipt']);
  });

  it('moves the strip one to one with the finger while dragging', () => {
    renderScan('/scan?mode=product');
    // Product is index 1: resting offset is -(42 + 84) px.
    expect(dial()).toHaveStyle({ transform: 'translateX(-126px)' });
    drag(item('Product'), { dx: -40, release: false });
    expect(dial()).toHaveStyle({ transform: 'translateX(-166px)' });
  });

  it('rubber-bands past the first item at 35 % of the finger', () => {
    renderScan('/scan?mode=receipt');
    drag(item('Receipt'), { dx: 100, release: false });
    // rest -42, finger +100 -> strip +35
    expect(dial()).toHaveStyle({ transform: 'translateX(-7px)' });
  });

  it('ignores the click that follows a drag', async () => {
    renderScan('/scan?mode=product');
    // The drag ends on Receipt (the browser then fires a click on the pressed icon).
    drag(item('Product'), { dx: 120 });
    expect(selected()).toEqual(['Receipt']);
    fireEvent.click(item('Plate'));
    expect(selected()).toEqual(['Receipt']);
  });

  it('selects by tap again once the drag is over', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      renderScan('/scan?mode=product');
      drag(item('Product'), { dx: 120 });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.click(item('Plate'));
      expect(selected()).toEqual(['Plate']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a pointer cancel snaps back and changes nothing', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -100, release: false });
    fireEvent.pointerCancel(item('Product'), { pointerId: 1 });
    expect(selected()).toEqual(['Product']);
    expect(dial()).toHaveStyle({ transform: 'translateX(-126px)' });
  });

  it('works with a mouse pointer', () => {
    renderScan('/scan?mode=product');
    drag(item('Product'), { dx: -50, pointerType: 'mouse' });
    expect(selected()).toEqual(['Ingredients']);
  });

  it('ignores a second pointer: it neither moves the strip nor ends the drag', () => {
    renderScan('/scan?mode=product');
    const radio = item('Product');
    const first = {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
    };
    const second = {
      pointerId: 2,
      pointerType: 'touch',
      isPrimary: false,
      button: 0,
    };
    fireEvent.pointerDown(radio, { ...first, clientX: 200, clientY: 500 });
    now += 300;
    fireEvent.pointerMove(radio, { ...first, clientX: 150, clientY: 500 });
    expect(dial()).toHaveStyle({ transform: 'translateX(-176px)' });
    fireEvent.pointerDown(radio, { ...second, clientX: 300, clientY: 500 });
    fireEvent.pointerMove(radio, { ...second, clientX: 0, clientY: 500 });
    expect(dial()).toHaveStyle({ transform: 'translateX(-176px)' });
    fireEvent.pointerUp(radio, { ...second, clientX: 0, clientY: 500 });
    expect(selected()).toEqual(['Product']);
    // the first finger is still dragging and decides the release
    now += 300;
    fireEvent.pointerUp(radio, { ...first, clientX: 150, clientY: 500 });
    expect(selected()).toEqual(['Ingredients']);
  });

  it('keeps the strip and the release target relative to where the drag began when the mode changes mid-drag', () => {
    renderScan('/scan?mode=product');
    const radio = item('Product');
    const mouse = {
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
    };
    fireEvent.pointerDown(radio, { ...mouse, clientX: 200, clientY: 500 });
    now += 600;
    fireEvent.pointerMove(radio, { ...mouse, clientX: 180, clientY: 500 });
    expect(dial()).toHaveStyle({ transform: 'translateX(-146px)' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(selected()).toEqual(['Ingredients']);
    expect(dial()).toHaveStyle({ transform: 'translateX(-146px)' });
    fireEvent.pointerUp(radio, { ...mouse, clientX: 180, clientY: 500 });
    // 20 px from where the drag began snaps back to where it began
    expect(selected()).toEqual(['Product']);
  });

  it('does not start a drag while the dial is disabled', () => {
    renderScan('/scan?mode=product');
    fireEvent.click(screen.getByRole('button', { name: 'How scanning works' }));
    drag(dial(), { dx: -150 });
    expect(selected()).toEqual(['Product']);
  });

  it('does not change mode on release if the dial became disabled mid-drag', () => {
    renderScan('/scan?mode=product');
    const radio = item('Product');
    const touch = {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
    };
    fireEvent.pointerDown(radio, { ...touch, clientX: 200, clientY: 500 });
    now += 600;
    fireEvent.pointerMove(radio, { ...touch, clientX: 120, clientY: 500 });
    fireEvent.click(screen.getByRole('button', { name: 'How scanning works' }));
    fireEvent.pointerUp(radio, { ...touch, clientX: 120, clientY: 500 });
    expect(selected()).toEqual(['Product']);
  });
});
