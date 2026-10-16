import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { SCAN_LANGUAGES } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { addDays } from '../common/dates';
import { CatalogMatchService, keepConfident } from '../scan/catalog-matching';
import { ScanCapService } from '../scan/scan-cap.service';
import { SettingsService } from '../settings/settings.service';
import { ShoppingService } from '../shopping/shopping.service';
import { TranscriptionService } from './transcription.service';
import {
  amountOf,
  type ModelVoiceAction,
  type ResolvedVoiceAction,
  type VoiceActionDraft,
  type VoiceApplyBody,
  type VoiceApplyResult,
} from './voice-actions';
import type { VoiceActionHandler } from './voice-handlers';
import { VoiceHandlers } from './voice-handlers.registry';
import { VoiceReaderService } from './voice-reader.service';
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

class SkippedAction extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
}

const FIVE_YEARS_DAYS = 5 * 366;

/** A spoken date in the past or more than five years out is dropped. */
function sensibleDate(date: string | null, today: string): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return date >= today && date <= addDays(today, FIVE_YEARS_DAYS) ? date : null;
}

/**
 * A Voice Note: the recording is transcribed, the transcript read into Voice
 * Actions and each resolved against the current lists. Charged to the Voice Cap
 * before the providers are called and refunded when a provider fails or
 * nothing was heard. Reading writes nothing but the cap charge; Apply writes
 * the edited Voice Actions in one transaction and is free. Neither audio nor
 * transcript is stored.
 */
@Injectable()
export class VoiceService {
  constructor(
    private readonly transcription: TranscriptionService,
    private readonly cap: ScanCapService,
    private readonly reader: VoiceReaderService,
    private readonly catalogMatch: CatalogMatchService,
    private readonly settings: SettingsService,
    private readonly shopping: ShoppingService,
    private readonly handlers: VoiceHandlers,
    private readonly config: ConfigService<AppConfig, true>,
    @Inject(DATABASE) private readonly database: Database,
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
    try {
      const { text } = await this.transcription.transcribe({
        audio: input.audio,
        mimeType: input.mimeType,
        language: input.scanLanguage,
        otherLanguages: SCAN_LANGUAGES.filter((l) => l !== input.scanLanguage),
      });
      const transcript = text.trim();
      if (!transcript) throw new ApiException(422, 'voice.nothing_heard');
      const actions = await this.resolveTranscript(memberId, transcript, input);
      return { transcript, actions };
    } catch (error) {
      await this.cap.refund(memberId, day, 'voice');
      throw error;
    }
  }

  private async resolveTranscript(
    memberId: string,
    transcript: string,
    input: VoiceNoteFields,
  ): Promise<ResolvedVoiceAction[]> {
    const shoppingItems = await this.shopping
      .peekList(memberId, input.locale)
      .then((list) => list?.groups.flatMap((group) => group.items) ?? []);
    let read;
    try {
      read = await this.reader.read({
        shoppingItems,
        memberId,
        transcript,
        scanLanguage: input.scanLanguage,
        locale: input.locale,
        today: input.today,
        defaultTarget: input.defaultTarget,
      });
    } catch (error) {
      // The shared AI service speaks `scan.*`; to a Member this is the voice provider failing.
      if (error instanceof ApiException && error.code.startsWith('scan.')) {
        throw new ApiException(error.getStatus(), 'voice.provider_unavailable');
      }
      throw error;
    }

    const scope = await this.settings.catalogScopeForMember(memberId);
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    const resolved = await this.catalogMatch.resolve(
      read.actions.map((action) => ({
        names: [action.fallbackIngredientName, action.spokenText],
        proposedIngredientId: action.matchedIngredientId,
      })),
      scope,
      input.locale,
      overrides,
    );

    const ctx = {
      memberId,
      locale: input.locale,
      lists: { shoppingItems: () => Promise.resolve(shoppingItems) },
    };
    const out: ResolvedVoiceAction[] = [];
    for (const [index, action] of read.actions.entries()) {
      const match = keepConfident(
        resolved[index],
        action.matchConfidence,
        threshold,
      );
      const draft = this.draftOf(action, match?.id ?? null, input.today);
      const handler = this.handlers.for(draft);
      if (!handler) {
        out.push(this.notUnderstood(action.spokenText));
        continue;
      }
      const resolution = await handler.resolve(draft, ctx);
      out.push({
        id: draft.id,
        status: resolution.status,
        target: draft.target,
        op: draft.op,
        text: draft.text,
        ingredient: match,
        name: match ? null : draft.name,
        quantity: draft.quantity,
        unit: draft.unit,
        scope: draft.scope,
        expiresOn: draft.expiresOn,
        noExpiry: draft.noExpiry,
        location: draft.location,
        rows: resolution.rows,
        defaults: resolution.defaults,
      });
    }
    for (const phrase of read.unsupported) {
      out.push(this.notUnderstood(phrase));
    }
    return out;
  }

  private draftOf(
    action: ModelVoiceAction,
    ingredientId: string | null,
    today: string,
  ): VoiceActionDraft {
    return {
      id: randomUUID(),
      target: action.target,
      op: action.op,
      text: action.spokenText,
      ingredientId,
      name: ingredientId ? null : action.fallbackIngredientName,
      ...amountOf(action),
      scope: action.scope,
      expiresOn: action.noExpiry ? null : sensibleDate(action.expiresOn, today),
      noExpiry: action.noExpiry,
      location: action.location,
      batchId: null,
    };
  }

  private notUnderstood(text: string): ResolvedVoiceAction {
    return {
      id: randomUUID(),
      status: 'notUnderstood',
      target: null,
      op: null,
      text,
      ingredient: null,
      name: null,
      quantity: null,
      unit: null,
      scope: null,
      expiresOn: null,
      noExpiry: false,
      location: null,
      rows: {},
      defaults: {},
    };
  }

  /**
   * Applies the Voice Actions as edited in Review, all in one transaction.
   * Each is re-checked against the current lists by its handler and runs in its
   * own savepoint, so a skipped one leaves no partial write. Free of the Voice Cap.
   */
  async apply(
    memberId: string,
    body: VoiceApplyBody,
  ): Promise<VoiceApplyResult> {
    const result: VoiceApplyResult = { applied: [], skipped: [] };
    await this.database.transaction(async (tx) => {
      for (const action of body.actions) {
        const draft: VoiceActionDraft = action;
        const handler: VoiceActionHandler | undefined =
          this.handlers.for(draft);
        if (!handler) {
          result.skipped.push({ id: draft.id, reason: 'voice.not_supported' });
          continue;
        }
        try {
          await tx.transaction(async (savepoint) => {
            const outcome = await handler.apply(draft, {
              memberId,
              locale: body.locale,
              tx: savepoint,
            });
            if (!outcome.applied) throw new SkippedAction(outcome.reason);
          });
          result.applied.push(draft.id);
        } catch (error) {
          if (!(error instanceof SkippedAction)) throw error;
          result.skipped.push({ id: draft.id, reason: error.reason });
        }
      }
    });
    return result;
  }
}
