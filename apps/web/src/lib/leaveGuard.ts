/**
 * A tiny store for "ask before leaving this screen". A screen with unsaved work
 * registers a guard; navigation that bypasses the screen's own buttons (the Dock)
 * asks `confirmLeave()` first. The guard returns false to stay.
 *
 * The browser/OS back button is not covered: the app uses BrowserRouter, which has
 * no `useBlocker`.
 */
type LeaveGuard = () => boolean;

let guard: LeaveGuard | null = null;

/** Registers the guard; returns the function that removes it. */
export function registerLeaveGuard(next: LeaveGuard): () => void {
  guard = next;
  return () => {
    if (guard === next) guard = null;
  };
}

/** True when there is no guard or the guard lets the Member leave. */
export function confirmLeave(): boolean {
  return guard ? guard() : true;
}
