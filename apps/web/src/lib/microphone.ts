/**
 * The microphone, as a seam: page tests replace this module, because jsdom has no
 * `getUserMedia` or `MediaRecorder`. It records one Voice Note at a time.
 */

export type Recording = {
  blob: Blob;
  /** The container the browser chose, e.g. `audio/webm;codecs=opus` (Chromium) or `audio/mp4` (Safari). */
  mimeType: string;
  durationMs: number;
};

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
};

const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
  'audio/ogg;codecs=opus',
];

/** Asks for the microphone (prompting the first time) and starts recording. */
export async function startRecording(): Promise<MicrophoneSession> {
  if (
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === 'undefined'
  ) {
    throw new MicrophoneError('unavailable');
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    const name = (error as { name?: string }).name;
    throw new MicrophoneError(
      name === 'NotAllowedError' || name === 'SecurityError'
        ? 'denied'
        : 'unavailable',
    );
  }
  const release = () => stream.getTracks().forEach((track) => track.stop());
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
