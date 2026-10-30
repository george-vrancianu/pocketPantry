import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNotNull, isNull, sql, type SQL } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { hasPgCode } from '../database/pg-errors';
import { promoCode, user } from '../database/schema';
import { redeemPromoCode } from './redeem-promo-code';
import { familyBalance } from '../credits/credits.service';
import { formatPromoCode, generatePromoCode } from '../family/invite-code';
import {
  encodeCursor,
  type GenerateBody,
  type ListQuery,
  type PromoCodeEntry,
  type PromoCodePage,
  type PromoCodeStatus,
} from './promo-code.schemas';

const MAX_GENERATE_ATTEMPTS = 5;

type Row = typeof promoCode.$inferSelect;

const statusOf = (row: Row): PromoCodeStatus =>
  row.revokedAt ? 'revoked' : row.redeemedAt ? 'redeemed' : 'unused';

const toEntry = (row: Row): PromoCodeEntry => ({
  id: row.id,
  code: formatPromoCode(row.code),
  credits: row.credits,
  note: row.note,
  createdAt: row.createdAt.toISOString(),
  status: statusOf(row),
  redeemedAt: row.redeemedAt?.toISOString() ?? null,
  redeemedByName: row.redeemedByName,
  redeemedByEmail: row.redeemedByEmail,
  redeemedFamilyId: row.redeemedFamilyId,
});

/**
 * Promo Codes (ADR 0034). One service owns generation, listing and revocation;
 * the redeem operation (code, Family, optional Member, caller's transaction)
 * joins it in the signup and Settings tickets. The Admin routes are the only
 * callers so far.
 */
@Injectable()
export class PromoCodeService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /** Makes `count` distinct codes; returns them as `XXXXX-XXXXX`, in creation order. */
  async generate(adminId: string, body: GenerateBody): Promise<string[]> {
    for (let attempt = 1; ; attempt++) {
      const codes = new Set<string>();
      while (codes.size < body.count) codes.add(generatePromoCode());
      try {
        await this.database.insert(promoCode).values(
          [...codes].map((code) => ({
            code,
            credits: body.credits,
            note: body.note ?? null,
            createdBy: adminId,
          })),
        );
        return [...codes].map(formatPromoCode);
      } catch (error) {
        // The (vanishingly rare) collision with an existing code: draw again.
        if (!hasPgCode(error, '23505') || attempt >= MAX_GENERATE_ATTEMPTS) {
          throw error;
        }
      }
    }
  }

  /** Newest first; keyset paging on (created at, id). */
  async list(query: ListQuery): Promise<PromoCodePage> {
    // Postgres keeps microseconds, a JS Date does not: page on the exact text.
    const createdAtText = sql<string>`to_char(${promoCode.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;
    const filters: (SQL | undefined)[] = [
      query.status === 'revoked' ? isNotNull(promoCode.revokedAt) : undefined,
      query.status === 'redeemed'
        ? and(isNotNull(promoCode.redeemedAt), isNull(promoCode.revokedAt))
        : undefined,
      query.status === 'unused'
        ? and(isNull(promoCode.redeemedAt), isNull(promoCode.revokedAt))
        : undefined,
      query.cursor
        ? sql`(${promoCode.createdAt}, ${promoCode.id}) < (${query.cursor.createdAt}::timestamptz, ${query.cursor.id}::uuid)`
        : undefined,
    ];
    const rows = await this.database
      .select({ row: promoCode, createdAtText })
      .from(promoCode)
      .where(and(...filters))
      .orderBy(desc(promoCode.createdAt), desc(promoCode.id))
      .limit(query.limit + 1);
    const page = rows.slice(0, query.limit);
    const last = page.at(-1);
    return {
      entries: page.map(({ row }) => toEntry(row)),
      nextCursor:
        rows.length > query.limit && last
          ? encodeCursor({ createdAt: last.createdAtText, id: last.row.id })
          : null,
    };
  }

  /**
   * A Member redeems a code for their current Family; returns the new Credit Balance.
   * Signup calls `redeemPromoCode` directly inside its own transaction.
   */
  async redeem(memberId: string, code: string): Promise<number> {
    return this.database.transaction(async (tx) => {
      const [me] = await tx
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, memberId));
      if (!me) throw new ApiException(404, 'promo_code.not_found');
      await redeemPromoCode(tx, { code, familyId: me.familyId, memberId });
      return familyBalance(tx, me.familyId);
    });
  }

  /** Only an Unused code can be revoked: a redeemed one already gave its Credits. */
  async revoke(id: string): Promise<PromoCodeEntry> {
    const [revoked] = await this.database
      .update(promoCode)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(promoCode.id, id),
          isNull(promoCode.redeemedAt),
          isNull(promoCode.revokedAt),
        ),
      )
      .returning();
    if (revoked) return toEntry(revoked);
    const [existing] = await this.database
      .select({ id: promoCode.id })
      .from(promoCode)
      .where(eq(promoCode.id, id));
    throw existing
      ? new ApiException(409, 'promo_code.not_revocable')
      : new ApiException(404, 'promo_code.not_found');
  }
}
