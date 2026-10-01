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

export function inviteCodeExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);
}
