import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';

const WINDOW_MS = 60_000;

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
 * Two sliding logs of the last minute's calls: one per Member, so a single
 * Member cannot drive unbounded lookups, and one for the whole API process,
 * kept under Open Food Facts' own limit. A sliding log, not a fixed window:
 * a fixed window lets a full budget at the end of one window and another at
 * the start of the next go out together, doubling the rate. Per Member rather
 * than per Family: it is what the ticket asks for and a Member's scan session
 * is the thing that bursts; the global limit already bounds a whole Family of
 * scanners.
 *
 * Open Food Facts allows 15 product reads a minute per IP address
 * (GET /api/v*\/product); search is 10 a minute, which this does not use.
 * https://openfoodfacts.github.io/openfoodfacts-server/api/ ("Rate limits",
 * checked October 2026). The default global limit is 12, under that 15, and
 * the default per-Member limit is 8 so one Member cannot use most of it.
 *
 * Per-process and in memory, like InviteCodeRateLimitGuard: several API
 * instances multiply the global limit by the instance count until a shared
 * store replaces it. Expired entries are pruned on access.
 */
@Injectable()
export class OpenFoodFactsThrottle {
  private readonly members = new Map<string, number[]>();
  private globalLog: number[] = [];
  /** The time source; tests replace it so nothing waits. */
  clock: () => number = Date.now;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  /**
   * Charges one outgoing call to the Member and to the API as a whole.
   * Throws 429 `barcode.rate_limited` (a BarcodeRateLimitedException), waiting
   * for the later of the two limits to free up, when either is full; a refused
   * call charges neither.
   */
  charge(memberId: string): void {
    const now = this.clock();
    const cutoff = now - WINDOW_MS;
    for (const [key, log] of this.members) {
      if (log.every((at) => at <= cutoff)) this.members.delete(key);
    }
    this.globalLog = this.globalLog.filter((at) => at > cutoff);
    const memberLog = (this.members.get(memberId) ?? []).filter(
      (at) => at > cutoff,
    );
    const memberLimit = this.config.get('BARCODE_LOOKUP_LIMIT_PER_MEMBER', {
      infer: true,
    });
    const globalLimit = this.config.get('BARCODE_LOOKUP_LIMIT_GLOBAL', {
      infer: true,
    });
    const frees = [
      memberLog.length >= memberLimit
        ? memberLog[memberLog.length - memberLimit] + WINDOW_MS
        : 0,
      this.globalLog.length >= globalLimit
        ? this.globalLog[this.globalLog.length - globalLimit] + WINDOW_MS
        : 0,
    ];
    const freesAt = Math.max(...frees);
    if (freesAt > 0) {
      throw new BarcodeRateLimitedException(Math.ceil((freesAt - now) / 1000));
    }
    memberLog.push(now);
    this.members.set(memberId, memberLog);
    this.globalLog.push(now);
  }
}
