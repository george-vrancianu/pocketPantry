import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';

const WINDOW_MS = 60_000;

/** The clock the throttle reads; tests provide their own so nothing waits. */
export const OFF_THROTTLE_CLOCK = Symbol('OFF_THROTTLE_CLOCK');

/** 429 `barcode.rate_limited`; the controller turns `retryAfterSeconds` into a Retry-After header. */
export class BarcodeRateLimitedException extends ApiException {
  constructor(readonly retryAfterSeconds: number) {
    super(429, 'barcode.rate_limited');
  }
}

/**
 * Keeps outgoing Open Food Facts calls within their published limits (#416).
 * Only calls that really leave the API are charged (the caller asks just before
 * `fetchProduct`), so cache hits, Known Barcodes and invalid codes cost nothing.
 *
 * Two fixed one-minute windows: one per Member, so a single Member cannot drive
 * unbounded lookups, and one for the whole API process, kept under Open Food
 * Facts' own limit. Per Member rather than per Family: it is what the ticket
 * asks for and a Member's scan session is the thing that bursts; the global
 * window already bounds a whole Family of scanners.
 *
 * Open Food Facts allows 15 product reads a minute per IP address
 * (GET /api/v*\/product); search is 10 a minute, which this does not use.
 * https://openfoodfacts.github.io/openfoodfacts-server/api/ ("Rate limits",
 * checked October 2026). The default global limit is 12, under that 15, and
 * the default per-Member limit is 8 so one Member cannot use most of it.
 *
 * Per-process and in memory, like InviteCodeRateLimitGuard: several API
 * instances multiply the global limit by the instance count until a shared
 * store replaces it. Expired windows are pruned on access.
 */
@Injectable()
export class OpenFoodFactsThrottle {
  private readonly members = new Map<
    string,
    { count: number; resetsAt: number }
  >();
  private global = { count: 0, resetsAt: 0 };

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    @Optional()
    @Inject(OFF_THROTTLE_CLOCK)
    private readonly now: () => number = Date.now,
  ) {}

  /**
   * Charges one outgoing call to the Member and to the API as a whole.
   * Throws 429 `barcode.rate_limited` (a BarcodeRateLimitedException)
   * when either window is full; a refused call charges neither.
   */
  charge(memberId: string): void {
    const now = this.now();
    for (const [key, window] of this.members) {
      if (now >= window.resetsAt) this.members.delete(key);
    }
    if (now >= this.global.resetsAt) {
      this.global = { count: 0, resetsAt: now + WINDOW_MS };
    }
    const member = this.members.get(memberId) ?? {
      count: 0,
      resetsAt: now + WINDOW_MS,
    };
    const memberLimit = this.config.get('BARCODE_LOOKUP_LIMIT_PER_MEMBER', {
      infer: true,
    });
    const globalLimit = this.config.get('BARCODE_LOOKUP_LIMIT_GLOBAL', {
      infer: true,
    });
    const retryAfterMs =
      member.count >= memberLimit
        ? member.resetsAt - now
        : this.global.count >= globalLimit
          ? this.global.resetsAt - now
          : undefined;
    if (retryAfterMs !== undefined) {
      throw new BarcodeRateLimitedException(Math.ceil(retryAfterMs / 1000));
    }
    member.count++;
    this.global.count++;
    this.members.set(memberId, member);
  }
}
