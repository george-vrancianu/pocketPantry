import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  MAX_VOICE_NOTE_MS,
  micExplained,
  MIN_VOICE_NOTE_MS,
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
 * `cancel` (dragging off) throws the recording away, and 60 seconds stops and
 * sends by itself. A recording that fails to send stays in memory for `retry`
 * until the page reloads.
 */
export function useVoiceNote(defaultTarget: VoiceList) {
  const { t } = useTranslation(['errors']);
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
  const options = useRef({ locale, scanLanguage, defaultTarget, t });
  options.current = { locale, scanLanguage, defaultTarget, t };

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
      stopping.current = false;
      voiceNote.fail('unavailable');
      return;
    }
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      stopping.current = false;
      voiceNote.fail('tooShort');
      return;
    }
    stopping.current = false;
    await send(audio);
  }, [send]);

  const cancel = useCallback(() => {
    held.current = false;
    const active = session.current;
    if (!active) return;
    session.current = null;
    clearTimers();
    active.cancel();
    voiceNote.cancelRecording();
  }, []);

  const press = useCallback(async () => {
    if (session.current || starting.current || stopping.current || sending)
      return;
    held.current = true;
    voiceNote.dismiss();
    if (!micExplained()) {
      held.current = false;
      setExplaining(true);
      return;
    }
    starting.current = true;
    let started: MicrophoneSession;
    try {
      started = await startRecording();
    } catch (error) {
      held.current = false;
      voiceNote.fail(failureCode(error));
      return;
    } finally {
      starting.current = false;
    }
    if (!held.current) {
      started.cancel();
      return;
    }
    session.current = started;
    const startedAt = Date.now();
    setElapsedMs(0);
    voiceNote.startRecording(options.current.defaultTarget);
    timers.current.tick = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      200,
    );
    timers.current.limit = setTimeout(() => {
      held.current = false;
      void finish();
    }, MAX_VOICE_NOTE_MS);
  }, [finish, sending]);

  const release = useCallback(() => {
    held.current = false;
    void finish();
  }, [finish]);

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

function failureCode(error: unknown): VoiceErrorCode {
  return error instanceof MicrophoneError ? error.reason : 'unavailable';
}
