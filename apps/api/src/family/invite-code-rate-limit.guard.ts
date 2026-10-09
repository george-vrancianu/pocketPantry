import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';

const WINDOW_MS = 60_000;

/**
 * Throttles Invite Code redemption (`join-preview` and `join` share one
 * budget): a Member can only guess so many codes a minute, and so can one IP.
 * Either limit tripping answers 429 `family.rate_limited` with Retry-After.
 * Run it after AuthGuard. Requests the per-Member limit blocks do not charge
 * the IP, so one throttled Member cannot lock out the rest of a shared IP.
 *
 * The IP is the socket address: nothing here trusts X-Forwarded-For, because
 * the API is not configured behind a proxy and the header would be spoofable.
 * Behind a proxy, enable Fastify's `trustProxy` first or every client shares
 * the proxy's IP.
 *
 * Per-process and in memory (fixed one-minute windows): it assumes a single
 * API instance. Running several multiplies the limits by the instance count
 * until a shared store replaces it. Expired windows are pruned on access.
 */
@Injectable()
export class InviteCodeRateLimitGuard implements CanActivate {
  private readonly windows = new Map<
    string,
    { count: number; resetsAt: number }
  >();

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const now = Date.now();
    for (const [key, w] of this.windows) {
      if (now >= w.resetsAt) this.windows.delete(key);
    }
    const retryAfterMs =
      this.hit(
        `user:${request.user.id}`,
        this.config.get('INVITE_CODE_LIMIT_PER_USER', { infer: true }),
        now,
      ) ??
      this.hit(
        `ip:${request.ip}`,
        this.config.get('INVITE_CODE_LIMIT_PER_IP', { infer: true }),
        now,
      );
    if (retryAfterMs === undefined) return true;
    void http
      .getResponse<FastifyReply>()
      .header('Retry-After', Math.ceil(retryAfterMs / 1000));
    throw new ApiException(429, 'family.rate_limited');
  }

  /** Counts a request; the ms until the window resets if it is over `limit`. */
  private hit(key: string, limit: number, now: number): number | undefined {
    const w = this.windows.get(key) ?? { count: 0, resetsAt: now + WINDOW_MS };
    this.windows.set(key, w);
    if (w.count >= limit) return w.resetsAt - now;
    w.count++;
    return undefined;
  }
}
