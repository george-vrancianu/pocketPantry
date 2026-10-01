import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, lt, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { scanUsage } from '../database/schema';

const utcDay = (now: Date) => now.toISOString().slice(0, 10);

/**
 * The per-Member daily Scan Cap, counted per UTC day and enforced before the
 * provider is called. `SCAN_DAILY_CAP=0` disables the cap.
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
  async consume(memberId: string, now = new Date()): Promise<string> {
    const cap = this.config.get('SCAN_DAILY_CAP', { infer: true });
    const day = utcDay(now);
    if (cap === 0) return day;
    const rows = await this.database
      .insert(scanUsage)
      .values({ memberId, day, count: 1 })
      .onConflictDoUpdate({
        target: [scanUsage.memberId, scanUsage.day],
        set: { count: sql`${scanUsage.count} + 1` },
        setWhere: lt(scanUsage.count, cap),
      })
      .returning({ count: scanUsage.count });
    if (rows.length === 0) {
      throw new ApiException(429, 'scan.cap_reached', { cap });
    }
    return day;
  }

  /**
   * Gives a Scan back when the provider failed, so an outage does not burn the
   * Member's cap. `day` is the day `consume` returned, so a failure after UTC
   * midnight still refunds the day that was charged.
   */
  async refund(memberId: string, day: string): Promise<void> {
    await this.database
      .update(scanUsage)
      .set({ count: sql`${scanUsage.count} - 1` })
      .where(
        and(
          eq(scanUsage.memberId, memberId),
          eq(scanUsage.day, day),
          sql`${scanUsage.count} > 0`,
        ),
      );
  }
}
