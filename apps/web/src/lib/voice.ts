import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { Recording } from './microphone';
import { localIso } from './pantry';
import type { Locale, ScanLanguage } from '../i18n/resources';

/** A Voice Note lasts at most this long; the recording stops and sends itself here. */
export const MAX_VOICE_NOTE_MS = 60_000;
/** A press shorter than this is a tap, not a Voice Note (the gesture). */
export const QUICK_TAP_MS = 300;
/** Recorded audio shorter than this is too little to read. Audio never outlasts the hold, so this equals the tap threshold. */
export const MIN_VOICE_NOTE_MS = QUICK_TAP_MS;

/** The list the page a Voice Note is recorded on acts on (ADR 0017). */
export type VoiceList = 'shopping' | 'pantry';

export type VoiceActionStatus =
  'ready' | 'needsBatch' | 'notFound' | 'notUnderstood';

export type VoiceBatchRow = {
  id: string;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  expiresOn: string | null;
  /** Removals: the amount taken from this Batch, or null when the whole Batch goes. */
  take?: number | null;
};

/** A Voice Action as the server resolved it, and as Review edits it. */
export type VoiceReviewAction = {
  id: string;
  status: VoiceActionStatus;
  /** Null for a Didn't understand entry. */
  target: VoiceList | null;
  op:
    | 'add'
    | 'remove'
    | 'check'
    | 'uncheck'
    | 'setQuantity'
    | 'runningLow'
    | null;
  /** What was said. */
  text: string;
  /** The Match; null when Unmatched. */
  ingredient: CatalogSearchResult | null;
  /** The Unmatched name; null when matched. */
  name: string | null;
  quantity: number | null;
  unit: Unit | null;
  scope: 'one' | 'all' | null;
  expiresOn: string | null;
  noExpiry: boolean;
  location: StorageLocation | null;
  /** A Batch picked in Review for a removal that needed one. Never sent by the server. */
  batchId?: string | null;
  rows: {
    /** Pantry removals and Running low: the Batches taken, or (needsBatch) the candidates to pick from. */
    batches?: VoiceBatchRow[];
    /** Pantry Running low with no Batch: Apply adds it to the Shopping List instead. */
    shoppingFallback?: boolean;
    shoppingItem?: {
      id: string;
      name: string;
      quantity: number | null;
      unit: Unit | null;
      checked: boolean;
    } | null;
  };
  defaults: { location?: StorageLocation; expiresOn?: string };
};

export type VoiceNoteResult = {
  /** What was said. */
  transcript: string;
  actions: VoiceReviewAction[];
};

/** One applied Voice Action: the list it landed on and the row it touched. */
export type VoiceAppliedEntry = {
  actionId: string;
  list: VoiceList;
  /**
   * The Shopping Item or Batch touched. A Shopping removal names the row just removed (nothing to flash);
   * a Batch removal names a surviving Batch of the Ingredient, and none when nothing is left.
   */
  rowId?: string;
  /** Already satisfied when applied; still counts as applied. */
  alreadyDone: boolean;
};

export type VoiceApplyResult = {
  applied: VoiceAppliedEntry[];
  skipped: { id: string; reason: string }[];
};

/** Apply the Voice Actions as edited in Review. Free of the Voice Cap. */
export function applyVoiceActions(
  actions: VoiceReviewAction[],
  locale: Locale,
  today: string = localIso(new Date()),
): Promise<VoiceApplyResult> {
  return apiRequest<VoiceApplyResult>('/voice/apply', {
    method: 'POST',
    body: {
      locale,
      today,
      actions: actions.map((a) => ({
        id: a.id,
        target: a.target,
        op: a.op,
        text: a.text,
        ingredientId: a.ingredient?.id ?? null,
        name: a.ingredient ? null : a.name,
        quantity: a.quantity,
        unit: a.quantity === null ? null : a.unit,
        scope: a.scope,
        // What Review showed for an unspoken Location and expiry, defaults included.
        expiresOn: a.noExpiry
          ? null
          : (a.expiresOn ?? a.defaults.expiresOn ?? null),
        noExpiry: a.noExpiry,
        location: a.location ?? a.defaults.location ?? null,
        batchId: a.batchId ?? null,
        // A resolved removal holds to the Batches Review showed.
        batchIds:
          a.op === 'remove' && !a.batchId
            ? (a.rows.batches ?? []).map((batch) => batch.id)
            : [],
      })),
    },
  });
}

/** Whether the server can transcribe (AI key and transcription model set). Voice is hidden until it says so. */
export function useVoiceConfigured(): boolean {
  const config = useQuery({
    queryKey: ['voice', 'config'],
    queryFn: () => apiRequest<{ configured: boolean }>('/voice/config'),
    staleTime: 5 * 60_000,
  });
  return config.data?.configured === true;
}

export type VoiceNoteRequest = {
  recording: Recording;
  scanLanguage: ScanLanguage;
  locale: Locale;
  defaultTarget: VoiceList;
  /** The Member's local date, `YYYY-MM-DD`. */
  today: string;
};

export function sendVoiceNote({
  recording,
  scanLanguage,
  locale,
  defaultTarget,
  today,
}: VoiceNoteRequest): Promise<VoiceNoteResult> {
  const form = new FormData();
  form.append('scanLanguage', scanLanguage);
  form.append('locale', locale);
  form.append('defaultTarget', defaultTarget);
  form.append('today', today);
  form.append('durationMs', String(Math.round(recording.durationMs)));
  const extension = /mp4/.test(recording.mimeType)
    ? 'mp4'
    : /ogg/.test(recording.mimeType)
      ? 'ogg'
      : 'webm';
  form.append('audio', recording.blob, `voice-note.${extension}`);
  return apiRequest<VoiceNoteResult>('/voice', {
    method: 'POST',
    body: form,
  });
}

export { micExplained, rememberMicExplained } from './micExplained';

/** Errors a second try of the same recording cannot fix: keeping it for Retry would only mislead. */
export const NOT_RETRYABLE = new Set([
  'voice.cap_reached',
  'voice.too_long',
  'voice.unsupported_audio',
  'voice.not_configured',
  'voice.nothing_heard',
]);
