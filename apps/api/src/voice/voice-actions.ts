import { z } from 'zod';
import {
  CATALOG_LOCALES,
  FALLBACK_LOCALE,
  SCAN_LANGUAGES,
  type CatalogSearchResult,
} from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { MAX_QUANTITY } from '../common/quantity';
import { ingredientUnit, storageLocation } from '../database/schema';
import { VOICE_LISTS, VOICE_DEFAULT_TARGETS } from './voice.schemas';

/** Structured-output schema name of a Voice Note read. */
export const VOICE_READ_SCHEMA_NAME = 'voice_note_actions';

export const VOICE_OPS = [
  'add',
  'remove',
  'check',
  'uncheck',
  'setQuantity',
  'runningLow',
] as const;
export type VoiceOp = (typeof VOICE_OPS)[number];
export type VoiceTarget = (typeof VOICE_LISTS)[number];
export type VoiceDefaultTarget = (typeof VOICE_DEFAULT_TARGETS)[number];
export type VoiceUnit = (typeof ingredientUnit.enumValues)[number];
export type VoiceLocation = (typeof storageLocation.enumValues)[number];

/** One Voice Action as the text model returns it, before Matching. */
const modelAction = z.object({
  /** Null only for a bare add or remove with no Default List (`defaultTarget: none`); the server then asks Review for a list. */
  target: z.enum(VOICE_LISTS).nullable(),
  op: z.enum(VOICE_OPS),
  /** The words that made this Voice Action, in the language spoken. */
  spokenText: z.string().trim().min(1).max(200),
  matchedIngredientId: z.uuid().nullable(),
  matchConfidence: z.number().min(0).max(1),
  /** A short generic Ingredient name in the UI locale. */
  fallbackIngredientName: z.string().trim().min(1).max(80),
  /** The same short generic name in the language spoken, for an Assistant reply. */
  spokenName: z.string().trim().min(1).max(80),
  quantity: z.number().positive().max(MAX_QUANTITY).nullable(),
  unit: z.enum(ingredientUnit.enumValues).nullable(),
  /** Removals only: one Batch (or the item) or all of them. */
  scope: z.enum(['one', 'all']).nullable(),
  expiresOn: z.string().nullable(),
  noExpiry: z.boolean(),
  location: z.enum(storageLocation.enumValues).nullable(),
});
/**
 * One Pantry Question as the text model returns it: "do we have X?" names one
 * Ingredient (ADR 0020). Matched like a Voice Action, but it is not one: it has
 * no list, op or amount, and never reaches a handler.
 */
const modelQuestion = z.object({
  /** The words that made this question, in the language spoken. */
  spokenText: z.string().trim().min(1).max(200),
  matchedIngredientId: z.uuid().nullable(),
  matchConfidence: z.number().min(0).max(1),
  /** A short generic Ingredient name in the UI locale. */
  fallbackIngredientName: z.string().trim().min(1).max(80),
  /** The same short generic name in the language spoken, for an Assistant reply. */
  spokenName: z.string().trim().min(1).max(80),
});
export const voiceReadModelSchema = z.object({
  actions: z.array(modelAction),
  /** Pantry Questions, one per Ingredient asked about (ADR 0020). */
  questions: z.array(modelQuestion).default([]),
  /** Phrases the model could not turn into a supported Voice Action. */
  unsupported: z.array(z.string().trim().min(1).max(200)),
  /** The language the text was spoken in, or null when it can't be told. Only Assistant Requests use it. */
  spokenLanguage: z.enum(SCAN_LANGUAGES).nullable(),
});
export type VoiceReadModelResult = z.infer<typeof voiceReadModelSchema>;
export type ModelVoiceAction = z.infer<typeof modelAction>;
export type ModelPantryQuestion = z.infer<typeof modelQuestion>;

export const voiceReadJsonSchema = z.toJSONSchema(voiceReadModelSchema, {
  target: 'draft-7',
});
delete voiceReadJsonSchema.$schema;
// The provider's schema keeps `questions` required; the `default` only serves parsing a reply that omits it.
delete (voiceReadJsonSchema.properties as Record<string, { default?: unknown }>)
  .questions.default;

/**
 * A Voice Action as the resolvers and appliers see it: what Review shows and
 * sends back. Resolving a Voice Note produces these; Apply receives them
 * edited. `ingredientId` is the Match; without one, `name` is the Unmatched name.
 */
export type VoiceActionDraft = {
  id: string;
  target: VoiceTarget;
  op: VoiceOp;
  /** What was said. */
  text: string;
  ingredientId: string | null;
  name: string | null;
  quantity: number | null;
  unit: VoiceUnit | null;
  scope: 'one' | 'all' | null;
  expiresOn: string | null;
  noExpiry: boolean;
  location: VoiceLocation | null;
  /** A Batch chosen in Review, when the action needed one. */
  batchId: string | null;
  /** The Batches Review showed a resolved Pantry removal taking; Apply holds to exactly those. */
  batchIds: string[];
};

/** The rows an action will touch, for Review to show. */
export type ResolvedBatchRow = {
  id: string;
  /** The Ingredient's (or Unmatched) name. */
  name: string;
  quantity: number | null;
  unit: VoiceUnit | null;
  location: VoiceLocation;
  expiresOn: string | null;
  /** Removals: the amount taken from this Batch, or null when the whole Batch goes. */
  take?: number | null;
};

export type ResolvedRows = {
  /** Pantry removals and Running low: the Batches it will take, or the candidates to pick from (needsBatch). */
  batches?: ResolvedBatchRow[];
  /** Pantry Running low with no Batch: Apply adds the Ingredient to the Shopping List instead. */
  shoppingFallback?: boolean;
  shoppingItem?: {
    id: string;
    name: string;
    quantity: number | null;
    unit: VoiceUnit | null;
    checked: boolean;
  } | null;
};

