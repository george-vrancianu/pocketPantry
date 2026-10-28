import { costAt, costUsd, priceOf } from './prices';

describe('costUsd', () => {
  it('prices input, cached input and output tokens per million', () => {
    // gpt-6-luna: 0.1 input, 0.01 cached input, 0.5 output per 1M.
    expect(
      costUsd('gpt-6-luna', {
        inputTokens: 1_000_000,
        cachedInputTokens: 400_000,
        outputTokens: 200_000,
      }),
    ).toBeCloseTo(0.6 * 0.1 + 0.4 * 0.01 + 0.2 * 0.5, 10);
  });

  it('bills reasoning tokens as output, which already counts them', () => {
    expect(
      costUsd('gpt-6-luna', {
        inputTokens: 0,
        outputTokens: 1_000_000,
        reasoningTokens: 600_000,
      }),
    ).toBeCloseTo(0.5, 10);
  });

  it('prices a dated snapshot as its base model', () => {
    expect(
      costUsd('gpt-4o-mini-2024-07-18', {
        inputTokens: 1_000_000,
        outputTokens: 0,
      }),
    ).toBeCloseTo(0.15, 10);
  });

  it('prices a duration-billed transcription model per minute of audio', () => {
    expect(costUsd('whisper-1', { audioSeconds: 90 })).toBeCloseTo(0.009, 10);
  });

  it('prices a token-billed transcription model from its tokens', () => {
    expect(
      costUsd('gpt-4o-transcribe', { inputTokens: 1000, outputTokens: 100 }),
    ).toBeCloseTo((1000 * 6 + 100 * 10) / 1_000_000, 10);
  });

  it('is null for a model with no price', () => {
    expect(
      costUsd('vendor-model', { inputTokens: 1, outputTokens: 1 }),
    ).toBeNull();
  });

  it('is null when the provider reported no usage, or not the kind the model bills by', () => {
    expect(costUsd('gpt-6-luna', undefined)).toBeNull();
    expect(costUsd('gpt-6-luna', { audioSeconds: 10 })).toBeNull();
    expect(
      costUsd('whisper-1', { inputTokens: 5, outputTokens: 5 }),
    ).toBeNull();
    expect(costUsd('whisper-1', {})).toBeNull();
  });

  it('is zero for a call that used nothing', () => {
    expect(costUsd('gpt-6-luna', { inputTokens: 0, outputTokens: 0 })).toBe(0);
  });
});

describe('priceOf / costAt', () => {
  it('finds no price for an unknown model', () => {
    expect(priceOf('vendor-model')).toBeUndefined();
  });

  it('costs usage at a price given by the caller', () => {
    expect(
      costAt(
        { input: 1, cachedInput: 1, output: 2 },
        { inputTokens: 1_000_000, outputTokens: 1_000_000 },
      ),
    ).toBe(3);
  });
});
