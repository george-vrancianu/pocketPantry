import { afterEach, describe, expect, it, vi } from 'vitest';
import { keepScreenAwake } from './wakeLock';

const fakeWakeLock = (request: () => Promise<{ release(): Promise<void> }>) =>
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
});
