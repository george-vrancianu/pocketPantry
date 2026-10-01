import type { Database } from '../database/database.types';
import { family } from '../database/schema';
import { generateInviteCode, inviteCodeExpiry } from './invite-code';

const MAX_CODE_ATTEMPTS = 5;

export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (current && typeof current === 'object') {
    if ('code' in current && current.code === '23505') return true;
    current = 'cause' in current ? current.cause : undefined;
  }
  return false;
}

type FreshCode = { inviteCode: string; inviteCodeExpiresAt: Date };

/** Retries on the (vanishingly rare) Invite Code collision with another Family. */
export async function withFreshInviteCode<T>(
  write: (code: FreshCode) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await write({
        inviteCode: generateInviteCode(),
        inviteCodeExpiresAt: inviteCodeExpiry(),
      });
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= MAX_CODE_ATTEMPTS) {
        throw error;
      }
    }
  }
}

/** The empty Family a Member is created into at signup; returns its id. */
export async function createHouseholdOfOne(
  database: Database,
): Promise<string> {
  const [created] = await withFreshInviteCode((code) =>
    database.insert(family).values(code).returning({ id: family.id }),
  );
  return created.id;
}
