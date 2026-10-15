import {
  Alert,
  bodyFont,
  Box,
  CloseIcon,
  FlashIcon,
  tokens,
  Typography,
  useForcedThemeColor,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanLanguage } from '../../i18n/resources';
import { useCamera } from '../../lib/camera';
import { IMAGE_PREPARATION } from '../../lib/scanImage';
import { glassControl, glassFocusRing, shade } from './components/glass';
import { ModeDial } from './components/ModeDial';
import { ScanLanguageChip } from './components/ScanLanguageChip';
import { Viewfinder } from './components/Viewfinder';
import { useScanLanguage } from './hooks/useScanLanguage';

/** The modes an overlay camera offers. Only Product so far; Barcode joins it later. */
export type CameraMode = 'product';

/**
 * What the camera hands back to whatever opened it, then closes. One kind per camera mode that
 * yields a result; a Barcode mode adds `{ kind: 'barcode'; code: string }` here.
 */
export type CameraResult = {
  kind: 'product';
  /** The prepared photo, as a JPEG data URL. */
  image: string;
  /** The language the Member chose to read it in. */
  scanLanguage: ScanLanguage;
};

type Props = {
  /** In dial order; the dial is hidden when there is only one. */
  modes: readonly CameraMode[];
  /** The mode the camera opens in; the first of `modes` when it is not one of them. */
  defaultMode: CameraMode;
  /** One shot was taken: the opener closes the overlay and owns the work that follows. */
  onResult: (result: CameraResult) => void;
  /** Closed without a shot; the opener is left as it was. */
  onCancel: () => void;
};

const roundButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 0,
  ...glassControl(false),
  '&:focus-visible': glassFocusRing,
};

/**
 * The camera as a full-screen overlay for a page that needs one photo back (the add-Batch form),
 * not a Scan Session. Its mode lives in the overlay, never in the URL, and it remembers nothing:
 * it is opened over a page whose own address and settings are not its to change. The Scan
 * Language is the Scan page's remembered one.
 */
export function CameraOverlay({
  modes,
  defaultMode,
  onResult,
  onCancel,
}: Props) {
  const { t } = useTranslation('scan');
  useForcedThemeColor('dark');
  const camera = useCamera();
  const { locale, scanLanguage, setScanLanguage } = useScanLanguage();
  const [mode, setMode] = useState<CameraMode>(
    modes.includes(defaultMode) ? defaultMode : modes[0],
  );
  const [flash, setFlash] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [failed, setFailed] = useState(false);
  const dragEndedAt = useRef<number | null>(null);
  const shooting = useRef(false);

  // Focus moves into the dialog on open, and Escape closes it as Close does.
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => dialog.current?.focus(), []);
  // Set once the overlay is cancelled or gone: a photo still being prepared is then dropped.
  const closed = useRef(false);
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  const cancel = () => {
    closed.current = true;
    cancelRef.current();
  };
  const cancelFromKey = useRef(cancel);
  cancelFromKey.current = cancel;
  useEffect(() => {
    closed.current = false;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelFromKey.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      closed.current = true;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const shoot = async () => {
    if (shooting.current) return;
    shooting.current = true;
    setFailed(false);
    try {
      const frame = await camera.capture();
      if (!frame) return;
      setPreparing(true);
      const feed = camera.videoRef.current;
      const image = await IMAGE_PREPARATION[mode](frame, 'camera', {
        width: feed?.clientWidth || window.innerWidth,
        height: feed?.clientHeight || window.innerHeight,
      });
      if (!closed.current) onResult({ kind: 'product', image, scanLanguage });
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
        component="video"
        ref={camera.videoRef}
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
      <Viewfinder
        mode={mode}
        disabled={preparing || camera.status !== 'ready'}
        onScan={() => void shoot()}
        dragEndedAt={dragEndedAt}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          px: 2,
          pt: 'calc(22px + env(safe-area-inset-top))',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label={t('close')}
          onClick={cancel}
          sx={roundButton}
        >
          <CloseIcon size={20} />
        </Box>
        {camera.torchSupported ? (
          <Box
            component="button"
            type="button"
            aria-label={t('flash')}
            aria-pressed={flash}
            onClick={() => void toggleFlash()}
            sx={{
              ...roundButton,
              ...(flash && {
                backgroundColor: tokens.color.ink,
                color: tokens.color.bg,
              }),
            }}
          >
            <FlashIcon size={20} />
          </Box>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <ScanLanguageChip
          value={scanLanguage}
          locale={locale}
          disabled={preparing}
          onChange={setScanLanguage}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: 2.5,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <Typography
          role="status"
          component="div"
          sx={{ mt: '24px', minHeight: 24, textAlign: 'center', fontSize: 13 }}
        >
          {camera.status === 'unavailable' ? t('overlay.noCamera') : null}
        </Typography>
        {failed ? <Alert role="alert">{t('overlay.photoFailed')}</Alert> : null}
        {modes.length > 1 ? (
          <ModeDial
            modes={modes}
            mode={mode}
            disabled={preparing}
            keysDisabled={preparing}
            dragEndedAt={dragEndedAt}
            onChange={(next) => {
              const picked = modes.find((item) => item === next);
              if (picked) setMode(picked);
            }}
          />
        ) : (
          <Box sx={visuallyHidden}>{t(`mode.${mode}`)}</Box>
        )}
      </Box>
    </Box>
  );
}
