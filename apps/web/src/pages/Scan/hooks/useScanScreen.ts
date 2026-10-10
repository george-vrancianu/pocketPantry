import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCamera } from '../../../lib/camera';
import { useIngredientsScan } from '../../../lib/ingredients-scan';
import { startReview } from '../../../lib/review';
import {
  clearReadFailure,
  readScans,
  useReadFailure,
} from '../../../lib/scanReads';
import {
  dispatchScanSession,
  pendingCount,
  useScanSession,
} from '../../../lib/scanSession';
import { cropToReceiptArea } from '../../../lib/image';
import {
  IMAGE_PREPARATION,
  needsCropStep,
  type ImageOrigin,
} from '../../../lib/scanImage';
import type { ReceiptCrop } from '../components/ReceiptCropper';
import { useScanLanguage } from './useScanLanguage';
import { usePlateScan } from './usePlateScan';
import {
  isScanMode,
  loadScanMode,
  saveScanMode,
  useProductScan,
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
  const productScan = useProductScan(i18n.language, scanLanguage);
  const plate = usePlateScan();
  const ingredientsScan = useIngredientsScan(i18n.language, scanLanguage);
  // Product and Ingredients have one endpoint and return the same proposed lines. Plate has its
  // own flow, and Receipt Scans join the Scan Session.
  const modeScans = { product: productScan, ingredients: ingredientsScan };
  const modeScan =
    mode === 'plate' || mode === 'receipt' ? null : modeScans[mode];
  /**
   * Gallery photos picked in Receipt mode that are not sent yet, in the order picked. The first is
   * the one in the crop step while `cropOpen`; each joins the Scan Session once cropped.
   */
  const [queue, setQueue] = useState<Blob[]>([]);
  const [cropOpen, setCropOpen] = useState(false);
  /** How many photos the current selection had, for the "photo 2 of 4" progress. */
  const [batchTotal, setBatchTotal] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const clearQueue = () => {
    setQueue([]);
    setCropOpen(false);
    setBatchTotal(0);
    setNotice(null);
  };
  const cropping = cropOpen ? (queue[0] ?? null) : null;
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
  // bypassing `setMode`: the selection and any photo being prepared are dropped.
  useEffect(() => {
    if (previousMode.current !== mode) {
      scanEpoch.current += 1;
      clearQueue();
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
  const fileInput = useRef<HTMLInputElement>(null);
  /** Whether a Scan was taken yet, failed or not: the guide's hint goes away after the first. */
  const [scanned, setScanned] = useState(false);

  const reading = resizing || (modeScan?.isPending ?? false) || plate.pending;
  const busy = reading;

  /** A camera frame or gallery file: prepare it, scan it, and land on Review. */
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
    setNotice(null);
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
    // A camera Scan, or a cropped gallery receipt, joins the Scan Session at once; its read goes on
    // in the background.
    if ((origin === 'camera' || mode === 'receipt') && mode !== 'plate') {
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
    if (!modeScan) {
      plate.scan(image);
      return false;
    }
    modeScan.mutate(image, {
      onSuccess: ({ lines }) => {
        if (lines.length === 0) {
          setLocalError('scan.nothing_found');
          return;
        }
        startReview({ mode, lines, scanLanguage });
        navigate('/scan/review/draft');
      },
    });
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

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    // The same lock as the guide: a photo being prepared or read.
    if (picked.length === 0 || busy) return;
    if (!needsCropStep(mode, 'gallery')) {
      void scanImage(picked[0], 'gallery');
      return;
    }
    setNotice(null);
    setQueue(picked);
    setBatchTotal(picked.length);
    setCropOpen(true);
  };

  const confirmCrop = ({ area, rotation }: ReceiptCrop) => {
    const photo = cropping;
    if (!photo || busy) return;
    // On to the next queued photo's crop step, if the selection has one left.
    setQueue((current) => current.slice(1));
    setCropOpen(queue.length > 1);
    if (queue.length <= 1) setBatchTotal(0);
    void scanImage(photo, 'gallery', () =>
      cropToReceiptArea(photo, area, rotation),
    );
  };

  /** Cancelling a crop abandons the rest of the selection (nothing is sent for it). */
  const cancelCrop = clearQueue;

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const scanError = modeScan?.error ?? plate.error ?? readError;
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
    controlsDisabled: busy,
    fileInput,
    error,
    setMode: (next: ScanMode) => {
      scanEpoch.current += 1;
      Object.values(modeScans).forEach((scan) => scan.reset());
      plate.reset();
      setLocalError(null);
      clearQueue();
      setParams({ mode: next }, { replace: true });
    },
    plate,
    /** Which photo of a gallery selection is in the crop step, and how many were picked. */
    photoQueue: {
      total: batchTotal,
      number: Math.min(
        batchTotal,
        batchTotal - queue.length + (cropOpen ? 1 : 0),
      ),
    },
    notice,
    shoot,
    pickFile,
    cropping,
    confirmCrop,
    cancelCrop,
    openGallery: () => fileInput.current?.click(),
    toggleFlash,
    // Back to wherever the Member came from, or home when this was the first page.
    close: () => {
      if (location.key === 'default') navigate('/');
      else navigate(-1);
    },
    // Handoff section 7: the Pantry's add form is the manual entry.
    addManually: () => {
      navigate('/pantry?add=1');
    },
  };
}
