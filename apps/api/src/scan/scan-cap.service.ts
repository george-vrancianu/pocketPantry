import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, lt, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { scanUsage } from '../database/schema';

export type UsageKind = 'scan' | 'voice';

const LIMITS = {
  scan: { setting: 'SCAN_DAILY_CAP', code: 'scan.cap_reached' },
  voice: { setting: 'VOICE_DAILY_CAP', code: 'voice.cap_reached' },
} as const;

const utcDay = (now: Date) => now.toISOString().slice(0, 10);

/**
 * The per-Member daily caps, counted per UTC day and per kind and enforced
 * before the provider is called. The Scan Cap is `SCAN_DAILY_CAP` and the Voice
 * Cap `VOICE_DAILY_CAP`; a cap of 0 disables it. Kinds never affect each other.
 */
@Injectable()
export class ScanCapService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Counts one Scan, atomically; throws `scan.cap_reached` once the Member is
   * at the cap. Returns the UTC day it was counted on, which a refund must use.
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
      throw new ApiException(429, limit.code, { cap });
    }
    return day;
  }

  /** Counts the Scan before calling the provider, and hands it back if the provider fails. */
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
   * Gives a Scan back when the provider failed, so an outage does not burn the
   * Member's cap. `day` is the day `consume` returned, so a failure after UTC
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
