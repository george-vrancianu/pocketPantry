import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import type { ScanLanguage } from '../catalog/catalog.schemas';
import { AUDIO_EXTENSIONS } from './voice.schemas';
import {
  createScanDebugRecorder,
  type ScanDebugRecorder,
} from '../ai/scan-debug-recorder';

export const LANGUAGE_NAMES: Record<ScanLanguage, string> = {
  en: 'English',
  ro: 'Romanian',
  da: 'Danish',
};

export type TranscriptionRequest = {
  audio: Buffer;
  /** A bare container type such as `audio/webm`. */
  mimeType: string;
  /** The main hint: the language the Member speaks. */
  language: ScanLanguage;
  /** The other Scan Languages, as extra hints. */
  otherLanguages: ScanLanguage[];
  /** Debug capture only: ties this recording to its transcript read. */
  captureId?: string;
};

export type TranscriptionResult = { text: string };

/** The prompt hint sent with a recording; undefined when no other language is allowed. */
export function transcriptionPrompt(
  language: ScanLanguage,
  otherLanguages: ScanLanguage[],
): string | undefined {
  if (otherLanguages.length === 0) return undefined;
  const others = otherLanguages.map((l) => LANGUAGE_NAMES[l]);
  return `A shopping and pantry note, mostly in ${LANGUAGE_NAMES[language]}; it may also contain ${others.join(' or ')} words.`;
}

const responseSchema = z.object({ text: z.string() });

/**
 * The audio transcription provider (a seam separate from the structured-output
 * AI service; tests swap it for a fake). Uses the same key and base URL as the
 * Scans, with its own model (`AI_TRANSCRIBE_MODEL`).
 */
@Injectable()
export class TranscriptionService {
  private readonly debug: ScanDebugRecorder | undefined;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    // Dev only, like the Scan captures: voice is personal data.
    this.debug = createScanDebugRecorder(
      config.get('NODE_ENV', { infer: true }),
      config.get('SCAN_DEBUG_DIR', { infer: true }),
    );
  }

  /** Voice is on when there is a key, a transcription model, and (for a compatible vendor) a base URL. */
  isConfigured(): boolean {
    const provider = this.config.get('AI_PROVIDER', { infer: true });
    return Boolean(
      this.config.get('AI_API_KEY', { infer: true }) &&
      this.config.get('AI_TRANSCRIBE_MODEL', { infer: true }) &&
      (provider !== 'openai-compatible' ||
        this.config.get('AI_BASE_URL', { infer: true })),
    );
  }

  async transcribe(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    if (!this.isConfigured())
      throw new ApiException(503, 'voice.not_configured');
    if (!this.debug) return this.send(request);
    const startedAt = new Date();
    let transcript: string | undefined;
    let error: { code: string } | undefined;
    try {
      const result = await this.send(request);
      transcript = result.text;
      return result;
    } catch (caught) {
      error = {
        code: caught instanceof ApiException ? caught.code : 'unexpected',
      };
      throw caught;
    } finally {
      await this.debug.recordTranscription({
        audio: request.audio,
        mimeType: request.mimeType,
        model: this.config.get('AI_TRANSCRIBE_MODEL', { infer: true }),
        language: request.language,
        prompt: transcriptionPrompt(request.language, request.otherLanguages),
        startedAt,
        durationMs: Date.now() - startedAt.getTime(),
        captureId: request.captureId,
        transcript,
        error,
      });
    }
  }

  private async send(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    const apiKey = this.config.get('AI_API_KEY', { infer: true });
    const model = this.config.get('AI_TRANSCRIBE_MODEL', { infer: true });
    const baseUrl = (
      this.config.get('AI_BASE_URL', { infer: true }) ??
      'https://api.openai.com/v1'
    ).replace(/\/$/, '');

    const form = new FormData();
    form.set('model', model);
    form.set('language', request.language);
    form.set('response_format', 'json');
    const prompt = transcriptionPrompt(
      request.language,
      request.otherLanguages,
    );
    if (prompt) form.set('prompt', prompt);
    form.set(
      'file',
      new Blob([new Uint8Array(request.audio)], { type: request.mimeType }),
      `voice-note.${(AUDIO_EXTENSIONS as Record<string, string>)[request.mimeType] ?? 'webm'}`,
    );

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } catch {
      throw new ApiException(502, 'voice.provider_unavailable');
    }
    if (!response.ok) {
      throw new ApiException(502, 'voice.provider_unavailable', {
        status: response.status,
      });
    }
    try {
      return responseSchema.parse(await response.json());
    } catch {
      throw new ApiException(502, 'voice.provider_unavailable');
    }
  }
}
