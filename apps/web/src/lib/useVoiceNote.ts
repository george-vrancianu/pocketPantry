import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  micExplained,
  MIN_VOICE_NOTE_MS,
  QUICK_TAP_MS,
  NOT_RETRYABLE,
  rememberMicExplained,
  sendVoiceNote,
  type VoiceList,
} from './voice';
import {
  getVoiceNoteState,
  voiceNote,
  useVoiceNoteState,
  type VoiceErrorCode,
} from './voiceNoteStore';
import { useScanLanguage } from '../pages/Scan/hooks/useScanLanguage';

/**
 * Hold-to-talk Voice Note: `press` starts recording, `release` stops and sends,
 * `cancel` (sliding off, Escape) throws the recording away, and 60 seconds stops and
 * sends by itself. A recording that fails to send stays in memory for `retry`
 * until the page reloads.
 */
export function useVoiceNote(defaultTarget: VoiceList) {
  const { t } = useTranslation(['errors', 'voice']);
  const toast = useToast();
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const [elapsedMs, setElapsedMs] = useState(0);
  // The Voice Note itself lives in the shared store, so Review and the button on any page see it.
  const {
    phase,
    recording: kept,
    proposal,
    error,
    errorMessage,
  } = useVoiceNoteState();
  const recording = phase === 'recording';
  const sending = phase === 'reading';
  const note = proposal ?? null;
  const notice = useMemo(
    () =>
      phase === 'failed' && error
        ? error === 'failed'
          ? {
              kind: 'failed' as const,
              message: errorMessage ?? '',
              canRetry: kept !== undefined,
            }
          : { kind: error }
        : null,
    [phase, error, errorMessage, kept],
  );
  const [explaining, setExplaining] = useState(false);
  // The pointer is down and the stream is not live yet ("Starting…").
  const [pressing, setPressing] = useState(false);
  // The "Hold to talk" tip after a press too quick to be a Voice Note.
  const [tip, setTip] = useState(false);
  const tipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressedAt = useRef(0);
  // Let go after 0.3 s but before the stream was live: say how it works once it arrives.
  const tipOnArrival = useRef(false);

  const showTip = useCallback(() => {
    setTip(true);
    clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTip(false), TIP_MS);
  }, []);

  const session = useRef<MicrophoneSession | null>(null);
  // The pointer is still down: a release before the microphone is ready cancels the start.
  const held = useRef(false);
  const starting = useRef(false);
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

  const clearTimers = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.limit);
    timers.current = {};
  };

  const send = useCallback(async (audio: Recording) => {
    const { locale, scanLanguage, defaultTarget, t } = options.current;
    voiceNote.read(audio, scanLanguage, defaultTarget);
    try {
      const result = await sendVoiceNote({
        recording: audio,
        scanLanguage,
        locale,
        defaultTarget,
        today: localIso(new Date()),
      });
      if (result.transcript.trim() === '') {
        voiceNote.fail('nothingHeard');
      } else voiceNote.review(result);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'voice.nothing_heard') {
        voiceNote.fail('nothingHeard');
        return;
      }
      const canRetry = !(
        error instanceof ApiError && NOT_RETRYABLE.has(error.code)
      );
      voiceNote.fail('failed', {
        message: translateApiError(t, error),
        keepRecording: canRetry,
      });
    } finally {
      settle();
    }
  }, []);

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
    await send(audio);
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
    discardRecording();
    if (pressed) say(options.current.t('voice:listening.cancelled'));
  }, [discardRecording]);

  const press = useCallback(async () => {
    if (session.current || starting.current || stopping.current || sending)
      return;
    held.current = true;
    pressedAt.current = Date.now();
    tipOnArrival.current = false;
    clearTimeout(tipTimer.current);
    setTip(false);
    voiceNote.dismiss();
    if (!micExplained()) {
      held.current = false;
      setExplaining(true);
      return;
    }
    starting.current = true;
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
      voiceNote.fail(failureCode(error));
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
  }, [finish, sending, showTip]);

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

  /** The explanation was accepted: ask for the microphone now, so the browser's prompt does not interrupt a hold. */
  const allowMicrophone = useCallback(async () => {
    rememberMicExplained();
    setExplaining(false);
    try {
      (await startRecording()).cancel();
    } catch (error) {
      voiceNote.fail(failureCode(error));
    }
  }, []);

  const retry = useCallback(() => {
    const { recording: kept } = getVoiceNoteState();
    if (kept) {
      void send({
        blob: kept.blob,
        mimeType: kept.mimeType,
        durationMs: kept.seconds * 1000,
      });
    }
  }, [send]);

  const dismiss = useCallback(() => {
    voiceNote.dismiss();
  }, []);

  // Leaving the page drops a recording in progress.
  useEffect(
    () => () => {
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
    },
    [],
  );

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
    notice,
    note,
    explaining,
    press,
    release,
    cancel,
    allowMicrophone,
    dismissExplainer: () => setExplaining(false),
    retry,
    dismiss,
    discard: voiceNote.discard,
  };
}

const TIP_MS = 1800;

function failureCode(error: unknown): VoiceErrorCode {
  return error instanceof MicrophoneError ? error.reason : 'unavailable';
}
