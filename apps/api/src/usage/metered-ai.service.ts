import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import {
  StructuredOutputAiService,
  type StructuredOutputResult,
} from '../ai/structured-output-ai.service';
import {
  TranscriptionService,
  type TranscriptionRequest,
  type TranscriptionResult,
} from '../voice/transcription.service';
import { type CallUsage } from './prices';
import { UsageRecordsService } from './usage-records.service';

/**
 * The metering layer: every read calls the AI providers through here. Each call leaves one Usage
 * Record from the model, request id and usage the provider service returns; a failed call leaves
 * one too (marked failed, with the model as configured and whatever request id the error carries).
 * The providers are the only code that talks to the network, so tests fake them and still get rows.
 */
@Injectable()
export class MeteredAiService {
  constructor(
    private readonly structured: StructuredOutputAiService,
    private readonly transcription: TranscriptionService,
    private readonly records: UsageRecordsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Whether transcription is set up; the only thing callers outside `usage/` may ask of the provider. */
  isTranscriptionConfigured(): boolean {
    return this.transcription.isConfigured();
  }

  async generate(
    ...args: Parameters<StructuredOutputAiService['generate']>
  ): Promise<StructuredOutputResult> {
    const [request] = args;
    try {
      const result = await this.structured.generate(...args);
      await this.records.record({
        step: 'reading',
        model: result.model ?? this.configuredModel(request.model),
        success: true,
        usage: result.usage,
        requestId: result.requestId,
      });
      return result;
    } catch (error) {
      if (!isNotConfigured(error)) {
        await this.records.record({
          step: 'reading',
          model: modelOf(error) ?? this.configuredModel(request.model),
          success: false,
          usage: usageOf(error),
          requestId: requestIdOf(error),
        });
      }
      throw error;
    }
  }

  async transcribe(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    try {
      const result = await this.transcription.transcribe(request);
      await this.records.record({
        step: 'transcription',
        model: result.model ?? this.transcribeModel(),
        success: true,
        usage: result.usage,
        requestId: result.requestId,
      });
      return result;
    } catch (error) {
      if (!isNotConfigured(error)) {
        await this.records.record({
          step: 'transcription',
          model: this.transcribeModel(),
          success: false,
          requestId: requestIdOf(error),
        });
      }
      throw error;
    }
  }

  private configuredModel(kind: 'vision' | 'text' | undefined): string {
    return this.config.get(
      kind === 'text' ? 'AI_TEXT_MODEL' : 'AI_VISION_MODEL',
      { infer: true },
    );
  }

  private transcribeModel(): string {
    return this.config.get('AI_TRANSCRIBE_MODEL', { infer: true });
  }
}

/** The provider request id an error carries, if it carries one. */
function requestIdOf(error: unknown): string | null {
  const id = (error as { requestId?: unknown } | null)?.requestId;
  return typeof id === 'string' ? id : null;
}

/** The billed usage an error carries (a call that was billed but gave no usable answer). */
function usageOf(error: unknown): CallUsage | undefined {
  const usage = (error as { usage?: unknown } | null)?.usage;
  return typeof usage === 'object' && usage !== null ? usage : undefined;
}

/** The model an error says was called, if it says. */
function modelOf(error: unknown): string | undefined {
  const model = (error as { model?: unknown } | null)?.model;
  return typeof model === 'string' ? model : undefined;
}

/** A provider that is not set up was never called, so there is nothing to record. */
function isNotConfigured(error: unknown): boolean {
  return error instanceof ApiException && error.code.endsWith('not_configured');
}
