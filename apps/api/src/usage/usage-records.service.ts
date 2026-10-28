import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { usageRecord, user } from '../database/schema';
import { costUsd, type CallUsage } from './prices';
import type { PaidReadKind } from '../scan/paid-reads.service';
import { currentUsageContext, runInUsageContext } from './usage-context';

/** One provider call, as reported by the metering layer. */
export type UsageCall = {
  /** `transcription` for the audio step of a Voice Note; `reading` for every structured-output call. */
  step: 'transcription' | 'reading';
  model: string;
  success: boolean;
  usage?: CallUsage | undefined;
  requestId?: string | null | undefined;
};

/**
 * Writes Usage Records (ADR 0032): one row per provider call, with the cost frozen from the
 * price table at write time. A failure to write is logged and swallowed: a record must never
 * break the read it describes.
 */
@Injectable()
export class UsageRecordsService {
  private readonly logger = new Logger(UsageRecordsService.name);

  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /**
   * Runs `run` so every provider call inside it is recorded for the Member's `kind` of read. The
   * Family is the Member's current one; a null Member (Admin) has none.
   */
  async inContext<T>(
    memberId: string | null,
    kind: PaidReadKind,
    run: () => Promise<T>,
  ): Promise<T> {
    const familyId = memberId === null ? null : await this.familyOf(memberId);
    return runInUsageContext({ kind, memberId, familyId }, run);
  }

  async record(call: UsageCall): Promise<void> {
    try {
      const context = currentUsageContext();
      const { usage } = call;
      const cost = costUsd(call.model, usage);
      await this.database.insert(usageRecord).values({
        kind: context?.kind ?? null,
        step: call.step,
        memberId: context?.memberId ?? null,
        familyId: context?.familyId ?? null,
        model: call.model,
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        cachedTokens: usage?.cachedInputTokens ?? null,
        reasoningTokens: usage?.reasoningTokens ?? null,
        audioSeconds:
          usage?.audioSeconds === undefined ? null : String(usage.audioSeconds),
        success: call.success,
        providerRequestId: call.requestId ?? null,
        costUsd: cost === null ? null : cost.toFixed(8),
      });
    } catch (error) {
      this.logger.error({
        message: 'Could not write a Usage Record',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async familyOf(memberId: string): Promise<string | null> {
    try {
      const [row] = await this.database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, memberId));
      return row?.familyId ?? null;
    } catch (error) {
      this.logger.error({
        message: 'Could not look up the Family for a Usage Record',
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
