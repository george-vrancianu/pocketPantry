import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { TranscriptionService } from './transcription.service';

const service = (values: Record<string, string | undefined>) =>
  new TranscriptionService({
    get: (key: string) => values[key],
  } as unknown as ConfigService<AppConfig, true>);

describe('TranscriptionService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('is configured with a key and a transcription model, and a base URL for a compatible vendor', () => {
    const base = {
      AI_PROVIDER: 'openai',
      AI_TRANSCRIBE_MODEL: 'gpt-transcribe',
    };
    expect(service({ ...base, AI_API_KEY: 'k' }).isConfigured()).toBe(true);
    expect(service({ ...base }).isConfigured()).toBe(false);
    expect(
      service({ AI_API_KEY: 'k', AI_PROVIDER: 'openai' }).isConfigured(),
    ).toBe(false);
    expect(
      service({
        ...base,
        AI_PROVIDER: 'openai-compatible',
        AI_API_KEY: 'k',
      }).isConfigured(),
    ).toBe(false);
  });

  it('posts the recording to the transcription endpoint with language hints', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ text: 'hello' })));
    const result = await service({
      AI_PROVIDER: 'openai-compatible',
      AI_API_KEY: 'vendor-key',
      AI_BASE_URL: 'https://vendor.example/v1/',
      AI_TRANSCRIBE_MODEL: 'vendor-stt',
    }).transcribe({
      audio: Buffer.from('audio'),
      mimeType: 'audio/mp4',
      language: 'da',
      otherLanguages: ['en', 'ro'],
    });

    expect(result).toEqual({ text: 'hello' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://vendor.example/v1/audio/transcriptions');
    expect(init?.headers).toEqual({ authorization: 'Bearer vendor-key' });
    const form = init?.body as FormData;
    expect(form.get('model')).toBe('vendor-stt');
    expect(form.get('language')).toBe('da');
    expect(form.get('prompt')).toContain('English or Romanian');
    expect((form.get('file') as File).name).toBe('voice-note.mp4');
  });

  it('maps a provider failure to voice.provider_unavailable', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('no', { status: 500 }));
    await expect(
      service({
        AI_PROVIDER: 'openai',
        AI_API_KEY: 'k',
        AI_TRANSCRIBE_MODEL: 'm',
      }).transcribe({
        audio: Buffer.from('a'),
        mimeType: 'audio/webm',
        language: 'en',
        otherLanguages: [],
      }),
    ).rejects.toMatchObject({ code: 'voice.provider_unavailable' });
  });

  describe('dev debug capture', () => {
    let dir: string;
    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'voice-debug-'));
      jest.spyOn(Logger.prototype, 'log').mockImplementation();
      jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    const config = (nodeEnv: string) => ({
      NODE_ENV: nodeEnv,
      SCAN_DEBUG_DIR: dir,
      AI_PROVIDER: 'openai',
      AI_API_KEY: 'k',
      AI_TRANSCRIBE_MODEL: 'gpt-transcribe',
    });
    const request = {
      audio: Buffer.from('audio'),
      mimeType: 'audio/webm',
      language: 'ro' as const,
      otherLanguages: ['en' as const, 'da' as const],
      captureId: 'note-7',
    };

    it('saves the recording, the request parameters and the transcript in development', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ text: 'lapte' })));
      await service(config('development')).transcribe(request);

      const [folder] = readdirSync(dir);
      expect(readFileSync(join(dir, folder, 'audio.webm'), 'utf8')).toBe(
        'audio',
      );
      expect(
        JSON.parse(
          readFileSync(join(dir, folder, 'transcription.json'), 'utf8'),
        ),
      ).toMatchObject({
        captureId: 'note-7',
        model: 'gpt-transcribe',
        language: 'ro',
        transcript: 'lapte',
      });
      expect(
        (
          JSON.parse(
            readFileSync(join(dir, folder, 'transcription.json'), 'utf8'),
          ) as { prompt: string }
        ).prompt,
      ).toContain('English or Danish');
    });

    it('records a provider failure without a transcript', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('no', { status: 500 }));
      await expect(
        service(config('development')).transcribe(request),
      ).rejects.toMatchObject({ code: 'voice.provider_unavailable' });

      const [folder] = readdirSync(dir);
      expect(
        JSON.parse(
          readFileSync(join(dir, folder, 'transcription.json'), 'utf8'),
        ),
      ).toMatchObject({
        outcome: 'error',
        error: { code: 'voice.provider_unavailable' },
      });
    });

    it('saves nothing outside development', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ text: 'lapte' })));
      await service(config('production')).transcribe(request);
      expect(readdirSync(dir)).toEqual([]);
    });
  });
});
