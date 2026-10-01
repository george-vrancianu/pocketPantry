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

  describe('failures carry stable API codes', () => {
    const serviceWith = (apiKey?: string) =>
      new StructuredOutputAiService({
        get: (key: string) =>
          ({ AI_PROVIDER: 'openai', AI_API_KEY: apiKey })[key],
      } as unknown as ConfigService<AppConfig, true>);
    const request = {
      prompt: 'x',
      schemaName: 's',
      schema: {},
      maxOutputTokens: 1,
    };
    const respond = (body: unknown, status = 200) =>
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify(body), { status }));

    it('is not configured without an API key', async () => {
      await expect(serviceWith().generate(request)).rejects.toMatchObject({
        code: 'scan.not_configured',
      });
    });

    it('is unavailable when the network or the provider fails', async () => {
      jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
      await expect(serviceWith('k').generate(request)).rejects.toMatchObject({
        code: 'scan.provider_unavailable',
      });
      respond({}, 500);
      await expect(serviceWith('k').generate(request)).rejects.toMatchObject({
        code: 'scan.provider_unavailable',
      });
    });

    it('maps a refusal and an incomplete answer', async () => {
      respond({
        status: 'completed',
        output: [
          { type: 'message', content: [{ type: 'refusal', text: 'no' }] },
        ],
      });
      await expect(serviceWith('k').generate(request)).rejects.toMatchObject({
        code: 'scan.provider_refused',
      });
      respond({ status: 'incomplete', output: [] });
      await expect(serviceWith('k').generate(request)).rejects.toMatchObject({
        code: 'scan.provider_incomplete',
      });
    });

    it('maps unparseable output to an invalid result', async () => {
      respond({
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: '{not json' }],
          },
        ],
      });
      await expect(serviceWith('k').generate(request)).rejects.toMatchObject({
        code: 'scan.result_invalid',
      });
    });
  });
});
