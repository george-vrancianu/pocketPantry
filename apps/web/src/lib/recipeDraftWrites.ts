/**
 * Recipe Draft writes still in flight when their form closed (ADR 0028). The
 * form's flush on unmount cannot be awaited by anyone, so a Recipe Draft read
 * right after (opening a row from the list, re-entering its address) waits on
 * `settled()` first, and so never sees a version older than the one just sent.
 */
const pending = new Set<Promise<unknown>>();

export function trackDraftWrite(write: Promise<unknown>): void {
  const tracked = write.then(
    () => undefined,
    () => undefined,
  );
  pending.add(tracked);
  void tracked.then(() => pending.delete(tracked));
}

/** Resolves once every tracked write has finished (successfully or not). */
export async function draftWritesSettled(): Promise<void> {
  while (pending.size > 0) await Promise.all(pending);
}
