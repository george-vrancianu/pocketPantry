import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { PantryService } from '../pantry/pantry.service';
import { SettingsService } from '../settings/settings.service';
import {
  voiceReadModelSchema,
  type VoiceReadModelResult,
} from './voice-actions';
import type { VoiceDefaultTarget } from './voice-actions';
import { buildVoiceReadRequest } from './voice-read-request';

export type VoiceReadInput = {
  /** The Shopping List's current items, loaded once by the caller (spelling hints only). */
  shoppingItems: { name: string }[];
  memberId: string;
  transcript: string;
  /** Null when the language spoken is not known. */
  scanLanguage: ScanLanguage | null;
  /** The Catalog Language: names are looked up, matched and made up in it. */
  locale: CatalogLocale;
  /** The UI Language, for the prompt only. */
  uiLanguage?: CatalogLocale;
  today: string;
  defaultTarget: VoiceDefaultTarget;
  /** Debug capture only: ties this read to the recording's transcription. */
  captureId?: string;
};

/**
 * Reads a transcript into Voice Actions with the text model. The prompt opens
 * with the Catalog text every Scan sends (so the provider's prompt cache is
 * shared) and ends with the transcript, which is data and never instructions.
 */
@Injectable()
export class VoiceReaderService {
  private readonly logger = new Logger(VoiceReaderService.name);

  constructor(
    private readonly ai: StructuredOutputAiService,
    private readonly ingredientCatalog: IngredientCatalogService,
    private readonly settings: SettingsService,
    private readonly pantry: PantryService,
  ) {}

  async read(input: VoiceReadInput): Promise<VoiceReadModelResult> {
    const familyId = await this.settings.familyIdOf(input.memberId);
    const catalog = await this.ingredientCatalog.getCatalogIn(
      familyId,
      input.locale,
    );
    const batches = await this.pantry.list(input.memberId, input.locale);

    const response = await this.ai.generate(
      buildVoiceReadRequest({
        catalogText: this.ingredientCatalog.toPrompt(catalog),
        shoppingNames: input.shoppingItems.map((item) => item.name),
        pantryNames: batches.map((batch) => batch.name),
        transcript: input.transcript,
        scanLanguage: input.scanLanguage,
        locale: input.locale,
        uiLanguage: input.uiLanguage,
        today: input.today,
        defaultTarget: input.defaultTarget,
        captureId: input.captureId,
      }),
    );
    try {
      return voiceReadModelSchema.parse(response.data);
    } catch (error) {
      // Field paths only, never the transcript.
      this.logger.warn({
        message: 'Voice Note response validation failed',
        requestId: response.requestId,
        ...(error instanceof z.ZodError
          ? {
              issues: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                code: issue.code,
              })),
            }
          : {}),
      });
      throw new ApiException(502, 'voice.provider_unavailable');
    }
  }
}
