import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { AppConfig } from '../config/env';

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

export class StructuredOutputAiError extends BadGatewayException {
  constructor(
    readonly code: StructuredOutputErrorCode,
    readonly requestId: string | null,
  ) {
    const messages: Record<StructuredOutputErrorCode, string> = {
      incomplete: 'The AI provider did not finish the request',
      refusal: 'The AI provider refused the request',
      empty: 'The AI provider returned an empty result',
      failed: 'The AI provider could not finish the request',
    };
    super(messages[code]);
  }
}

const openAiResponsesBodySchema = z.object({
  status: z.string().optional(),
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
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async generate(
    request: StructuredOutputRequest,
  ): Promise<StructuredOutputResult> {
    const provider = this.config.get('AI_PROVIDER', { infer: true });
    const apiKey = this.config.get('AI_API_KEY', { infer: true });
    const model = this.config.get('AI_VISION_MODEL', { infer: true });
    const configuredBaseUrl = this.config.get('AI_BASE_URL', { infer: true });

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI image recognition is not configured. Set AI_API_KEY on the API server.',
      );
    }
    if (provider === 'openai-compatible' && !configuredBaseUrl) {
      throw new ServiceUnavailableException(
        'AI_BASE_URL is required when AI_PROVIDER is openai-compatible.',
      );
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
      throw new BadGatewayException('The AI provider is unavailable');
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `The AI provider returned ${response.status}`,
      );
    }

    const requestId = response.headers.get('x-request-id');
    try {
      const body: unknown = await response.json();
      const text = isResponsesApi
        ? this.readResponsesText(body, requestId)
        : this.readChatCompletionsText(body, requestId);
      return { data: JSON.parse(text) as unknown, requestId };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException(
        'The AI provider returned invalid structured output',
      );
    }
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
