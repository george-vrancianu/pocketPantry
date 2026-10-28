import { eq, sum } from 'drizzle-orm';
import type { Database } from '../../database/database.types';
import { creditEntry, family } from '../../database/schema';
import { lockFamilyCredits } from '../credits.service';
import type { GrantInput } from './grant-args';

/** Raised when a grant is refused; nothing was written. */
export class GrantRefusedError extends Error {}

/**
 * Credit Grant by hand: writes one `grant` entry (never a `welcome_grant`, which is claimed through
 * `user.welcome_grant_at` elsewhere) and returns the Family's new Credit Balance. One transaction:
 * the Family's credits lock first, then the existence check, then the insert.
 */
export async function grantCredits(
  db: Database,
  { familyId, amount, reason }: GrantInput,
): Promise<number> {
  if (!Number.isInteger(amount) || amount <= 0)
    throw new GrantRefusedError('The amount must be a positive whole number.');
  if (!reason.trim()) throw new GrantRefusedError('A reason is required.');

  return db.transaction(async (tx) => {
    await lockFamilyCredits(tx, familyId);
    const [existing] = await tx
      .select({ id: family.id })
      .from(family)
      .where(eq(family.id, familyId));
    if (!existing)
      throw new GrantRefusedError(`No Family with id ${familyId}.`);
    await tx.insert(creditEntry).values({
      familyId,
      memberId: null,
      kind: 'grant',
      reason: reason.trim(),
      amount,
    });
    const [row] = await tx
      .select({ balance: sum(creditEntry.amount) })
      .from(creditEntry)
      .where(eq(creditEntry.familyId, familyId));
    return Number(row.balance);
  });
}
