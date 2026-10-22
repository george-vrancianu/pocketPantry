import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  SCAN_LANGUAGES,
  type CatalogLocale,
  type ScanLanguage,
} from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { CatalogMatchService, keepConfident } from '../scan/catalog-matching';
import { ScanCapService } from '../scan/scan-cap.service';
import { SettingsService } from '../settings/settings.service';
import { ShoppingService } from '../shopping/shopping.service';
import { TranscriptionService } from './transcription.service';
import {
  amountOf,
  type ModelVoiceAction,
  type VoiceTarget,
  type ResolvedVoiceAction,
  type VoiceActionDraft,
  type VoiceActionKind,
  type VoiceApplyBody,
  type VoiceApplyResult,
  voiceActionKind,
} from './voice-actions';
import type { VoiceActionHandler } from './voice-handlers';
import { VoiceHandlers } from './voice-handlers.registry';
import { PantryService } from '../pantry/pantry.service';
import { resolveSpokenDate } from './voice-dates';
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

/** Plain text to read into Voice Actions: no audio, no cap. */
export type VoiceReadTextInput = {
  text: string;
  /** Null when the language spoken is not known: the model works it out and reports it. */
  scanLanguage: ScanLanguage | null;
  locale: CatalogLocale;
  /** The Member's local date, for resolving spoken dates. */
  today: string;
  defaultTarget: VoiceTarget;
  /** Debug capture only: ties this read to a transcription. */
  captureId?: string;
};

export type VoiceReadTextResult = {
  actions: ResolvedVoiceAction[];
  /** The language the text was spoken in, as the model read it; null when it can't be told. */
  spokenLanguage: ScanLanguage | null;
  /** Each action's short generic name in the language spoken, by action id. Only Assistant Requests use it. */
  spokenNames: Map<string, string>;
};

/** Voice Actions to apply on their own, without Review. */
export type VoiceApplyActionsInput = {
  actions: VoiceActionDraft[];
  locale: CatalogLocale;
  /** The Member's local date, for a Pantry add that takes the Default Expiry. */
  today: string;
  /** When given, an action of any other kind is refused and nothing is written for it. */
  allowedKinds?: ReadonlySet<VoiceActionKind>;
  /** An add onto an existing Shopping line sets its quantity (and unchecks it) instead of summing. Off for Review. */
  addSetsQuantity?: boolean;
};

type PantryBatches = Awaited<ReturnType<PantryService['list']>>;

