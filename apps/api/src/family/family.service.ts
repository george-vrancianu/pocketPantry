import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { family, user } from '../database/schema';
import { withFreshInviteCode } from './household-of-one';

export type FamilyView = {
  id: string;
  inviteCode: string;
  inviteCodeExpiresAt: Date;
  members: Array<{ id: string; name: string; isOwner: boolean }>;
  currentMemberIsOwner: boolean;
};

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
    const [owner] = await this.database
      .select({ familyId: user.familyId })
      .from(user)
      .where(and(eq(user.id, memberId), eq(user.familyRole, 'owner')))
      .limit(1);
    if (!owner) throw new ApiException(403, 'family.owner_required');

    await withFreshInviteCode((code) =>
      this.database
        .update(family)
        .set(code)
        .where(eq(family.id, owner.familyId)),
    );
    return this.getForMember(memberId);
  }
}
