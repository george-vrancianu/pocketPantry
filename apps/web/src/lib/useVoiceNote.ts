import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../i18n/translateApiError';
import { ApiError } from './api';
import {
  MicrophoneError,
  startRecording,
  type MicrophoneSession,
  type Recording,
} from './microphone';
import { localIso } from './pantry';
import { toastBottom } from '../components/voice/placement';
import { haptic } from './haptic';
import { keepScreenAwake } from './wakeLock';
import {
  MAX_VOICE_NOTE_MS,
  MIN_VOICE_NOTE_MS,
  QUICK_TAP_MS,
  sendVoiceNote,
  type VoiceList,
} from './voice';
import type { ScanLanguage } from '../i18n/resources';
import {
  getVoiceNoteState,
  isVoiceCapReached,
  voiceNote,
  useVoiceNoteState,
} from './voiceNoteStore';
import { useMicPermission } from './useMicPermission';
import { micExplained } from './micExplained';
import { useScanLanguage } from '../pages/Scan/hooks/useScanLanguage';

/** Cancel aborts this request; module-level so the pill on either page can reach it. */
let reading: AbortController | undefined;

/** The pill for a note nothing came of closes itself after this long. */
export const NOTHING_HEARD_MS = 3600;

/**
 * Hold-to-talk Voice Note: `press` starts recording, `release` stops and sends,
 * `cancel` (sliding off, Escape) throws the recording away, and 60 seconds stops and
 * sends by itself. A recording that fails to send stays in memory for `retry`
 * until the page reloads.
 */
