import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, lt, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { scanUsage } from '../database/schema';

const today = () => new Date().toISOString().slice(0, 10);

/** The per-Member daily Scan Cap, counted per UTC day and enforced before the provider is called. */
@Injectable()
export class ScanCapService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Counts one Scan, atomically; throws `scan.cap_reached` once the Member is at the cap. */
  async consume(memberId: string): Promise<void> {
    const cap = this.config.get('SCAN_DAILY_CAP', { infer: true });
    if (cap > 0) {
      const rows = await this.database
        .insert(scanUsage)
        .values({ memberId, day: today(), count: 1 })
        .onConflictDoUpdate({
          target: [scanUsage.memberId, scanUsage.day],
          set: { count: sql`${scanUsage.count} + 1` },
          setWhere: lt(scanUsage.count, cap),
        })
        .returning({ count: scanUsage.count });
      if (rows.length > 0) return;
    }
    throw new ApiException(429, 'scan.cap_reached', { cap });
  }

  /** Gives a Scan back when the provider failed, so an outage does not burn the Member's cap. */
  async refund(memberId: string): Promise<void> {
    await this.database
      .update(scanUsage)
      .set({ count: sql`${scanUsage.count} - 1` })
      .where(
        and(
          eq(scanUsage.memberId, memberId),
          eq(scanUsage.day, today()),
          sql`${scanUsage.count} > 0`,
        ),
      );
  }
}
