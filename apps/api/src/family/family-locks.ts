import { and, eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Database, Tx } from '../database/database.types';
import { family, user } from '../database/schema';

export type LockedMember = {
  id: string;
  familyId: string;
  familyRole: 'owner' | 'member';
};

/** The Member moved Family between the unlocked peek and the lock. */
export class ConcurrentMove extends Error {}

const MAX_ATTEMPTS = 5;

/**
 * Runs `work` in a transaction, restarting it from scratch if it reports a
 * ConcurrentMove. Restarting (rather than re-locking inside the transaction)
 * releases every lock first, so Family locks are always taken in ascending id
 * order and cannot deadlock.
 */
export async function runLocked<T>(
  database: Database,
  work: (tx: Tx) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await database.transaction(work);
    } catch (error) {
      if (!(error instanceof ConcurrentMove)) throw error;
      if (attempt >= MAX_ATTEMPTS) {
        throw new ApiException(409, 'family.concurrent_change');
      }
    }
  }
}

/**
 * Lock order, everywhere: Family rows first (ascending id when several), then
 * Member rows. Every membership mutation takes the Family lock, so they are
 * serialised per Family and cannot deadlock one another.
 *
 * Locks the Member's current Family (plus any extra Families) and then the
 * Member, and returns the Member as read from the database under the lock,
 * never from the session. Throws ConcurrentMove if the Member changed Family
 * in between; call through `runLocked` so the transaction restarts.
 */
export async function lockMemberAndFamily(
  tx: Tx,
  memberId: string,
  alsoLockFamilyIds: string[] = [],
): Promise<LockedMember> {
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
  if (member.familyId !== peek.familyId) throw new ConcurrentMove();
  return member;
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
