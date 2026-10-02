import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { family, user } from '../database/schema';
import {
  lockFamilyMember,
  lockFamilyMembers,
  lockMemberAndFamily,
  requireOwner,
  runLocked,
} from './family-locks';
import { withFreshInviteCode } from './invite-code';
import {
  countFamilyData,
  moveToNewHouseholdOfOne,
  type FamilyDataCounts,
} from './membership';

export type FamilyView = {
  id: string;
  inviteCode: string;
  inviteCodeExpiresAt: Date;
  members: Array<{ id: string; name: string; isOwner: boolean }>;
  currentMemberIsOwner: boolean;
};

/** What joining would delete: the caller's own Household of One and its data. */
export type JoinPreview = FamilyDataCounts;

/**
 * Every mutation here runs in one transaction that first locks the affected
 * Family row(s), then the Member row(s) (see family-locks.ts), and reads the
 * caller's role from the database under that lock, never from the session.
 * Each returns the caller's Family as it is after the change.
 */
@Injectable()
export class FamilyService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getForMember(memberId: string): Promise<FamilyView> {
    const [self] = await this.database
      .select({ familyId: user.familyId, familyRole: user.familyRole })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!self) throw new ApiException(401, 'auth.unauthenticated');

    const [row] = await this.database
      .select()
      .from(family)
      .where(eq(family.id, self.familyId))
      .limit(1);
    const members = await this.database
      .select({ id: user.id, name: user.name, familyRole: user.familyRole })
      .from(user)
      .where(eq(user.familyId, self.familyId))
      // Owner first: 'owner' precedes 'member' in the enum.
      .orderBy(asc(user.familyRole), asc(user.createdAt), asc(user.id));

    return {
      id: row.id,
      inviteCode: row.inviteCode,
      inviteCodeExpiresAt: row.inviteCodeExpiresAt,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        isOwner: m.familyRole === 'owner',
      })),
      currentMemberIsOwner: self.familyRole === 'owner',
    };
  }

  /** Owner only. Replaces the code in place, so the previous one stops working. */
  async regenerateInviteCode(memberId: string): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const owner = await lockMemberAndFamily(tx, memberId);
      requireOwner(owner);
      await withFreshInviteCode((code) =>
        tx.transaction((savepoint) =>
          savepoint
            .update(family)
            .set(code)
            .where(eq(family.id, owner.familyId)),
        ),
      );
    });
    return this.getForMember(memberId);
  }

  /** Same checks as `join`, no changes: what joining with `code` would delete. */
  async previewJoin(memberId: string, code: string): Promise<JoinPreview> {
    // Read-only: no row locks, so a preview never blocks (or is blocked by) others.
    const { counts } = await this.prepareJoin(
      this.database,
      memberId,
      code,
      false,
    );
    return counts;
  }

  /**
   * Joins the Family behind `code`. Only a Household of One can be abandoned:
   * it is deleted with its data (never merged) in the same transaction.
   */
  async join(memberId: string, code: string): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const { abandoned, target } = await this.prepareJoin(
        tx,
        memberId,
        code,
        true,
      );
      await tx
        .update(user)
        .set({ familyId: target, familyRole: 'member' })
        .where(eq(user.id, memberId));
      // Its only Member just left, so nothing references it any more.
      await tx.delete(family).where(eq(family.id, abandoned));
    });
    return this.getForMember(memberId);
  }

  /** A non-Owner Member leaves for a fresh Household of One. */
  async leave(memberId: string): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const member = await lockMemberAndFamily(tx, memberId);
      if (member.familyRole === 'owner') {
        throw new ApiException(409, 'family.owner_cannot_leave');
      }
      await moveToNewHouseholdOfOne(tx, memberId);
    });
    return this.getForMember(memberId);
  }

  /** Owner only. The removed Member lands in a fresh Household of One. */
  async removeMember(ownerId: string, targetId: string): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const owner = await lockMemberAndFamily(tx, ownerId);
      requireOwner(owner);
      if (targetId === ownerId) {
        throw new ApiException(400, 'family.cannot_remove_self');
      }
      await lockFamilyMember(tx, owner.familyId, targetId);
      await moveToNewHouseholdOfOne(tx, targetId);
    });
    return this.getForMember(ownerId);
  }

  /** Owner only. Hands ownership to another Member of the same Family. */
  async transferOwnership(
    ownerId: string,
    targetId: string,
  ): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const owner = await lockMemberAndFamily(tx, ownerId);
      requireOwner(owner);
      if (targetId === ownerId) {
        throw new ApiException(400, 'family.cannot_transfer_to_self');
      }
      await lockFamilyMember(tx, owner.familyId, targetId);
      // One Owner per Family is a unique index checked per statement: demote first.
      await tx
        .update(user)
        .set({ familyRole: 'member' })
        .where(eq(user.id, ownerId));
      await tx
        .update(user)
        .set({ familyRole: 'owner' })
        .where(eq(user.id, targetId));
    });
    return this.getForMember(ownerId);
  }

  /**
   * Owner only. Deletes the Family and everything it owns; every Member,
   * the Owner included, gets a fresh empty Household of One.
   */
  async deleteFamily(ownerId: string): Promise<FamilyView> {
    await runLocked(this.database, async (tx) => {
      const owner = await lockMemberAndFamily(tx, ownerId);
      requireOwner(owner);
      const members = await lockFamilyMembers(tx, owner.familyId);
      for (const member of members) {
        await moveToNewHouseholdOfOne(tx, member.id);
      }
      // Pantry/Shopping tables reference family ON DELETE CASCADE.
      await tx.delete(family).where(eq(family.id, owner.familyId));
    });
    return this.getForMember(ownerId);
  }

  /**
   * Validates a join. With `lock`, takes the Family/Member locks and the
   * result is authoritative (used by `join`); without, plain reads (preview).
   */
  private async prepareJoin(
    db: Executor,
    memberId: string,
    rawCode: string,
    lock: boolean,
  ) {
    const code = rawCode.trim().toUpperCase();
    const invalid = () => new ApiException(404, 'family.invite_code_invalid');

    const [peek] = await db
      .select({ id: family.id })
      .from(family)
      .where(eq(family.inviteCode, code));
    if (!peek) throw invalid();

    let member: { familyId: string };
    if (lock) {
      member = await lockMemberAndFamily(db as Tx, memberId, [peek.id]);
    } else {
      const [row] = await db
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, memberId));
      if (!row) throw new ApiException(401, 'auth.unauthenticated');
      member = row;
    }

    // Re-read (under the lock when locking): the Owner may have regenerated or deleted it.
    const [target] = await db
      .select()
      .from(family)
      .where(eq(family.id, peek.id));
    if (!target || target.inviteCode !== code) throw invalid();
    if (member.familyId === target.id) {
      throw new ApiException(409, 'family.already_member');
    }
    if (target.inviteCodeExpiresAt.getTime() <= Date.now()) {
      throw new ApiException(410, 'family.invite_code_expired');
    }
    const housemates = lock
      ? await lockFamilyMembers(db as Tx, member.familyId)
      : await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.familyId, member.familyId));
    if (housemates.length > 1) {
      throw new ApiException(409, 'family.not_household_of_one');
    }
    return {
      abandoned: member.familyId,
      target: target.id,
      counts: await countFamilyData(db, member.familyId),
    };
  }
}
