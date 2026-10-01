import { and, eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Database } from '../database/database.types';
import { family, user } from '../database/schema';

export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export type LockedMember = {
  id: string;
  familyId: string;
  familyRole: 'owner' | 'member';
};

const MAX_ATTEMPTS = 5;

/**
 * Lock order, everywhere: Family rows first (ascending id when several), then
 * Member rows. Every membership mutation takes the Family lock, so they are
 * serialised per Family and cannot deadlock one another.
 *
 * Locks the Member's current Family (plus any extra Families) and then the
 * Member, and returns the Member as read from the database under the lock,
 * never from the session. If the Member moved Family between the unlocked
 * peek and the lock, it tries again.
 */
export async function lockMemberAndFamily(
  tx: Tx,
  memberId: string,
  alsoLockFamilyIds: string[] = [],
): Promise<LockedMember> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [peek] = await tx
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId));
    if (!peek) throw new ApiException(401, 'auth.unauthenticated');

    await lockFamilies(tx, [peek.familyId, ...alsoLockFamilyIds]);

    const [member] = await tx
      .select({
        id: user.id,
        familyId: user.familyId,
        familyRole: user.familyRole,
      })
      .from(user)
      .where(eq(user.id, memberId))
      .for('update');
    if (!member) throw new ApiException(401, 'auth.unauthenticated');
    if (member.familyId === peek.familyId) return member;
  }
  throw new ApiException(409, 'family.concurrent_change');
}

/** `SELECT ... FOR UPDATE` in ascending id order; rows already deleted are skipped. */
export async function lockFamilies(tx: Tx, ids: string[]): Promise<void> {
  const ordered = [...new Set(ids)].sort();
  for (const id of ordered) {
    await tx
      .select({ id: family.id })
      .from(family)
      .where(eq(family.id, id))
      .for('update');
  }
}

/** Every Member of a Family, locked. Call only while holding the Family lock. */
export function lockFamilyMembers(tx: Tx, familyId: string) {
  return tx
    .select({ id: user.id, familyRole: user.familyRole })
    .from(user)
    .where(eq(user.familyId, familyId))
    .orderBy(user.id)
    .for('update');
}

export function requireOwner(member: LockedMember): void {
  if (member.familyRole !== 'owner') {
    throw new ApiException(403, 'family.owner_required');
  }
}

/** A Member of the given Family, locked; 404 also hides Members of other Families. */
export async function lockFamilyMember(
  tx: Tx,
  familyId: string,
  memberId: string,
): Promise<LockedMember> {
  const [member] = await tx
    .select({
      id: user.id,
      familyId: user.familyId,
      familyRole: user.familyRole,
    })
    .from(user)
    .where(and(eq(user.id, memberId), eq(user.familyId, familyId)))
    .for('update');
  if (!member) throw new ApiException(404, 'family.member_not_found');
  return member;
}
