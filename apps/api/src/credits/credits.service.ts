import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { creditEntry, user } from '../database/schema';
import type { CreditPriceKind, CreditPrices } from './credits.schemas';

/** The Credits a Member's Household of One starts with, once in their life (ADR 0032). */
export const WELCOME_GRANT_CREDITS = 100;

/** Credits held for a read that is running; given back with `release`. `null` when the read is free. */
export type CreditHold = { entryId: string } | null;

/** The 402 for a read whose Credit Price is more than the Family has left. */
const insufficient = (price: number, balance: number) =>
  new ApiException(402, 'credits.insufficient', { price, balance });

/**
 * Takes the transaction-long credits lock of each Family, in ascending id order so two transactions that
 * need the same pair cannot deadlock. The one place the lock key lives: `hold` and Family joins both use it.
 * Take it before any `family` row lock: a hold's insert needs a share lock on its Family row.
 */
export async function lockFamilyCredits(
  tx: Tx,
  ...familyIds: string[]
): Promise<void> {
  for (const id of [...new Set(familyIds)].sort()) {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`credits:${id}`}, 0))`,
    );
  }
}

/** The Credit Balance of a Family: the sum of its entries. The one definition of "balance". */
export async function familyBalance(
  executor: Executor,
  familyId: string,
): Promise<number> {
  const [row] = await executor
    .select({
      balance: sql<number>`coalesce(sum(${creditEntry.amount}), 0)::int`,
    })
    .from(creditEntry)
    .where(eq(creditEntry.familyId, familyId));
  return row.balance;
}

/**
 * Moves a Household of One's whole balance into the Family its Member joins, as a `transfer_in` entry
 * naming the Member. The caller holds both Families' credits locks. A balance of 0 writes nothing.
 * The Household of One's own entries go with it when it is deleted, so no `transfer_out` is written.
 */
export async function transferHouseholdBalance(
  tx: Tx,
  memberId: string,
  fromFamilyId: string,
  toFamilyId: string,
): Promise<void> {
  const balance = await familyBalance(tx, fromFamilyId);
  if (balance <= 0) return;
  await tx.insert(creditEntry).values({
    familyId: toFamilyId,
    memberId,
    kind: 'transfer_in',
    reason: 'Household of One joined the Family',
    amount: balance,
  });
}

/**
 * The Credit ledger of a Family (ADR 0032). The Credit Balance is the sum of the Family's entries, never
 * stored. A read's Credits are held as a negative entry, written only while the balance can pay for it,
 * and released (the entry is deleted) when the read fails or finds nothing; a kept hold is the spend.
 * A released hold leaves no entry, so the history later shows only what was really spent.
 */
@Injectable()
export class CreditsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** The Credit Price of each kind of read, from the environment. */
  prices(): CreditPrices {
    const price = (
      setting:
        | 'CREDIT_PRICE_SCAN'
        | 'CREDIT_PRICE_VOICE'
        | 'CREDIT_PRICE_ASSISTANT'
        | 'CREDIT_PRICE_LINK_PAGE'
        | 'CREDIT_PRICE_LINK_TEXT'
        | 'CREDIT_PRICE_GUIDANCE',
    ): number => this.config.get(setting, { infer: true });
    return {
      scan: price('CREDIT_PRICE_SCAN'),
      voice: price('CREDIT_PRICE_VOICE'),
      assistant: price('CREDIT_PRICE_ASSISTANT'),
      'link-page': price('CREDIT_PRICE_LINK_PAGE'),
      'link-text': price('CREDIT_PRICE_LINK_TEXT'),
      guidance: price('CREDIT_PRICE_GUIDANCE'),
    };
  }

  priceOf(kind: CreditPriceKind): number {
    return this.prices()[kind];
  }

  /** The Credit Balance of the Member's current Family. */
  async balanceOfMember(memberId: string): Promise<number> {
    const [row] = await this.database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId));
    return row ? this.balanceOfFamily(row.familyId) : 0;
  }

  async balanceOfFamily(
    familyId: string,
    executor: Executor = this.database,
  ): Promise<number> {
    return familyBalance(executor, familyId);
  }

  /** Throws `credits.insufficient` when the Member's Family cannot pay `price`; holds nothing. */
  async assertCanAfford(memberId: string, price: number): Promise<void> {
    if (price <= 0) return;
    const balance = await this.balanceOfMember(memberId);
    if (balance < price) throw insufficient(price, balance);
  }

  /**
   * Holds `price` Credits of the Member's Family for a read of `kind`, or throws `credits.insufficient`.
   * The check and the insert run in one transaction under a lock on the Family, so reads that start at
   * the same moment cannot take the balance below zero.
   */
  async hold(
    memberId: string,
    kind: CreditPriceKind,
    price: number,
  ): Promise<CreditHold> {
    if (price <= 0) return null;
    // The Member may join another Family while this waits for the lock; then the lock was the wrong
    // one, so start over in a new transaction (which releases it) and charge the Family they are in now.
    for (let attempt = 0; attempt < 5; attempt++) {
      const held = await this.database.transaction(async (tx) => {
        const familyOf = async () => {
          const [member] = await tx
            .select({ familyId: user.familyId })
            .from(user)
            .where(eq(user.id, memberId));
          return member?.familyId;
        };
        const peeked = await familyOf();
        if (!peeked) throw insufficient(price, 0);
        await lockFamilyCredits(tx, peeked);
        const familyId = await familyOf();
        if (familyId !== peeked) return null;
        const balance = await this.balanceOfFamily(familyId, tx);
        if (balance < price) throw insufficient(price, balance);
        const [entry] = await tx
          .insert(creditEntry)
          .values({
            familyId,
            memberId,
            kind: 'spend',
            readKind: kind,
            amount: -price,
          })
          .returning({ id: creditEntry.id });
        return { entryId: entry.id };
      });
      if (held) return held;
    }
    throw new ApiException(409, 'family.concurrent_change');
  }

  /** Gives a held read's Credits back: the read failed or found nothing. */
  async release(hold: NonNullable<CreditHold>): Promise<void> {
    await this.database
      .delete(creditEntry)
      .where(eq(creditEntry.id, hold.entryId));
  }
}
