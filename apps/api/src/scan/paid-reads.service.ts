import { Injectable } from '@nestjs/common';
import { CreditsService, type CreditHold } from '../credits/credits.service';
import { UsageRecordsService } from '../usage/usage-records.service';
import { ScanCapService, type UsageKind } from './scan-cap.service';

/**
 * The kind of a paid read. Link names how the recipe arrives, because the two are priced apart
 * later; `plate-recipe` is writing a Plate Scan's picked dish as a Recipe (charged on its own, no Cap); `guidance-admin` is the Admin Catalog Suggest Guidance, which no Cap limits.
 */
export type PaidReadKind =
  | 'scan'
  | 'voice'
  | 'assistant'
  | 'link-page'
  | 'link-text'
  | 'guidance'
  | 'plate-recipe'
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
    // Writing a Plate Scan's dish is the second half of a Scan whose photo the Scan Cap already counted.
    case 'plate-recipe':
    case 'guidance-admin':
      return null;
    default:
      return kind;
  }
};

/**
 * The kinds of read that cost Credits: every kind but the Admin one. Adding a kind here is all it takes to charge it: the price
 * comes from `CREDIT_PRICE_*` and the hold, the refusal and the give-back are the same for every kind.
 */
const CHARGED_KINDS: ReadonlySet<PaidReadKind> = new Set<PaidReadKind>([
  'scan',
  'voice',
  'assistant',
  'link-page',
  'link-text',
  'guidance',
  'plate-recipe',
]);

/** The kind a Credit Price is set for, or null when `kind` is not charged Credits. */
const chargedKindOf = (kind: PaidReadKind): MemberPaidReadKind | null =>
  kind !== 'guidance-admin' && CHARGED_KINDS.has(kind) ? kind : null;

/**
 * The one place an AI read is paid for. Every feature calls `read` with the Member, the kind of read
 * and the read itself; nothing else counts a use against a Cap. The use is counted before the read
 * and handed back when the read throws or reports that it found nothing. A charged kind also holds its
 * Credit Price (after the Cap, so a read at its Cap never touches Credits) and gives it back the same way.
 */
@Injectable()
export class PaidReadsService {
  constructor(
    private readonly caps: ScanCapService,
    private readonly credits: CreditsService,
    private readonly usage: UsageRecordsService,
  ) {}

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
    const chargedKind = chargedKindOf(kind);
    if (chargedKind !== null && memberId !== null) {
      await this.credits.assertCanAfford(
        memberId,
        this.credits.priceOf(chargedKind),
      );
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
    const refundCap = async () => {
      if (capKind !== null && memberId !== null && day !== null) {
        await this.caps.refund(memberId, day, capKind);
      }
    };
    // After the Cap: a read at its Cap was refused above and never reaches Credits. A read the Credits
    // refuse hands its Cap use back, so it burns neither.
    const chargedKind = chargedKindOf(kind);
    let hold: CreditHold = null;
    if (chargedKind !== null && memberId !== null) {
      try {
        hold = await this.credits.hold(
          memberId,
          chargedKind,
          this.credits.priceOf(chargedKind),
        );
      } catch (error) {
        await refundCap();
        throw error;
      }
    }
    const refund = async () => {
      if (hold !== null) await this.credits.release(hold);
      await refundCap();
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

  /** The one place a read is wrapped in its Usage Record context (the kind, the Member and their Family). */
  private inContext<T>(
    memberId: string | null,
    kind: PaidReadKind,
    run: () => Promise<T>,
  ): Promise<T> {
    return this.usage.inContext(memberId, kind, run);
  }
}