export type VoiceActionStatus =
  'ready' | 'needsBatch' | 'notFound' | 'notUnderstood' | 'needsList';

export type ResolvedVoiceAction = {
  id: string;
  status: VoiceActionStatus;
  /** Null for a Didn't understand entry and for `needsList`, which belong to no list yet. */
  target: VoiceTarget | null;
  op: VoiceOp | null;
  text: string;
  /** The Match, localised; null when Unmatched. */
  ingredient: CatalogSearchResult | null;
  /** The Unmatched name (UI locale); null when matched. */
  name: string | null;
  quantity: number | null;
  unit: VoiceUnit | null;
  scope: 'one' | 'all' | null;
  expiresOn: string | null;
  noExpiry: boolean;
  location: VoiceLocation | null;
  rows: ResolvedRows;
  /** What fills in for anything unspoken (Location and Default Expiry for Pantry adds). */
  defaults: { location?: VoiceLocation; expiresOn?: string };
  /** Only `needsList`: the action resolved against each list, so Review swaps without a request. */
  byList?: { shopping: ResolvedVoiceAction; pantry: ResolvedVoiceAction };
};

/** The body of `POST /voice/apply`. */
export const voiceApplyBody = z.object({
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        target: z.enum(VOICE_LISTS),
        op: z.enum(VOICE_OPS),
        text: z.string().max(200).default(''),
        ingredientId: z.uuid().nullable().default(null),
        name: z.string().trim().min(1).max(100).nullable().default(null),
        quantity: z
          .number()
          .positive()
          .max(MAX_QUANTITY)
          .nullable()
          .default(null),
        unit: z.enum(ingredientUnit.enumValues).nullable().default(null),
        scope: z.enum(['one', 'all']).nullable().default(null),
        expiresOn: z.iso.date().nullable().default(null),
        noExpiry: z.boolean().default(false),
        location: z.enum(storageLocation.enumValues).nullable().default(null),
        batchId: z.uuid().nullable().default(null),
        batchIds: z.array(z.uuid()).max(50).default([]),
      }),
    )
    .max(50),
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  /** The Member's local date, for a Pantry add that takes the Default Expiry. */
  today: z.iso.date().optional(),
});
export type VoiceApplyBody = z.infer<typeof voiceApplyBody>;

/** One applied Voice Action: which list it landed on and the row it touched. */
export type VoiceAppliedEntry = {
  actionId: string;
  list: VoiceTarget;
  /** The Shopping Item or Batch touched (for a removal, `rowIds[0]`: a surviving Batch in a Location the removal touched). */
  rowId?: string;
  /** Set by Pantry removals: one surviving Batch per Location the removal touched; `rowId` is the first. Other Actions set only `rowId`. */
  rowIds?: string[];
  /** Already satisfied when applied; still counts as applied. */
  alreadyDone: boolean;
  /** Only with `addSetsQuantity` (Assistant Request): the add landed on a line already on the list. Never present for Review. */
  merged?: boolean;
};

/**
 * The kind of a Voice Action: its list and what it does, e.g. `shopping.add` or
 * `pantry.runningLow`. An allowed set of kinds limits what Apply may write.
 */
export type VoiceActionKind = `${VoiceTarget}.${VoiceOp}`;

export const voiceActionKind = (
  draft: Pick<VoiceActionDraft, 'target' | 'op'>,
): VoiceActionKind => `${draft.target}.${draft.op}`;

/** A Voice Action whose kind is outside the allowed set: not applied, nothing written. */
export type VoiceRefusedEntry = {
  id: string;
  kind: VoiceActionKind;
  /** `voice.kind_not_allowed`. */
  reason: string;
};

export type VoiceApplyResult = {
  applied: VoiceAppliedEntry[];
  skipped: { id: string; reason: string }[];
  /** Only present when Apply was given an allowed set (never for Review). */
  refused?: VoiceRefusedEntry[];
};

/** A unit only goes with a quantity; a bare number counts pieces. */
export const amountOf = (draft: {
  quantity: number | null;
  unit: VoiceUnit | null;
}): { quantity: number | null; unit: VoiceUnit | null } =>
  draft.quantity === null
    ? { quantity: null, unit: null }
    : { quantity: draft.quantity, unit: draft.unit ?? 'pcs' };

type Subject = { ingredientId: string | null; name: string | null };

/** A Voice Action needs a Match or an Unmatched name to be about anything. */
export const hasSubject = (draft: Subject): boolean =>
  draft.ingredientId !== null || draft.name !== null;

/**
 * The one rule for "the same thing" on either list: the Match's Ingredient, or
 * an Unmatched entry with the same normalised name.
 */
export function sameSubject(
  draft: Subject,
): (item: { ingredientId: string | null; name: string }) => boolean {
  if (draft.ingredientId !== null) {
    return (item) => item.ingredientId === draft.ingredientId;
  }
  if (draft.name === null) return () => false;
  const wanted = normalizeName(draft.name);
  return (item) =>
    item.ingredientId === null && normalizeName(item.name) === wanted;
}

/** The draft's subject as a service payload: `{ ingredientId }` or the name under `nameKey`. */
export const subjectOf = <K extends string>(
  draft: Subject,
  nameKey: K,
): { ingredientId: string } | { [key in K]: string } =>
  draft.ingredientId === null
    ? ({ [nameKey]: draft.name ?? '' } as { [key in K]: string })
    : { ingredientId: draft.ingredientId };
