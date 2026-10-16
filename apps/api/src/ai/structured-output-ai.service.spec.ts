import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { type AppConfig, validateEnv } from '../config/env';
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
      captureId: 'note-9',
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
    // The debug capture id never leaves the server.
    expect(request.body as string).not.toContain('captureId');
    expect(request.body as string).not.toContain('note-9');
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

    it.each([
      [
        'openai',
        responses({
          input_tokens: 1200,
          output_tokens: 300,
          input_tokens_details: { cached_tokens: 1024 },
          output_tokens_details: { reasoning_tokens: 250 },
        }),
      ],
      [
        'openai-compatible',
        chat({
          prompt_tokens: 1200,
          completion_tokens: 300,
          prompt_tokens_details: { cached_tokens: 1024 },
          completion_tokens_details: { reasoning_tokens: 250 },
        }),
      ],
    ])(
      'returns the token usage with the answer (%s)',
      async (provider, body) => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        respond(body);
        const result = await serviceFor(provider).generate(request);
        expect(result.usage).toEqual({
          inputTokens: 1200,
          outputTokens: 300,
          cachedInputTokens: 1024,
          reasoningTokens: 250,
        });
      },
    );

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

    it('logs reasoning tokens from the Responses API', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(
        responses({
          input_tokens: 33,
          output_tokens: 312,
          output_tokens_details: { reasoning_tokens: 300 },
        }),
      );
      await serviceFor('openai').generate(request);
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 33,
        outputTokens: 312,
        reasoningTokens: 300,
      });
    });

    it('logs reasoning tokens from Chat Completions', async () => {
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      respond(
        chat({
          prompt_tokens: 37,
          completion_tokens: 11,
          completion_tokens_details: { reasoning_tokens: 0 },
        }),
      );
      await serviceFor('openai-compatible').generate(request);
      expect(log).toHaveBeenCalledWith({
        message: 'AI token usage',
        requestId: 'req-1',
        schemaName: 'receipt',
        inputTokens: 37,
        outputTokens: 11,
        reasoningTokens: 0,
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

  describe('reasoning effort', () => {
    const serviceFor = (provider: string, effort?: string) =>
      new StructuredOutputAiService({
        get: (key: string) =>
          (
            ({
              AI_PROVIDER: provider,
              AI_API_KEY: 'k',
              AI_BASE_URL: 'https://vendor.example/v1',
              AI_VISION_MODEL: 'some-model',
              AI_REASONING_EFFORT: effort,
            }) as Record<string, string | undefined>
          )[key],
      } as unknown as ConfigService<AppConfig, true>);
    const request = {
      prompt: 'p',
      schemaName: 's',
      schema: {},
      maxOutputTokens: 400,
    };
    const sentBody = async (provider: string, effort?: string) => {
      jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify(
            provider === 'openai'
              ? {
                  status: 'completed',
                  output: [
                    {
                      type: 'message',
                      content: [{ type: 'output_text', text: '{}' }],
                    },
                  ],
                }
              : { choices: [{ message: { content: '{}' } }] },
          ),
          { status: 200 },
        ),
      );
      await serviceFor(provider, effort).generate(request);
      return JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      ) as Record<string, unknown>;
    };

    it('leaves Responses requests as they were when no effort is configured', async () => {
      const body = await sentBody('openai');
      expect(body.temperature).toBe(0);
      expect(body.max_output_tokens).toBe(400);
      expect(body).not.toHaveProperty('reasoning');
    });

    it('leaves Chat Completions requests as they were when no effort is configured', async () => {
      const body = await sentBody('openai-compatible');
      expect(body.temperature).toBe(0);
      expect(body.max_tokens).toBe(400);
      expect(body).not.toHaveProperty('reasoning_effort');
      expect(body).not.toHaveProperty('max_completion_tokens');
    });

    it('sends effort none on the Responses API and keeps temperature 0', async () => {
      const body = await sentBody('openai', 'none');
      expect(body.reasoning).toEqual({ effort: 'none' });
      expect(body.temperature).toBe(0);
      expect(body.max_output_tokens).toBe(400);
    });

    // Probed on gpt-6-luna: every effort above none rejects temperature 0.
    it.each(['low', 'medium', 'high', 'xhigh'])(
      'leaves temperature out at effort %s, where the API rejects it',
      async (effort) => {
        const body = await sentBody('openai', effort);
        expect(body.reasoning).toEqual({ effort });
        expect(body).not.toHaveProperty('temperature');
      },
    );

    it('adds room for reasoning tokens to the output budget', async () => {
      // A gpt-6-luna Product Scan at effort low used 202 reasoning tokens of 297 output.
      expect((await sentBody('openai', 'low')).max_output_tokens).toBe(2400);
      jest.restoreAllMocks();
      expect(
        (await sentBody('openai-compatible', 'medium')).max_completion_tokens,
      ).toBe(8400);
    });

    it('sends effort none on Chat Completions with temperature 0 and max_completion_tokens', async () => {
      const body = await sentBody('openai-compatible', 'none');
      expect(body.reasoning_effort).toBe('none');
      expect(body.temperature).toBe(0);
      // Reasoning models reject `max_tokens` on Chat Completions.
      expect(body.max_completion_tokens).toBe(400);
      expect(body).not.toHaveProperty('max_tokens');
    });

    it('leaves temperature out of Chat Completions above effort none', async () => {
      const body = await sentBody('openai-compatible', 'low');
      expect(body.reasoning_effort).toBe('low');
      expect(body).not.toHaveProperty('temperature');
    });
  });

  // Through the real ConfigModule, as a deployer's environment reaches the service.
  describe('requests from the deployed environment', () => {
    const saved = { ...process.env };
    afterEach(() => {
      process.env = { ...saved };
    });

    const bodyFor = async (env: Record<string, string>) => {
      process.env = {
        ...saved,
        DATABASE_URL: 'postgresql://x',
        CLIENT_ORIGIN: 'http://localhost:5173',
        BETTER_AUTH_URL: 'http://localhost:3000',
        BETTER_AUTH_SECRET: 'x'.repeat(32),
        AI_API_KEY: 'k',
        ...env,
      };
      for (const key of [
        'AI_PROVIDER',
        'AI_VISION_MODEL',
        'AI_REASONING_EFFORT',
      ]) {
        if (!(key in env)) delete process.env[key];
      }
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, validate: validateEnv }),
        ],
        providers: [StructuredOutputAiService],
      }).compile();
      jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'completed',
            output: [
              {
                type: 'message',
                content: [{ type: 'output_text', text: '{}' }],
              },
            ],
          }),
          { status: 200 },
        ),
      );
      await moduleRef.get(StructuredOutputAiService).generate({
        prompt: 'p',
        schemaName: 's',
        schema: {},
        maxOutputTokens: 400,
      });
      return JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      ) as Record<string, unknown>;
    };

    it('runs on gpt-6-luna at effort none when nothing is set', async () => {
      const body = await bodyFor({});
      expect(body.model).toBe('gpt-6-luna');
      expect(body.reasoning).toEqual({ effort: 'none' });
      expect(body.temperature).toBe(0);
      expect(body.max_output_tokens).toBe(400);
    });

    it.each([
      ['left out', {}],
      ['empty', { AI_REASONING_EFFORT: '' }],
    ])(
      'goes back to the gpt-4o-mini request with the effort %s',
      async (_, effort) => {
        const body = await bodyFor({
          AI_VISION_MODEL: 'gpt-4o-mini-2024-07-18',
          ...effort,
        });
        expect(body.model).toBe('gpt-4o-mini-2024-07-18');
        expect(body).not.toHaveProperty('reasoning');
        expect(body.temperature).toBe(0);
        expect(body.max_output_tokens).toBe(400);
      },
    );
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

    it('maps a Chat Completions answer cut off by the token limit to incomplete', async () => {
      const service = new StructuredOutputAiService({
        get: (key: string) =>
          ({
            AI_PROVIDER: 'openai-compatible',
            AI_API_KEY: 'k',
            AI_BASE_URL: 'https://vendor.example/v1',
          })[key],
      } as unknown as ConfigService<AppConfig, true>);
      respond({
        choices: [
          { finish_reason: 'length', message: { content: '{"items":[{"na' } },
        ],
      });
      await expect(service.generate(request)).rejects.toMatchObject({
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

  describe('Scan debug capture', () => {
    let dir: string;

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'ai-debug-'));
      jest.spyOn(Logger.prototype, 'log').mockImplementation();
      jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });

    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    const serviceIn = (nodeEnv: string) =>
      new StructuredOutputAiService({
        get: (key: string) =>
          (
            ({
              NODE_ENV: nodeEnv,
              SCAN_DEBUG_DIR: dir,
              AI_PROVIDER: 'openai',
              AI_API_KEY: 'k',
              AI_VISION_MODEL: 'vision-model',
            }) as Record<string, string>
          )[key],
      } as unknown as ConfigService<AppConfig, true>);
    const request = {
      prompt: 'Read the receipt',
      images: ['data:image/jpeg;base64,aGVsbG8='],
      schemaName: 'grocery_receipt_scan',
      schema: {},
      maxOutputTokens: 1,
    };
    const saved = (name: string): unknown => {
      const [folder] = readdirSync(dir);
      return JSON.parse(readFileSync(join(dir, folder, name), 'utf8'));
    };

    it('saves the answer of a successful call in development', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'completed',
            output: [
              {
                type: 'message',
                content: [{ type: 'output_text', text: '{"lines":[]}' }],
              },
            ],
          }),
          { status: 200, headers: { 'x-request-id': 'req-9' } },
        ),
      );

      await serviceIn('development').generate(request);

      expect(saved('request.json')).toMatchObject({
        model: 'vision-model',
        images: ['image-1.jpg'],
      });
      expect(saved('response.json')).toMatchObject({
        outcome: 'ok',
        requestId: 'req-9',
        data: { lines: [] },
      });
    });

    it('saves a provider failure and still fails the call', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('upstream exploded', { status: 500 }));

      await expect(
        serviceIn('development').generate(request),
      ).rejects.toMatchObject({ code: 'scan.provider_unavailable' });
      expect(saved('response.json')).toMatchObject({
        outcome: 'error',
        httpStatus: 500,
        body: 'upstream exploded',
        error: { code: 'scan.provider_unavailable' },
      });
    });

    it('keeps a body that is not JSON', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('<html>oops</html>', { status: 200 }));

      await expect(
        serviceIn('development').generate(request),
      ).rejects.toMatchObject({ code: 'scan.result_invalid' });
      expect(saved('response.json')).toMatchObject({
        body: '<html>oops</html>',
        error: { code: 'scan.result_invalid' },
      });
    });

    it.each(['production', 'test'])('writes nothing in %s', async (env) => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify({ choices: [] }), { status: 200 }),
        );

      await serviceIn(env)
        .generate(request)
        .catch(() => undefined);

      expect(readdirSync(dir)).toEqual([]);
    });
  });
});
