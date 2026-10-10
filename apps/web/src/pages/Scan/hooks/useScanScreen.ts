import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCamera } from '../../../lib/camera';
import { registerLeaveGuard } from '../../../lib/leaveGuard';
import { startReview } from '../../../lib/review';
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
import { useReceiptSections } from './useReceiptSections';
import { useScanLanguage } from './useScanLanguage';
import { usePlateScan } from './usePlateScan';
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
  const receiptSections = useReceiptSections(i18n.language, scanLanguage);
  const plate = usePlateScan();
  const resetReceiptSections = useRef(receiptSections.reset);
  resetReceiptSections.current = receiptSections.reset;
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
  // bypassing `setMode`: leaving Receipt always discards the batch and any read in flight.
  useEffect(() => {
    if (previousMode.current !== mode) {
      scanEpoch.current += 1;
    }
    if (previousMode.current === 'receipt' && mode !== 'receipt') {
      resetReceiptSections.current();
    }
    previousMode.current = mode;
  }, [mode]);
  const [flash, setFlash] = useState(false);
  // A restarted stream (e.g. switching into or out of Receipt mode) has its torch off.
  useEffect(() => {
    if (camera.status !== 'ready') setFlash(false);
  }, [camera.status]);
  // A reload or tab close would lose the sections too.
  const sectionCount = receiptSections.sections.length;
  useEffect(() => {
    if (sectionCount === 0) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ''; // older Safari
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [sectionCount]);
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

  const reading = resizing || plate.pending || receiptSections.pending;
  const sectionsInProgress = receiptSections.sections.length > 0;
  const busy =
    reading ||
    (mode === 'receipt' && (receiptSections.deciding || receiptSections.full));

  /** A camera frame or gallery file: prepare it, then join the Scan Session (Plate: the dish picker). */
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
    if (origin === 'camera' && mode !== 'plate') {
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
          scanLanguage,
          image,
          thumbnail: image,
        },
      });
      readScans(i18n.language);
      return false;
    }
    plate.scan(image);
    return false;
  };

  // A double tap on the guide must not send the same section twice.
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
    // Plate keeps its single-photo flow for now.
    if (mode === 'plate') {
      if (!busy) void scanImage(picked[0], 'gallery');
      return;
    }
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
    const base = { mode, scanLanguage };
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

  /** Asks before throwing away Receipt Sections that have not reached Review. */
  const confirmDiscard = () =>
    !sectionsInProgress || window.confirm(t('scan:sections.discardConfirm'));

  // The Dock goes through this guard. The browser/OS back button stays unguarded:
  // the app uses BrowserRouter, which has no `useBlocker`.
  const confirmDiscardRef = useRef(confirmDiscard);
  confirmDiscardRef.current = confirmDiscard;
  useEffect(() => {
    if (sectionCount === 0) return;
    return registerLeaveGuard(() => confirmDiscardRef.current());
  }, [sectionCount]);

  /** Merge the sections and go to Review, like a single photo does. */
  const finishSections = () => {
    const { lines } = receiptSections.merged();
    if (lines.length === 0) {
      setLocalError('scan.nothing_found');
      return;
    }
    startReview({ mode: 'receipt', lines, scanLanguage });
    navigate('/scan/review/draft');
  };

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const scanError = plate.error ?? receiptSections.error ?? readError;
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
    /** A receipt has one Scan Language, fixed by its first section. */
    scanLanguageLocked: reading || sectionsInProgress,
    camera,
    scans: session.scans,
    pending: pendingCount(session),
    done: () => navigate('/scan/review'),
    flash,
    reading,
    scanned,
    /** Switching Scan Mode would reset the batch under an in-flight section. */
    modesDisabled: receiptSections.pending || resizing,
    controlsDisabled: busy,
    fileInput,
    error,
    setMode: (next: ScanMode) => {
      if (next !== mode && !confirmDiscard()) return;
      scanEpoch.current += 1;
      receiptSections.reset();
      plate.reset();
      setLocalError(null);
      setParams({ mode: next }, { replace: true });
    },
    plate,
    receiptSections,
    toast,
    clearToast: () => setToast(null),
    finishSections,
    shoot,
    pickFile,
    openGallery: () => fileInput.current?.click(),
    toggleFlash,
    // Back to wherever the Member came from, or home when this was the first page.
    close: () => {
      if (!confirmDiscard()) return;
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
      if (confirmDiscard()) navigate('/pantry?add=1');
    },
  };
}
