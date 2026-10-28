import { Injectable } from '@nestjs/common';
import { ScanCapService, type UsageKind } from './scan-cap.service';

/**
 * The kind of a paid read. Link names how the recipe arrives, because the two are priced apart
 * later; `guidance-admin` is the Admin Catalog Suggest Guidance, which no Cap limits.
 */
export type PaidReadKind =
  | 'scan'
  | 'voice'
  | 'assistant'
  | 'link-page'
  | 'link-text'
  | 'guidance'
  | 'guidance-admin';

/** Every kind a Member pays for: all but the Admin one, which has no Member. */
export type MemberPaidReadKind = Exclude<PaidReadKind, 'guidance-admin'>;

/** What a read returns: its value, and whether it found nothing (which hands the use back). */
export interface PaidReadOutcome<T> {
  value: T;
  foundNothing: boolean;
}

/** A read that found something. */
export const found = <T>(value: T): PaidReadOutcome<T> => ({
  value,
  foundNothing: false,
});

/** A read that ran but found nothing usable: still a normal answer, but it costs the Member nothing. */
export const foundNothing = <T>(value: T): PaidReadOutcome<T> => ({
  value,
  foundNothing: true,
});

/** The Cap that limits `kind`, or null when none does. */
const capKindOf = (kind: PaidReadKind): UsageKind | null => {
  switch (kind) {
    case 'link-page':
    case 'link-text':
      return 'link';
    case 'guidance-admin':
      return null;
    default:
      return kind;
  }
};

/**
 * The one place an AI read is paid for. Every feature calls `read` with the Member, the kind of read
 * and the read itself; nothing else counts a use against a Cap. The use is counted before the read
 * and handed back when the read throws or reports that it found nothing.
 */
@Injectable()
export class PaidReadsService {
  constructor(private readonly caps: ScanCapService) {}

  /**
   * A cheap early refusal before slow work (the link read before it fetches the page): throws
   * what `read` would throw for a Member who cannot go ahead, and counts nothing. `memberId` is
   * null only for the Admin path, which no Cap limits.
   */
  assertCanGoAhead(memberId: string, kind: MemberPaidReadKind): Promise<void>;
  assertCanGoAhead(memberId: null, kind: 'guidance-admin'): Promise<void>;
  async assertCanGoAhead(
    memberId: string | null,
    kind: PaidReadKind,
  ): Promise<void> {
    const capKind = capKindOf(kind);
    if (capKind !== null && memberId !== null) {
      await this.caps.assertBelowCap(memberId, new Date(), capKind);
    }
  }

  /** Runs `run` as a paid read of `kind` for the Member and returns its value. */
  read<T>(
    memberId: string,
    kind: MemberPaidReadKind,
    run: () => Promise<PaidReadOutcome<T>>,
  ): Promise<T>;
  read<T>(
    memberId: null,
    kind: 'guidance-admin',
    run: () => Promise<PaidReadOutcome<T>>,
  ): Promise<T>;
  async read<T>(
    memberId: string | null,
    kind: PaidReadKind,
    run: () => Promise<PaidReadOutcome<T>>,
  ): Promise<T> {
    const capKind = capKindOf(kind);
    const day =
      capKind === null || memberId === null
        ? null
        : await this.caps.consume(memberId, new Date(), capKind);
    const refund = async () => {
      if (capKind !== null && memberId !== null && day !== null) {
        await this.caps.refund(memberId, day, capKind);
      }
    };
    let outcome: PaidReadOutcome<T>;
    try {
      outcome = await this.inContext(memberId, kind, run);
    } catch (error) {
      await refund();
      throw error;
    }
    if (outcome.foundNothing) await refund();
    return outcome.value;
  }

  /** The one place the read is wrapped in its context (later: the Usage Record context). */
  private inContext<T>(
    _memberId: string | null,
    _kind: PaidReadKind,
    run: () => Promise<T>,
  ): Promise<T> {
    return run();
  }
}
