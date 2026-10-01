import { describe, expect, it, vi } from 'vitest';
import { confirmLeave, registerLeaveGuard } from './leaveGuard';

describe('leave guard', () => {
  it('allows leaving when no guard is registered', () => {
    expect(confirmLeave()).toBe(true);
  });

  it('asks the registered guard until it is unregistered', () => {
    const guard = vi.fn(() => false);
    const unregister = registerLeaveGuard(guard);
    expect(confirmLeave()).toBe(false);
    unregister();
    expect(confirmLeave()).toBe(true);
  });
});
