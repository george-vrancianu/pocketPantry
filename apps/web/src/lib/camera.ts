import { useCallback, useEffect, useRef, useState } from 'react';

/** Ask for 1080p where the device can, in every Scan Mode so the dial never restarts the stream: a receipt's small print is unreadable at the 640x480 browsers often default to. */
export const HIGH_RESOLUTION_VIDEO = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

export function cameraConstraints(): MediaStreamConstraints {
  return {
    video: {
      facingMode: { ideal: 'environment' },
      // `ideal`, never `exact`: lesser cameras still start, at whatever they can do.
      ...HIGH_RESOLUTION_VIDEO,
    },
  };
}

/** Barcodes a product carries: EAN-13, EAN-8, UPC-A and UPC-E. */
export const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

type Detector = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};
type NativeDetector = {
  new (options: { formats: string[] }): Detector;
  getSupportedFormats(): Promise<string[]>;
};

let detector: Promise<Detector> | null = null;

/** The browser's detector where it reads all four formats; otherwise the ZXing WASM one, loaded on first use. */
function loadDetector(): Promise<Detector> {
  detector ??= (async () => {
    const native = (window as { BarcodeDetector?: NativeDetector })
      .BarcodeDetector;
    try {
      const supported = (await native?.getSupportedFormats()) ?? [];
      if (native && BARCODE_FORMATS.every((f) => supported.includes(f))) {
        return new native({ formats: BARCODE_FORMATS });
      }
    } catch {
      // Fall through to the ponyfill.
    }
    const { createZXingDetector } = await import('./barcodeDecoder');
    return createZXingDetector(BARCODE_FORMATS);
  })();
  // A failed load (offline) must not stick: the next try starts again.
  detector.catch(() => (detector = null));
  return detector;
}

/** The first product barcode in the current video frame (8, 12 or 13 digits), or null. */
export async function readBarcode(
  video: HTMLVideoElement,
): Promise<string | null> {
  const found = await (await loadDetector()).detect(video);
  return (
    found.find((code) => /^(?:\d{8}|\d{12}|\d{13})$/.test(code.rawValue))
      ?.rawValue ?? null
  );
}

const SCAN_INTERVAL_MS = 250;

export type CameraStatus = 'starting' | 'ready' | 'unavailable';

type TorchConstraints = MediaTrackConstraints & {
  advanced?: Array<{ torch?: boolean }>;
};

/**
 * The rear camera as a live preview. `unavailable` covers no camera, a denied
 * permission, and a non-secure page; the Scan screen then leans on the gallery.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('starting');
  // Many devices (and every desktop webcam) have no torch: the flash toggle must say so.
  const [torchSupported, setTorchSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('starting');
    // The new stream's torch starts off and its support is not known yet.
    setTorchSupported(false);
    const devices = navigator.mediaDevices as MediaDevices | undefined;
    if (!devices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }
    devices
      .getUserMedia(cameraConstraints())
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        // `torch` is not in the DOM typings; `getCapabilities` itself is missing in some browsers.
        const capabilities = stream.getVideoTracks()[0]?.getCapabilities?.() as
          { torch?: boolean } | undefined;
        setTorchSupported(capabilities?.torch === true);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  /** The current preview frame as an image, or null when there is no live camera. */
  const capture = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  }, []);

  /** Switches the torch where the device supports it; resolves to whether it did. */
  const setTorch = useCallback(async (on: boolean): Promise<boolean> => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return false;
    try {
      await track.applyConstraints({
        advanced: [{ torch: on }],
      } as TorchConstraints);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Reads barcodes from the live preview until the first one, which goes to `onCode`. Returns a
   * function that stops the watch. Starting it is what first loads a ZXing decoder.
   */
  const watchBarcodes = useCallback((onCode: (code: string) => void) => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      const video = videoRef.current;
      try {
        const code =
          video && video.readyState >= 2 ? await readBarcode(video) : null;
        if (stopped) return;
        if (code) {
          stopped = true;
          onCode(code);
          return;
        }
      } catch {
        // A frame that cannot be read, or a decoder that has not loaded yet: try the next one.
      }
      if (!stopped) timer = setTimeout(() => void tick(), SCAN_INTERVAL_MS);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  return { videoRef, status, torchSupported, capture, setTorch, watchBarcodes };
}
