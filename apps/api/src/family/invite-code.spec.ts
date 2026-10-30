import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  INVITE_CODE_TTL_DAYS,
  generateInviteCode,
  inviteCodeExpiry,
  PROMO_CODE_LENGTH,
  formatPromoCode,
  generatePromoCode,
  looksLikeInviteCode,
  looksLikePromoCode,
  normalizePromoCode,
} from './invite-code';

describe('Invite Code', () => {
  it('is 8 characters from an unambiguous uppercase alphanumeric alphabet', () => {
    expect(INVITE_CODE_LENGTH).toBe(8);
    expect(INVITE_CODE_ALPHABET).toMatch(/^[A-Z0-9]+$/);
    for (const ambiguous of ['0', 'O', '1', 'I', 'L']) {
      expect(INVITE_CODE_ALPHABET).not.toContain(ambiguous);
    }
    for (let i = 0; i < 200; i++) {
      expect(generateInviteCode()).toMatch(
        new RegExp(`^[${INVITE_CODE_ALPHABET}]{8}$`),
      );
    }
  });

  it('expires 7 days after generation', () => {
    const now = new Date('2026-01-01T12:00:00.000Z');
    expect(INVITE_CODE_TTL_DAYS).toBe(7);
    expect(inviteCodeExpiry(now).toISOString()).toBe(
      '2026-01-08T12:00:00.000Z',
    );
  });
});

describe('Promo Code', () => {
  it('is 10 characters from the Invite Code alphabet', () => {
    expect(PROMO_CODE_LENGTH).toBe(10);
    for (let i = 0; i < 200; i++) {
      expect(generatePromoCode()).toMatch(
        new RegExp(`^[${INVITE_CODE_ALPHABET}]{10}$`),
      );
    }
  });

  it('is displayed as XXXXX-XXXXX', () => {
    expect(formatPromoCode('ABCDEFGHJK')).toBe('ABCDE-FGHJK');
  });

  it('normalises case, spaces and dashes', () => {
    expect(normalizePromoCode(' abcde-fghjk ')).toBe('ABCDEFGHJK');
    expect(normalizePromoCode('abcde fgh jk')).toBe('ABCDEFGHJK');
    expect(normalizePromoCode('ABCDEFGHJK')).toBe('ABCDEFGHJK');
  });
});

describe('Promo Code vs Invite Code shape', () => {
  it('tells an Invite Code from a Promo Code once normalised', () => {
    expect(looksLikeInviteCode(normalizePromoCode('abcd-efgh'))).toBe(true);
    expect(looksLikeInviteCode(generateInviteCode())).toBe(true);
    expect(looksLikeInviteCode(normalizePromoCode('abcde-fghjk'))).toBe(false);
    expect(looksLikeInviteCode('ABCDEFG')).toBe(false);
    expect(looksLikeInviteCode('ABCD0FGH')).toBe(false);
  });
});

describe('looksLikePromoCode', () => {
  it('is true for 10 characters of the code alphabet, once normalised', () => {
    expect(looksLikePromoCode(normalizePromoCode('abcde-fghjk'))).toBe(true);
    expect(looksLikePromoCode(generatePromoCode())).toBe(true);
  });

  it('is false for an Invite Code, other lengths and characters outside the alphabet', () => {
    expect(looksLikePromoCode(generateInviteCode())).toBe(false);
    expect(looksLikePromoCode('ABCDEFGHJ')).toBe(false);
    expect(looksLikePromoCode('ABCDEFGHJKM')).toBe(false);
    expect(looksLikePromoCode('ABCDEFGHJ0')).toBe(false);
  });
});
