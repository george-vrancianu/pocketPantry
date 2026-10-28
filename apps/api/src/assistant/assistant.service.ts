import { Injectable } from '@nestjs/common';
import { type CatalogLocale } from '../catalog/catalog.schemas';
import type { AssistantTokenMember } from '../assistant-tokens/assistant-token.schemas';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import { ApiException } from '../common/api-exception';
import { MemberLanguageService } from '../member-language/member-language.service';
import {
  found,
  foundNothing,
  PaidReadsService,
} from '../scan/paid-reads.service';
import { SettingsService } from '../settings/settings.service';
import {
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
 * The Voice Action kinds an Assistant Request applies without Review (ADR 0019,
 * amended by ADR 0023). Adding a Shopping Item, flagging Running low and
 * checking a Shopping Item already on the list are the safe kinds; everything
 * else (unchecking, removing, `shopping.setQuantity`, Batch changes) is refused.
 */
export const ASSISTANT_ALLOWED_KINDS: ReadonlySet<VoiceActionKind> = new Set([
  'shopping.add',
  'shopping.check',
  'pantry.runningLow',
]);

/** A request answered with a whole-request state instead of per-action outcomes. */
export type AssistantReply =
  | ({ state?: undefined } & AssistantRequestResponse)
  | { state: AssistantState; outcomes: []; speech: string };

/** Anything the reply names: a Voice Action or an answer. */
type Named = {
  id: string;
  ingredient: { id: string; name: string } | null;
  /** The Unmatched name. */
  name?: string | null;
  /** What was said. */
  text: string;
};

const displayName = (action: Named): string =>
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
    private readonly paidReads: PaidReadsService,
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
    private readonly languages: MemberLanguageService,
  ) {}

  async handle(
    member: AssistantTokenMember,
    body: AssistantRequestBody,
  ): Promise<AssistantReply> {
    // The UI Language: the reply falls back to it (ADR 0019). What the request writes (Unmatched names,
    // Shopping Item names) is in the Catalog Language.
    const { ui: locale, catalog } = await this.languages.languagesOf(member.id);
    const stateReply = (state: AssistantState): AssistantReply => ({
      state,
      outcomes: [],
      speech: assistantSpeech({ locale, state }),
    });
    // Before the charge: an unconfigured deployment costs the Member nothing.
    if (!this.voice.isTextConfigured()) return stateReply('notConfigured');

    // Nothing dictated: no model call and no charge.
    if (body.text === '') return stateReply('nothingUnderstood');

    let outcomes: AssistantOutcome[] = [];
    let replyLocale = locale;
    try {
      await this.paidReads.read(member.id, 'assistant', async () => {
        const today = body.today ?? new Date().toISOString().slice(0, 10);
        const read = await this.voice.readText(member.id, {
          text: body.text,
          // Siri dictation may be in any language, whatever the UI Language.
          spokenLanguage: null,
          locale: catalog,
          uiLanguage: locale,
          today,
          defaultTarget: 'shopping',
        });
        replyLocale = read.spokenLanguage ?? locale;
        const resolved = read.actions.filter(
          (action) => action.status !== 'notUnderstood',
        );
        const drafts = resolved.map(toDraft);
        // Looked up before the writes: a failure here must not follow committed items.
        const names = await this.namesIn(member.id, catalog, replyLocale, [
          ...resolved,
          ...read.answers,
        ]);
        // An add onto an existing line sets the spoken quantity (ADR 0017) and
        // wants the line back on the list, rather than summing as in Review.
        // A question-only request has nothing to apply and writes nothing.
        const result: VoiceApplyResult =
          drafts.length === 0
            ? { applied: [], skipped: [], refused: [] }
            : await this.voice.applyActions(member.id, {
                actions: drafts,
                locale: catalog,
                today,
                allowedKinds: ASSISTANT_ALLOWED_KINDS,
                addSetsQuantity: true,
                checkOnly: true,
              });
        // The list keeps Catalog Language names; the reply names things in the language spoken.
        // An Unmatched item is named by what was said (spokenName) when the reply is not in the Catalog Language.
        const nameOf = (action: Named): string =>
          action.ingredient
            ? (names.get(action.ingredient.id) ?? action.ingredient.name)
            : ((replyLocale !== catalog
                ? read.spokenNames.get(action.id)
                : undefined) ?? displayName(action));
        const tickedHere = new Set<string>();
        // Answers to Pantry Questions come first, as they are spoken first.
        outcomes = [
          ...read.answers.map((answer): AssistantOutcome => {
            const name = nameOf(answer);
            switch (answer.kind) {
              case 'yes':
                return {
                  kind: 'yes',
                  name,
                  totals: answer.totals,
                  locations: answer.locations,
                  expiringSoon: answer.expiringSoon,
                  runningLow: answer.runningLow,
                };
              case 'notSure':
                return { kind: 'notSure', name };
              case 'onlyExpired':
              case 'no':
                return {
                  kind: answer.kind,
                  name,
                  onShoppingList: answer.onShoppingList,
                };
            }
          }),
          ...resolved.flatMap((action, index) => {
            const outcome = outcomeOf(
              action,
              drafts[index],
              result,
              nameOf(action),
            );
            // "Got milk and milk": the second mention is the line the first just ticked, not a miss.
            const key =
              action.ingredient?.id ?? displayName(action).toLowerCase();
            if (outcome.kind === 'checked') tickedHere.add(key);
            else if (outcome.kind === 'notOnList' && tickedHere.has(key))
              return [];
            return [outcome];
          }),
        ];
        return outcomes.length === 0 ? foundNothing(outcomes) : found(outcomes);
      });
    } catch (error) {
      if (
        error instanceof ApiException &&
        error.code === 'assistant.cap_reached'
      ) {
        return stateReply('capReached');
      }
      if (
        error instanceof ApiException &&
        error.code === 'voice.provider_unavailable'
      ) {
        return stateReply('providerFailed');
      }
      throw error;
    }
    if (outcomes.length === 0) return stateReply('nothingUnderstood');
    return {
      outcomes,
      speech: assistantSpeech({ locale: replyLocale, outcomes }),
    };
  }

  /** Matched Ingredients' display names in the reply language, by id. */
  private async namesIn(
    memberId: string,
    catalogLocale: CatalogLocale,
    replyLocale: CatalogLocale,
    actions: { ingredient: { id: string } | null }[],
  ): Promise<Map<string, string>> {
    // Ingredient names already come in the Catalog Language.
    if (replyLocale === catalogLocale) return new Map();
    const ids = [
      ...new Set(actions.flatMap((action) => action.ingredient?.id ?? [])),
    ];
    if (ids.length === 0) return new Map();
    const scope = await this.settings.catalogScopeForMember(memberId);
    const found = await this.catalogSearch.mapByIds(scope, ids, replyLocale);
    return new Map([...found].map(([id, result]) => [id, result.name]));
  }
}