class SkippedAction extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
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
    private readonly pantry: PantryService,
    private readonly handlers: VoiceHandlers,
    private readonly config: ConfigService<AppConfig, true>,
    @Inject(DATABASE) private readonly database: Database,
  ) {}

  isConfigured(): boolean {
    return this.transcription.isConfigured();
  }

  /** The text model can be called: a key, and for a compatible vendor a base URL. */
  isTextConfigured(): boolean {
    const provider = this.config.get('AI_PROVIDER', { infer: true });
    return Boolean(
      this.config.get('AI_API_KEY', { infer: true }) &&
      (provider !== 'openai-compatible' ||
        this.config.get('AI_BASE_URL', { infer: true })),
    );
  }

  async read(
    memberId: string,
    input: VoiceNoteInput,
  ): Promise<VoiceNoteResponse> {
    if (input.durationMs > MAX_VOICE_NOTE_MS) {
      throw new ApiException(413, 'voice.too_long');
    }
    const day = await this.cap.consume(memberId, new Date(), 'voice');
    // Debug capture only: ties the recording's transcription to its transcript read.
    const captureId = randomUUID();
    try {
      const { text } = await this.transcription.transcribe({
        audio: input.audio,
        mimeType: input.mimeType,
        language: input.scanLanguage,
        otherLanguages: SCAN_LANGUAGES.filter((l) => l !== input.scanLanguage),
        captureId,
      });
      const transcript = text.trim();
      if (!transcript) throw new ApiException(422, 'voice.nothing_heard');
      const { actions } = await this.readText(memberId, {
        text: transcript,
        scanLanguage: input.scanLanguage,
        locale: input.locale,
        today: input.today,
        defaultTarget: input.defaultTarget,
        captureId,
      });
      // Noise ("Thank you.") reads into nothing: no Review, and no charge. A
      // note of only "Didn't understand" rows still opens Review.
      if (actions.length === 0) {
        throw new ApiException(422, 'voice.nothing_heard');
      }
      return { transcript, actions };
    } catch (error) {
      await this.cap.refund(memberId, day, 'voice');
      throw error;
    }
  }

  /**
   * Reads plain text into Voice Actions, each resolved against the Member's
   * current lists. No transcription and no cap; writes nothing. A provider
   * failure is `voice.provider_unavailable`.
   */
  async readText(
    memberId: string,
    input: VoiceReadTextInput,
  ): Promise<VoiceReadTextResult> {
    const shoppingItems = await this.shopping
      .peekList(memberId, input.locale)
      .then((list) => list?.groups.flatMap((group) => group.items) ?? []);
    let read;
    try {
      read = await this.reader.read({
        shoppingItems,
        memberId,
        transcript: input.text,
        scanLanguage: input.scanLanguage,
        locale: input.locale,
        today: input.today,
        defaultTarget: input.defaultTarget,
        captureId: input.captureId,
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
        // An exact name or Synonym hit beats a Match the model doubted.
        floor: { confidence: action.matchConfidence, threshold },
      })),
      scope,
      input.locale,
      overrides,
    );

    let pantryBatches: Promise<PantryBatches> | undefined;
    const ctx = {
      memberId,
      locale: input.locale,
      today: input.today,
      lists: {
        shoppingItems: () => Promise.resolve(shoppingItems),
        // Loaded once, and only when a Pantry action needs it.
        pantryBatches: (): Promise<PantryBatches> =>
          (pantryBatches ??= this.pantry.list(memberId, input.locale)),
      },
    };
    const out: ResolvedVoiceAction[] = [];
    const spokenNames = new Map<string, string>();
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
      spokenNames.set(draft.id, action.spokenName);
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
    return {
      actions: out,
      spokenLanguage: read.spokenLanguage,
      spokenNames,
    };
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
      // An unspoken unit on set quantity / check means "the item's own unit".
      ...(action.op === 'setQuantity' || action.op === 'check'
        ? {
            quantity: action.quantity,
            unit: action.quantity === null ? null : action.unit,
          }
        : amountOf(action)),
      scope: action.scope,
      expiresOn: action.noExpiry
        ? null
        : resolveSpokenDate(action.expiresOn, today),
      noExpiry: action.noExpiry,
      location: action.location,
      batchId: null,
      batchIds: [],
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

  /** Applies the Voice Actions as edited in Review. Free of the Voice Cap. */
  apply(memberId: string, body: VoiceApplyBody): Promise<VoiceApplyResult> {
    return this.applyActions(memberId, {
      actions: body.actions,
      locale: body.locale,
      today: body.today ?? new Date().toISOString().slice(0, 10),
    });
  }

  /**
   * Applies Voice Actions all in one transaction. Each is re-checked against
   * the current lists by its handler and runs in its own savepoint, so a
   * skipped one leaves no partial write. With an allowed set, an action of
   * another kind is refused (`refused`, reason `voice.kind_not_allowed`) before
   * any handler runs.
   */
  async applyActions(
    memberId: string,
    input: VoiceApplyActionsInput,
  ): Promise<VoiceApplyResult> {
    const { allowedKinds } = input;
    const result: VoiceApplyResult = {
      applied: [],
      skipped: [],
      ...(allowedKinds ? { refused: [] } : {}),
    };
    await this.database.transaction(async (tx) => {
      for (const draft of input.actions) {
        const kind = voiceActionKind(draft);
        if (allowedKinds && !allowedKinds.has(kind)) {
          result.refused?.push({
            id: draft.id,
            kind,
            reason: 'voice.kind_not_allowed',
          });
          continue;
        }
        const handler: VoiceActionHandler | undefined =
          this.handlers.for(draft);
        if (!handler) {
          result.skipped.push({ id: draft.id, reason: 'voice.not_supported' });
          continue;
        }
        try {
          const applied = await tx.transaction(async (savepoint) => {
            const outcome = await handler.apply(draft, {
              memberId,
              locale: input.locale,
              today: input.today,
              tx: savepoint,
              ...(input.addSetsQuantity ? { addSetsQuantity: true } : {}),
            });
            if (!outcome.applied) throw new SkippedAction(outcome.reason);
            return outcome;
          });
          result.applied.push({
            actionId: draft.id,
            list: applied.list,
            ...(applied.rowId === undefined ? {} : { rowId: applied.rowId }),
            ...(applied.rowIds === undefined ? {} : { rowIds: applied.rowIds }),
            alreadyDone: applied.alreadyDone,
            ...(applied.merged ? { merged: true } : {}),
          });
        } catch (error) {
          if (!(error instanceof SkippedAction)) throw error;
          result.skipped.push({ id: draft.id, reason: error.reason });
        }
      }
    });
    return result;
  }
}
