import { afterEach, describe, expect, it, vi } from 'vitest';
import { keepScreenAwake } from './wakeLock';

type Sentinel = { released?: boolean; release(): Promise<void> };

const fakeWakeLock = (request: () => Promise<Sentinel>) =>
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: { request },
  });

describe('keepScreenAwake', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: undefined,
    });
  });

  it('requests a screen lock and releases it once', async () => {
    const release = vi.fn(() => Promise.resolve());
    const request = vi.fn(() => Promise.resolve({ release }));
    fakeWakeLock(request);
    const letSleep = keepScreenAwake();
    await Promise.resolve();
    letSleep();
    letSleep();
    expect(request).toHaveBeenCalledWith('screen');
    expect(release).toHaveBeenCalledOnce();
  });

  it('releases a lock the browser grants after it was let go', async () => {
    const release = vi.fn(() => Promise.resolve());
    let grant!: (lock: { release(): Promise<void> }) => void;
    fakeWakeLock(() => new Promise((resolve) => (grant = resolve)));
    const letSleep = keepScreenAwake();
    letSleep();
    grant({ release });
    await Promise.resolve();
    expect(release).toHaveBeenCalledOnce();
  });

  it('does nothing where the browser has none, or refuses', () => {
    expect(() => keepScreenAwake()()).not.toThrow();
    fakeWakeLock(() => Promise.reject(new Error('denied')));
    expect(() => keepScreenAwake()()).not.toThrow();
  });

  describe('when the page comes back', () => {
    const setVisibility = (state: 'visible' | 'hidden') => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: state,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    };
    // The browser drops the lock while hidden.
    const dropLock = (lock: Sentinel) => {
      lock.released = true;
    };
    afterEach(() => setVisibility('visible'));

    it('asks for the lock again while it is held', async () => {
      const first: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi.fn(() => Promise.resolve(first));
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      await Promise.resolve();
      setVisibility('hidden');
      dropLock(first);
      setVisibility('visible');
      await Promise.resolve();
      expect(request).toHaveBeenCalledTimes(2);
      letSleep();
    });

    it('does not ask again once let go', async () => {
      const first: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi.fn(() => Promise.resolve(first));
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      await Promise.resolve();
      letSleep();
      dropLock(first);
      setVisibility('visible');
      await Promise.resolve();
      expect(request).toHaveBeenCalledOnce();
    });

    it('does not ask while hidden, or while a request is in flight or the lock is still held', async () => {
      const held: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi.fn(() => Promise.resolve(held));
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      setVisibility('visible'); // still in flight
      await Promise.resolve();
      setVisibility('visible'); // held
      dropLock(held);
      setVisibility('hidden');
      await Promise.resolve();
      expect(request).toHaveBeenCalledOnce();
      letSleep();
    });

    it('asks only once for repeated visible events', async () => {
      const first: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const second: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi
        .fn<() => Promise<Sentinel>>()
        .mockResolvedValueOnce(first);
      let grant!: (lock: Sentinel) => void;
      request.mockImplementationOnce(
        () => new Promise((resolve) => (grant = resolve)),
      );
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      await Promise.resolve();
      dropLock(first);
      setVisibility('visible');
      setVisibility('visible');
      expect(request).toHaveBeenCalledTimes(2);
      grant(second);
      await Promise.resolve();
      letSleep();
      expect(second.release).toHaveBeenCalledOnce();
    });

    it('lets go of a lock that arrives after release, and stops listening', async () => {
      const first: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const second: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi
        .fn<() => Promise<Sentinel>>()
        .mockResolvedValueOnce(first);
      let grant!: (lock: Sentinel) => void;
      request.mockImplementationOnce(
        () => new Promise((resolve) => (grant = resolve)),
      );
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      await Promise.resolve();
      dropLock(first);
      setVisibility('visible');
      letSleep();
      grant(second);
      await Promise.resolve();
      expect(second.release).toHaveBeenCalledOnce();
      setVisibility('visible');
      expect(request).toHaveBeenCalledTimes(2);
    });

    it('survives a refused re-request', async () => {
      const first: Sentinel = { release: vi.fn(() => Promise.resolve()) };
      const request = vi
        .fn<() => Promise<Sentinel>>()
        .mockResolvedValueOnce(first);
      request.mockRejectedValueOnce(new Error('denied'));
      fakeWakeLock(request);
      const letSleep = keepScreenAwake();
      await Promise.resolve();
      dropLock(first);
      setVisibility('visible');
      await Promise.resolve();
      await Promise.resolve();
      expect(() => letSleep()).not.toThrow();
    });
  });
});
