import { useCallback, useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    let cancelled = false;
    const devices = navigator.mediaDevices as MediaDevices | undefined;
    if (!devices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }
    devices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
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

  return { videoRef, status, capture, setTorch };
}
