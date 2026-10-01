import { validateEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://x',
  CLIENT_ORIGIN: 'http://localhost:5173',
  BETTER_AUTH_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
};

describe('SCAN_TOKEN_SECRET', () => {
  it('has a deterministic default outside production', () => {
    const a = validateEnv({ ...base, NODE_ENV: 'development' });
    const b = validateEnv({ ...base, NODE_ENV: 'test' });
    expect(a.SCAN_TOKEN_SECRET).toBe(b.SCAN_TOKEN_SECRET);
    expect(a.SCAN_TOKEN_SECRET.length).toBeGreaterThanOrEqual(32);
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
