import {
  Alert,
  bodyFont,
  Box,
  tokens,
  Typography,
  useForcedThemeColor,
  visuallyHidden,
} from '@pocket-pantry/ui';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanLanguage } from '../../i18n/resources';
import { readBarcode, useCamera } from '../../lib/camera';
import type { CameraMode } from '../../lib/cameraMode';
import { IMAGE_PREPARATION } from '../../lib/scanImage';
import { CameraFooter } from './components/CameraFooter';
import { CameraTopBar } from './components/CameraTopBar';
import { Fading } from './components/Fading';
import { InfoSheet } from './components/InfoSheet';
import { shade } from './components/glass';
import { ModeSlider } from './components/ModeSlider';
import { ScanLanguageChip } from './components/ScanLanguageChip';
import { ShutterButton } from './components/ShutterButton';
import { ZoomPill } from './components/ZoomPill';
import { Viewfinder, useShotFeedback } from './components/Viewfinder';
import { measureView, useGuideRect } from './hooks/useGuideRect';
import { useScanLanguage } from './hooks/useScanLanguage';

export type { CameraMode };

/** What the camera hands back to whatever opened it, then closes: one kind per camera mode. */
export type CameraResult =
  | {
      kind: 'product';
      /** The prepared photo, as a JPEG data URL. */
      image: string;
      /** The language the Member chose to read it in. */
      scanLanguage: ScanLanguage;
      /**
       * The barcode found in the captured frame, or null: decoded on the device alongside the
       * read, never awaited by it. Never rejects; a frame that cannot be decoded just has none.
       */
      barcode: Promise<string | null>;
    }
  | {
      kind: 'barcode';
      /** The decoded EAN-13, EAN-8, UPC-A or UPC-E code. */
      code: string;
    };

type Props = {
  /** In slider order; the slider is hidden when there is only one. */
  modes: readonly CameraMode[];
  /** The mode the camera opens in; the first of `modes` when it is not one of them. */
  defaultMode: CameraMode;
  /** The Member picked a mode on the slider: the opener may remember it. */
  onModeChange?: (mode: CameraMode) => void;
  /** A short message above the footer, such as why the overlay reopened. */
  notice?: string;
  /** One shot was taken, or a barcode was read: the opener closes the overlay and owns the work that follows. */
  onResult: (result: CameraResult) => void;
  /** Closed without a shot; the opener is left as it was. */
  onCancel: () => void;
};

/**
 * The camera as a full-screen overlay for a page that needs one photo back (the add-Batch form),
 * not a Scan Session. Its mode lives in the overlay, never in the URL, and the opener decides what
 * to remember: it is opened over a page whose own address and settings are not its to change. The
 * Scan Language is the Scan page's remembered one, and only Product mode has it: a Barcode Lookup
 * is not a Scan.
 */
