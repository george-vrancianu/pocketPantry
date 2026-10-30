import { randomInt } from 'node:crypto';
import { hasPgCode } from '../database/pg-errors';

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
      if (!hasPgCode(error, '23505') || attempt >= MAX_CODE_ATTEMPTS) {
        throw error;
      }
    }
  }
}

export function inviteCodeExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** The form an Invite Code is stored and compared in: typed codes may have spaces or lower case. */
export const normalizeInviteCode = (raw: string): string =>
  raw.trim().toUpperCase();

export const PROMO_CODE_LENGTH = 10;

/** A Promo Code: the Invite Code alphabet, 10 characters. */
export function generatePromoCode(): string {
  let code = '';
  for (let i = 0; i < PROMO_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** The form a Promo Code is stored and compared in: typed codes may have spaces, dashes or lower case. */
export const normalizePromoCode = (raw: string): string =>
  raw.replace(/[\s-]/g, '').toUpperCase();

/** How a stored Promo Code is shown and copied: `XXXXX-XXXXX`. */
export const formatPromoCode = (code: string): string =>
  `${code.slice(0, 5)}-${code.slice(5)}`;

/** True when a normalised code could be an Invite Code (8 characters of the code alphabet). */
export const looksLikeInviteCode = (normalised: string): boolean =>
  normalised.length === INVITE_CODE_LENGTH &&
  [...normalised].every((c) => INVITE_CODE_ALPHABET.includes(c));

/** True when a normalised code could be a Promo Code (10 characters of the code alphabet). */
export const looksLikePromoCode = (normalised: string): boolean =>
  normalised.length === PROMO_CODE_LENGTH &&
  [...normalised].every((c) => INVITE_CODE_ALPHABET.includes(c));
