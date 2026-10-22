import { z } from 'zod';
import type { ResolvedVoiceAction } from './voice-actions';
import type { PantryAnswer } from './pantry-answers';
import {
  CATALOG_LOCALES,
  FALLBACK_LOCALE,
  SCAN_LANGUAGES,
} from '../catalog/catalog.schemas';

/** A Voice Note lasts at most this long; the app stops itself here. */
export const MAX_VOICE_NOTE_SECONDS = 60;
/** The app's timer and the recorder's stop never agree to the millisecond, so allow a second. */
export const MAX_VOICE_NOTE_MS = (MAX_VOICE_NOTE_SECONDS + 1) * 1000;
/** 60 seconds of webm/opus is ~250 KB and of mp4/aac ~1 MB; this leaves room for a better codec. */
export const MAX_VOICE_AUDIO_BYTES = 2 * 1024 * 1024;

/** The list the page the Member recorded on targets (ADR 0017). */
export const VOICE_LISTS = ['shopping', 'pantry'] as const;

/** What a page sends as its Default List: a list, or `none` where the page has no list (ADR 0021). */
export const VOICE_DEFAULT_TARGETS = [...VOICE_LISTS, 'none'] as const;

/** The text fields of a Voice Note request; the recording travels beside them. */
export const voiceNoteFields = z
  .object({
    locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
    scanLanguage: z.enum(SCAN_LANGUAGES).optional(),
    defaultTarget: z.enum(VOICE_DEFAULT_TARGETS),
    /** The Member's local date, for resolving spoken dates. */
    today: z.iso.date(),
    durationMs: z.coerce.number().int().min(0),
  })
  .transform((fields) => ({
    ...fields,
    scanLanguage: fields.scanLanguage ?? fields.locale,
  }));
export type VoiceNoteFields = z.infer<typeof voiceNoteFields>;

export type VoiceNoteResponse = {
  /** What was said, as text. */
  transcript: string;
  /** The Voice Actions read from it, each resolved against the current lists; nothing is written. */
  actions: ResolvedVoiceAction[];
  /** The answers to the Pantry Questions in it (ADR 0020); read-only, nothing to apply. */
  answers: PantryAnswer[];
};

/** The container types a browser's MediaRecorder produces (Chromium webm, Safari mp4, Firefox ogg). */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
] as const;

/** The file extension each supported container is saved or sent under. */
export const AUDIO_EXTENSIONS: Record<
  (typeof SUPPORTED_AUDIO_TYPES)[number],
  string
> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
};

/** The container type of an audio file name's extension (`.m4a` is mp4), or undefined. */
export function audioTypeOfExtension(extension: string): string | undefined {
  const bare = extension.replace(/^\./, '').toLowerCase();
  if (bare === 'm4a') return 'audio/mp4';
  return SUPPORTED_AUDIO_TYPES.find((type) => AUDIO_EXTENSIONS[type] === bare);
}

/** `audio/webm;codecs=opus` -> `audio/webm`, or undefined when we cannot read it. */
export function supportedAudioType(mimeType: string): string | undefined {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  return (SUPPORTED_AUDIO_TYPES as readonly string[]).includes(base)
    ? base
    : undefined;
}
