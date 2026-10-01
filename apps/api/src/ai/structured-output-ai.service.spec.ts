import { Logger } from '@nestjs/common';
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

  describe('token usage logging', () => {
    const serviceFor = (provider: string) =>
      new StructuredOutputAiService({
        get: (key: string) =>
          (
            ({
              AI_PROVIDER: provider,
              AI_API_KEY: 'k',
              AI_BASE_URL: 'https://vendor.example/v1',
            }) as Record<string, string>
          )[key],
      } as unknown as ConfigService<AppConfig, true>);
    const request = {
      prompt: 'secret receipt text',
      images: ['data:image/jpeg;base64,SECRETIMAGE'],
      schemaName: 'receipt',
      schema: {},
      maxOutputTokens: 1,
    };
    const respond = (body: unknown) =>
      jest.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'x-request-id': 'req-1' },
        }),
      );
    const responses = (usage?: unknown) => ({
      status: 'completed',
      output: [
        { type: 'message', content: [{ type: 'output_text', text: '{}' }] },
      ],
      ...(usage ? { usage } : {}),
    });
    const chat = (usage?: unknown) => ({
      choices: [{ message: { content: '{}' } }],
      ...(usage ? { usage } : {}),
    });

    it('logs Responses API usage with request id and schema name', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(
        responses({
          input_tokens: 1200,
          output_tokens: 80,
          input_tokens_details: { cached_tokens: 1024 },
        }),
      );
      await serviceFor('openai').generate(request);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 1200,
        outputTokens: 80,
        cachedInputTokens: 1024,
      });
    });

    it('logs Chat Completions usage', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(
        chat({
          prompt_tokens: 50,
          completion_tokens: 7,
          prompt_tokens_details: { cached_tokens: 0 },
        }),
      );
      await serviceFor('openai-compatible').generate(request);
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 50,
        outputTokens: 7,
        cachedInputTokens: 0,
      });
    });

    it('omits cached tokens when the provider does not report them', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(chat({ prompt_tokens: 5, completion_tokens: 2 }));
      await serviceFor('openai-compatible').generate(request);
      expect(log.mock.calls[0][0]).not.toHaveProperty('cachedInputTokens');
    });

    it.each([
      ['openai', responses()],
      ['openai-compatible', chat()],
    ])('still succeeds without a usage block (%s)', async (provider, body) => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(body);
      await expect(serviceFor(provider).generate(request)).resolves.toEqual({
        data: {},
        requestId: 'req-1',
      });
      expect(log).not.toHaveBeenCalled();
    });

    it('ignores a malformed usage block instead of failing', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(responses({ input_tokens: 'lots' }));
      await expect(serviceFor('openai').generate(request)).resolves.toEqual({
        data: {},
        requestId: 'req-1',
      });
      expect(log).not.toHaveBeenCalled();
    });

    it('keeps the token counts when only the cached-token details are malformed', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(
        chat({
          prompt_tokens: 5,
          completion_tokens: 2,
          prompt_tokens_details: { cached_tokens: 'many' },
        }),
      );
      await serviceFor('openai-compatible').generate(request);
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 5,
        outputTokens: 2,
      });
    });

    it('logs usage even when the billed call ends in an incomplete answer', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond({
        status: 'incomplete',
        output: [],
        usage: { input_tokens: 900, output_tokens: 1 },
      });
      await expect(
        serviceFor('openai').generate(request),
      ).rejects.toMatchObject({ reason: 'incomplete' });
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 900,
        outputTokens: 1,
      });
    });

    it('never logs prompt or image content', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(chat({ prompt_tokens: 5, completion_tokens: 2 }));
      await serviceFor('openai-compatible').generate(request);
      const logged = JSON.stringify(log.mock.calls);
      expect(logged).not.toContain('secret receipt text');
      expect(logged).not.toContain('SECRETIMAGE');
    });
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
