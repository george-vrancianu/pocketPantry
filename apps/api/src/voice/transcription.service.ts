import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import type { ScanLanguage } from '../catalog/catalog.schemas';

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
};

export type TranscriptionResult = { text: string };

const EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
};

const responseSchema = z.object({ text: z.string() });

/**
 * The audio transcription provider (a seam separate from the structured-output
 * AI service; tests swap it for a fake). Uses the same key and base URL as the
 * Scans, with its own model (`AI_TRANSCRIBE_MODEL`).
 */
@Injectable()
export class TranscriptionService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

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
    if (request.otherLanguages.length > 0) {
      const others = request.otherLanguages.map((l) => LANGUAGE_NAMES[l]);
      form.set(
        'prompt',
        `A shopping and pantry note, mostly in ${LANGUAGE_NAMES[request.language]}; it may also contain ${others.join(' or ')} words.`,
      );
    }
    form.set(
      'file',
      new Blob([new Uint8Array(request.audio)], { type: request.mimeType }),
      `voice-note.${EXTENSIONS[request.mimeType] ?? 'webm'}`,
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
