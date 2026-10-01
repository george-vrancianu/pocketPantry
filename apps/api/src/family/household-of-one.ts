import { randomUUID } from 'node:crypto';
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

/** The slice of a Better Auth (transaction) adapter needed to create the Family. */
type FamilyWriter = {
  create(args: {
    model: string;
    data: Record<string, unknown>;
    forceAllowId?: boolean;
  }): Promise<unknown>;
};

/**
 * The empty Family a Member is created into at signup; returns its id.
 * Pass the current transaction adapter so the Family commits or rolls back
 * together with the Member. No collision retry here: a failed statement
 * aborts the surrounding transaction, and a code clash is vanishingly rare.
 */
export async function createHouseholdOfOne(
  writer: FamilyWriter,
): Promise<string> {
  const id = randomUUID();
  await writer.create({
    model: 'family',
    data: {
      id,
      inviteCode: generateInviteCode(),
      inviteCodeExpiresAt: inviteCodeExpiry(),
    },
    forceAllowId: true,
  });
  return id;
}
