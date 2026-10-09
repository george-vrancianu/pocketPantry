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
import { MAX_RECEIPT_SECTIONS } from '../../../lib/receiptSections';
import type { ReceiptCrop } from '../components/ReceiptCropper';
import { useReceiptSections } from './useReceiptSections';
import { useScanLanguage } from './useScanLanguage';
import { usePlateScan } from './usePlateScan';
import { isScanMode, useProductScan, type ScanMode } from '../../../lib/scan';

/** Scan screen state: mode, camera, flash, and the photo-to-Review flow. */
export function useScanScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const requested = params.get('mode');
  const mode: ScanMode = isScanMode(requested) ? requested : 'product';

  const camera = useCamera(mode === 'receipt');
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const productScan = useProductScan(i18n.language, scanLanguage);
  const receiptSections = useReceiptSections(i18n.language, scanLanguage);
  const plate = usePlateScan();
  const ingredientsScan = useIngredientsScan(i18n.language, scanLanguage);
  // Product and Ingredients have one endpoint and return the same proposed lines. Plate has its
  // own flow, and Receipt photographs the receipt in sections.
  const modeScans = { product: productScan, ingredients: ingredientsScan };
  const modeScan =
    mode === 'plate' || mode === 'receipt' ? null : modeScans[mode];
  /**
   * Gallery photos picked in Receipt mode that are not sent yet, in the order picked. The first is
   * the one in the crop step while `cropOpen`. They are read one at a time: the next is cropped
   * only after the Member has seen the previous result and pressed Next photo.
   */
  const [queue, setQueue] = useState<Blob[]>([]);
  const [cropOpen, setCropOpen] = useState(false);
  /** How many photos the current selection had, for the "photo 2 of 4" progress. */
  const [batchTotal, setBatchTotal] = useState(0);
  /** The photo whose read failed: re-cropped on Retake, then the queue continues. */
  const [failedPhoto, setFailedPhoto] = useState<Blob | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const clearQueue = () => {
    setQueue([]);
    setCropOpen(false);
    setBatchTotal(0);
    setFailedPhoto(null);
    setNotice(null);
  };
  const cropping = cropOpen ? (queue[0] ?? null) : null;
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
      clearQueue();
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
    (mode === 'receipt' && (receiptSections.deciding || receiptSections.full));

  /** A camera frame or gallery file: prepare it, scan it, and land on Review. */
  const scanImage = async (
    source: Blob,
    origin: ImageOrigin,
    prepare: () => Promise<string> = () =>
      IMAGE_PREPARATION[mode](source, origin),
  ): Promise<boolean> => {
    setLocalError(null);
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
    if (mode === 'receipt') {
      return (await receiptSections.submit(image)) === 'failed';
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
        navigate('/scan/review');
      },
    });
    return false;
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
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    // The same locks as the shutter: a section being read, a result awaiting a decision, or a
    // full batch (retaking targets an existing section, so it is not full).
    if (picked.length === 0 || busy) return;
    if (!needsCropStep(mode, 'gallery')) {
      void scanImage(picked[0], 'gallery');
      return;
    }
    // The whole batch counts against the cap: a retaken section is replaced, not added.
    const room =
      MAX_RECEIPT_SECTIONS -
      receiptSections.sections.length +
      (receiptSections.retaking ? 1 : 0);
    if (picked.length > room) {
      setNotice(
        t('scan:sections.tooMany', { count: room, selected: picked.length }),
      );
      return;
    }
    setNotice(null);
    setQueue(picked);
    setBatchTotal(picked.length);
    setFailedPhoto(null);
    setCropOpen(true);
  };

  const confirmCrop = ({ area, rotation }: ReceiptCrop) => {
    const photo = cropping;
    setCropOpen(false);
    if (!photo || busy) return;
    setQueue((current) => current.slice(1));
    void scanImage(photo, 'gallery', () =>
      cropToReceiptArea(photo, area, rotation),
    ).then((failed) => {
      // Stop here: the Member re-crops this photo, then the rest follows.
      if (failed) setFailedPhoto(photo);
    });
  };

  /** Cancelling a crop abandons the rest of the selection (nothing is sent for it). */
  const cancelCrop = clearQueue;

  /** On to the next queued photo's crop step, if the selection has one left. */
  const continueQueue = () => {
    if (queue.length > 0) setCropOpen(true);
    else setBatchTotal(0);
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
    clearQueue();
    startReview({ mode: 'receipt', lines, scanLanguage });
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
    uiLocale: locale,
    scanLanguage,
    setScanLanguage,
    /** Plate Scan has no Scan Language. */
    scanLanguageShown: mode !== 'plate',
    /** A receipt has one Scan Language, fixed by its first section. */
    scanLanguageLocked: reading || sectionsInProgress,
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
      clearQueue();
      setParams({ mode: next }, { replace: true });
    },
    plate,
    receiptSections: {
      ...receiptSections,
      nextPhoto: () => {
        receiptSections.nextPhoto();
        setFailedPhoto(null);
        continueQueue();
      },
      remove: (index: number) => {
        receiptSections.remove(index);
        setFailedPhoto(null);
        continueQueue();
      },
      retake: (index: number) => {
        receiptSections.retake(index);
        if (failedPhoto) {
          setQueue((current) => [failedPhoto, ...current]);
          setFailedPhoto(null);
          setCropOpen(true);
        }
      },
    },
    /** Photos of the selection still to be read, and where the Member is in it. */
    photoQueue: {
      total: batchTotal,
      waiting: queue.length,
      /** 1-based number of the photo in the crop step, or being read or shown. */
      number: Math.min(
        batchTotal,
        batchTotal - queue.length + (cropOpen ? 1 : 0),
      ),
    },
    notice,
    finishSections,
    shoot,
    pickFile,
    cropping,
    confirmCrop,
    cancelCrop,
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
