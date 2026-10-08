import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
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
  maxOutputTokens: number;
};

export type StructuredOutputResult = {
  data: unknown;
  requestId: string | null;
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

export type AiTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
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

/** Usage is best-effort telemetry: a missing or malformed block is dropped, never an error. */
const responsesUsageSchema = z
  .object({
    input_tokens: tokenCount,
    output_tokens: tokenCount,
    input_tokens_details: z
      .object({ cached_tokens: tokenCount.optional() })
      .optional()
      .catch(undefined),
  })
  .transform((u): AiTokenUsage => ({
    inputTokens: u.input_tokens,
    outputTokens: u.output_tokens,
    cachedInputTokens: u.input_tokens_details?.cached_tokens,
  }));

const chatUsageSchema = z
  .object({
    prompt_tokens: tokenCount,
    completion_tokens: tokenCount,
    prompt_tokens_details: z
      .object({ cached_tokens: tokenCount.optional() })
      .optional()
      .catch(undefined),
  })
  .transform((u): AiTokenUsage => ({
    inputTokens: u.prompt_tokens,
    outputTokens: u.completion_tokens,
    cachedInputTokens: u.prompt_tokens_details?.cached_tokens,
  }));

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

  async generate(
    request: StructuredOutputRequest,
  ): Promise<StructuredOutputResult> {
    if (!this.debug) return this.call(request, {});
    const trace: CallTrace = {};
    const startedAt = new Date();
    try {
      const result = await this.call(request, trace);
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
  ): Promise<StructuredOutputResult> {
    const provider = this.config.get('AI_PROVIDER', { infer: true });
    const apiKey = this.config.get('AI_API_KEY', { infer: true });
    const model = this.config.get('AI_VISION_MODEL', { infer: true });
    const configuredBaseUrl = this.config.get('AI_BASE_URL', { infer: true });
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
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(
            isResponsesApi
              ? this.toResponsesRequest(request, model)
              : this.toChatCompletionsRequest(request, model),
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
      this.logUsage(isResponsesApi, body, request.schemaName, requestId);
      const text = isResponsesApi
        ? this.readResponsesText(body, requestId)
        : this.readChatCompletionsText(body, requestId);
      return { data: JSON.parse(text) as unknown, requestId };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(502, 'scan.result_invalid');
    }
  }

  /** Logs token counts only (never prompt, image or response content). */
  private logUsage(
    isResponsesApi: boolean,
    body: unknown,
    schemaName: string,
    requestId: string | null,
  ) {
    const schema: z.ZodType<AiTokenUsage> = isResponsesApi
      ? responsesUsageSchema
      : chatUsageSchema;
    const usage = schema.safeParse((body as { usage?: unknown } | null)?.usage);
    if (!usage.success) return;
    const { cachedInputTokens, ...counts } = usage.data;
    this.logger.log({
      message: 'AI token usage',
      requestId,
      schemaName,
      ...counts,
      ...(cachedInputTokens === undefined ? {} : { cachedInputTokens }),
    });
  }

  private toResponsesRequest(request: StructuredOutputRequest, model: string) {
    return {
      model,
      temperature: 0,
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
      max_output_tokens: request.maxOutputTokens,
    };
  }

  private toChatCompletionsRequest(
    request: StructuredOutputRequest,
    model: string,
  ) {
    return {
      model,
      temperature: 0,
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
      max_tokens: request.maxOutputTokens,
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
    const message = response.choices[0]?.message;
    if (message?.refusal) {
      throw new StructuredOutputAiError('refusal', requestId);
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
