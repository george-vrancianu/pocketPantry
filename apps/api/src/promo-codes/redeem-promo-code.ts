import { eq, sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Tx } from '../database/database.types';
import { creditEntry, promoCode, user } from '../database/schema';
import { looksLikeInviteCode, normalizePromoCode } from '../family/invite-code';

export type RedeemedPromoCode = {
  /** The Credits added. */
  credits: number;
  promoCodeId: string;
  entryId: string;
};

export type RedeemPromoCodeInput = {
  /** As typed: case, spaces and dashes are ignored. */
  code: string;
  familyId: string;
  /** The redeeming Member, when they exist already (not at signup). */
  memberId?: string;
  /** The redeemer's snapshot when there is no `memberId` yet. */
  redeemer?: { name: string; email: string };
};

/**
 * Redeems a Promo Code for a Family inside the caller's transaction (ADR 0034): locks the code row,
 * rejects an unknown, redeemed or revoked code, marks it redeemed (with a snapshot of the redeemer)
 * and writes a `promo_code` Credit entry that references the code, also for a 0-Credit code. Returns the Credits
 * added and the ids of the code and the entry.
 * Throws `promo_code.is_invite_code` when the input is shaped like an Invite Code.
 */
export async function redeemPromoCode(
  tx: Tx,
  input: RedeemPromoCodeInput,
): Promise<RedeemedPromoCode> {
  const normalised = normalizePromoCode(input.code);
  if (looksLikeInviteCode(normalised)) {
    throw new ApiException(400, 'promo_code.is_invite_code');
  }
  const [row] = await tx
    .select()
    .from(promoCode)
    .where(eq(promoCode.code, normalised))
    .for('update');
  if (!row) throw new ApiException(404, 'promo_code.not_found');
  if (row.revokedAt) throw new ApiException(409, 'promo_code.revoked');
  if (row.redeemedAt)
    throw new ApiException(409, 'promo_code.already_redeemed');

  let redeemer = input.redeemer ?? null;
  if (input.memberId) {
    const [member] = await tx
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, input.memberId));
    redeemer = member ?? redeemer;
  }
  await tx
    .update(promoCode)
    .set({
      redeemedAt: sql`now()`,
      redeemedBy: input.memberId ?? null,
      redeemedByName: redeemer?.name ?? null,
      redeemedByEmail: redeemer?.email ?? null,
      redeemedFamilyId: input.familyId,
    })
    .where(eq(promoCode.id, row.id));
  const [entry] = await tx
    .insert(creditEntry)
    .values({
      familyId: input.familyId,
      memberId: input.memberId ?? null,
      kind: 'promo_code',
      promoCodeId: row.id,
      amount: row.credits,
    })
    .returning({ id: creditEntry.id });
  return { credits: row.credits, promoCodeId: row.id, entryId: entry.id };
}
