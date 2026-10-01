import { Injectable } from '@nestjs/common';

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
  private readonly spent = new Map<string, number>();

  /** Marks the title spent. False if it already was. Synchronous, so concurrent requests cannot both win. */
  claim(
    signature: string,
    title: string,
    expiresAt: number,
    now = Date.now(),
  ): boolean {
    this.prune(now);
    const key = this.key(signature, title);
    if (this.spent.has(key)) return false;
    this.spent.set(key, expiresAt);
    return true;
  }

  /** Gives the use back, e.g. after the provider failed. */
  release(signature: string, title: string): void {
    this.spent.delete(this.key(signature, title));
  }

  get size(): number {
    return this.spent.size;
  }

  private key(signature: string, title: string) {
    return `${signature}\n${title.trim()}`;
  }

  private prune(now: number) {
    for (const [key, expiresAt] of this.spent) {
      if (now > expiresAt) this.spent.delete(key);
    }
  }
}
