import { eq } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import { memberAllergies } from '../database/schema';

/** The Allergen ids a Member has recorded as their own Allergies. */
export async function loadMemberAllergenIds(
  executor: Executor,
  memberId: string,
): Promise<string[]> {
  const rows = await executor
    .select({ allergenId: memberAllergies.allergenId })
    .from(memberAllergies)
    .where(eq(memberAllergies.userId, memberId));
  return rows.map((row) => row.allergenId);
}
