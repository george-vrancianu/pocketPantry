import { Injectable } from '@nestjs/common';

/** Total attempts per title per token, failures included. */
export const MAX_ATTEMPTS = 3;

/**
 * Remembers which signed dish titles have been spent, so one Plate token
 * loads each title's Ingredients at most once (each load sends the whole
 * Catalog to the model, so replaying a token would defeat the Scan Cap).
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
   * Marks the title spent. False if it already is, or if it was already
   * attempted MAX_ATTEMPTS times (a released use may be retried, but not
   * without limit). Synchronous, so concurrent requests cannot both win.
   */
  claim(
    signature: string,
    title: string,
    expiresAt: number,
    now = Date.now(),
  ): boolean {
    this.prune(now);
    const key = this.key(signature, title);
    const entry = this.spent.get(key);
    if (entry && (entry.held || entry.attempts >= MAX_ATTEMPTS)) return false;
    this.spent.set(key, {
      expiresAt,
      attempts: (entry?.attempts ?? 0) + 1,
      held: true,
    });
    return true;
  }

  /** Gives the use back, e.g. after the provider failed. The attempt still counts. */
  release(signature: string, title: string): void {
    const entry = this.spent.get(this.key(signature, title));
    if (entry) entry.held = false;
  }

  get size(): number {
    return this.spent.size;
  }

  private key(signature: string, title: string) {
    return `${signature}\n${title.trim()}`;
  }

  private prune(now: number) {
    for (const [key, entry] of this.spent) {
      if (now > entry.expiresAt) this.spent.delete(key);
    }
  }
}