/** The action as a draft to apply. */
function toDraft(action: ResolvedVoiceAction): VoiceActionDraft {
  return {
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
}

/** What happened to one action, from the draft that was applied and the apply result, named for the reply. */
function outcomeOf(
  action: ResolvedVoiceAction,
  draft: VoiceActionDraft,
  result: VoiceApplyResult,
  name: string,
): AssistantOutcome {
  const refused = { kind: 'refused', name } as const;
  const applied = result.applied.find((entry) => entry.actionId === draft.id);
  // A check finds an unchecked line already on the list or it writes nothing (ADR 0023).
  if (
    !applied &&
    voiceActionKind(draft) === 'shopping.check' &&
    result.skipped.some(
      (entry) =>
        entry.id === draft.id && entry.reason === 'voice.item_not_found',
    )
  ) {
    return { kind: 'notOnList', name };
  }
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
    case 'shopping.check':
      return { kind: 'checked', name };
    case 'shopping.add':
      if (applied.alreadyDone) return { kind: 'alreadyOnList', name };
      if (applied.merged && action.quantity !== null) {
        return { kind: 'quantitySet', name, ...amount };
      }
      // A bare add that put a checked line back on the list reads as an add.
      return {
        kind: action.ingredient ? 'added' : 'addedUnmatched',
        name,
        ...amount,
      };
    default:
      return refused;
  }
}
