import { validateEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://x',
  CLIENT_ORIGIN: 'http://localhost:5173',
  BETTER_AUTH_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
};

describe('SCAN_TOKEN_SECRET', () => {
  it('falls back to a random per-process secret outside production, never a fixed one', () => {
    const a = validateEnv({ ...base, NODE_ENV: 'development' });
    const b = validateEnv({ ...base, NODE_ENV: 'test' });
    const c = validateEnv({ ...base });
    expect(a.SCAN_TOKEN_SECRET).not.toBe(b.SCAN_TOKEN_SECRET);
    expect(c.SCAN_TOKEN_SECRET).not.toBe(a.SCAN_TOKEN_SECRET);
    for (const { SCAN_TOKEN_SECRET } of [a, b, c]) {
      expect(SCAN_TOKEN_SECRET.length).toBeGreaterThanOrEqual(32);
    }
  });

  it('is required in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /SCAN_TOKEN_SECRET/,
    );
    expect(
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        SCAN_TOKEN_SECRET: 's'.repeat(32),
      }).SCAN_TOKEN_SECRET,
    ).toBe('s'.repeat(32));
  });

  it('must be at least 32 characters', () => {
    expect(() => validateEnv({ ...base, SCAN_TOKEN_SECRET: 'short' })).toThrow(
      /SCAN_TOKEN_SECRET/,
    );
  });
});

describe('SCAN_DEBUG_DIR', () => {
  it('is kept with an explicit NODE_ENV=development', () => {
    expect(
      validateEnv({
        ...base,
        NODE_ENV: 'development',
        SCAN_DEBUG_DIR: '.scan-debug',
      }).SCAN_DEBUG_DIR,
    ).toBe('.scan-debug');
  });

  it('is dropped in test, so a dev .env does not break the suite', () => {
    expect(
      validateEnv({ ...base, NODE_ENV: 'test', SCAN_DEBUG_DIR: '.scan-debug' })
        .SCAN_DEBUG_DIR,
    ).toBeUndefined();
  });

  it('is dropped when NODE_ENV is missing, which only defaults to development', () => {
    expect(
      validateEnv({ ...base, SCAN_DEBUG_DIR: '.scan-debug' }).SCAN_DEBUG_DIR,
    ).toBeUndefined();
  });

  it('stops the app from starting in production', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        SCAN_TOKEN_SECRET: 's'.repeat(32),
        SCAN_DEBUG_DIR: '.scan-debug',
      }),
    ).toThrow(/SCAN_DEBUG_DIR must not be set in production/);
  });
});
