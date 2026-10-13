import { act, renderHook } from '@testing-library/react';
import type { PointerEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  swipeOffset,
  swipeZone,
  useRowGestures,
  type RowGestureOptions,
} from './useRowGestures';

const WIDTH = 350; // the 390 pt reference; delete line 350 * 2/3 * 0.985 = 229.8

function pointer(x: number, y = 0, id = 1) {
  const target = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    getBoundingClientRect: () => ({ width: WIDTH }),
  };
  return {
    pointerId: id,
    clientX: x,
    clientY: y,
    button: 0,
    isPrimary: true,
    currentTarget: target,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as PointerEvent<HTMLElement> & {
    currentTarget: typeof target;
    preventDefault: ReturnType<typeof vi.fn>;
    stopPropagation: ReturnType<typeof vi.fn>;
  };
}

function setup(options: Partial<RowGestureOptions> = {}) {
  const onAsk = vi.fn();
  const onDelete = vi.fn();
  const view = renderHook(() =>
    useRowGestures({ onAsk, onDelete, ...options }),
  );
  const bind = () => view.result.current.bind;
  /** Press at x=300, then move to `300 + dx`. */
  const drag = (dx: number, dy = 0) => {
    act(() => bind().onPointerDown(pointer(300, 0)));
    act(() => bind().onPointerMove(pointer(300 + dx, dy)));
  };
  const release = (dx: number) =>
    act(() => bind().onPointerUp(pointer(300 + dx)));
  return { view, bind, drag, release, onAsk, onDelete };
}

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, 'vibrate');
});

describe('swipe maths', () => {
  it('follows the finger up to the delete line, then at 0.4', () => {
    expect(swipeOffset(-50, WIDTH)).toBe(-50);
    const line = (WIDTH * 2) / 3;
    expect(swipeOffset(-(line * 0.985) - 100, WIDTH)).toBeCloseTo(
      -(line * 0.985) - 40,
    );
  });

  it('rubber-bands a right drag at 0.25', () => {
    expect(swipeOffset(100, WIDTH)).toBe(25);
  });

  it('picks the zone from the drag distance', () => {
    expect(swipeZone(-91.9, WIDTH)).toBe(0);
    expect(swipeZone(-92, WIDTH)).toBe(1);
    expect(swipeZone(-229, WIDTH)).toBe(1);
    expect(swipeZone(-230, WIDTH)).toBe(2);
    expect(swipeZone(40, WIDTH)).toBe(0);
  });
});

describe('useRowGestures', () => {
  it('does not start a drag within 8 pt, or when the move is vertical', () => {
    const { view, drag } = setup();
    drag(-8);
    expect(view.result.current.dragging).toBe(false);
    expect(view.result.current.x).toBe(0);

    drag(-20, 30);
    expect(view.result.current.dragging).toBe(false);
  });

  it('starts at more than 8 pt of mostly horizontal movement and captures the pointer', () => {
    const { view, bind } = setup();
    act(() => bind().onPointerDown(pointer(300)));
    const move = pointer(280, 5);
    act(() => bind().onPointerMove(move));
    expect(view.result.current.dragging).toBe(true);
    expect(view.result.current.x).toBe(-20);
    expect(move.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('does not capture the pointer before the threshold, so taps reach children', () => {
    const { bind } = setup();
    act(() => bind().onPointerDown(pointer(300)));
    const move = pointer(296);
    act(() => bind().onPointerMove(move));
    expect(move.currentTarget.setPointerCapture).not.toHaveBeenCalled();
  });

  it('springs back and does nothing when released in zone 0', () => {
    const { view, drag, release, onAsk, onDelete } = setup();
    drag(-60);
    expect(view.result.current.zone).toBe(0);
    release(-60);
    expect(view.result.current.x).toBe(0);
    expect(view.result.current.dragging).toBe(false);
    expect(onAsk).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('asks when released in zone 1 and returns to rest', () => {
    const { view, drag, release, onAsk, onDelete } = setup();
    drag(-120);
    expect(view.result.current.zone).toBe(1);
    release(-120);
    expect(onAsk).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
    expect(view.result.current.x).toBe(0);
  });

  it('deletes when released in zone 2', () => {
    const { view, drag, release, onAsk, onDelete } = setup();
    drag(-260);
    expect(view.result.current.zone).toBe(2);
    release(-260);
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onAsk).not.toHaveBeenCalled();
    expect(view.result.current.dragging).toBe(false);
  });

  it('recomputes the zone when the finger moves back', () => {
    const { view, bind, drag, release, onAsk, onDelete } = setup();
    drag(-260);
    act(() => bind().onPointerMove(pointer(300 - 120)));
    expect(view.result.current.zone).toBe(1);
    release(-120);
    expect(onAsk).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('rubber-bands a right drag and does nothing on release', () => {
    const { view, drag, release, onAsk, onDelete } = setup();
    drag(100);
    expect(view.result.current.x).toBe(25);
    release(100);
    expect(view.result.current.x).toBe(0);
    expect(onAsk).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('springs back on pointercancel, even in zone 2', () => {
    const { view, bind, drag, onAsk, onDelete } = setup();
    drag(-260);
    act(() => bind().onPointerCancel(pointer(40)));
    expect(view.result.current.x).toBe(0);
    expect(view.result.current.dragging).toBe(false);
    expect(onAsk).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('ignores another pointer while dragging', () => {
    const { view, bind, drag } = setup();
    drag(-30);
    act(() => bind().onPointerMove(pointer(100, 0, 2)));
    expect(view.result.current.x).toBe(-30);
  });

  it('ignores pointers while disabled', () => {
    const { view, drag } = setup({ disabled: true });
    drag(-120);
    expect(view.result.current.dragging).toBe(false);
  });

  it('swallows the click after a drag, once', () => {
    const { bind, drag, release } = setup();
    drag(-60);
    release(-60);
    const first = pointer(0);
    bind().onClickCapture(first);
    expect(first.preventDefault).toHaveBeenCalled();
    expect(first.stopPropagation).toHaveBeenCalled();
    const second = pointer(0);
    bind().onClickCapture(second);
    expect(second.stopPropagation).not.toHaveBeenCalled();
  });

  it('lets a plain tap click through', () => {
    const { bind } = setup();
    act(() => bind().onPointerDown(pointer(300)));
    act(() => bind().onPointerUp(pointer(300)));
    const click = pointer(300);
    bind().onClickCapture(click);
    expect(click.stopPropagation).not.toHaveBeenCalled();
  });

  it('suppresses the context menu', () => {
    const { bind } = setup();
    const event = pointer(0);
    bind().onContextMenu(event as never);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('vibrates lightly in zone 1, firmer in zone 2, and again on the fly-off', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });
    const { bind, drag, release } = setup();
    drag(-100);
    expect(vibrate).toHaveBeenLastCalledWith(10);
    act(() => bind().onPointerMove(pointer(300 - 260)));
    expect(vibrate).toHaveBeenLastCalledWith([14, 40, 22]);
    release(-260);
    expect(vibrate).toHaveBeenLastCalledWith([10, 30, 30]);
  });
});
