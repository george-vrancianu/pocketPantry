import { ApiException } from '../common/api-exception';
import { signPlateToken, verifyPlateToken } from './plate-token';

const SECRET = 'a-token-secret-that-is-at-least-32-chars';
const titles = ['Pancakes', 'Crepes'];
const T0 = 1_700_000_000_000;

const sign = (overrides: Partial<Parameters<typeof signPlateToken>[0]> = {}) =>
  signPlateToken({
    secret: SECRET,
    memberId: 'm1',
    titles,
    now: T0,
    ...overrides,
  });
const verify = (
  token: string | undefined,
  overrides: Partial<Parameters<typeof verifyPlateToken>[0]> = {},
) =>
  verifyPlateToken({
    secret: SECRET,
    memberId: 'm1',
    dishTitle: 'Pancakes',
    token,
    now: T0 + 1000,
    ...overrides,
  });
const invalid = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiException);
    expect(error).toMatchObject({ code: 'scan.plate_token_invalid' });
    expect((error as ApiException).getStatus()).toBe(400);
    return;
  }
  throw new Error('expected the token to be rejected');
};
const forge = (
  token: string,
  edit: (payload: Record<string, unknown>) => void,
) => {
  const [body, signature] = token.split('.');
  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8'),
  ) as Record<string, unknown>;
  edit(payload);
  const forged = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${forged}.${signature}`;
};

describe('Plate token', () => {
  it('round-trips: a title in the signed list verifies', () => {
    expect(() => verify(sign())).not.toThrow();
    expect(() => verify(sign(), { dishTitle: 'Crepes' })).not.toThrow();
  });

  it('is base64url and does not contain the secret', () => {
    const token = sign();
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(token).not.toContain(SECRET);
  });

  it('rejects a missing, empty or malformed token', () => {
    invalid(() => verify(undefined));
    invalid(() => verify(''));
    invalid(() => verify('nonsense'));
    invalid(() => verify('a.b.c'));
    invalid(() => verify('!!!.???'));
  });

  it('rejects a title that is not in the signed list', () => {
    invalid(() => verify(sign(), { dishTitle: 'Lasagne' }));
  });

  it('rejects a tampered title list, Member, expiry or signature', () => {
    invalid(() =>
      verify(
        forge(sign(), (p) => (p.t = ['Pancakes', 'Crepes', 'Lasagne'])),
        {
          dishTitle: 'Lasagne',
        },
      ),
    );
    invalid(() =>
      verify(
        forge(sign(), (p) => (p.m = 'm2')),
        { memberId: 'm2' },
      ),
    );
    invalid(() => verify(forge(sign(), (p) => (p.e = T0 + 10 ** 9))));
    const [body] = sign().split('.');
    invalid(() => verify(`${body}.${Buffer.alloc(32).toString('base64url')}`));
    invalid(() => verify(`${body}.`));
  });

  it('rejects a signature that decodes to the right mac but is not its canonical encoding', () => {
    const token = sign();
    const [body, signature] = token.split('.');
    invalid(() => verify(`${body}.${signature}=`));
    // 32 bytes fill 43 characters with 4 spare bits: another last character can decode to the same bytes.
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const last = signature.at(-1) as string;
    const sibling = alphabet[(alphabet.indexOf(last) ^ 1) % 64];
    expect(
      Buffer.from(signature.slice(0, -1) + sibling, 'base64url').equals(
        Buffer.from(signature, 'base64url'),
      ),
    ).toBe(true);
    invalid(() => verify(`${body}.${signature.slice(0, -1)}${sibling}`));
  });

  it('returns what identifies this token and when it lapses', () => {
    const token = sign();
    expect(verify(token)).toEqual({
      signature: token.split('.')[1],
      expiresAt: T0 + 10 * 60_000,
    });
  });

  it("rejects another Member's token", () => {
    invalid(() => verify(sign({ memberId: 'm2' })));
  });

  it('rejects a token signed with another secret', () => {
    invalid(() => verify(sign({ secret: 'x'.repeat(40) })));
  });

  it('expires after about ten minutes, by the injected clock', () => {
    const token = sign();
    expect(() => verify(token, { now: T0 + 9 * 60_000 })).not.toThrow();
    invalid(() => verify(token, { now: T0 + 10 * 60_000 + 1 }));
  });
});
