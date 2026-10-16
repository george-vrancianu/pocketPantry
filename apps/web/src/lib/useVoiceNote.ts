import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  // The Voice Note itself lives in the shared store, so Review and the button on any page see it.
  const { sending, notice, note } = useVoiceNoteState();
  const setSending = voiceNote.setSending;
  const setNotice = voiceNote.setNotice;
  const [explaining, setExplaining] = useState(false);

  const session = useRef<MicrophoneSession | null>(null);
  // The pointer is still down: a release before the microphone is ready cancels the start.
  const held = useRef(false);
  const starting = useRef(false);
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
    setSending(true);
    setNotice(null);
    try {
      const result = await sendVoiceNote({
        recording: audio,
        scanLanguage,
        locale,
        defaultTarget,
        today: localIso(new Date()),
      });
      voiceNote.setPending(null);
      if (result.transcript.trim() === '') setNotice({ kind: 'nothingHeard' });
      else voiceNote.open(result, defaultTarget);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'voice.nothing_heard') {
        voiceNote.setPending(null);
        setNotice({ kind: 'nothingHeard' });
        return;
      }
      const canRetry = !(
        error instanceof ApiError && NOT_RETRYABLE.has(error.code)
      );
      voiceNote.setPending(canRetry ? audio : null);
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
    let audio: Recording;
    try {
      audio = await active.stop();
    } catch {
      setNotice({ kind: 'unavailable' });
      return;
    }
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      setNotice({ kind: 'tooShort' });
      return;
    }
    voiceNote.setPending(audio);
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
    voiceNote.setPending(null);
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
    const { pending } = getVoiceNoteState();
    if (pending) void send(pending);
  }, [send]);

  const dismiss = useCallback(() => {
    voiceNote.setPending(null);
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
