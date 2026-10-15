import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwipeToggle } from './SwipeToggle';

function renderToggle(
  props: { disabled?: boolean; label?: string } = {},
  onClick = vi.fn(),
) {
  const onToggle = vi.fn();
  const view = render(
    <SwipeToggle
      label={props.label ?? 'Running low'}
      onToggle={onToggle}
      disabled={props.disabled}
    >
      <button type="button" onClick={onClick}>
        Milk
      </button>
    </SwipeToggle>,
  );
  const content = () =>
    view.container.querySelector<HTMLElement>('[data-swipe-toggle-content]')!;
  const tab = () =>
    view.container.querySelector<HTMLElement>('[data-swipe-toggle-tab]')!;
  const band = () =>
    view.container.querySelector<HTMLElement>('[data-swipe-toggle-band]')!;
  /** Press on the button at x=300 and drag to `300 + dx`. */
  const drag = (dx: number) => {
    const target = screen.getByRole('button', { name: 'Milk' });
    fireEvent.pointerDown(target, { pointerId: 1, clientX: 300, clientY: 0 });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      clientX: 300 + dx,
      clientY: 0,
    });
  };
  const release = (dx: number) =>
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Milk' }), {
      pointerId: 1,
      clientX: 300 + dx,
      clientY: 0,
    });
  return { view, onToggle, onClick, content, tab, band, drag, release };
}

function stubReducedMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

describe('SwipeToggle', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('has nothing behind the row at rest', () => {
    const { band } = renderToggle();
    expect(band()).toBeNull();
  });

  it('shows the caller label on a tab hidden from assistive technology while dragging', () => {
    const { tab, drag } = renderToggle({ label: 'Not low' });
    drag(-30);
    expect(tab().textContent).toBe('Not low');
    expect(tab().closest('[aria-hidden="true"]')).not.toBeNull();
    expect(tab().querySelector('svg')).not.toBeNull();
  });

  it('follows the finger, then toggles once on a release inside the zone and springs back', () => {
    const { onToggle, content, drag, release } = renderToggle();
    drag(-100);
    expect(content().style.transform).toBe('translateX(-100px)');
    release(-100);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(content().style.transform).toBe('translateX(0px)');
  });

  it('keeps the band through the 300 ms spring back, then removes it', () => {
    vi.useFakeTimers();
    const { band, drag, release } = renderToggle();
    drag(-60);
    release(-60);
    expect(band()).not.toBeNull();
    act(() => vi.advanceTimersByTime(300));
    expect(band()).toBeNull();
  });

  it('does not toggle on a release short of the zone', () => {
    const { onToggle, drag, release } = renderToggle();
    drag(-80);
    release(-80);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('dims the row content and fills the band in the zone', () => {
    const { content, band, drag } = renderToggle();
    drag(-50);
    const dimmed = () =>
      content().querySelector<HTMLElement>('[data-swipe-toggle-dim]')!;
    expect(getComputedStyle(dimmed()).opacity).toBe('1');
    expect(Number(getComputedStyle(band()).opacity)).toBeCloseTo(
      0.35 + 0.65 * (50 / 92),
    );
    fireEvent.pointerMove(screen.getByRole('button', { name: 'Milk' }), {
      pointerId: 1,
      clientX: 200,
      clientY: 0,
    });
    expect(getComputedStyle(dimmed()).opacity).toBe('0.7');
    expect(getComputedStyle(band()).opacity).toBe('1');
  });

  it('buzzes 10 ms entering the zone and 14 ms on a release in it', () => {
    const buzz = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: buzz,
      configurable: true,
    });
    const { drag, release } = renderToggle();
    drag(-100);
    expect(buzz).toHaveBeenLastCalledWith(10);
    release(-100);
    expect(buzz).toHaveBeenLastCalledWith(14);
  });

  it('swallows the click that follows a drag, and lets a plain tap through', () => {
    const { onClick, drag, release } = renderToggle();
    drag(-40);
    release(-40);
    fireEvent.click(screen.getByRole('button', { name: 'Milk' }));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Milk' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does nothing while disabled', () => {
    const { onToggle, content, drag, release } = renderToggle({
      disabled: true,
    });
    drag(-120);
    expect(content().style.transform).toBe('translateX(0px)');
    release(-120);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('springs back with the overshoot curve, and not at all under reduce-motion', () => {
    const { content } = renderToggle();
    expect(getComputedStyle(content()).transition).toContain(
      'transform 300ms cubic-bezier(.25,1.35,.45,1)',
    );
    cleanup();

    stubReducedMotion();
    const reduced = renderToggle();
    expect(getComputedStyle(reduced.content()).transition).toBe('none');
    reduced.drag(-100);
    // Band and tab still show.
    expect(getComputedStyle(reduced.band()).opacity).toBe('1');
    expect(reduced.tab().textContent).toBe('Running low');
    // No spring, so nothing to wait for.
    reduced.release(-100);
    expect(reduced.band()).toBeNull();
  });
});
