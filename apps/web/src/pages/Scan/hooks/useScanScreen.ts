import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCamera } from '../../../lib/camera';
import {
  clearReadFailure,
  readScans,
  useReadFailure,
} from '../../../lib/scanReads';
import {
  MAX_SESSION_SCANS,
  dispatchScanSession,
  getScanSession,
  pendingCount,
  resetScanSession,
  useScanSession,
} from '../../../lib/scanSession';
import { resizeImage } from '../../../lib/image';
import { IMAGE_PREPARATION, type ImageOrigin } from '../../../lib/scanImage';
import { useScanLanguage } from './useScanLanguage';
import {
  isScanMode,
  loadScanMode,
  saveScanMode,
  type ScanMode,
} from '../../../lib/scan';

/** Scan screen state: mode, camera, flash, and the photo-to-Review flow. */
export function useScanScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const requested = params.get('mode');
  const mode: ScanMode = isScanMode(requested) ? requested : loadScanMode();
  // Plain `/scan` (the Dock) comes back to whatever was used last, including a `?mode=` link.
  useEffect(() => saveScanMode(mode), [mode]);

  const camera = useCamera(mode === 'receipt');
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const previousMode = useRef(mode);
  /**
   * Bumped whenever what a photo being prepared was meant for goes away (mode change, batch
   * reset, leaving the screen): a photo prepared under an older value is dropped, not sent.
   */
  const scanEpoch = useRef(0);
  useEffect(
    () => () => {
      scanEpoch.current += 1;
    },
    [],
  );
  // The mode can also change through the URL (the Dock's Scan item links to plain `/scan`),
  // bypassing `setMode`: a photo being prepared is dropped.
  useEffect(() => {
    if (previousMode.current !== mode) {
      scanEpoch.current += 1;
    }
    previousMode.current = mode;
  }, [mode]);
  const [flash, setFlash] = useState(false);
  // A restarted stream (e.g. switching into or out of Receipt mode) has its torch off.
  useEffect(() => {
    if (camera.status !== 'ready') setFlash(false);
  }, [camera.status]);
  const [resizing, setResizing] = useState(false);
  // Problems found on this screen itself (bad image, nothing recognised), as `errors` keys.
  const [localError, setLocalError] = useState<string | null>(null);
  // A Scan of the Scan Session that could not be read; the Scan is dropped.
  const readError = useReadFailure();
  const session = useScanSession();
  // A short message at the bottom of the screen: the Scan Session is full, or a Scan Session was just saved.
  const [toast, setToast] = useState<{
    text: string;
    severity: 'success' | 'warning';
  } | null>(() => {
    const state = location.state as {
      added?: number;
      discarded?: boolean;
    } | null;
    if (state?.added)
      return {
        text: t('scan:added', { count: state.added }),
        severity: 'success',
      };
    if (state?.discarded)
      return { text: t('scan:discarded'), severity: 'success' };
    return null;
  });
  useEffect(() => {
    if (location.state === null) return;
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location, navigate]);
  const fileInput = useRef<HTMLInputElement>(null);
  /** Whether a Scan was taken yet, failed or not: the guide's hint goes away after the first. */
  const [scanned, setScanned] = useState(false);

  const reading = resizing;

  /** A camera frame or gallery file: prepare it, then join the Scan Session. */
  const scanImage = async (
    source: Blob,
    origin: ImageOrigin,
    prepare: () => Promise<string> = () => {
      const feed = camera.videoRef.current;
      const view = {
        width: feed?.clientWidth || window.innerWidth,
        height: feed?.clientHeight || window.innerHeight,
      };
      return IMAGE_PREPARATION[mode](source, origin, view);
    },
  ): Promise<boolean> => {
    setScanned(true);
    setLocalError(null);
    clearReadFailure();
    setResizing(true);
    const epoch = scanEpoch.current;
    let image: string;
    try {
      image = await prepare();
    } catch {
      if (epoch === scanEpoch.current) setLocalError('scan.image_invalid');
      return false;
    } finally {
      setResizing(false);
    }
    if (epoch !== scanEpoch.current) return false;
    // A camera Scan joins the Scan Session at once; its read goes on in the background.
    if (origin === 'camera') {
      if (getScanSession().scans.length >= MAX_SESSION_SCANS) {
        setToast({
          text: t('scan:limit', { max: MAX_SESSION_SCANS }),
          severity: 'warning',
        });
        return false;
      }
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          id: crypto.randomUUID(),
          mode,
          scanLanguage: mode === 'plate' ? undefined : scanLanguage,
          image,
          thumbnail: image,
        },
      });
      readScans(i18n.language);
    }
    return false;
  };

  // A double tap on the guide must not send the same photo twice.
  const shooting = useRef(false);
  const shoot = async () => {
    if (shooting.current) return;
    shooting.current = true;
    try {
      const frame = await camera.capture();
      if (frame) await scanImage(frame, 'camera');
    } finally {
      shooting.current = false;
    }
  };

  const resizingPicks = useRef(0);
  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length === 0) return;
    setScanned(true);
    setLocalError(null);
    clearReadFailure();
    // Take what fits under the Scan Session's cap, counting photos still being resized.
    const room = Math.max(
      0,
      MAX_SESSION_SCANS - getScanSession().scans.length - resizingPicks.current,
    );
    if (picked.length > room) {
      setToast({
        text: t('scan:limit', { max: MAX_SESSION_SCANS }),
        severity: 'warning',
      });
    }
    const base = {
      mode,
      scanLanguage: mode === 'plate' ? undefined : scanLanguage,
    };
    for (const file of picked.slice(0, room)) {
      const id = crypto.randomUUID();
      if (mode === 'receipt') {
        // Cropped from its card in Review, then read.
        dispatchScanSession({
          type: 'enqueue',
          scan: {
            ...base,
            id,
            image: '',
            thumbnail: URL.createObjectURL(file),
            source: file,
          },
        });
        continue;
      }
      resizingPicks.current += 1;
      void resizeImage(file)
        .then(
          (image) => {
            dispatchScanSession({
              type: 'enqueue',
              scan: { ...base, id, image, thumbnail: image },
            });
            readScans(i18n.language);
          },
          () => setLocalError('scan.image_invalid'),
        )
        .finally(() => {
          resizingPicks.current -= 1;
        });
    }
  };

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const scanError = readError;
  const error = localError
    ? t(`errors:${localError}`)
    : scanError
      ? translateApiError(t, scanError)
      : null;

  return {
    mode,
    uiLocale: locale,
    scanLanguage,
    setScanLanguage,
    /** Plate Scan has no Scan Language. */
    scanLanguageShown: mode !== 'plate',
    scanLanguageLocked: reading,
    camera,
    scans: session.scans,
    pending: pendingCount(session),
    done: () => navigate('/scan/review'),
    flash,
    reading,
    scanned,
    modesDisabled: resizing,
    controlsDisabled: reading,
    fileInput,
    error,
    setMode: (next: ScanMode) => {
      scanEpoch.current += 1;
      setLocalError(null);
      setParams({ mode: next }, { replace: true });
    },
    toast,
    clearToast: () => setToast(null),
    shoot,
    pickFile,
    openGallery: () => fileInput.current?.click(),
    toggleFlash,
    // Back to wherever the Member came from, or home when this was the first page.
    close: () => {
      const taken = session.scans.length;
      if (taken > 0) {
        if (!window.confirm(t('scan:discardScans', { count: taken }))) return;
        resetScanSession();
      }
      if (location.key === 'default') navigate('/');
      else navigate(-1);
    },
    // Handoff section 7: the Pantry's add form is the manual entry.
    addManually: () => {
      navigate('/pantry?add=1');
    },
  };
}
