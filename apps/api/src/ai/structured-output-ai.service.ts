import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ApiException } from '../common/api-exception';
import type { AppConfig, ReasoningEffort } from '../config/env';
import {
  createScanDebugRecorder,
  type ScanDebugCall,
  type ScanDebugRecorder,
} from './scan-debug-recorder';

export type StructuredOutputRequest = {
  prompt: string;
  images?: string[];
  schemaName: string;
  schema: Record<string, unknown>;
  /** Budget for the answer itself; with a reasoning effort the service adds room for reasoning. */
  maxOutputTokens: number;
  /** Which configured model answers: the vision model (default, Scans) or the text model (Voice Notes). */
  model?: 'vision' | 'text';
  /** Debug capture only: ties a Voice Note's transcript read to its recording. Never sent to the provider. */
  captureId?: string;
};

export type StructuredOutputResult = {
  data: unknown;
  requestId: string | null;
  /** The model that answered; a Usage Record falls back to the configured one when absent. */
  model?: string;
  /** Billed tokens, when the provider reported them. */
  usage?: AiTokenUsage;
};

export type StructuredOutputErrorCode =
  'incomplete' | 'refusal' | 'empty' | 'failed';

/** Provider-side failure; `code` is the stable API code, `reason` says what the provider did. */
export class StructuredOutputAiError extends ApiException {
  constructor(
    readonly reason: StructuredOutputErrorCode,
    readonly requestId: string | null,
  ) {
    const codes: Record<StructuredOutputErrorCode, string> = {
      incomplete: 'scan.provider_incomplete',
      empty: 'scan.provider_incomplete',
      refusal: 'scan.provider_refused',
      failed: 'scan.provider_unavailable',
    };
    super(502, codes[reason]);
  }
}

/**
 * `temperature: 0` keeps receipt reads repeatable. gpt-6-luna accepts it only at effort
 * `none` (no reasoning) and rejects it at low, medium, high and xhigh (probed on both APIs
 * for low, on Responses for the rest). It has no `minimal` effort at all.
 */
function acceptsTemperature(effort: ReasoningEffort | undefined): boolean {
  return effort === undefined || effort === 'none';
}

/**
 * Reasoning tokens count against the output limit, so each effort adds room on top of a
 * Scan Mode's answer budget. At effort low gpt-6-luna used ~70-270 reasoning tokens per Scan.
 */
const REASONING_HEADROOM: Record<ReasoningEffort, number> = {
  none: 0,
  minimal: 1000,
  low: 2000,
  medium: 8000,
  high: 16_000,
  xhigh: 32_000,
};

function outputBudget(
  request: StructuredOutputRequest,
  effort: ReasoningEffort | undefined,
): number {
  return request.maxOutputTokens + (effort ? REASONING_HEADROOM[effort] : 0);
}

export type AiTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  /** Counted within `outputTokens`; only reasoning models report it. */
  reasoningTokens?: number;
};

type CallTrace = Partial<
  Pick<
    ScanDebugCall,
    | 'provider'
    | 'model'
    | 'requestId'
    | 'httpStatus'
    | 'body'
    | 'data'
    | 'error'
  >
>;

function describeError(error: unknown): ScanDebugCall['error'] {
  if (error instanceof StructuredOutputAiError) {
    return { code: error.code, reason: error.reason };
  }
  if (error instanceof ApiException) return { code: error.code };
  return {
    code: 'unexpected',
    message: error instanceof Error ? error.message : String(error),
  };
}

const tokenCount = z.number().int().nonnegative();

const reasoningDetails = z
  .object({ reasoning_tokens: tokenCount.optional() })
  .optional()
  .catch(undefined);

/** Usage is best-effort telemetry: a missing or malformed block is dropped, never an error. */
const responsesUsageSchema = z
  .object({
    input_tokens: tokenCount,
    output_tokens: tokenCount,
    input_tokens_details: z
      .object({ cached_tokens: tokenCount.optional() })
      .optional()
      .catch(undefined),
    output_tokens_details: reasoningDetails,
  })
  .transform((u): AiTokenUsage => ({
    inputTokens: u.input_tokens,
    outputTokens: u.output_tokens,
    cachedInputTokens: u.input_tokens_details?.cached_tokens,
    reasoningTokens: u.output_tokens_details?.reasoning_tokens,
  }));

