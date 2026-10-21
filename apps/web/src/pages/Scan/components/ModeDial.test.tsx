import { act, fireEvent, screen, within } from '@testing-library/react';
import { useEffect, useState } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeDial } from './ModeDial';
import { renderWithProviders } from '../../../test/render';

const renderDial = (
  modes: Parameters<typeof ModeDial>[0]['modes'],
  mode: Parameters<typeof ModeDial>[0]['mode'],
  onChange = vi.fn(),
) => {
  renderWithProviders(
    <ModeDial
      modes={modes}
      mode={mode}
      disabled={false}
      keysDisabled={false}
      dragEndedAt={{ current: null }}
      onChange={onChange}
      onScan={() => {}}
      scanDisabled={false}
    />,
  );
  return onChange;
};

describe('ModeDial with a configured mode list', () => {
  it('lists only the given modes, in the given order', () => {
    renderDial(['product', 'receipt'], 'product');
    const dial = screen.getByRole('radiogroup', { name: 'Scan mode' });
    expect(
      within(dial)
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label')),
    ).toEqual(['Product', 'Receipt']);
  });

  it('steps through the given list with the arrow keys and stops at its ends', async () => {
    const onChange = renderDial(['product', 'receipt'], 'product');
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('receipt');
    onChange.mockClear();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not step past the last mode', async () => {
    const onChange = renderDial(['product', 'receipt'], 'receipt');
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is not rendered when only one mode is allowed', () => {
    renderDial(['product'], 'product');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});

describe('ModeDial Scan gestures on the current mode', () => {
  let now = 0;
  const vibrate = vi.fn(() => true);
  const onScan = vi.fn();
  const onChange = vi.fn();
  const pass = { done: Promise.resolve(), cancel: vi.fn() };
  const focusForScan = vi.fn(() => pass);
  let release: () => void;
  let dragEndedAt: { current: number | null };

  const renderGestureDial = (
    props: Partial<Parameters<typeof ModeDial>[0]> = {},
  ) =>
    renderWithProviders(
      <ModeDial
        modes={['product', 'receipt', 'barcode']}
        mode="product"
        disabled={false}
        keysDisabled={false}
        dragEndedAt={dragEndedAt}
        onChange={onChange}
        onScan={onScan}
        scanDisabled={false}
        focusForScan={focusForScan}
        {...props}
      />,
    );

  const current = () => screen.getByRole('radio', { name: 'Product' });
  const base = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
  };
  const down = (target: Element = current(), x = 100, y = 100) =>
    fireEvent.pointerDown(target, { ...base, clientX: x, clientY: y });
  const move = (x: number, y = 100, target: Element = current()) =>
    fireEvent.pointerMove(target, { ...base, clientX: x, clientY: y });
  const up = (x = 100, y = 100, target: Element = current()) =>
    fireEvent.pointerUp(target, { ...base, clientX: x, clientY: y });
  const tap = (after = 0, x = 100) => {
    now += after;
    down(current(), x);
    up(x);
  };
  const advance = (ms: number) =>
    act(() => {
      now += ms;
      vi.advanceTimersByTime(ms);
    });
  const flush = () => act(async () => {});
  const fill = () => screen.queryByTestId('mode-dial-hold');

  beforeEach(() => {
    now = 1000;
    dragEndedAt = { current: null };
    pass.done = new Promise<void>((resolve) => (release = resolve));
    vi.clearAllMocks();
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
    vi.restoreAllMocks();
  });

  describe('double tap', () => {
    it('scans on the second tap within 320 ms and 60 px, without delaying the first', () => {
      renderGestureDial();
      tap();
      expect(onScan).not.toHaveBeenCalled();
      tap(200, 130);
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it('does not scan when the second tap is late or far', () => {
      renderGestureDial();
      tap();
      tap(321);
      tap(100, 200);
      expect(onScan).not.toHaveBeenCalled();
    });

    it('ignores a tap within 320 ms of a dial drag ending', () => {
      renderGestureDial();
      tap();
      dragEndedAt.current = now + 50;
      now += 100;
      tap(0);
      expect(onScan).not.toHaveBeenCalled();
    });

    it('does nothing in Barcode Lookup, or when a Scan cannot start', () => {
      const { unmount } = renderGestureDial({ mode: 'barcode' });
      const barcode = screen.getByRole('radio', { name: 'Barcode' });
      for (let i = 0; i < 2; i++) {
        down(barcode);
        up(100, 100, barcode);
      }
      unmount();
      renderGestureDial({ scanDisabled: true });
      tap();
      tap(100);
      expect(onScan).not.toHaveBeenCalled();
    });
  });

  describe('hold', () => {
    it('after 300 ms ticks 6 ms and fills the ring, then scans once on release', async () => {
      renderGestureDial();
      down();
      await advance(299);
      expect(fill()).toBeNull();
      expect(vibrate).not.toHaveBeenCalled();
      await advance(2);
      expect(fill()).toBeInTheDocument();
      expect(vibrate).toHaveBeenCalledWith(6);
      expect(focusForScan).toHaveBeenCalledTimes(1);
      up();
      release();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(fill()).toBeNull();
    });

    it('waits for focus before scanning when released during focusing', async () => {
      renderGestureDial();
      down();
      await advance(301);
      up();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
      release();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it('scans straight away when focus already finished while holding', async () => {
      renderGestureDial();
      down();
      await advance(301);
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
      up();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it('is an ordinary tap when released before 300 ms', async () => {
      renderGestureDial();
      down();
      await advance(200);
      up();
      await advance(500);
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
      expect(vibrate).not.toHaveBeenCalled();
      expect(focusForScan).not.toHaveBeenCalled();
    });

    it('tolerates up to 10 px of drift, and a hold release is not a double-tap tap', async () => {
      renderGestureDial();
      down();
      move(108, 104);
      await advance(301);
      expect(fill()).toBeInTheDocument();
      up(108, 104);
      release();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
      tap(50);
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it('becomes a dial drag when moved more than 10 px before 300 ms, and sends no Scan', async () => {
      renderGestureDial();
      down();
      move(80);
      move(40);
      await advance(500);
      up(40);
      release();
      await flush();
      expect(fill()).toBeNull();
      expect(focusForScan).not.toHaveBeenCalled();
      expect(onScan).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('receipt');
    });

    it('moving more than 10 px after the hold started cancels: no Scan, no drag, focus put back', async () => {
      renderGestureDial();
      down();
      await advance(301);
      move(60);
      move(20);
      expect(fill()).toBeNull();
      expect(pass.cancel).toHaveBeenCalledTimes(1);
      up(20);
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('sliding off the item after the hold started cancels', async () => {
      renderGestureDial();
      down();
      await advance(301);
      fireEvent.pointerLeave(current(), { ...base });
      expect(pass.cancel).toHaveBeenCalledTimes(1);
      up();
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
    });

    it('does not start the hold when the Scan became impossible during the 300 ms', async () => {
      let setOff: (off: boolean) => void = () => {};
      function Harness() {
        const [off, set] = useState(false);
        useEffect(() => {
          setOff = set;
        }, [set]);
        return (
          <ModeDial
            modes={['product', 'receipt', 'barcode']}
            mode="product"
            disabled={false}
            keysDisabled={false}
            dragEndedAt={dragEndedAt}
            onChange={onChange}
            onScan={onScan}
            scanDisabled={off}
            focusForScan={focusForScan}
          />
        );
      }
      renderWithProviders(<Harness />);
      down();
      await advance(100);
      act(() => setOff(true));
      await advance(300);
      expect(fill()).toBeNull();
      expect(vibrate).not.toHaveBeenCalled();
      expect(focusForScan).not.toHaveBeenCalled();
      up();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
    });

    it('does not send the delayed Scan if it became impossible while waiting for focus', async () => {
      let setOff: (off: boolean) => void = () => {};
      function Harness() {
        const [off, set] = useState(false);
        useEffect(() => {
          setOff = set;
        }, [set]);
        return (
          <ModeDial
            modes={['product', 'receipt', 'barcode']}
            mode="product"
            disabled={false}
            keysDisabled={false}
            dragEndedAt={dragEndedAt}
            onChange={onChange}
            onScan={onScan}
            scanDisabled={off}
            focusForScan={focusForScan}
          />
        );
      }
      renderWithProviders(<Harness />);
      down();
      await advance(301);
      up();
      act(() => setOff(true));
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
    });

    it('sliding off while the hold is still pending drops it', async () => {
      renderGestureDial();
      down();
      fireEvent.pointerLeave(current(), { ...base });
      await advance(500);
      expect(fill()).toBeNull();
      expect(focusForScan).not.toHaveBeenCalled();
    });

    it('ignores a double tap and a new hold while the released hold waits for focus', async () => {
      renderGestureDial();
      down();
      await advance(301);
      up();
      tap(100);
      tap(100);
      down();
      await advance(301);
      expect(focusForScan).toHaveBeenCalledTimes(1);
      up();
      expect(onScan).not.toHaveBeenCalled();
      release();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it("a finished hold's Scan does not hide the ring of a newer hold", async () => {
      renderGestureDial();
      down();
      await advance(301);
      up();
      release();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
      down();
      await advance(301);
      expect(fill()).toBeInTheDocument();
    });

    it('a pointer cancel cancels the hold', async () => {
      renderGestureDial();
      down();
      await advance(301);
      fireEvent.pointerCancel(current(), { ...base });
      release();
      await flush();
      expect(pass.cancel).toHaveBeenCalledTimes(1);
      expect(onScan).not.toHaveBeenCalled();
    });

    it('cancels a pending focus when it unmounts mid-hold', async () => {
      const { unmount } = renderGestureDial();
      down();
      await advance(301);
      unmount();
      expect(pass.cancel).toHaveBeenCalled();
      release();
      await flush();
      expect(onScan).not.toHaveBeenCalled();
    });

    it('does not arm on another mode, in Barcode Lookup, or when a Scan cannot start', async () => {
      const { unmount } = renderGestureDial({ scanDisabled: true });
      down();
      await advance(500);
      up();
      expect(fill()).toBeNull();
      unmount();
      renderGestureDial({ mode: 'barcode' });
      const barcode = screen.getByRole('radio', { name: 'Barcode' });
      down(barcode);
      await advance(500);
      up(100, 100, barcode);
      renderGestureDial();
      down(screen.getAllByRole('radio', { name: 'Receipt' })[0]);
      await advance(500);
      expect(fill()).toBeNull();
      expect(vibrate).not.toHaveBeenCalled();
      expect(onScan).not.toHaveBeenCalled();
    });

    it('scans after a release even with no focus support wired in', async () => {
      renderGestureDial({ focusForScan: undefined });
      down();
      await advance(301);
      up();
      await flush();
      expect(onScan).toHaveBeenCalledTimes(1);
    });
  });
});
