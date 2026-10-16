import { Injectable } from '@nestjs/common';
import { SCAN_LANGUAGES } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { ScanCapService } from '../scan/scan-cap.service';
import { TranscriptionService } from './transcription.service';
import {
  MAX_VOICE_NOTE_MS,
  type VoiceNoteFields,
  type VoiceNoteResponse,
} from './voice.schemas';

export type VoiceNoteInput = VoiceNoteFields & {
  audio: Buffer;
  /** A bare, supported container type such as `audio/webm`. */
  mimeType: string;
};

/**
 * A Voice Note: the recording is transcribed and the transcript handed back.
 * Charged to the Voice Cap before the provider is called and refunded when the
 * provider fails or nothing was heard. The Scan Cap is never touched, and
 * neither audio nor transcript is stored.
 */
@Injectable()
export class VoiceService {
  constructor(
    private readonly transcription: TranscriptionService,
    private readonly cap: ScanCapService,
  ) {}

  isConfigured(): boolean {
    return this.transcription.isConfigured();
  }

  async read(
    memberId: string,
    input: VoiceNoteInput,
  ): Promise<VoiceNoteResponse> {
    if (!this.transcription.isConfigured()) {
      throw new ApiException(503, 'voice.not_configured');
    }
    if (input.durationMs > MAX_VOICE_NOTE_MS) {
      throw new ApiException(413, 'voice.too_long');
    }
    const day = await this.cap.consume(memberId, new Date(), 'voice');
    let text: string;
    try {
      ({ text } = await this.transcription.transcribe({
        audio: input.audio,
        mimeType: input.mimeType,
        language: input.scanLanguage,
        otherLanguages: SCAN_LANGUAGES.filter((l) => l !== input.scanLanguage),
      }));
    } catch (error) {
      await this.cap.refund(memberId, day, 'voice');
      throw error;
    }
    const transcript = text.trim();
    if (!transcript) await this.cap.refund(memberId, day, 'voice');
    return { transcript };
  }
}
