import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { Recording } from './microphone';
import type { Locale, ScanLanguage } from '../i18n/resources';

/** A Voice Note lasts at most this long; the recording stops and sends itself here. */
export const MAX_VOICE_NOTE_MS = 60_000;
/** Shorter than this is an accidental tap, not a Voice Note. */
export const MIN_VOICE_NOTE_MS = 400;

/** The list the page a Voice Note is recorded on acts on (ADR 0017). */
export type VoiceList = 'shopping' | 'pantry';

export type VoiceActionStatus =
  'ready' | 'needsBatch' | 'notFound' | 'notUnderstood';

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
  rows: {
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

export type VoiceApplyResult = {
  applied: string[];
  skipped: { id: string; reason: string }[];
};

/** Apply the Voice Actions as edited in Review. Free of the Voice Cap. */
export function applyVoiceActions(
  actions: VoiceReviewAction[],
  locale: Locale,
): Promise<VoiceApplyResult> {
  return apiRequest<VoiceApplyResult>('/voice/apply', {
    method: 'POST',
    body: {
      locale,
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
        expiresOn: a.expiresOn,
        noExpiry: a.noExpiry,
        location: a.location,
        batchId: null,
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

const EXPLAINED_KEY = 'pp.voice.micExplained';

/** Whether the "why the microphone" explanation has been shown and accepted. */
export function micExplained(): boolean {
  try {
    return window.localStorage.getItem(EXPLAINED_KEY) !== null;
  } catch {
    return false;
  }
}

export function rememberMicExplained(): void {
  try {
    window.localStorage.setItem(EXPLAINED_KEY, '1');
  } catch {
    // Not persisting just shows the explanation again.
  }
}

/** Errors a second try of the same recording cannot fix: keeping it for Retry would only mislead. */
export const NOT_RETRYABLE = new Set([
  'voice.cap_reached',
  'voice.too_long',
  'voice.unsupported_audio',
  'voice.not_configured',
  'voice.nothing_heard',
]);
