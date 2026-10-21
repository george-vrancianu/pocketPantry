import { Injectable } from '@nestjs/common';
import {
  CATALOG_LOCALES,
  FALLBACK_LOCALE,
  type CatalogLocale,
} from '../catalog/catalog.schemas';
import type { AssistantTokenMember } from '../assistant-tokens/assistant-token.schemas';
import { ApiException } from '../common/api-exception';
import { ScanCapService } from '../scan/scan-cap.service';
import { ShoppingService } from '../shopping/shopping.service';
import {
  sameSubject,
  voiceActionKind,
  type ResolvedVoiceAction,
  type VoiceActionDraft,
  type VoiceActionKind,
  type VoiceApplyResult,
} from '../voice/voice-actions';
import { VoiceService } from '../voice/voice.service';
import {
  assistantSpeech,
  type AssistantOutcome,
  type AssistantState,
} from './assistant-speech';
import type {
  AssistantRequestBody,
  AssistantRequestResponse,
} from './assistant.schemas';

/**
 * The Voice Action kinds an Assistant Request applies without Review (ADR 0019).
 * Adding a Shopping Item and flagging Running low are the safe kinds;
 * `shopping.setQuantity` only changes the amount of an item already on the
 * list (and is how a spoken quantity on an existing item is applied, ADR 0017),
 * so nothing is removed, checked or lost. Everything else is refused.
 */
export const ASSISTANT_ALLOWED_KINDS: ReadonlySet<VoiceActionKind> = new Set([
  'shopping.add',
  'shopping.setQuantity',
  'pantry.runningLow',
]);

/** A request answered with a whole-request state instead of per-action outcomes. */
export type AssistantReply =
  | ({ state?: undefined } & AssistantRequestResponse)
  | { state: AssistantState; outcomes: []; speech: string };

const localeOf = (member: AssistantTokenMember): CatalogLocale =>
  CATALOG_LOCALES.find((locale) => locale === member.locale) ?? FALLBACK_LOCALE;

const displayName = (action: ResolvedVoiceAction): string =>
  action.ingredient?.name ?? action.name ?? action.text;

/**
 * An Assistant Request: dictated text read into Voice Actions and the safe ones
 * applied at once, with no Review. Charged to the Assistant Cap and refunded on
 * a provider failure or when nothing was understood. The text is passed
 * through and never stored.
 */
@Injectable()
export class AssistantService {
  constructor(
    private readonly voice: VoiceService,
    private readonly cap: ScanCapService,
    private readonly shopping: ShoppingService,
  ) {}

  async handle(
    member: AssistantTokenMember,
    body: AssistantRequestBody,
  ): Promise<AssistantReply> {
    const locale = localeOf(member);
    const stateReply = (state: AssistantState): AssistantReply => ({
      state,
      outcomes: [],
      speech: assistantSpeech({ locale, state }),
    });
    // Before the charge: an unconfigured deployment costs the Member nothing.
    if (!this.voice.isTextConfigured()) return stateReply('notConfigured');

    let day: string;
    try {
      day = await this.cap.consume(member.id, new Date(), 'assistant');
    } catch (error) {
      if (
        error instanceof ApiException &&
        error.code === 'assistant.cap_reached'
      ) {
        return stateReply('capReached');
      }
      throw error;
    }

    try {
      const today = body.today ?? new Date().toISOString().slice(0, 10);
      const resolved = (
        await this.voice.readText(member.id, {
          text: body.text,
          scanLanguage: locale,
          locale,
          today,
          defaultTarget: 'shopping',
        })
      ).filter((action) => action.status !== 'notUnderstood');
      if (resolved.length === 0) {
        await this.cap.refund(member.id, day, 'assistant');
        return stateReply('nothingUnderstood');
      }
      const drafts = resolved.map(toDraft);
      // Adding what is already on the list, with no quantity, changes nothing.
      const items = await this.shopping
        .peekList(member.id, locale)
        .then((list) => list?.groups.flatMap((group) => group.items) ?? []);
      const present = new Set(
        drafts
          .filter(
            (draft) =>
              voiceActionKind(draft) === 'shopping.add' &&
              draft.quantity === null &&
              items.some((item) => !item.checked && sameSubject(draft)(item)),
          )
          .map((draft) => draft.id),
      );
      const result = await this.voice.applyActions(member.id, {
        actions: drafts.filter((draft) => !present.has(draft.id)),
        locale,
        today,
        allowedKinds: ASSISTANT_ALLOWED_KINDS,
      });
      const outcomes = resolved.map((action, index) =>
        outcomeOf(action, drafts[index], result, present.has(drafts[index].id)),
      );
      return { outcomes, speech: assistantSpeech({ locale, outcomes }) };
    } catch (error) {
      await this.cap.refund(member.id, day, 'assistant');
      if (
        error instanceof ApiException &&
        error.code === 'voice.provider_unavailable'
      ) {
        return stateReply('providerFailed');
      }
      throw error;
    }
  }
}

/**
 * The action as a draft to apply. Adding an item already on the list with a
 * spoken quantity sets that quantity (ADR 0017) rather than summing, so it is
 * applied as `shopping.setQuantity`; with no quantity the add leaves it alone.
 */
function toDraft(action: ResolvedVoiceAction): VoiceActionDraft {
  const draft: VoiceActionDraft = {
    id: action.id,
    // notUnderstood entries are filtered out, so target and op are set.
    target: action.target ?? 'shopping',
    op: action.op ?? 'add',
    text: action.text,
    ingredientId: action.ingredient?.id ?? null,
    name: action.name,
    quantity: action.quantity,
    unit: action.unit,
    scope: action.scope,
    expiresOn: action.expiresOn,
    noExpiry: action.noExpiry,
    location: action.location,
    batchId: null,
    batchIds: [],
  };
  return draft.target === 'shopping' &&
    draft.op === 'add' &&
    action.rows.shoppingItem != null &&
    draft.quantity !== null
    ? { ...draft, op: 'setQuantity' }
    : draft;
}

/** What happened to one action, from the draft that was applied and the apply result. */
function outcomeOf(
  action: ResolvedVoiceAction,
  draft: VoiceActionDraft,
  result: VoiceApplyResult,
  alreadyPresent: boolean,
): AssistantOutcome {
  const name = displayName(action);
  if (alreadyPresent) return { kind: 'alreadyOnList', name };
  const refused = { kind: 'refused', name } as const;
  const applied = result.applied.find((entry) => entry.actionId === draft.id);
  if (!applied) return refused; // refused by kind, or skipped (the Member is sent to the app)
  const amount = { quantity: action.quantity, unit: action.unit };
  switch (voiceActionKind(draft)) {
    case 'pantry.runningLow':
      return {
        kind: action.rows.shoppingFallback
          ? 'addedBecauseRunningLowNoBatch'
          : 'flaggedRunningLow',
        name,
      };
    case 'shopping.setQuantity':
      return {
        kind: applied.alreadyDone ? 'alreadyOnList' : 'quantitySet',
        name,
        ...amount,
      };
    case 'shopping.add':
      return {
        kind: action.ingredient ? 'added' : 'addedUnmatched',
        name,
        ...amount,
      };
    default:
      return refused;
  }
}
