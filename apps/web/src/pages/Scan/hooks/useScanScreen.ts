import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { readBarcode, useCamera } from '../../../lib/camera';
import { decodePhotoBarcode, readScans } from '../../../lib/scanReads';
import {
  capReached,
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
  CAMERA_MODES,
  loadScanPageMode,
  saveScanPageMode,
  SCAN_INTERVAL_MS,
  type CameraMode,
} from '../../../lib/cameraMode';

/** A code identical to the last accepted one is taken again after this long without being seen. */
const BARCODE_COOLDOWN_MS = 1500;
const BARCODE_HAPTIC_MS = 12;

/** What opens the camera decides which modes it offers and which one it starts in. */
export type ScanScreenModes = {
  /** In dial order. Defaults to all five camera modes. */
  modes?: readonly CameraMode[];
  /** Used when the URL names no allowed mode and either `rememberMode` is false or the remembered mode isn't allowed. */
  defaultMode?: CameraMode;
  /** Load and save the mode used last. Defaults to true, as on the main Scan page; callers with their own mode set pass false. */
  rememberMode?: boolean;
};

/** Scan screen state: mode, camera, flash, and the photo-to-Review flow. */
export function useScanScreen(config: ScanScreenModes = {}) {
  const modes = config.modes ?? CAMERA_MODES;
  const remembersMode = config.rememberMode ?? true;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const requested = params.get('mode');
  const allowed = (value: string | null | undefined): value is CameraMode =>
    modes.some((item) => item === value);
  const { defaultMode } = config;
  const remembered = remembersMode ? loadScanPageMode() : null;
  const mode: CameraMode = allowed(requested)
    ? requested
    : allowed(remembered)
      ? remembered
      : allowed(defaultMode)
        ? defaultMode
        : modes[0];
  // Plain `/scan` (the Dock) comes back to whatever was used last, including a `?mode=` link.
  useEffect(() => {
    if (remembersMode) saveScanPageMode(mode);
  }, [mode, remembersMode]);

  const camera = useCamera();
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const previousMode = useRef(mode);
  /**
   * Bumped whenever what a photo being prepared was meant for goes away (mode change, Scan Session
   * reset, leaving the screen): a photo prepared under an older value is dropped, not sent.
   */
  const scanEpoch = useRef(0);
  /**
   * The barcode just accepted. The same code is ignored until another is accepted, the mode
   * changes, or it goes unseen for the cooldown (see `lastSeenAt`).
   */
  const lastCode = useRef<string | null>(null);
  /** When `lastCode` was last seen: every sighting of a held pack restarts its cooldown. */
  const lastSeenAt = useRef(0);
  /** Barcodes accepted since this screen opened: only a change in it is announced, never what the Session already held. */
  const [barcodesRead, setBarcodesRead] = useState(0);
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
      // Coming back to Barcode takes the pack still held in front of the camera.
      lastCode.current = null;
    }
    previousMode.current = mode;
  }, [mode]);
  /** Gallery photos still being resized: they will join the Scan Session, so they count against its limit. */
  const resizingPicks = useRef(0);
  const [flash, setFlash] = useState(false);
  const [resizing, setResizing] = useState(false);
  // Problems found on this screen itself (bad image, nothing recognised), as `errors` keys.
  const [localError, setLocalError] = useState<string | null>(null);
  /** A camera Scan that could not be prepared, so never joined the Scan Session. */
  const [notAdded, setNotAdded] = useState(false);
  const session = useScanSession();
  const capped = capReached(session);
  // A short message at the bottom of the screen: the Scan Session is full, or a Scan Session was just saved.
  const [toast, setToast] = useState<{
    text: string;
    severity: 'success' | 'warning';
  } | null>(() => {
    const state = location.state as {
      added?: number;
      notTicked?: number;
      discarded?: boolean;
    } | null;
    if (state?.added)
      return {
        text: [
          t('scan:added', { count: state.added }),
          state.notTicked
            ? t('scan:tickFailed', { count: state.notTicked })
            : '',
        ]
          .join(' ')
          .trim(),
        severity: state.notTicked ? 'warning' : 'success',
      };
    if (state?.discarded)
      return { text: t('scan:discarded'), severity: 'success' };
    return null;
  });
  const warnSessionFull = () =>
    setToast({
      text: t('scan:limit', { max: MAX_SESSION_SCANS }),
      severity: 'warning',
    });
  useEffect(() => {
    if (location.state === null) return;
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location, navigate]);
  const fileInput = useRef<HTMLInputElement>(null);

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
      // Barcode sends no photo: it never gets here.
      if (mode === 'barcode')
        return Promise.reject(new Error('Barcode has no photo to prepare'));
      return IMAGE_PREPARATION[mode](source, origin, view);
    },
  ): Promise<boolean> => {
    setLocalError(null);
    setNotAdded(false);
    setResizing(true);
    const epoch = scanEpoch.current;
    let image: string;
    try {
      image = await prepare();
    } catch {
      if (epoch === scanEpoch.current) {
        if (origin === 'camera' && mode !== 'plate') setNotAdded(true);
        else setLocalError('scan.image_invalid');
      }
      return false;
    } finally {
      setResizing(false);
    }
    if (epoch !== scanEpoch.current) return false;
    // A camera Scan joins the Scan Session at once; its read goes on in the background.
    if (origin === 'camera') {
      if (
        getScanSession().scans.length + resizingPicks.current >=
        MAX_SESSION_SCANS
      ) {
        warnSessionFull();
        return false;
      }
      const id = crypto.randomUUID();
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          id,
          mode,
          scanLanguage: mode === 'plate' ? undefined : scanLanguage,
          image,
          thumbnail: image,
        },
      });
      readScans(i18n.language);
      // The full frame, before it was resized for the read: barcodes need the resolution.
      if (mode === 'product')
        decodePhotoBarcode(id, source, (photo) => readBarcode(photo));
    }
    return false;
  };

  // A double tap on the guide must not send the same photo twice.
  const shooting = useRef(false);
  const shoot = async () => {
    if (shooting.current || capped || mode === 'barcode') return;
    shooting.current = true;
    try {
      const frame = await camera.capture();
      if (frame) await scanImage(frame, 'camera');
    } finally {
      shooting.current = false;
    }
  };

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length === 0 || mode === 'barcode') return;
    setLocalError(null);
    setNotAdded(false);
    // Take what fits under the Scan Session's cap, counting photos still being resized.
    const room = Math.max(
      0,
      MAX_SESSION_SCANS - getScanSession().scans.length - resizingPicks.current,
    );
    if (picked.length > room) {
      warnSessionFull();
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
            if (base.mode === 'product')
              decodePhotoBarcode(id, file, (photo) => readBarcode(photo));
          },
          () => setLocalError('scan.image_invalid'),
        )
        .finally(() => {
          resizingPicks.current -= 1;
        });
    }
  };

  // The Barcode dial mode reads on its own. Each accepted code adds a card at once; the watch reads one
  // code per subscription, so it is re-armed after every read.
  const acceptCode = async (code: string) => {
    // The code just accepted is ignored while it keeps being seen: it is taken again once
    // another code was accepted, or once it has gone unseen for the cooldown.
    const now = performance.now();
    const held =
      code === lastCode.current &&
      now - lastSeenAt.current < BARCODE_COOLDOWN_MS;
    lastSeenAt.current = now;
    if (held) return;
    // Remembered before the limit check, so a held pack at the limit toasts once, not every tick.
    lastCode.current = code;
    if (
      getScanSession().scans.length + resizingPicks.current >=
      MAX_SESSION_SCANS
    ) {
      warnSessionFull();
      return;
    }
    const epoch = scanEpoch.current;
    // The card's thumbnail is the frame the code was read from, frozen now.
    const frame = await camera.capture();
    const thumbnail = frame ? await resizeImage(frame).catch(() => '') : '';
    if (epoch !== scanEpoch.current) {
      lastCode.current = null;
      return;
    }
    // Another read may have filled the Scan Session while the frame was prepared.
    if (getScanSession().scans.length >= MAX_SESSION_SCANS) {
      // Nothing was added, so the pack still held up must be taken again once there is room.
      lastCode.current = null;
      warnSessionFull();
      return;
    }
    dispatchScanSession({
      type: 'enqueue',
      scan: { id: crypto.randomUUID(), mode: 'barcode', code, thumbnail },
    });
    navigator.vibrate?.(BARCODE_HAPTIC_MS);
    setBarcodesRead((n) => n + 1);
    // The lookup starts at once, outside the read slots.
    readScans(i18n.language);
  };
  const onCode = useRef(acceptCode);
  useLayoutEffect(() => {
    onCode.current = acceptCode;
  });
  const { watchBarcodes } = camera;
  useEffect(() => {
    if (mode !== 'barcode' || camera.status !== 'ready') return;
    let stopped = false;
    let stop = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      stop = watchBarcodes((code) => {
        if (stopped) return;
        void onCode.current(code);
        // The camera ticks as soon as it is watched, so a held pack waits out the scan interval.
        timer = setTimeout(arm, SCAN_INTERVAL_MS);
      });
    };
    arm();
    return () => {
      stopped = true;
      clearTimeout(timer);
      stop();
    };
  }, [mode, camera.status, watchBarcodes]);

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const error = localError ? t(`errors:${localError}`) : null;

  return {
    modes,
    mode,
    uiLocale: locale,
    scanLanguage,
    setScanLanguage,
    /** Plate Scan has no Scan Language. */
    scanLanguageShown: mode !== 'plate' && mode !== 'barcode',
    scanLanguageLocked: reading,
    camera,
    scans: session.scans,
    /** The Session's Barcode card count once a read happened on this screen, else 0: what the live region announces. */
    barcodesAnnounced:
      barcodesRead > 0
        ? session.scans.filter((scan) => scan.mode === 'barcode').length
        : 0,
    pending: pendingCount(session),
    done: () => navigate('/scan/review'),
    flash,
    reading,
    modesDisabled: resizing,
    controlsDisabled: reading || capped,
    capped,
    notAdded,
    dismissNotAdded: () => setNotAdded(false),
    retryScan: (id: string) => {
      dispatchScanSession({ type: 'retry', id });
      readScans(i18n.language);
    },
    fileInput,
    error,
    setMode: (next: CameraMode) => {
      scanEpoch.current += 1;
      lastCode.current = null;
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
        // Nothing is left to go back to: the overview and the camera of this Session are empty.
        navigate('/');
        return;
      }
      if (location.key === 'default') navigate('/');
      else navigate(-1);
    },
  };
}
