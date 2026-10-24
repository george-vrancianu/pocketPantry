import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, lt, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { scanUsage } from '../database/schema';

export type UsageKind = 'scan' | 'voice' | 'assistant' | 'link';

const LIMITS = {
  scan: { setting: 'SCAN_DAILY_CAP', code: 'scan.cap_reached' },
  voice: { setting: 'VOICE_DAILY_CAP', code: 'voice.cap_reached' },
  assistant: {
    setting: 'ASSISTANT_DAILY_CAP',
    code: 'assistant.cap_reached',
  },
  link: { setting: 'LINK_DAILY_CAP', code: 'link.cap_reached' },
} as const;

/** When the cap's UTC `day` ends (ISO), which is when its count starts over. */
const nextUtcMidnight = (day: string) =>
  new Date(Date.parse(`${day}T00:00:00.000Z`) + 86_400_000).toISOString();

const utcDay = (now: Date) => now.toISOString().slice(0, 10);

/**
 * The per-Member daily caps, counted per UTC day and per kind and enforced
 * before the provider is called. The Scan Cap is `SCAN_DAILY_CAP`, the Voice
 * Cap `VOICE_DAILY_CAP`, the Assistant Cap `ASSISTANT_DAILY_CAP` and the Link Cap
 * `LINK_DAILY_CAP`; a cap of 0
 * disables it. Kinds never affect each other.
 */
@Injectable()
export class ScanCapService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Counts one use of `kind`, atomically; throws `scan.cap_reached` (Scan Cap),
   * `voice.cap_reached` (Voice Cap), `assistant.cap_reached` (Assistant Cap) or
   * `link.cap_reached` (Link Cap)
   * once the Member is at that kind's cap.
   * Returns the UTC day it was counted on, which a refund must use.
   */
  async consume(
    memberId: string,
    now = new Date(),
    kind: UsageKind = 'scan',
  ): Promise<string> {
    const limit = LIMITS[kind];
    const cap = this.config.get(limit.setting, { infer: true });
    const day = utcDay(now);
    if (cap === 0) return day;
    const rows = await this.database
      .insert(scanUsage)
      .values({ memberId, day, kind, count: 1 })
      .onConflictDoUpdate({
        target: [scanUsage.memberId, scanUsage.day, scanUsage.kind],
        set: { count: sql`${scanUsage.count} + 1` },
        setWhere: lt(scanUsage.count, cap),
      })
      .returning({ count: scanUsage.count });
    if (rows.length === 0) {
      // The Voice Cap (the button waits it out) and the Link Cap (the message names the time) say when they lift.
      throw new ApiException(
        429,
        limit.code,
        kind === 'voice' || kind === 'link'
          ? { cap, resetsAt: nextUtcMidnight(day) }
          : { cap },
      );
    }
    return day;
  }

  /**
   * Throws the cap's `*.cap_reached` (same shape as `consume`) when the Member is already at the
   * `kind` cap today, without counting a use. A cheap early refusal before slow work; `consume`
   * stays the one place a use is counted.
   */
  async assertBelowCap(
    memberId: string,
    kind: UsageKind = 'scan',
    now = new Date(),
  ): Promise<void> {
    const limit = LIMITS[kind];
    const cap = this.config.get(limit.setting, { infer: true });
    if (cap === 0) return;
    const day = utcDay(now);
    const [row] = await this.database
      .select({ count: scanUsage.count })
      .from(scanUsage)
      .where(
        and(
          eq(scanUsage.memberId, memberId),
          eq(scanUsage.day, day),
          eq(scanUsage.kind, kind),
        ),
      );
    if ((row?.count ?? 0) >= cap) {
      throw new ApiException(
        429,
        limit.code,
        kind === 'voice' || kind === 'link'
          ? { cap, resetsAt: nextUtcMidnight(day) }
          : { cap },
      );
    }
  }

  /** Counts one use of `kind` before calling the provider, and hands it back if the provider fails. */
  async withinCap<T>(
    memberId: string,
    run: () => Promise<T>,
    kind: UsageKind = 'scan',
  ): Promise<T> {
    const day = await this.consume(memberId, new Date(), kind);
    try {
      return await run();
    } catch (error) {
      await this.refund(memberId, day, kind);
      throw error;
    }
  }

  /**
   * Gives a use of `kind` back when the provider failed, so an outage does not
   * burn the Member's cap. `day` is the day `consume` returned, so a failure after UTC
   * midnight still refunds the day that was charged.
   */
  async refund(
    memberId: string,
    day: string,
    kind: UsageKind = 'scan',
  ): Promise<void> {
    await this.database
      .update(scanUsage)
      .set({ count: sql`${scanUsage.count} - 1` })
      .where(
        and(
          eq(scanUsage.memberId, memberId),
          eq(scanUsage.day, day),
          eq(scanUsage.kind, kind),
          sql`${scanUsage.count} > 0`,
        ),
      );
  }
}
