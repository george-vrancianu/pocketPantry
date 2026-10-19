import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Track = { stop: ReturnType<typeof vi.fn> };

function fakeStream() {
  const track: Track = { stop: vi.fn() };
  return {
    track,
    stream: { getTracks: () => [track] } as unknown as MediaStream,
  };
}

/** A MediaRecorder that records nothing and stops on request. */
class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';
  private listeners = new Map<string, Array<(e: unknown) => void>>();
  addEventListener(type: string, fn: (e: unknown) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  start() {
    this.state = 'recording';
  }
  stop() {
    this.state = 'inactive';
    for (const fn of this.listeners.get('stop') ?? []) fn({});
  }
}

/** An analyser whose time-domain samples the test controls (128 = silence). */
function fakeAudio(samples: () => number[]) {
  const close = vi.fn(async () => undefined);
  const disconnect = vi.fn();
  class FakeAudioContext {
    createMediaStreamSource() {
      return { connect: vi.fn(), disconnect };
    }
    createAnalyser() {
      return {
        fftSize: 0,
        get frequencyBinCount() {
          return samples().length;
        },
        getByteTimeDomainData(into: Uint8Array) {
          into.set(samples());
        },
      };
    }
    close = close;
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  return { close, disconnect };
}

function stubNavigator(parts: {
  getUserMedia?: unknown;
  permissions?: unknown;
}) {
  vi.stubGlobal('navigator', {
    mediaDevices: parts.getUserMedia
      ? { getUserMedia: parts.getUserMedia }
      : undefined,
    permissions: parts.permissions,
  });
}

async function load() {
  vi.resetModules();
  return import('./microphone');
}

describe('microphone', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('permissionState', () => {
    it('reports what the Permissions API says', async () => {
      for (const state of ['prompt', 'granted', 'denied'] as const) {
        const query = vi.fn(async () => ({ state }));
        stubNavigator({ permissions: { query } });
        const { permissionState } = await load();
        expect(await permissionState()).toBe(state);
        expect(query).toHaveBeenCalledWith({ name: 'microphone' });
      }
    });

    it('falls back to prompt until the explanation was accepted', async () => {
      stubNavigator({});
      const { permissionState } = await load();
      expect(await permissionState()).toBe('prompt');
    });

    it('treats an explained device as granted until a request says otherwise', async () => {
      stubNavigator({
        permissions: {
          query: vi.fn(async () => Promise.reject(new TypeError())),
        },
        getUserMedia: vi.fn(async () => fakeStream().stream),
      });
      window.localStorage.setItem('pp.voice.micExplained', '1');
      const mic = await load();
      expect(await mic.permissionState()).toBe('granted');
    });

    it('remembers a refusal when the Permissions API is missing', async () => {
      const denied = Object.assign(new Error('no'), {
        name: 'NotAllowedError',
      });
      stubNavigator({
        getUserMedia: vi.fn(async () => Promise.reject(denied)),
      });
      window.localStorage.setItem('pp.voice.micExplained', '1');
      const mic = await load();
      await expect(mic.requestPermission()).rejects.toMatchObject({
        reason: 'denied',
      });
      expect(await mic.permissionState()).toBe('denied');
    });
  });

  describe('requestPermission', () => {
    it('opens a stream and stops it straight away', async () => {
      const { track, stream } = fakeStream();
      const getUserMedia = vi.fn(async () => stream);
      stubNavigator({ getUserMedia });
      const mic = await load();
      await mic.requestPermission();
      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(track.stop).toHaveBeenCalledTimes(1);
    });

    it('says unavailable when there is no microphone', async () => {
      stubNavigator({
        getUserMedia: vi.fn(async () =>
          Promise.reject(Object.assign(new Error(), { name: 'NotFoundError' })),
        ),
      });
      const mic = await load();
      await expect(mic.requestPermission()).rejects.toMatchObject({
        reason: 'unavailable',
      });
    });
  });

  describe('recording lifecycle and level', () => {
    it('reads a 0..1 level from the analyser while recording', async () => {
      let samples = [128, 128, 128, 128];
      const audio = fakeAudio(() => samples);
      const { track, stream } = fakeStream();
      stubNavigator({ getUserMedia: vi.fn(async () => stream) });
      const mic = await load();
      const session = await mic.startRecording();

      expect(session.level()).toBe(0);
      samples = [255, 1, 255, 1];
      const loud = session.level();
      expect(loud).toBeGreaterThan(0.9);
      expect(loud).toBeLessThanOrEqual(1);

      const recording = await session.stop();
      expect(recording.mimeType).toBe('audio/webm');
      expect(track.stop).toHaveBeenCalled();
      expect(audio.close).toHaveBeenCalled();
      expect(session.level()).toBe(0);
    });

    it('still records where there is no AudioContext, with a flat level', async () => {
      vi.stubGlobal('AudioContext', undefined);
      const { stream } = fakeStream();
      stubNavigator({ getUserMedia: vi.fn(async () => stream) });
      const mic = await load();
      const session = await mic.startRecording();
      expect(session.level()).toBe(0);
      session.cancel();
    });

    it('cancel releases the microphone and the analyser', async () => {
      const audio = fakeAudio(() => [128]);
      const { track, stream } = fakeStream();
      stubNavigator({ getUserMedia: vi.fn(async () => stream) });
      const mic = await load();
      const session = await mic.startRecording();
      session.cancel();
      expect(track.stop).toHaveBeenCalled();
      expect(audio.close).toHaveBeenCalled();
    });

    it('a recording that started proves the permission is granted', async () => {
      stubNavigator({
        getUserMedia: vi.fn(async () => fakeStream().stream),
      });
      window.localStorage.setItem('pp.voice.micExplained', '1');
      const mic = await load();
      (await mic.startRecording()).cancel();
      expect(await mic.permissionState()).toBe('granted');
    });
  });
});
