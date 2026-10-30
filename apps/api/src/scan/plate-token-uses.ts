import { Injectable } from '@nestjs/common';

/** Total attempts per token, failures included. */
export const MAX_ATTEMPTS = 3;

/**
 * Remembers which Plate tokens have been spent, so one token writes
 * the Recipe Draft of one picked dish, once (each write is a paid model call,
 * so writing every signed title, or replaying a token, would defeat the Scan
 * Cap).
 *
 * Per-process and in memory: it assumes a single API instance. Running several
 * instances needs a durable shared store (a follow-up); until then a replay
 * could land on another instance. Entries live as long as their token could
 * still verify, and are pruned on access.
 */
@Injectable()
export class PlateTokenUses {
  private readonly spent = new Map<
    string,
    { expiresAt: number; attempts: number; held: boolean }
  >();

  /**
   * Marks the token spent. False if it already is, or if it was already
   * attempted MAX_ATTEMPTS times (a released use may be retried, for any
   * signed title, but not without limit). Synchronous, so concurrent requests
   * cannot both win.
   */
  claim(signature: string, expiresAt: number, now = Date.now()): boolean {
    this.prune(now);
    const entry = this.spent.get(signature);
    if (entry && (entry.held || entry.attempts >= MAX_ATTEMPTS)) return false;
    this.spent.set(signature, {
      expiresAt,
      attempts: (entry?.attempts ?? 0) + 1,
      held: true,
    });
    return true;
  }

  /**
   * Gives the use back. After a provider failure the attempt still counts; a refusal before the
   * provider was called (draft limit, short balance) passes `countAttempt: false` and takes it back.
   */
  release(
    signature: string,
    { countAttempt = true }: { countAttempt?: boolean } = {},
  ): void {
    const entry = this.spent.get(signature);
    if (!entry) return;
    entry.held = false;
    if (!countAttempt) entry.attempts = Math.max(0, entry.attempts - 1);
  }

  get size(): number {
    return this.spent.size;
  }

  private prune(now: number) {
    for (const [key, entry] of this.spent) {
      if (now > entry.expiresAt) this.spent.delete(key);
    }
  }
}
