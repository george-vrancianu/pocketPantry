// Voice Note replay cases: the input a Voice Note read needs, and the Voice Actions
// it should produce. See README.md next to this file.
import { z } from 'zod';
import {
  CATALOG_LOCALES,
  SCAN_LANGUAGES,
  type CatalogLocale,
} from '../../catalog/catalog.schemas';
import {
  amountOf,
  VOICE_OPS,
  type VoiceReadModelResult,
} from '../../voice/voice-actions';
import { VOICE_DEFAULT_TARGETS, VOICE_LISTS } from '../../voice/voice.schemas';
import {
  exactIngredient,
  nameIn,
  type VoiceCatalog,
  type VoiceCatalogIngredient,
} from './voice-catalog';
import { ingredientUnit, storageLocation } from '../../database/schema';

/** What a case exercises; the seed set must cover each one in every Scan Language. */
export const CASE_TAGS = [
  'basic',
  'filler',
  'correction',
  'units',
  'relative-date',
  'unsupported',
  'mixed-lists',
  'sound-alike',
] as const;
export type CaseTag = (typeof CASE_TAGS)[number];

/** A fixed Wednesday, so "next Friday" and "in two weeks" have one right answer. */
export const DEFAULT_TODAY = '2026-10-14';

const unit = z.enum(ingredientUnit.enumValues);

/** One Voice Action as the case writes it down: the fields that matter. */
export const expectedActionSchema = z
  .object({
    target: z.enum(VOICE_LISTS),
    op: z.enum(VOICE_OPS),
    /** The Ingredient as Review shows it: the Catalog name in the case's locale, or the generic name when Unmatched. Several names = any is right. */
    ingredient: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    /** Unspoken = no amount. A quantity needs its unit. */
    quantity: z.number().positive().nullable().default(null),
    unit: unit.nullable().default(null),
    expiresOn: z.iso.date().nullable().default(null),
    noExpiry: z.boolean().default(false),
    /** Checked only when written down. */
    scope: z.enum(['one', 'all']).nullable().optional(),
    location: z.enum(storageLocation.enumValues).nullable().optional(),
  })
  .refine((a) => a.quantity === null || a.unit !== null || a.op === 'check', {
    message: 'a quantity needs a unit',
    path: ['unit'],
  });
export type ExpectedAction = z.infer<typeof expectedActionSchema>;

export const voiceCaseSchema = z
  .object({
    id: z.string().min(1),
    /** The language the note is spoken in. */
    scanLanguage: z.enum(SCAN_LANGUAGES),
    /** The app's language; defaults to the Scan Language. */
    locale: z.enum(CATALOG_LOCALES).optional(),
    tags: z.array(z.enum(CASE_TAGS)).min(1),
    /** What was said. For a recording this is the correct transcript, typed by hand. */
    transcript: z.string().min(1),
    /** The recording, relative to the case file. Needed only to replay transcription. */
    audio: z.string().min(1).optional(),
    defaultTarget: z.enum(VOICE_DEFAULT_TARGETS).default('shopping'),
    today: z.iso.date().default(DEFAULT_TODAY),
    /** Names already on the Shopping List / in the Pantry (spelling hints for the read). */
    shoppingList: z.array(z.string()).default([]),
    pantry: z.array(z.string()).default([]),
    expected: z.object({
      actions: z.array(expectedActionSchema),
      /** How many phrases should come back as Didn't understand. */
      unsupported: z.number().int().nonnegative().default(0),
    }),
  })
  .transform((c) => ({ ...c, locale: c.locale ?? c.scanLanguage }));
export type VoiceCase = z.infer<typeof voiceCaseSchema>;

export const voiceCaseFileSchema = z.object({
  /** `synthetic`: written by hand, not a real recording. `recorded`: from a debug capture. */
  source: z.enum(['synthetic', 'recorded']),
  note: z.string().optional(),
  cases: z.array(voiceCaseSchema).min(1),
});

/** A Voice Action as the replay compares it. */
export type ActionView = {
  target: (typeof VOICE_LISTS)[number];
  op: (typeof VOICE_OPS)[number];
  ingredient: string;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  expiresOn: string | null;
  noExpiry: boolean;
  scope: 'one' | 'all' | null;
  location: (typeof storageLocation.enumValues)[number] | null;
};

/**
 * What the model read, as Review would name and fill it. Matching follows
 * `CatalogMatchService.resolve` + `keepConfident` on the seed Catalog: a confident proposed
 * id wins; otherwise (no id, or a doubted one) an exact name or Synonym hit on the fallback
 * name or the spoken text wins; else the action is Unmatched. Approximated: no Family
 * Catalog, and an unknown id never borrows a name another action in the batch looked up.
 */
