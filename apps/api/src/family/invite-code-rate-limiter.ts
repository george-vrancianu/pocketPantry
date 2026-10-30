import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { ApiException } from '../common/api-exception';

const WINDOW_MS = 60_000;

type Window = { count: number; resetsAt: number };

/**
 * The fixed one-minute windows behind Invite Code throttling, shared by the Family-page join guard
 * and signup with an Invite Code so both draw on one per-IP budget. The guard charges every request;
 * signup charges only failures (a successful signup refunds its charge). Per-process and in memory.
 */
@Injectable()
export class InviteCodeRateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  /** Drops expired windows. */
  prune(now: number): void {
    for (const [key, window] of this.windows) {
      if (now >= window.resetsAt) this.windows.delete(key);
    }
  }

  /** Counts a request; the ms until the window resets if it is over `limit`. */
  hit(key: string, limit: number, now: number): number | undefined {
    const window = this.windows.get(key) ?? {
      count: 0,
      resetsAt: now + WINDOW_MS,
    };
    this.windows.set(key, window);
    if (window.count >= limit) return window.resetsAt - now;
    window.count++;
    return undefined;
  }

  /**
   * Signup: charges one attempt to the IP up front (so parallel guesses are bounded) and throws 429
   * `family.rate_limited` when used up; the returned fn refunds it for a signup that succeeded.
   */
  reserveIp(ip: string): () => void {
    const now = Date.now();
    this.prune(now);
    const key = `ip:${ip}`;
    const retryAfterMs = this.hit(
      key,
      this.config.get('INVITE_CODE_LIMIT_PER_IP', { infer: true }),
      now,
    );
    if (retryAfterMs !== undefined) {
      throw new ApiException(429, 'family.rate_limited', {
        retryAfter: Math.ceil(retryAfterMs / 1000),
      });
    }
    const window = this.windows.get(key);
    return () => {
      if (window && window.count > 0) window.count--;
    };
  }
}
