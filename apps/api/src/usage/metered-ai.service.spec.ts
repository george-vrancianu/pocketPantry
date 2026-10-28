import type { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';
import type { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import type { TranscriptionService } from '../voice/transcription.service';
import type { AppConfig } from '../config/env';
import { MeteredAiService } from './metered-ai.service';
import type { UsageRecordsService } from './usage-records.service';

describe('MeteredAiService', () => {
  const config = {
    get: (key: string) =>
      ({
        AI_VISION_MODEL: 'vision-m',
        AI_TEXT_MODEL: 'text-m',
        AI_TRANSCRIBE_MODEL: 'transcribe-m',
      })[key],
  } as unknown as ConfigService<AppConfig, true>;

  const setup = (
    structured: Partial<Record<'generate', jest.Mock>>,
    transcription: Partial<Record<'transcribe', jest.Mock>> = {},
  ) => {
    const record = jest.fn().mockResolvedValue(undefined);
    return {
      record,
      metered: new MeteredAiService(
        structured as unknown as StructuredOutputAiService,
        transcription as unknown as TranscriptionService,
        { record } as unknown as UsageRecordsService,
        config,
      ),
    };
  };
  const request = {
    prompt: 'p',
    schemaName: 's',
    schema: {},
    maxOutputTokens: 1,
  };

  it('records a successful call from what the provider returned', async () => {
    const usage = { inputTokens: 3, outputTokens: 2 };
    const { metered, record } = setup({
      generate: jest
        .fn()
        .mockResolvedValue({ data: 1, requestId: 'r1', model: 'm1', usage }),
    });
    await expect(metered.generate(request)).resolves.toMatchObject({ data: 1 });
    expect(record).toHaveBeenCalledWith({
      step: 'reading',
      model: 'm1',
      success: true,
      usage,
      requestId: 'r1',
    });
  });

  it('falls back to the configured model for the text and vision models', async () => {
    const { metered, record } = setup({
      generate: jest.fn().mockResolvedValue({ data: 1, requestId: null }),
    });
    await metered.generate({ ...request, model: 'text' });
    await metered.generate(request);
    expect(
      record.mock.calls.map(([call]) => (call as { model: string }).model),
    ).toEqual(['text-m', 'vision-m']);
  });

  it('records a failed call and rethrows the error', async () => {
    const failure = Object.assign(
      new ApiException(502, 'scan.provider_incomplete'),
      {
        requestId: 'r9',
      },
    );
    const { metered, record } = setup({
      generate: jest.fn().mockRejectedValue(failure),
    });
    await expect(metered.generate(request)).rejects.toBe(failure);
    expect(record).toHaveBeenCalledWith({
      step: 'reading',
      model: 'vision-m',
      success: false,
      requestId: 'r9',
    });
  });

  it('records nothing for a provider that is not configured', async () => {
    const { metered, record } = setup({
      generate: jest
        .fn()
        .mockRejectedValue(new ApiException(503, 'scan.not_configured')),
    });
    await expect(metered.generate(request)).rejects.toBeInstanceOf(
      ApiException,
    );
    expect(record).not.toHaveBeenCalled();
  });

  it('records a transcription, and a failed one', async () => {
    const audio = {
      audio: Buffer.from('a'),
      mimeType: 'audio/webm',
      language: 'en' as const,
      otherLanguages: [],
    };
    const ok = setup(
      {},
      {
        transcribe: jest.fn().mockResolvedValue({
          text: 'hi',
          requestId: 'r2',
          usage: { audioSeconds: 4 },
        }),
      },
    );
    await ok.metered.transcribe(audio);
    expect(ok.record).toHaveBeenCalledWith({
      step: 'transcription',
      model: 'transcribe-m',
      success: true,
      usage: { audioSeconds: 4 },
      requestId: 'r2',
    });
    const bad = setup(
      {},
      {
        transcribe: jest
          .fn()
          .mockRejectedValue(
            new ApiException(502, 'voice.provider_unavailable'),
          ),
      },
    );
    await expect(bad.metered.transcribe(audio)).rejects.toBeInstanceOf(
      ApiException,
    );
    expect(bad.record).toHaveBeenCalledWith({
      step: 'transcription',
      model: 'transcribe-m',
      success: false,
      requestId: null,
    });
  });
});
