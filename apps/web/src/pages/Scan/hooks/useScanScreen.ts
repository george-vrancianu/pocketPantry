import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCamera } from '../../../lib/camera';
import { useIngredientsScan } from '../../../lib/ingredients-scan';
import { registerLeaveGuard } from '../../../lib/leaveGuard';
import { startReview } from '../../../lib/review';
import { cropToReceiptArea } from '../../../lib/image';
import {
  IMAGE_PREPARATION,
  needsCropStep,
  type ImageOrigin,
} from '../../../lib/scanImage';
import type { ReceiptCrop } from '../components/ReceiptCropper';
import { useReceiptSections } from './useReceiptSections';
import { usePlateScan } from './usePlateScan';
import {
  isScanMode,
  useProductScan,
  WIRED_SCAN_MODES,
  type ScanMode,
} from '../../../lib/scan';

/** Scan screen state: mode, camera, flash, and the photo-to-Review flow. */
export function useScanScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const requested = params.get('mode');
  const mode: ScanMode = isScanMode(requested) ? requested : 'product';
  const wired = WIRED_SCAN_MODES.includes(mode);

  const camera = useCamera(mode === 'receipt');
  const productScan = useProductScan(i18n.language);
  const receiptSections = useReceiptSections(i18n.language);
  const plate = usePlateScan();
  const ingredientsScan = useIngredientsScan(i18n.language);
  // Product and Ingredients have one endpoint and return the same proposed lines. Plate has its
  // own flow, and Receipt photographs the receipt in sections.
  const modeScans = { product: productScan, ingredients: ingredientsScan };
  const modeScan =
    mode === 'plate' || mode === 'receipt' ? null : modeScans[mode];
  // A receipt photo from the gallery waiting for the Member to frame it in the crop step.
  const [cropping, setCropping] = useState<Blob | null>(null);
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
      setCropping(null);
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
  const fileInput = useRef<HTMLInputElement>(null);

  const reading =
    resizing ||
    (modeScan?.isPending ?? false) ||
    plate.pending ||
    receiptSections.pending;
  const sectionsInProgress = receiptSections.sections.length > 0;
  const busy =
    reading ||
    !wired ||
    (mode === 'receipt' && (receiptSections.deciding || receiptSections.full));

  /** A camera frame or gallery file: prepare it, scan it, and land on Review. */
  const scanImage = async (
    source: Blob,
    origin: ImageOrigin,
    prepare: () => Promise<string> = () =>
      IMAGE_PREPARATION[mode](source, origin),
  ) => {
    setLocalError(null);
    setResizing(true);
    const epoch = scanEpoch.current;
    let image: string;
    try {
      image = await prepare();
    } catch {
      if (epoch === scanEpoch.current) setLocalError('scan.image_invalid');
      return;
    } finally {
      setResizing(false);
    }
    if (epoch !== scanEpoch.current) return;
    if (mode === 'receipt') {
      await receiptSections.submit(image);
      return;
    }
    if (!modeScan) {
      plate.scan(image);
      return;
    }
    modeScan.mutate(image, {
      onSuccess: ({ lines }) => {
        if (lines.length === 0) {
          setLocalError('scan.nothing_found');
          return;
        }
        startReview({ mode, lines });
        navigate('/scan/review');
      },
    });
  };

  // A double tap on the shutter must not send the same section twice.
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
    const file = event.target.files?.[0];
    event.target.value = '';
    // The same locks as the shutter: a section being read, a result awaiting a decision, or a
    // full batch (retaking targets an existing section, so it is not full).
    if (!file || busy) return;
    if (needsCropStep(mode, 'gallery')) setCropping(file);
    else void scanImage(file, 'gallery');
  };

  const confirmCrop = ({ area, rotation }: ReceiptCrop) => {
    const photo = cropping;
    setCropping(null);
    if (photo && !busy)
      void scanImage(photo, 'gallery', () =>
        cropToReceiptArea(photo, area, rotation),
      );
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
    startReview({ mode: 'receipt', lines });
    navigate('/scan/review');
  };

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const scanError = modeScan?.error ?? plate.error ?? receiptSections.error;
  const error = localError
    ? t(`errors:${localError}`)
    : scanError
      ? translateApiError(t, scanError)
      : null;

  return {
    mode,
    wired,
    camera,
    flash,
    reading,
    /** Switching Scan Mode would reset the batch under an in-flight section. */
    modesDisabled: receiptSections.pending || resizing,
    controlsDisabled: busy,
    fileInput,
    error,
    setMode: (next: ScanMode) => {
      if (next !== mode && !confirmDiscard()) return;
      scanEpoch.current += 1;
      Object.values(modeScans).forEach((scan) => scan.reset());
      receiptSections.reset();
      plate.reset();
      setLocalError(null);
      setCropping(null);
      setParams({ mode: next }, { replace: true });
    },
    plate,
    receiptSections,
    finishSections,
    shoot,
    pickFile,
    cropping,
    confirmCrop,
    cancelCrop: () => setCropping(null),
    openGallery: () => fileInput.current?.click(),
    toggleFlash,
    // Back to wherever the Member came from, or home when this was the first page.
    close: () => {
      if (!confirmDiscard()) return;
      if (location.key === 'default') navigate('/');
      else navigate(-1);
    },
    // Handoff section 7: the Pantry's add form is the manual entry.
    addManually: () => {
      if (confirmDiscard()) navigate('/pantry?add=1');
    },
  };
}