export function normalizeActions(
  read: VoiceReadModelResult,
  catalog: VoiceCatalog,
  locale: CatalogLocale,
  threshold: number,
): ActionView[] {
  const byId = new Map(catalog.ingredients.map((i) => [i.id, i]));
  return read.actions.map((action) => {
    const proposed = action.matchedIngredientId
      ? byId.get(action.matchedIngredientId)
      : undefined;
    const doubted =
      action.matchedIngredientId !== null && action.matchConfidence < threshold;
    let matched: VoiceCatalogIngredient | null = null;
    if (proposed && !doubted) matched = proposed;
    else if (!action.matchedIngredientId || doubted) {
      matched = exactIngredient(catalog, [
        action.fallbackIngredientName,
        action.spokenText,
      ]);
    }
    // As VoiceService.draftOf: check and setQuantity keep an unspoken unit empty.
    const amount =
      action.op === 'setQuantity' || action.op === 'check'
        ? {
            quantity: action.quantity,
            unit: action.quantity === null ? null : action.unit,
          }
        : amountOf(action);
    return {
      target: action.target,
      op: action.op,
      ingredient: matched
        ? nameIn(matched, locale)
        : action.fallbackIngredientName,
      ...amount,
      expiresOn: action.noExpiry ? null : action.expiresOn,
      noExpiry: action.noExpiry,
      scope: action.scope,
      location: action.location,
    };
  });
}

export type FieldDiff = { field: string; expected: unknown; actual: unknown };
export type ActionComparison = {
  passed: boolean;
  /** Expected actions the model read exactly. */
  matched: number;
  /** Expected actions paired with a read action that differs. */
  mismatched: {
    expected: ExpectedAction;
    actual: ActionView;
    diffs: FieldDiff[];
  }[];
  /** Expected actions the model did not read. */
  missing: ExpectedAction[];
  /** Read actions nobody asked for. */
  extra: ActionView[];
  unsupported: { expected: number; actual: number };
};

const lower = (value: string) => value.trim().toLowerCase();
const namesOf = (e: ExpectedAction) =>
  (Array.isArray(e.ingredient) ? e.ingredient : [e.ingredient]).map(lower);
const sameIngredient = (e: ExpectedAction, a: ActionView) =>
  namesOf(e).includes(lower(a.ingredient));

function diffsOf(e: ExpectedAction, a: ActionView): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const check = (field: keyof ActionView, want: unknown) => {
    if (a[field] !== want)
      diffs.push({ field, expected: want, actual: a[field] });
  };
  check('target', e.target);
  check('op', e.op);
  check('quantity', e.quantity);
  check('unit', e.quantity === null ? null : e.unit);
  check('expiresOn', e.expiresOn);
  check('noExpiry', e.noExpiry);
  if (e.scope !== undefined) check('scope', e.scope);
  if (e.location !== undefined) check('location', e.location);
  return diffs;
}

/**
 * Pairs each expected action with a read one: first by target, op and Ingredient,
 * then by Ingredient alone (so a wrong op reads as a mismatch, not as a miss and an extra).
 */
export function compareActions(
  expected: { actions: ExpectedAction[]; unsupported: number },
  read: { actions: ActionView[]; unsupported: string[] },
): ActionComparison {
  const used = new Set<number>();
  const pairs = new Map<number, number>();
  const pair = (loose: boolean) => {
    expected.actions.forEach((e, i) => {
      if (pairs.has(i)) return;
      const j = read.actions.findIndex(
        (a, index) =>
          !used.has(index) &&
          sameIngredient(e, a) &&
          (loose || (a.target === e.target && a.op === e.op)),
      );
      if (j >= 0) {
        used.add(j);
        pairs.set(i, j);
      }
    });
  };
  pair(false);
  pair(true);

  let matched = 0;
  const mismatched: ActionComparison['mismatched'] = [];
  const missing: ExpectedAction[] = [];
  expected.actions.forEach((e, i) => {
    const j = pairs.get(i);
    // push() returns a number; void discards it so the early return yields undefined.
    if (j === undefined) return void missing.push(e);
    const diffs = diffsOf(e, read.actions[j]);
    if (diffs.length)
      mismatched.push({ expected: e, actual: read.actions[j], diffs });
    else matched++;
  });
  const extra = read.actions.filter((_, index) => !used.has(index));
  const unsupported = {
    expected: expected.unsupported,
    actual: read.unsupported.length,
  };
  return {
    passed:
      matched === expected.actions.length &&
      !extra.length &&
      unsupported.expected === unsupported.actual,
    matched,
    mismatched,
    missing,
    extra,
    unsupported,
  };
}

export type TranscriptComparison = {
  exact: boolean;
  wordErrors: number;
  /** Words in the expected transcript. */
  words: number;
  /** Word error rate: errors / expected words. */
  wer: number;
};

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** Word-level edit distance between the expected and the replayed transcript. */
export function compareTranscripts(
  expected: string,
  actual: string,
): TranscriptComparison {
  const a = words(expected);
  const b = words(actual);
  let row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        row[j] + 1,
        next[j - 1] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    row = next;
  }
  const wordErrors = row[b.length];
  return {
    exact: wordErrors === 0,
    wordErrors,
    words: a.length,
    wer: a.length ? wordErrors / a.length : wordErrors > 0 ? 1 : 0,
  };
}
