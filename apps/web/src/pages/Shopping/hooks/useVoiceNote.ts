import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { ApiError } from '../../../lib/api';
import {
  MicrophoneError,
  startRecording,
  type MicrophoneSession,
  type Recording,
} from '../../../lib/microphone';
import { localIso } from '../../../lib/pantry';
import {
  MAX_VOICE_NOTE_MS,
  micExplained,
  MIN_VOICE_NOTE_MS,
  NOT_RETRYABLE,
  rememberMicExplained,
  sendVoiceNote,
  type VoiceList,
} from '../../../lib/voice';
import { useScanLanguage } from '../../Scan/hooks/useScanLanguage';

export type VoiceNotice =
  | { kind: 'denied' }
  | { kind: 'unavailable' }
  | { kind: 'tooShort' }
  | { kind: 'nothingHeard' }
  | { kind: 'failed'; message: string; canRetry: boolean };

/**
 * Hold-to-talk Voice Note: `press` starts recording, `release` stops and sends,
 * `cancel` (dragging off) throws the recording away, and 60 seconds stops and
 * sends by itself. A recording that fails to send stays in memory for `retry`
 * until the page reloads.
 */
export function useVoiceNote(defaultList: VoiceList) {
  const { t } = useTranslation(['errors']);
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<VoiceNotice | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const session = useRef<MicrophoneSession | null>(null);
  // The pointer is still down: a release before the microphone is ready cancels the start.
  const held = useRef(false);
  const starting = useRef(false);
  const pending = useRef<Recording | null>(null);
  const timers = useRef<{
    tick?: ReturnType<typeof setInterval>;
    limit?: ReturnType<typeof setTimeout>;
  }>({});
  const options = useRef({ locale, scanLanguage, defaultList, t });
  options.current = { locale, scanLanguage, defaultList, t };

  const clearTimers = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.limit);
    timers.current = {};
  };

  const send = useCallback(async (audio: Recording) => {
    const { locale, scanLanguage, defaultList, t } = options.current;
    setSending(true);
    setNotice(null);
    try {
      const result = await sendVoiceNote({
        recording: audio,
        scanLanguage,
        locale,
        defaultList,
        today: localIso(new Date()),
      });
      pending.current = null;
      if (result.transcript.trim() === '') setNotice({ kind: 'nothingHeard' });
      else setTranscript(result.transcript);
    } catch (error) {
      const canRetry = !(
        error instanceof ApiError && NOT_RETRYABLE.has(error.code)
      );
      pending.current = canRetry ? audio : null;
      setNotice({
        kind: 'failed',
        message: translateApiError(t, error),
        canRetry,
      });
    } finally {
      setSending(false);
    }
  }, []);

  const finish = useCallback(async () => {
    const active = session.current;
    if (!active) return;
    session.current = null;
    clearTimers();
    setRecording(false);
    const audio = await active.stop();
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      setNotice({ kind: 'tooShort' });
      return;
    }
    pending.current = audio;
    await send(audio);
  }, [send]);

  const cancel = useCallback(() => {
    held.current = false;
    const active = session.current;
    if (!active) return;
    session.current = null;
    clearTimers();
    setRecording(false);
    active.cancel();
  }, []);

  const press = useCallback(async () => {
    if (session.current || starting.current || sending) return;
    pending.current = null;
    held.current = true;
    setNotice(null);
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
      setNotice({
        kind: error instanceof MicrophoneError ? error.reason : 'unavailable',
      });
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
    setRecording(true);
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
      setNotice({
        kind: error instanceof MicrophoneError ? error.reason : 'unavailable',
      });
    }
  }, []);

  const retry = useCallback(() => {
    if (pending.current) void send(pending.current);
  }, [send]);

  const dismiss = useCallback(() => {
    pending.current = null;
    setNotice(null);
  }, []);

  // Leaving the page drops a recording in progress.
  useEffect(
    () => () => {
      clearTimers();
      session.current?.cancel();
      session.current = null;
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
    transcript,
    explaining,
    press,
    release,
    cancel,
    allowMicrophone,
    dismissExplainer: () => setExplaining(false),
    retry,
    dismiss,
    closeTranscript: () => setTranscript(null),
  };
}
