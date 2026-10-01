import { randomInt } from 'node:crypto';

/** Uppercase alphanumerics without 0/O and 1/I/L, which are easy to misread. */
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 8;
export const INVITE_CODE_TTL_DAYS = 7;

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

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

export function inviteCodeExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);
}