export function useVoiceNote(defaultTarget: VoiceList) {
  const { t } = useTranslation(['errors', 'voice']);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const [elapsedMs, setElapsedMs] = useState(0);
  // The Voice Note itself lives in the shared store, so Review and the button on any page see it.
  const {
    phase,
    recording: keptRecording,
    proposal,
    voiceCap,
  } = useVoiceNoteState();
  const recording = phase === 'recording';
  const sending = phase === 'reading';
  const note = proposal ?? null;
  // The Voice Cap lifts by itself at `resetsAt`: render again then (the store alone would not).
  const [, wake] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (!voiceCap) return;
    const wait = voiceCap.resetsAt - Date.now();
    if (wait <= 0) return;
    const id = setTimeout(wake, Math.min(wait, 2 ** 31 - 1));
    return () => clearTimeout(id);
  }, [voiceCap]);
  const capped = isVoiceCapReached();
  // A failed note is waiting for Retry or Discard.
  const kept = phase === 'failed' && keptRecording !== undefined;
  // The pointer is down and the stream is not live yet ("Starting…").
  const [pressing, setPressing] = useState(false);
  // A tip above the button: how a press works, or why this one did nothing.
  const [tip, setTip] = useState<'hold' | 'busy' | 'failed' | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressedAt = useRef(0);
  // Let go after 0.3 s but before the stream was live: say how it works once it arrives.
  const tipOnArrival = useRef(false);

  const showTip = useCallback((which: 'hold' | 'busy' | 'failed' = 'hold') => {
    setTip(which);
    clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTip(null), TIP_MS);
  }, []);

  const session = useRef<MicrophoneSession | null>(null);
  // The pointer is still down: a release before the microphone is ready cancels the start.
  const held = useRef(false);
  const starting = useRef(false);
  // The press was cancelled (not merely let go) while the permission was being read.
  const cancelled = useRef(false);
  const unmounted = useRef(false);
  // The recording was let go and is being finalised: no new note until it is read or has failed.
  const stopping = useRef(false);
  const timers = useRef<{
    tick?: ReturnType<typeof setInterval>;
    limit?: ReturnType<typeof setTimeout>;
  }>({});
  const options = useRef({ locale, scanLanguage, defaultTarget, t, toast });
  options.current = { locale, scanLanguage, defaultTarget, t, toast };
  // Keeps the screen awake from the press until the note is settled (Review, a notice, cancelled).
  const awake = useRef<(() => void) | undefined>(undefined);
  const stayAwake = () => {
    awake.current ??= keepScreenAwake();
  };
  const settle = () => {
    awake.current?.();
    awake.current = undefined;
  };
  const say = (message: string) =>
    options.current.toast.show(message, { polite: true, bottom: toastBottom });

  const mic = useMicPermission({
    onGranted: () => {
      const { t } = options.current;
      say(`${t('voice:mic.on')} · ${t('voice:mic.onHint')}`);
    },
    onUnavailable: () => voiceNote.fail('unavailable'),
  });

  const { refresh, showBlocked, showIntro } = mic;

  const clearTimers = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.limit);
    timers.current = {};
  };

  const send = useCallback(
    async (audio: Recording, scanLanguage: ScanLanguage, page: VoiceList) => {
      const { locale, t } = options.current;
      const request = new AbortController();
      reading = request;
      voiceNote.read(audio, scanLanguage, page);
      try {
        const result = await sendVoiceNote({
          recording: audio,
          scanLanguage,
          locale,
          defaultTarget: page,
          today: localIso(new Date()),
          signal: request.signal,
        });
        if (request.signal.aborted) return;
        if (result.transcript.trim() === '') {
          voiceNote.fail('nothingHeard');
        } else voiceNote.review(result);
      } catch (error) {
        // Cancelled: the pill is already gone and the late answer is ignored.
        if (request.signal.aborted) return;
        if (error instanceof ApiError) {
          if (error.code === 'voice.nothing_heard') {
            voiceNote.fail('nothingHeard');
            return;
          }
          if (error.code === 'voice.cap_reached') {
            voiceNote.setCap({
              cap: Number(error.params.cap) || 0,
              resetsAt:
                typeof error.params.resetsAt === 'string'
                  ? error.params.resetsAt
                  : undefined,
            });
            voiceNote.fail('capReached');
            return;
          }
          if (error.code === 'voice.too_long') {
            voiceNote.fail('tooLong');
            return;
          }
          if (error.code === 'voice.unsupported_audio') {
            console.error('Voice Note format not supported', audio.mimeType);
            voiceNote.fail('unsupported');
            return;
          }
          if (error.code === 'voice.not_configured') {
            // Voice went away on the server: hide the button and drop the note without a word.
            voiceNote.dismiss();
            queryClient.setQueryData(['voice', 'config'], {
              configured: false,
            });
            return;
          }
        }
        // No signal and a provider that is down share the pill's own wording; anything else says what it was.
        const offline =
          error instanceof ApiError &&
          (error.code === 'network_error' ||
            error.code === 'voice.provider_unavailable');
        voiceNote.fail('failed', {
          message: offline ? undefined : translateApiError(t, error),
          keepRecording: true,
        });
      } finally {
        if (reading === request) reading = undefined;
        // A cancelled send must not release the wake lock of a newer press.
        if (!request.signal.aborted) settle();
      }
    },
    [queryClient],
  );

  const finish = useCallback(async () => {
    const active = session.current;
    if (!active) return;
    session.current = null;
    clearTimers();
    // Not recording any more, even while the audio is finalised.
    voiceNote.cancelRecording();
    stopping.current = true;
    let audio: Recording;
    try {
      audio = await active.stop();
    } catch {
      settle();
      voiceNote.fail('unavailable');
      return;
    } finally {
      stopping.current = false;
    }
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      // Too little audio to read (a slow microphone): the same tip as a quick tap.
      settle();
      showTip();
      return;
    }
    await send(
      audio,
      options.current.scanLanguage,
      options.current.defaultTarget,
    );
  }, [send, showTip]);

  /** Throw the recording away without a word (a tap too quick to be a note). */
  const discardRecording = useCallback(() => {
    held.current = false;
    tipOnArrival.current = false;
    setPressing(false);
    settle();
    const active = session.current;
    if (!active) return false;
    session.current = null;
    clearTimers();
    active.cancel();
    voiceNote.cancelRecording();
    return true;
  }, []);

  /** The Member cancelled (slid off, Escape, a system gesture): discard it and say so. */
  const cancel = useCallback(() => {
    // Pressed counts even before the stream is live.
    const pressed = held.current || starting.current || !!session.current;
    cancelled.current = true;
    discardRecording();
    if (pressed) say(options.current.t('voice:listening.cancelled'));
  }, [discardRecording]);

  const press = useCallback(async () => {
    if (session.current || starting.current || stopping.current) return;
    // Nothing starts while the last note is being read, waits for Retry, or the Voice Cap is used up.
    if (sending) return showTip('busy');
    if (kept) return showTip('failed');
    if (capped) return voiceNote.fail('capReached');
    held.current = true;
    cancelled.current = false;
    pressedAt.current = Date.now();
    tipOnArrival.current = false;
    clearTimeout(tipTimer.current);
    setTip(null);
    voiceNote.dismiss();
    starting.current = true;
    // The microphone sheets stand in for the hold until it is allowed; nothing records and the press resets.
    const permission = await refresh();
    // Cancelled (Escape, a system gesture) or the page left while asking: nothing more happens.
    if (cancelled.current || unmounted.current) {
      starting.current = false;
      return;
    }
    // iOS Safari often forgets a grant between sessions and reports `prompt` again: a device that has
    // allowed the microphone before goes straight to the hold, and the browser asks as it does.
    const needsSheet =
      permission === 'denied' || (permission === 'prompt' && !micExplained());
    if (needsSheet) {
      held.current = false;
      starting.current = false;
      if (permission === 'denied') showBlocked();
      else showIntro();
      return;
    }
    // Let go while the permission was being read: no recording to start.
    if (!held.current) {
      starting.current = false;
      if (tipOnArrival.current) {
        tipOnArrival.current = false;
        showTip();
      }
      return;
    }
    setPressing(true);
    stayAwake();
    haptic(10);
    let started: MicrophoneSession;
    try {
      started = await startRecording();
    } catch (error) {
      held.current = false;
      setPressing(false);
      settle();
      // A browser with no Permissions API only says "blocked" when a hold meets the refusal.
      if (isDenied(error)) showBlocked();
      else voiceNote.fail('unavailable');
      return;
    } finally {
      starting.current = false;
    }
    if (!held.current) {
      started.cancel();
      setPressing(false);
      settle();
      if (tipOnArrival.current) {
        tipOnArrival.current = false;
        showTip();
      }
      return;
    }
    session.current = started;
    setPressing(false);
    const startedAt = Date.now();
    setElapsedMs(0);
    voiceNote.startRecording(options.current.defaultTarget);
    timers.current.tick = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      200,
    );
    timers.current.limit = setTimeout(() => {
      held.current = false;
      haptic(14);
      const { t } = options.current;
      say(
        `${t('voice:listening.stopped')} · ${t('voice:listening.stoppedHint')}`,
      );
      void finish();
    }, MAX_VOICE_NOTE_MS);
  }, [finish, refresh, showBlocked, showIntro, sending, kept, capped, showTip]);

  const release = useCallback(() => {
    if (!held.current) return;
    if (Date.now() - pressedAt.current < QUICK_TAP_MS) {
      // Too quick to be a Voice Note: send nothing and say how it works.
      discardRecording();
      showTip();
      return;
    }
    held.current = false;
    // The stream is not live yet: nothing to send, so it ends with the tip once it arrives.
    if (starting.current) tipOnArrival.current = true;
    haptic(14);
    void finish();
  }, [finish, discardRecording, showTip]);

  /** The input loudness, 0 to 1, for the Listening card's meter. */
  const level = useCallback(() => session.current?.level() ?? 0, []);

  /** Sends the kept recording again: the same audio, in the language it was recorded in. */
  const retry = useCallback(() => {
    const { phase, recording: audio, page } = getVoiceNoteState();
    if (phase !== 'failed' || !audio) return;
    stayAwake();
    void send(
      {
        blob: audio.blob,
        mimeType: audio.mimeType,
        durationMs: audio.seconds * 1000,
      },
      audio.scanLanguage,
      page,
    );
  }, [send]);

  const dismiss = useCallback(() => {
    voiceNote.dismiss();
  }, []);

  /** Drops the kept recording (the pill's Discard). */
  const discardFailed = useCallback(() => {
    voiceNote.dismiss();
    say(options.current.t('voice:send.discarded'));
  }, []);

  /** Gives up waiting for the read. The server is not told, so the Voice Cap charge stands. */
  const cancelReading = useCallback(() => {
    reading?.abort();
    reading = undefined;
    voiceNote.dismiss();
    settle();
    say(options.current.t('voice:send.cancelled'));
  }, []);

  // Leaving the page drops a recording in progress.
  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      clearTimers();
      clearTimeout(tipTimer.current);
      settle();
      // A stream that arrives after this page is gone must not start a note.
      held.current = false;
      tipOnArrival.current = false;
      if (session.current) {
        session.current.cancel();
        session.current = null;
        voiceNote.cancelRecording();
      }
    };
  }, []);

  return {
    scanLanguage,
    setScanLanguage,
    locale,
    recording,
    elapsedMs,
    pressing,
    tip,
    level,
    sending,
    kept,
    capped,
    note,
    mic,
    press,
    release,
    cancel,
    retry,
    dismiss,
    discardFailed,
    cancelReading,
    discard: voiceNote.discard,
  };
}

const TIP_MS = 1800;

function isDenied(error: unknown) {
  return error instanceof MicrophoneError && error.reason === 'denied';
}
