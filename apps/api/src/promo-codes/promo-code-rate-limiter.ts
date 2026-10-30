import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';

const WINDOW_MS = 60_000;

type Window = { count: number; resetsAt: number };

/**
 * Throttles FAILED Promo Code redemptions, per Member and per IP (the same in-memory, single-instance
 * caveats as `InviteCodeRateLimitGuard`, with its own windows and `PROMO_CODE_LIMIT_PER_*` limits).
 * `reserve` charges an attempt up front, so a burst of parallel guesses is bounded, and throws 429
 * `promo_code.rate_limited` when a limit is used up; the returned `refund` gives the charge back for a
 * redemption that succeeded, so only failures use the budget.
 */
@Injectable()
export class PromoCodeRateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  reserve(memberId: string, ip: string, reply: FastifyReply): () => void {
    const now = Date.now();
    for (const [key, w] of this.windows) {
      if (now >= w.resetsAt) this.windows.delete(key);
    }
    const checks = [
      [
        `user:${memberId}`,
        this.config.get('PROMO_CODE_LIMIT_PER_USER', { infer: true }),
      ],
      [`ip:${ip}`, this.config.get('PROMO_CODE_LIMIT_PER_IP', { infer: true })],
    ] as const;
    for (const [key, limit] of checks) {
      const w = this.windows.get(key);
      if (w && w.count >= limit) {
        void reply.header('Retry-After', Math.ceil((w.resetsAt - now) / 1000));
        throw new ApiException(429, 'promo_code.rate_limited');
      }
    }
    const charged = checks.map(([key]) => {
      const w = this.windows.get(key) ?? {
        count: 0,
        resetsAt: now + WINDOW_MS,
      };
      w.count++;
      this.windows.set(key, w);
      return w;
    });
    return () => {
      for (const w of charged) if (w.count > 0) w.count--;
    };
  }
}
