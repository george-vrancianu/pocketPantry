import { and, asc, eq, ne } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import { familyAllergies, memberAllergies, user } from '../database/schema';

/** A Family's Allergies for people without an account, oldest first so the order is stable. */
export async function loadFamilyAllergies(
  executor: Executor,
  familyId: string,
): Promise<{ id: string; allergenId: string; label: string | null }[]> {
  return executor
    .select({
      id: familyAllergies.id,
      allergenId: familyAllergies.allergenId,
      label: familyAllergies.label,
    })
    .from(familyAllergies)
    .where(eq(familyAllergies.familyId, familyId))
    .orderBy(asc(familyAllergies.createdAt), asc(familyAllergies.id));
}

/** The Allergies of every Member of the Family except `memberId`, with the Member's name. */
export async function loadOtherMemberAllergies(
  executor: Executor,
  familyId: string,
  memberId: string,
): Promise<{ memberId: string; name: string; allergenId: string }[]> {
  return executor
    .select({
      memberId: user.id,
      name: user.name,
      allergenId: memberAllergies.allergenId,
    })
    .from(memberAllergies)
    .innerJoin(user, eq(user.id, memberAllergies.userId))
    .where(and(eq(user.familyId, familyId), ne(user.id, memberId)))
    .orderBy(asc(user.name), asc(user.id));
}
