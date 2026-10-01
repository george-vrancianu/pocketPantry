import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { ApiError } from '../../../lib/api';
import { useCamera } from '../../../lib/camera';
import { resizeImage } from '../../../lib/image';
import { startReview } from '../../../lib/review';
import { useReceiptScan } from '../../../lib/receiptScan';
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
  const receiptScan = useReceiptScan(i18n.language);
  const scanner = mode === 'receipt' ? receiptScan : productScan;
  const [flash, setFlash] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeError, setResizeError] = useState<ApiError | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reading = resizing || scanner.isPending;
  const busy = reading || !wired;

  /** A camera frame or gallery file: resize it, scan it, and land on Review. */
  const scanImage = async (source: Blob) => {
    setResizeError(null);
    setResizing(true);
    let image: string;
    try {
      image = await resizeImage(source);
    } catch {
      setResizeError(new ApiError('scan.image_invalid', 400));
      return;
    } finally {
      setResizing(false);
    }
    scanner.mutate(image, {
      onSuccess: ({ lines }) => {
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

  const error = resizeError ?? scanner.error;

  return {
    mode,
    wired,
    camera,
    flash,
    reading,
    controlsDisabled: busy,
    fileInput,
    error: error ? translateApiError(t, error) : null,
    setMode: (next: ScanMode) => {
      scanner.reset();
      setResizeError(null);
      setParams({ mode: next }, { replace: true });
    },
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
