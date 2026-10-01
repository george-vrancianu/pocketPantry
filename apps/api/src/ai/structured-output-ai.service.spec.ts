import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { StructuredOutputAiService } from './structured-output-ai.service';

describe('StructuredOutputAiService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('uses an OpenAI-compatible vendor endpoint and normalizes its result', async () => {
    const config = {
      get: (key: string) =>
        (
          ({
            AI_PROVIDER: 'openai-compatible',
            AI_API_KEY: 'vendor-key',
            AI_BASE_URL: 'https://vendor.example/v1/',
            AI_VISION_MODEL: 'vendor-vision-model',
          }) as Record<string, string>
        )[key],
    } as ConfigService<AppConfig, true>;
    const service = new StructuredOutputAiService(config);
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({ productName: 'Milk' }),
              },
            },
          ],
        }),
        { status: 200, headers: { 'x-request-id': 'vendor-request' } },
      ),
    );

    const result = await service.generate({
      prompt: 'Identify the product',
      images: ['data:image/jpeg;base64,YQ=='],
      schemaName: 'product',
      schema: { type: 'object' },
      maxOutputTokens: 123,
    });

    expect(result).toEqual({
      data: { productName: 'Milk' },
      requestId: 'vendor-request',
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://vendor.example/v1/chat/completions',
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body: unknown = JSON.parse(request.body as string);
    expect(body).toHaveProperty('model', 'vendor-vision-model');
    expect(body).toHaveProperty('response_format.type', 'json_schema');
    expect(body).toHaveProperty('max_tokens', 123);
  });
});
