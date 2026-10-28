import { parseGrantArgs } from './grant-args';

const FAMILY = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
const args = (
  over: Partial<Record<'family' | 'amount' | 'reason', string>>,
) => {
  const v = { family: FAMILY, amount: '50', reason: 'Beta tester', ...over };
  return Object.entries(v).flatMap(([k, val]) => [`--${k}`, val]);
};
const message = (argv: string[]) => {
  const r = parseGrantArgs(argv);
  return r.ok ? null : r.message;
};

describe('parseGrantArgs', () => {
  it('accepts a valid grant and trims the reason', () => {
    expect(parseGrantArgs(args({ reason: '  Beta tester ' }))).toEqual({
      ok: true,
      input: { familyId: FAMILY, amount: 50, reason: 'Beta tester' },
    });
  });

  it.each(['', '   '])('refuses a blank reason %j', (reason) => {
    expect(message(args({ reason }))).toMatch(/reason is required/);
  });

  it('refuses a missing reason, amount and Family', () => {
    expect(message(['--family', FAMILY, '--amount', '5'])).toMatch(
      /reason is required/,
    );
    expect(message(['--family', FAMILY, '--reason', 'x'])).toMatch(
      /amount is required/,
    );
    expect(message(['--amount', '5', '--reason', 'x'])).toMatch(
      /Family id is required/,
    );
  });

  it.each(['0', '1.5', 'abc', '1e3', '0x10', '+5', '5 0', '99999999999'])(
    'refuses the amount %j',
    (amount) => {
      expect(message(args({ amount }))).toMatch(/amount must be/);
    },
  );

  it('refuses a negative amount, given with or without =', () => {
    expect(
      message(['--family', FAMILY, '--reason', 'x', '--amount=-5']),
    ).toMatch(/amount must be/);
    expect(message(args({ amount: '-5' }))).toMatch(
      /amount must be a positive whole number/,
    );
  });

  it('refuses a Family id that is not a UUID', () => {
    expect(message(args({ family: 'abc' }))).toMatch(/not a Family id/);
  });

  it('refuses unknown flags and positionals', () => {
    expect(message([...args({}), '--force'])).toBeTruthy();
    expect(message([...args({}), 'extra'])).toBeTruthy();
  });
});
