/** What one provider call reported using. A field is absent when the provider did not report it. */
export type CallUsage = {
  inputTokens?: number;
  outputTokens?: number;
  /** Counted within `inputTokens`. */
  cachedInputTokens?: number;
  /** Counted within `outputTokens`; bills as output. */
  reasoningTokens?: number;
  /** Transcription only: audio length as the provider reports it (never the client's `durationMs`). */
  audioSeconds?: number;
};

/** USD per 1M tokens. */
export type TokenPrice = { input: number; cachedInput: number; output: number };
/** USD per minute of audio, for models the provider bills by duration. */
export type MinutePrice = { perMinute: number };
export type Price = TokenPrice | MinutePrice;

/**
 * USD per model, from the providers' list prices (2026-10). Reasoning tokens bill as output.
 * Token-billed transcription models bill their (audio) input at the audio rate: the provider
 * reports one input count, so this slightly over-estimates a prompt's text tokens.
 * A model not listed here has an unknown cost (`costUsd` returns null); add it when it is used.
 */
export const PRICES: Record<string, Price> = {
  'gpt-6-luna': { input: 0.1, cachedInput: 0.01, output: 0.5 },
  'gpt-5-mini': { input: 0.25, cachedInput: 0.025, output: 2 },
  'gpt-4o-mini': { input: 0.15, cachedInput: 0.075, output: 0.6 },
  'gpt-transcribe': { input: 6, cachedInput: 6, output: 10 },
  'gpt-4o-transcribe': { input: 6, cachedInput: 6, output: 10 },
  'gpt-4o-mini-transcribe': { input: 3, cachedInput: 3, output: 5 },
  'whisper-1': { perMinute: 0.006 },
};

/** The price of a model; a dated snapshot (`gpt-4o-mini-2024-07-18`) is priced as its base model. */
export function priceOf(model: string): Price | undefined {
  return PRICES[model] ?? PRICES[model.replace(/-\d{4}-\d{2}-\d{2}$/, '')];
}

/** The cost of `usage` at `price`, or null when `usage` lacks what the price needs. */
export function costAt(
  price: Price,
  usage: CallUsage | undefined,
): number | null {
  if (!usage) return null;
  if ('perMinute' in price) {
    return usage.audioSeconds === undefined
      ? null
      : (usage.audioSeconds / 60) * price.perMinute;
  }
  if (usage.inputTokens === undefined || usage.outputTokens === undefined) {
    return null;
  }
  const cached = usage.cachedInputTokens ?? 0;
  return (
    ((usage.inputTokens - cached) * price.input +
      cached * price.cachedInput +
      usage.outputTokens * price.output) /
    1_000_000
  );
}

/** The USD cost of one call; null when the model is not in the table or the usage is unknown. */
export function costUsd(
  model: string,
  usage: CallUsage | undefined,
): number | null {
  const price = priceOf(model);
  return price ? costAt(price, usage) : null;
}
