/**
 * The microphone, as a seam: page tests replace this module, because jsdom has no
 * `getUserMedia` or `MediaRecorder`. It records one Voice Note at a time.
 */

import { micExplained } from './micExplained';

export type Recording = {
  blob: Blob;
  /** The container the browser chose, e.g. `audio/webm;codecs=opus` (Chromium) or `audio/mp4` (Safari). */
  mimeType: string;
  durationMs: number;
};

/** What the browser will do when the microphone is asked for. */
export type MicrophonePermission = 'prompt' | 'granted' | 'denied';

export type MicrophoneFailure =
  /** The Member (or the browser's policy) refused the microphone. */
  | 'denied'
  /** No microphone, or this browser cannot record. */
  | 'unavailable';

export class MicrophoneError extends Error {
  constructor(readonly reason: MicrophoneFailure) {
    super(reason);
    this.name = 'MicrophoneError';
  }
}

export type MicrophoneSession = {
  /** Ends the recording and hands it back. */
  stop(): Promise<Recording>;
  /** Ends the recording and throws it away. */
  cancel(): void;
  /** The current input loudness from 0 (silence) to 1, read from an analyser on the stream. For the meter only; 0 where the browser has no analyser or once the session has ended. */
  level(): number;
};

const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
  'audio/ogg;codecs=opus',
];

/** The outcome of the last request in this page, for browsers without the Permissions API. */
let lastOutcome: 'granted' | 'denied' | null = null;

/**
 * Whether asking for the microphone would prompt, succeed or be refused. Uses the
 * Permissions API where the browser supports the `microphone` permission name;
 * elsewhere it falls back to the last request's outcome, else the stored "explained"
 * flag (explained means the Member decided, so `granted`; a real refusal surfaces on the
 * next hold and is remembered as `denied`), else `prompt`.
 */
export async function permissionState(): Promise<MicrophonePermission> {
  try {
    const status = await navigator.permissions?.query({
      name: 'microphone' as PermissionName,
    });
    if (status) return status.state;
  } catch {
    // Not supported for the microphone: use the fallback.
  }
  if (lastOutcome) return lastOutcome;
  return micExplained() ? 'granted' : 'prompt';
}

async function openStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneError('unavailable');
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    lastOutcome = 'granted';
    return stream;
  } catch (error) {
    const name = (error as { name?: string }).name;
    const denied = name === 'NotAllowedError' || name === 'SecurityError';
    if (denied) lastOutcome = 'denied';
    throw new MicrophoneError(denied ? 'denied' : 'unavailable');
  }
}

/**
 * Asks for the microphone now (the browser prompts the first time) by opening a
 * stream and stopping it at once, so the first hold never meets a prompt. Throws a
 * `MicrophoneError` when refused or unavailable.
 */
export async function requestPermission(): Promise<void> {
  const stream = await openStream();
  stream.getTracks().forEach((track) => track.stop());
}

/** An analyser on the stream, or null where the browser has none. */
function openMeter(stream: MediaStream) {
  const Context = typeof AudioContext === 'undefined' ? null : AudioContext;
  if (!Context) return null;
  try {
    const context = new Context();
    void context.resume?.();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.frequencyBinCount);
    return {
      level() {
        analyser.getByteTimeDomainData(samples);
        // Peak distance from the 128 midpoint, 0..1.
        let peak = 0;
        for (const sample of samples)
          peak = Math.max(peak, Math.abs(sample - 128));
        return Math.min(1, peak / 127);
      },
      close() {
        source.disconnect();
        void context.close();
      },
    };
  } catch {
    return null;
  }
}

/** Asks for the microphone (prompting the first time) and starts recording. */
export async function startRecording(): Promise<MicrophoneSession> {
  if (typeof MediaRecorder === 'undefined') {
    throw new MicrophoneError('unavailable');
  }
  const stream = await openStream();
  const meter = openMeter(stream);
  let metering = meter;
  const release = () => {
    stream.getTracks().forEach((track) => track.stop());
    metering?.close();
    metering = null;
  };
  const mimeType = PREFERRED_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch {
    release();
    throw new MicrophoneError('unavailable');
  }
  const chunks: Blob[] = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  const startedAt = Date.now();
  recorder.start();

  return {
    level: () => metering?.level() ?? 0,
    stop: () =>
      new Promise<Recording>((resolve, reject) => {
        const type = () => recorder.mimeType || mimeType || 'audio/webm';
        const done = () => {
          release();
          resolve({
            blob: new Blob(chunks, { type: type() }),
            mimeType: type(),
            durationMs: Date.now() - startedAt,
          });
        };
        recorder.addEventListener('stop', done);
        recorder.addEventListener('error', () => {
          release();
          reject(new MicrophoneError('unavailable'));
        });
        // Already stopped (the browser ended it): no `stop` event is coming.
        if (recorder.state === 'inactive') done();
        else recorder.stop();
      }),
    cancel: () => {
      if (recorder.state !== 'inactive') recorder.stop();
      release();
    },
  };
}

/** Calls `onChange` when the browser's microphone permission changes (the Member allows it in settings). Returns the stop function. */
export function watchPermission(
  onChange: (state: MicrophonePermission) => void,
): () => void {
  let stopped = false;
  let status: PermissionStatus | undefined;
  const handler = () => {
    if (status) onChange(status.state);
  };
  void Promise.resolve(
    navigator.permissions?.query({ name: 'microphone' as PermissionName }),
  )
    .then((found) => {
      if (stopped || !found) return;
      status = found;
      found.addEventListener('change', handler);
    })
    .catch(() => {
      // Not supported for the microphone: the button reads the permission on each press instead.
    });
  return () => {
    stopped = true;
    status?.removeEventListener('change', handler);
  };
}
