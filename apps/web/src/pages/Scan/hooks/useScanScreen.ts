import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCamera } from '../../../lib/camera';
import { resizeImage } from '../../../lib/image';
import { useIngredientsScan } from '../../../lib/ingredients-scan';
import { startReview } from '../../../lib/review';
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

  const camera = useCamera();
  const productScan = useProductScan(i18n.language);
  const plate = usePlateScan();
  const ingredientsScan = useIngredientsScan(i18n.language);
  // Every wired mode has its own endpoint and returns the same proposed lines.
  const modeScan = mode === 'ingredients' ? ingredientsScan : productScan;
  const [flash, setFlash] = useState(false);
  const [resizing, setResizing] = useState(false);
  // Problems found on this screen itself (bad image, nothing recognised), as `errors` keys.
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reading = resizing || modeScan.isPending || plate.pending;
  const busy = reading || !wired;

  /** A camera frame or gallery file: resize it, scan it, and land on Review. */
  const scanImage = async (source: Blob) => {
    setLocalError(null);
    setResizing(true);
    let image: string;
    try {
      image = await resizeImage(source);
    } catch {
      setLocalError('scan.image_invalid');
      return;
    } finally {
      setResizing(false);
    }
    if (mode === 'plate') {
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

  const shoot = async () => {
    const frame = await camera.capture();
    if (frame) await scanImage(frame);
  };

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void scanImage(file);
  };

  const toggleFlash = async () => {
    const next = !flash;
    // Only show the flash as on if the device actually switched the torch.
    if (await camera.setTorch(next)) setFlash(next);
  };

  const scanError = modeScan.error ?? plate.error;
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
    controlsDisabled: busy,
    fileInput,
    error,
    setMode: (next: ScanMode) => {
      productScan.reset();
      ingredientsScan.reset();
      plate.reset();
      setLocalError(null);
      setParams({ mode: next }, { replace: true });
    },
    plate,
    shoot,
    pickFile,
    openGallery: () => fileInput.current?.click(),
    toggleFlash,
    // Back to wherever the Member came from, or home when this was the first page.
    close: () => (location.key === 'default' ? navigate('/') : navigate(-1)),
    // Handoff section 7: the Pantry's add form is the manual entry.
    addManually: () => navigate('/pantry?add=1'),
  };
}
