import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Recording } from './microphone';
import type { Locale, ScanLanguage } from '../i18n/resources';

/** A Voice Note lasts at most this long; the recording stops and sends itself here. */
export const MAX_VOICE_NOTE_MS = 60_000;
/** Shorter than this is an accidental tap, not a Voice Note. */
export const MIN_VOICE_NOTE_MS = 400;

/** The list the page a Voice Note is recorded on acts on (ADR 0017). */
export type VoiceList = 'shopping' | 'pantry';

export type VoiceNoteResult = {
  /** What was said. Empty when nothing was heard. */
  transcript: string;
};

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
  defaultList: VoiceList;
  /** The Member's local date, `YYYY-MM-DD`. */
  today: string;
};

export function sendVoiceNote({
  recording,
  scanLanguage,
  locale,
  defaultList,
  today,
}: VoiceNoteRequest): Promise<VoiceNoteResult> {
  const form = new FormData();
  form.append('scanLanguage', scanLanguage);
  form.append('locale', locale);
  form.append('defaultList', defaultList);
  form.append('today', today);
  form.append('durationMs', String(Math.round(recording.durationMs)));
  const extension = recording.mimeType.includes('mp4') ? 'mp4' : 'webm';
  form.append('audio', recording.blob, `voice-note.${extension}`);
  return apiRequest<VoiceNoteResult>('/voice/notes', {
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
]);
