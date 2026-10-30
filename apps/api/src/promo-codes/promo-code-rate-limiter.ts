import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';

const WINDOW_MS = 60_000;

/**
 * Throttles FAILED Promo Code redemptions, per Member and per IP (same limits and the same in-memory,
 * single-instance caveats as `InviteCodeRateLimitGuard`, but its own windows). `assertAllowed` throws
 * 429 `promo_code.rate_limited` once a limit is used up; `recordFailure` charges one failure.
 */
@Injectable()
export class PromoCodeRateLimiter {
  private readonly windows = new Map<
    string,
    { count: number; resetsAt: number }
  >();

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private limits(memberId: string, ip: string) {
    return [
      [
        `user:${memberId}`,
        this.config.get('INVITE_CODE_LIMIT_PER_USER', { infer: true }),
      ],
      [
        `ip:${ip}`,
        this.config.get('INVITE_CODE_LIMIT_PER_IP', { infer: true }),
      ],
    ] as const;
  }

  assertAllowed(memberId: string, ip: string, reply: FastifyReply): void {
    const now = Date.now();
    for (const [key, w] of this.windows) {
      if (now >= w.resetsAt) this.windows.delete(key);
    }
    for (const [key, limit] of this.limits(memberId, ip)) {
      const w = this.windows.get(key);
      if (w && w.count >= limit) {
        void reply.header('Retry-After', Math.ceil((w.resetsAt - now) / 1000));
        throw new ApiException(429, 'promo_code.rate_limited');
      }
    }
  }

  recordFailure(memberId: string, ip: string): void {
    const now = Date.now();
    for (const [key] of this.limits(memberId, ip)) {
      const w = this.windows.get(key);
      if (!w || now >= w.resetsAt) {
        this.windows.set(key, { count: 1, resetsAt: now + WINDOW_MS });
      } else {
        w.count++;
      }
    }
  }
}
