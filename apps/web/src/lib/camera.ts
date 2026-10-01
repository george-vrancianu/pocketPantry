import { useCallback, useEffect, useRef, useState } from 'react';

/** Ask for 1080p where the device can: a receipt's small print is unreadable at the 640x480 browsers often default to. */
export const HIGH_RESOLUTION_VIDEO = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

export function cameraConstraints(
  highResolution: boolean,
): MediaStreamConstraints {
  return {
    video: {
      facingMode: { ideal: 'environment' },
      // `ideal`, never `exact`: lesser cameras still start, at whatever they can do.
      ...(highResolution && HIGH_RESOLUTION_VIDEO),
    },
  };
}

export type CameraStatus = 'starting' | 'ready' | 'unavailable';

type TorchConstraints = MediaTrackConstraints & {
  advanced?: Array<{ torch?: boolean }>;
};

/**
 * The rear camera as a live preview. `unavailable` covers no camera, a denied
 * permission, and a non-secure page; the Scan screen then leans on the gallery.
 */
export function useCamera(highResolution = false) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('starting');
  // Many devices (and every desktop webcam) have no torch: the flash toggle must say so.
  const [torchSupported, setTorchSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('starting');
    const devices = navigator.mediaDevices as MediaDevices | undefined;
    if (!devices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }
    devices
      .getUserMedia(cameraConstraints(highResolution))
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
  }, [highResolution]);

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

  return { videoRef, status, torchSupported, capture, setTorch };
}
