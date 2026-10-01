import { eq } from 'drizzle-orm';
import { family, user } from '../database/schema';
import type { Tx } from './family-locks';
import { withFreshInviteCode } from './invite-code';

/**
 * Moves a Member into a brand-new Household of One as its Owner. Runs inside
 * the caller's transaction so a Member is never without a Family. The insert
 * runs in a savepoint: a (vanishingly rare) Invite Code collision would
 * otherwise abort the whole transaction.
 */
export async function moveToNewHouseholdOfOne(
  tx: Tx,
  memberId: string,
): Promise<string> {
  const [created] = await withFreshInviteCode((code) =>
    tx.transaction((savepoint) =>
      savepoint.insert(family).values(code).returning({ id: family.id }),
    ),
  );
  await tx
    .update(user)
    .set({ familyId: created.id, familyRole: 'owner' })
    .where(eq(user.id, memberId));
  return created.id;
}

export type FamilyDataCounts = { batches: number; shoppingItems: number };

/**
 * What a Family owns that is deleted along with it. The Pantry and Shopping
 * tables arrive in later tickets (they must reference `family` with
 * ON DELETE CASCADE, which is what makes deleting the Family remove them);
 * until then there is nothing to count. Those tickets add `(tx: Tx, familyId: string)`
 * parameters and the queries.
 */
export function countFamilyData(): FamilyDataCounts {
  return { batches: 0, shoppingItems: 0 };
}