export function CameraOverlay({
  modes,
  defaultMode,
  onModeChange,
  notice,
  onResult,
  onCancel,
}: Props) {
  const { t } = useTranslation('scan');
  useForcedThemeColor('dark');
  const camera = useCamera();
  const { scanLanguage, setScanLanguage } = useScanLanguage();
  const [mode, setMode] = useState<CameraMode>(
    modes.includes(defaultMode) ? defaultMode : modes[0],
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const closeInfo = useCallback(() => setInfoOpen(false), []);
  const [flash, setFlash] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [failed, setFailed] = useState(false);
  const { shot, fire } = useShotFeedback();
  const guide = useGuideRect(mode);
  const [viewfinder, setViewfinder] = useState<HTMLElement | null>(null);
  const [sliding, setSliding] = useState(false);
  const shooting = useRef(false);
  const { videoRef } = camera;

  // Focus moves into the dialog on open, and Escape closes it as Close does.
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => dialog.current?.focus(), []);
  // Set once the overlay is cancelled or gone: a photo still being prepared is then dropped.
  const closed = useRef(false);
  const cancelRef = useRef(onCancel);
  // Escape closes the Info sheet first, not the camera under it.
  const infoOpenRef = useRef(false);
  useLayoutEffect(() => {
    cancelRef.current = onCancel;
    infoOpenRef.current = infoOpen;
  });
  const cancel = () => {
    closed.current = true;
    cancelRef.current();
  };
  useEffect(() => {
    closed.current = false;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !infoOpenRef.current) {
        closed.current = true;
        cancelRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      closed.current = true;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Barcode reads the live stream: the first code closes the overlay. The decoder (WASM
  // where the browser has none) is loaded by this call, the first time Barcode is used.
  const resultRef = useRef(onResult);
  useLayoutEffect(() => {
    resultRef.current = onResult;
  });
  const { watchBarcodes } = camera;
  useEffect(() => {
    if (mode !== 'barcode' || camera.status !== 'ready') return;
    return watchBarcodes((code) => {
      if (closed.current) return;
      closed.current = true;
      resultRef.current({ kind: 'barcode', code });
    });
  }, [mode, camera.status, watchBarcodes]);

  const shoot = async () => {
    if (mode === 'barcode' || shooting.current) return;
    shooting.current = true;
    setFailed(false);
    try {
      const frame = await camera.capture();
      if (!frame) return;
      // The frame's barcode settles later, never delaying the read: the ZXing decode is main-thread
      // work, so it only starts once the result is handed over and the read is under way.
      let settle: (code: string | null) => void = () => {};
      const barcode = new Promise<string | null>(
        (resolve) => (settle = resolve),
      );
      setPreparing(true);
      const image = await IMAGE_PREPARATION[mode](
        frame,
        'camera',
        measureView(camera.videoRef.current),
      );
      if (!closed.current) {
        onResult({ kind: 'product', image, scanLanguage, barcode });
        setTimeout(() => {
          readBarcode(frame).then(settle, () => settle(null));
        }, 0);
      }
    } catch {
      setFailed(true);
    } finally {
      setPreparing(false);
      shooting.current = false;
    }
  };

  const toggleFlash = async () => {
    if (await camera.setTorch(!flash)) setFlash(!flash);
  };

  return (
    <Box
      data-testid="camera-overlay"
      data-theme="dark"
      role="dialog"
      aria-modal="true"
      ref={dialog}
      tabIndex={-1}
      aria-label={t('title', {
        mode: t(`mode.${mode}`).toLocaleLowerCase(),
      })}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        overflow: 'hidden',
        backgroundColor: tokens.color.bg,
        color: tokens.color.ink,
        fontFamily: bodyFont,
      }}
    >
      <Box
        ref={setViewfinder}
        sx={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
      >
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${shade(45)} 100%)`,
          }}
        />
        <Viewfinder rect={guide} shot={shot} sliding={sliding} />
      </Box>
      <CameraTopBar
        onClose={cancel}
        torch={
          camera.torchSupported
            ? { on: flash, onToggle: () => void toggleFlash() }
            : undefined
        }
        onInfo={() => setInfoOpen(true)}
        language={
          <Fading hidden={mode === 'barcode'}>
            <ScanLanguageChip
              value={scanLanguage}
              disabled={preparing}
              onChange={setScanLanguage}
            />
          </Fading>
        }
      />
      <CameraFooter
        zoom={
          camera.zoomSupported ? <ZoomPill onZoom={camera.setZoom} /> : null
        }
        status={
          <>
            <Typography
              role="status"
              component="div"
              sx={{ minHeight: 24, textAlign: 'center', fontSize: 13 }}
            >
              {camera.status === 'unavailable'
                ? t('overlay.noCamera')
                : mode === 'barcode'
                  ? t('overlay.pointAtBarcode')
                  : null}
            </Typography>
            {notice ? <Alert severity="info">{notice}</Alert> : null}
            {failed ? (
              <Alert role="alert">{t('overlay.photoFailed')}</Alert>
            ) : null}
          </>
        }
        shutter={
          <ShutterButton
            ring={mode === 'barcode'}
            disabled={preparing || camera.status !== 'ready'}
            onShoot={() => {
              fire();
              void shoot();
            }}
            focusForScan={camera.focusForScan}
          />
        }
        slider={
          modes.length > 1 ? (
            <ModeSlider
              modes={modes}
              mode={mode}
              disabled={preparing || infoOpen}
              keysDisabled={preparing || infoOpen}
              swipeSurface={viewfinder}
              onDragChange={setSliding}
              onChange={(next) => {
                const picked = modes.find((item) => item === next);
                if (!picked) return;
                setMode(picked);
                onModeChange?.(picked);
              }}
            />
          ) : (
            <Box sx={visuallyHidden}>{t(`mode.${mode}`)}</Box>
          )
        }
      />
      {infoOpen ? (
        <InfoSheet onClose={closeInfo} modes={modes} stackTip={false} />
      ) : null}
    </Box>
  );
}