const chatUsageSchema = z
  .object({
    prompt_tokens: tokenCount,
    completion_tokens: tokenCount,
    prompt_tokens_details: z
      .object({ cached_tokens: tokenCount.optional() })
      .optional()
      .catch(undefined),
    completion_tokens_details: reasoningDetails,
  })
  .transform((u): AiTokenUsage => ({
    inputTokens: u.prompt_tokens,
    outputTokens: u.completion_tokens,
    cachedInputTokens: u.prompt_tokens_details?.cached_tokens,
    reasoningTokens: u.completion_tokens_details?.reasoning_tokens,
  }));

/**
 * Token usage from a provider body (`openai` is the Responses API, anything else Chat
 * Completions). Best-effort telemetry: a missing or malformed block is `undefined`.
 */
export function readAiUsage(
  provider: string,
  body: unknown,
): AiTokenUsage | undefined {
  const schema: z.ZodType<AiTokenUsage> =
    provider === 'openai' ? responsesUsageSchema : chatUsageSchema;
  const usage = schema.safeParse((body as { usage?: unknown } | null)?.usage);
  return usage.success ? usage.data : undefined;
}

const openAiResponsesBodySchema = z.object({
  status: z.string().optional(),
  usage: z.unknown().optional(),
  output: z.array(
    z.object({
      type: z.string().optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

const chatCompletionsBodySchema = z.object({
  usage: z.unknown().optional(),
  choices: z.array(
    z.object({
      finish_reason: z.string().nullable().optional(),
      message: z.object({
        content: z.union([
          z.string(),
          z.array(
            z.object({
              type: z.string().optional(),
              text: z.string().optional(),
            }),
          ),
        ]),
        refusal: z.string().nullable().optional(),
      }),
    }),
  ),
});

@Injectable()
export class StructuredOutputAiService {
  private readonly logger = new Logger(StructuredOutputAiService.name);
  private readonly debug: ScanDebugRecorder | undefined;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.debug = createScanDebugRecorder(
      config.get('NODE_ENV', { infer: true }),
      config.get('SCAN_DEBUG_DIR', { infer: true }),
    );
  }

  /** Aborting `options.signal` abandons the provider call (it then fails as `scan.provider_unavailable`). */
  async generate(
    request: StructuredOutputRequest,
    options: { signal?: AbortSignal } = {},
  ): Promise<StructuredOutputResult> {
    if (!this.debug) return this.call(request, {}, options.signal);
    const trace: CallTrace = {};
    const startedAt = new Date();
    try {
      const result = await this.call(request, trace, options.signal);
      trace.data = result.data;
      return result;
    } catch (error) {
      trace.error = describeError(error);
      throw error;
    } finally {
      await this.debug.record({
        request,
        provider: trace.provider ?? 'unknown',
        model: trace.model ?? 'unknown',
        startedAt,
        durationMs: Date.now() - startedAt.getTime(),
        requestId: trace.requestId ?? null,
        httpStatus: trace.httpStatus,
        body: trace.body,
        data: trace.data,
        error: trace.error,
      });
    }
  }

  /** The provider call; `trace` collects what the Scan debug capture records. */
  private async call(
    request: StructuredOutputRequest,
    trace: CallTrace,
    signal?: AbortSignal,
  ): Promise<StructuredOutputResult> {
    const provider = this.config.get('AI_PROVIDER', { infer: true });
    const apiKey = this.config.get('AI_API_KEY', { infer: true });
    const text = request.model === 'text';
    const model = this.config.get(text ? 'AI_TEXT_MODEL' : 'AI_VISION_MODEL', {
      infer: true,
    });
    const configuredBaseUrl = this.config.get('AI_BASE_URL', { infer: true });
    // `|| undefined`: with no validated effort, ConfigService falls back to process.env,
    // where `AI_REASONING_EFFORT=` is ''. That means no effort, as validateEnv reads it.
    const effort =
      this.config.get(
        text ? 'AI_TEXT_REASONING_EFFORT' : 'AI_REASONING_EFFORT',
        {
          infer: true,
        },
      ) || undefined;
    trace.provider = provider;
    trace.model = model;

    if (!apiKey) {
      throw new ApiException(503, 'scan.not_configured');
    }
    if (provider === 'openai-compatible' && !configuredBaseUrl) {
      throw new ApiException(503, 'scan.not_configured');
    }

    const baseUrl = (configuredBaseUrl ?? 'https://api.openai.com/v1').replace(
      /\/$/,
      '',
    );
    const isResponsesApi = provider === 'openai';
    let response: Response;

    try {
      response = await fetch(
        `${baseUrl}/${isResponsesApi ? 'responses' : 'chat/completions'}`,
        {
          method: 'POST',
          ...(signal ? { signal } : {}),
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(
            isResponsesApi
              ? this.toResponsesRequest(request, model, effort)
              : this.toChatCompletionsRequest(request, model, effort),
          ),
        },
      );
    } catch {
      throw new ApiException(502, 'scan.provider_unavailable');
    }

    const requestId = response.headers.get('x-request-id');
    trace.httpStatus = response.status;
    trace.requestId = requestId;
    if (!response.ok) {
      if (this.debug) {
        trace.body = await response.text().catch(() => undefined);
      }
      throw new ApiException(502, 'scan.provider_unavailable', {
        status: response.status,
      });
    }

    try {
      // Read as text first, so the debug capture keeps a body that is not JSON.
      const raw = await response.text();
      trace.body = raw;
      const body: unknown = JSON.parse(raw);
      trace.body = body;
      const usage = readAiUsage(provider, body);
      this.logUsage(usage, request.schemaName, requestId, model);
      const text = isResponsesApi
        ? this.readResponsesText(body, requestId)
        : this.readChatCompletionsText(body, requestId);
      return {
        data: JSON.parse(text) as unknown,
        requestId,
        model,
        ...(usage ? { usage } : {}),
      };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(502, 'scan.result_invalid');
    }
  }

  /** Logs token counts only (never prompt, image or response content). */
  private logUsage(
    usage: AiTokenUsage | undefined,
    schemaName: string,
    requestId: string | null,
    model: string,
  ) {
    if (!usage) return;
    const { cachedInputTokens, reasoningTokens, ...counts } = usage;
    this.logger.log({
      message: 'AI token usage',
      model,
      requestId,
      schemaName,
      ...counts,
      ...(cachedInputTokens === undefined ? {} : { cachedInputTokens }),
      ...(reasoningTokens === undefined ? {} : { reasoningTokens }),
    });
  }

  private toResponsesRequest(
    request: StructuredOutputRequest,
    model: string,
    effort: ReasoningEffort | undefined,
  ) {
    return {
      model,
      ...(acceptsTemperature(effort) ? { temperature: 0 } : {}),
      ...(effort ? { reasoning: { effort } } : {}),
      store: false,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: request.prompt },
            ...(request.images ?? []).map((imageUrl) => ({
              type: 'input_image',
              image_url: imageUrl,
              detail: 'high',
            })),
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: request.schemaName,
          strict: true,
          schema: request.schema,
        },
      },
      max_output_tokens: outputBudget(request, effort),
    };
  }

  private toChatCompletionsRequest(
    request: StructuredOutputRequest,
    model: string,
    effort: ReasoningEffort | undefined,
  ) {
    return {
      model,
      ...(acceptsTemperature(effort) ? { temperature: 0 } : {}),
      ...(effort ? { reasoning_effort: effort } : {}),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: request.prompt },
            ...(request.images ?? []).map((url) => ({
              type: 'image_url',
              image_url: { url, detail: 'high' },
            })),
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: request.schemaName,
          strict: true,
          schema: request.schema,
        },
      },
      // Reasoning models reject `max_tokens`; without an effort, keep it for vendors that only know it.
      ...(effort
        ? { max_completion_tokens: outputBudget(request, effort) }
        : { max_tokens: request.maxOutputTokens }),
    };
  }

  private readResponsesText(body: unknown, requestId: string | null): string {
    const response = openAiResponsesBodySchema.parse(body);
    if (response.status && response.status !== 'completed') {
      throw new StructuredOutputAiError(
        response.status === 'incomplete' ? 'incomplete' : 'failed',
        requestId,
      );
    }
    const content = response.output
      .filter((item) => !item.type || item.type === 'message')
      .flatMap((item) => item.content ?? []);
    if (content.some((item) => item.type === 'refusal')) {
      throw new StructuredOutputAiError('refusal', requestId);
    }
    const text = content
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text ?? '')
      .join('');
    if (!text.trim()) {
      throw new StructuredOutputAiError('empty', requestId);
    }
    return text;
  }

  private readChatCompletionsText(
    body: unknown,
    requestId: string | null,
  ): string {
    const response = chatCompletionsBodySchema.parse(body);
    const choice = response.choices[0];
    const message = choice?.message;
    if (message?.refusal) {
      throw new StructuredOutputAiError('refusal', requestId);
    }
    if (choice?.finish_reason === 'length') {
      throw new StructuredOutputAiError('incomplete', requestId);
    }
    const text =
      typeof message?.content === 'string'
        ? message.content
        : (message?.content ?? []).map((part) => part.text ?? '').join('');
    if (!text.trim()) {
      throw new StructuredOutputAiError('empty', requestId);
    }
    return text;
  }
}
