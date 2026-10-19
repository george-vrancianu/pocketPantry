import { useSyncExternalStore } from 'react';

/** How long a flashed row stays marked: the 1.8 s fade, with room for a row that renders a moment late. */
export const FLASH_HOLD_MS = 4000;

let flashing: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const emit = () => listeners.forEach((listener) => listener());

/** Mark the rows (Shopping Items or Batches) a Voice Note just changed; they clear on their own. */
export function flashRows(ids: readonly string[]) {
  if (ids.length === 0) return;
  flashing = new Set([...flashing, ...ids]);
  for (const id of ids) {
    clearTimeout(timers.get(id));
    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        const next = new Set(flashing);
        next.delete(id);
        flashing = next;
        emit();
      }, FLASH_HOLD_MS),
    );
  }
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Whether any of these rows is flashing now. */
export const useRowFlash = (ids: readonly string[]): boolean =>
  useSyncExternalStore(subscribe, () => ids.some((id) => flashing.has(id)));

/** Test helper: forget every flash. */
export function resetRowFlash() {
  timers.forEach(clearTimeout);
  timers.clear();
  flashing = new Set();
  emit();
}
