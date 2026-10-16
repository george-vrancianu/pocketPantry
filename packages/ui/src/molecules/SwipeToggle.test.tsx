import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { color } from '../theme/themeVars';
import { SwipeToggle } from './SwipeToggle';

function renderToggle(
  props: { disabled?: boolean; label?: string; on?: boolean } = {},
  onClick = vi.fn(),
) {
  const onToggle = vi.fn();
  const view = render(
    <SwipeToggle
      label={props.label ?? 'Running low'}
      onToggle={onToggle}
      disabled={props.disabled}
      on={props.on ?? false}
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
  const tint = () =>
    view.container.querySelector<HTMLElement>('[data-swipe-toggle-tint]');
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
  return {
    view,
    onToggle,
    onClick,
    content,
    tab,
    tint,
    band,
    drag,
    release,
  };
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

  describe('the Running low sweep', () => {
    type Sweep = { on: boolean; id: number } | null;
    function renderSweep(initialOn: boolean) {
      const view = render(<Toggle on={initialOn} sweep={null} />);
      const rerender = (on: boolean, sweep: Sweep) =>
        view.rerender(<Toggle on={on} sweep={sweep} />);
      const tint = () =>
        view.container.querySelector<HTMLElement>('[data-swipe-toggle-tint]');
      const wipe = () =>
        view.container.querySelector('[data-swipe-toggle-wipe]');
      return { view, rerender, tint, wipe };
    }
    function Toggle({ on, sweep }: { on: boolean; sweep: Sweep }) {
      return (
        <SwipeToggle
          label="Running low"
          onToggle={() => {}}
          on={on}
          sweep={sweep}
        >
          <button type="button">Milk</button>
        </SwipeToggle>
      );
    }
    const request = (on: boolean) => ({ on, id: Date.now() });

    it('plays the on sweep for a matching request, then leaves the tint at rest', () => {
      vi.useFakeTimers();
      const { rerender, tint } = renderSweep(false);
      rerender(true, request(true));
      expect(tint()!.getAttribute('data-sweep')).toBe('on');
      act(() => void vi.advanceTimersByTime(449));
      expect(tint()!.getAttribute('data-sweep')).toBe('on');
      act(() => void vi.advanceTimersByTime(2));
      expect(tint()!.hasAttribute('data-sweep')).toBe(false);
      expect(tint()).not.toBeNull();
    });

    it('plays the off wipe in the card colour, keeping the tint drawn until it ends', () => {
      vi.useFakeTimers();
      const { rerender, tint, wipe } = renderSweep(true);
      rerender(false, request(false));
      expect(tint()!.getAttribute('data-sweep')).toBe('off');
      expect(tint()!.querySelector('[data-swipe-toggle-rail]')).not.toBeNull();
      expect(tint()!.querySelector('[data-swipe-toggle-glow]')).not.toBeNull();
      expect(wipe()).not.toBeNull();
      const classes = wipe()!.className.split(' ');
      const css = Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .map((rule) => rule.cssText)
        .filter((text) => classes.some((c) => text.includes(`.${c}`)))
        .join('\n');
      expect(css).toContain(color.cardBg);
      expect(css).not.toMatch(/white|#fff/i);
      act(() => void vi.advanceTimersByTime(499));
      expect(tint()).not.toBeNull();
      act(() => void vi.advanceTimersByTime(2));
      expect(tint()).toBeNull();
    });

    it.each([
      ['no request', null, false],
      [
        'a request for the other direction',
        { on: false, id: Date.now() },
        false,
      ],
      ['a request older than 3 s', { on: true, id: Date.now() - 3000 }, false],
    ] as const)('snaps with %s', (_name, sweep, _unused) => {
      const { rerender, tint } = renderSweep(false);
      rerender(true, sweep as Sweep);
      expect(tint()).not.toBeNull();
      expect(tint()!.hasAttribute('data-sweep')).toBe(false);
    });

    it('uses a request up on the first change, so a later change snaps', () => {
      vi.useFakeTimers();
      const { rerender, tint } = renderSweep(false);
      const sweep = request(true);
      rerender(true, sweep);
      expect(tint()!.getAttribute('data-sweep')).toBe('on');
      rerender(false, sweep);
      act(() => void vi.advanceTimersByTime(10));
      expect(tint()).toBeNull();
      rerender(true, sweep);
      expect(tint()!.hasAttribute('data-sweep')).toBe(false);
    });

    it('does not let a stale request animate a later unrelated change', () => {
      vi.useFakeTimers();
      const { rerender, tint } = renderSweep(false);
      const sweep = request(false); // wrong direction: used up, snaps
      rerender(true, sweep);
      expect(tint()!.hasAttribute('data-sweep')).toBe(false);
      act(() => void vi.advanceTimersByTime(1000));
      rerender(false, { on: false, id: sweep.id });
      expect(tint()).toBeNull();
    });

    it('snaps under reduced motion', () => {
      stubReducedMotion();
      const { rerender, tint } = renderSweep(false);
      rerender(true, request(true));
      expect(tint()!.hasAttribute('data-sweep')).toBe(false);
      rerender(false, request(false));
      expect(tint()).toBeNull();
    });

    it('restarts at the new phase when the flag changes mid-sweep', () => {
      vi.useFakeTimers();
      const { rerender, tint, wipe } = renderSweep(false);
      rerender(true, request(true));
      act(() => void vi.advanceTimersByTime(100));
      rerender(false, request(false));
      expect(tint()!.getAttribute('data-sweep')).toBe('off');
      expect(wipe()).not.toBeNull();
      // The cancelled on sweep's timer must not end the wipe early.
      act(() => void vi.advanceTimersByTime(400));
      expect(tint()!.getAttribute('data-sweep')).toBe('off');
    });

    it('goes idle when the flag changes mid-sweep and the change snaps', () => {
      vi.useFakeTimers();
      const { rerender, tint } = renderSweep(false);
      rerender(true, request(true));
      act(() => void vi.advanceTimersByTime(100));
      rerender(false, null);
      expect(tint()).toBeNull();
    });

    it('cancels its timer on unmount', () => {
      vi.useFakeTimers();
      const { rerender, view } = renderSweep(false);
      rerender(true, request(true));
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('the Running low tint', () => {
    it('shows the rail and glow while on, hidden from assistive technology', () => {
      const { tint, content } = renderToggle({ on: true });
      expect(tint()).not.toBeNull();
      expect(tint()!.getAttribute('aria-hidden')).toBe('true');
      expect(tint()!.querySelector('[data-swipe-toggle-rail]')).not.toBeNull();
      expect(tint()!.querySelector('[data-swipe-toggle-glow]')).not.toBeNull();
      expect(content().contains(tint())).toBe(true);
    });

    it('shows nothing while off', () => {
      const { tint } = renderToggle({ on: false });
      expect(tint()).toBeNull();
    });

    it('snaps in and out when the flag changes', () => {
      const { view, tint } = renderToggle({ on: false });
      const rerender = (on: boolean) =>
        view.rerender(
          <SwipeToggle label="Running low" onToggle={() => {}} on={on}>
            <button type="button">Milk</button>
          </SwipeToggle>,
        );
      rerender(true);
      expect(tint()).not.toBeNull();
      rerender(false);
      expect(tint()).toBeNull();
    });

    it('moves with the row while dragging, with the band behind it', () => {
      const { tint, content, band, drag } = renderToggle({ on: true });
      drag(-60);
      expect(content().contains(tint())).toBe(true);
      expect(content().style.transform).toBe('translateX(-60px)');
      expect(band()).not.toBeNull();
      // The tint sits before the row's content, so the content draws over it.
      const dim = content().querySelector('[data-swipe-toggle-dim]')!;
      expect(
        tint()!.compareDocumentPosition(dim) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('does not block taps or swipes', () => {
      const { tint, onClick, onToggle, drag, release } = renderToggle({
        on: true,
      });
      expect(getComputedStyle(tint()!).pointerEvents).toBe('none');
      fireEvent.click(screen.getByRole('button', { name: 'Milk' }));
      expect(onClick).toHaveBeenCalledTimes(1);
      drag(-100);
      release(-100);
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
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
