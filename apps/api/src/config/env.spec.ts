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

describe('Voice text model defaults', () => {
  it('reads transcripts with gpt-5-mini at effort low, separate from the vision model', () => {
    const env = validateEnv({ ...base, AI_VISION_MODEL: 'vendor-vision' });
    expect(env.AI_TEXT_MODEL).toBe('gpt-5-mini');
    expect(env.AI_TEXT_REASONING_EFFORT).toBe('low');
  });

  it('sends no text effort when the text model is set and the effort is not', () => {
    const env = validateEnv({ ...base, AI_TEXT_MODEL: 'vendor-text' });
    expect(env.AI_TEXT_MODEL).toBe('vendor-text');
    expect(env.AI_TEXT_REASONING_EFFORT).toBeUndefined();
  });
});

describe('Scan model defaults', () => {
  it('runs a fresh deploy on gpt-6-luna at effort none', () => {
    const env = validateEnv({ ...base });
    expect(env.AI_VISION_MODEL).toBe('gpt-6-luna');
    expect(env.AI_REASONING_EFFORT).toBe('none');
  });

  it('treats `KEY=` as unset, so an empty model and effort still give the defaults', () => {
    const env = validateEnv({
      ...base,
      AI_VISION_MODEL: '',
      AI_REASONING_EFFORT: '',
    });
    expect(env.AI_VISION_MODEL).toBe('gpt-6-luna');
    expect(env.AI_REASONING_EFFORT).toBe('none');
  });

  it('sends no effort when the model is set and the effort is not (back to gpt-4o-mini)', () => {
    for (const AI_REASONING_EFFORT of [undefined, '']) {
      const env = validateEnv({
        ...base,
        AI_VISION_MODEL: 'gpt-4o-mini-2024-07-18',
        AI_REASONING_EFFORT,
      });
      expect(env.AI_VISION_MODEL).toBe('gpt-4o-mini-2024-07-18');
      expect(env.AI_REASONING_EFFORT).toBeUndefined();
    }
  });

  it('leaves an openai-compatible vendor model without an effort', () => {
    const env = validateEnv({
      ...base,
      AI_PROVIDER: 'openai-compatible',
      AI_BASE_URL: 'https://vendor.example/v1',
      AI_VISION_MODEL: 'vendor-vision-model',
    });
    expect(env.AI_REASONING_EFFORT).toBeUndefined();
  });

  it('keeps an effort set alongside a model', () => {
    expect(
      validateEnv({
        ...base,
        AI_VISION_MODEL: 'gpt-6-luna',
        AI_REASONING_EFFORT: 'low',
      }).AI_REASONING_EFFORT,
    ).toBe('low');
  });

  it('rejects an unknown effort', () => {
    expect(() =>
      validateEnv({ ...base, AI_REASONING_EFFORT: 'turbo' }),
    ).toThrow(/AI_REASONING_EFFORT/);
  });
});
