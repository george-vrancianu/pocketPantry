import {
  Alert,
  Box,
  CloseIcon,
  FlashIcon,
  GalleryIcon,
  InfoIcon,
  Snackbar,
  Typography,
  visuallyHidden,
  tokens,
  radius,
} from '@pocket-pantry/ui';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  glassControl,
  glassFocusRing,
  shade,
  translucent,
} from './components/glass';
import { ScanLanguageChip } from './components/ScanLanguageChip';
import { SessionStrip } from './components/SessionStrip';
import { ModeDial } from './components/ModeDial';
import { InfoSheet } from './components/InfoSheet';
import { Viewfinder } from './components/Viewfinder';
import { useScanScreen } from './hooks/useScanScreen';

const roundButton = (size: number) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: size,
  height: size,
  borderRadius: '50%',
  border: 0,
  ...glassControl(false),
  '&:focus-visible': glassFocusRing,
});

/**
 * The dark camera screen (handoff section 7). It is always in Dark-first,
 * whatever the Member's Theme, so the chrome never washes out the camera view.
 */
export function ScanPage() {
  const { t } = useTranslation('scan');
  const screen = useScanScreen();
  const modeLabel = t(`mode.${screen.mode}`);
  const [infoOpen, setInfoOpen] = useState(false);
  const dragEndedAt = useRef<number | null>(null);
  const closeInfo = useCallback(() => setInfoOpen(false), []);

  return (
    <Box
      data-testid="scan-screen"
      data-theme="dark"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        overflow: 'hidden',
        backgroundColor: tokens.color.bg,
        color: tokens.color.ink,
      }}
    >
      <Box
        component="video"
        ref={screen.camera.videoRef}
        data-testid="scan-feed"
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
        data-testid="scan-vignette"
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${shade(45)} 100%)`,
        }}
      />
      <Viewfinder
        mode={screen.mode}
        disabled={screen.controlsDisabled || screen.camera.status !== 'ready'}
        onScan={() => void screen.shoot()}
        dragEndedAt={dragEndedAt}
      />
      <SessionStrip scans={screen.scans} onRetry={screen.retryScan} />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          // Sized so Close, torch, Scan Language, Info, Gallery and Done fit a 360 px phone.
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
          onClick={screen.close}
          sx={roundButton(40)}
        >
          <CloseIcon size={20} />
        </Box>
        {screen.camera.torchSupported ? (
          <Box
            component="button"
            type="button"
            aria-label={t('flash')}
            aria-pressed={screen.flash}
            onClick={() => void screen.toggleFlash()}
            sx={{
              ...roundButton(40),
              ...(screen.flash && {
                backgroundColor: tokens.color.ink,
                color: tokens.color.bg,
              }),
            }}
          >
            <FlashIcon size={20} />
          </Box>
        ) : null}
        <Typography component="h1" sx={{ ...visuallyHidden, flex: 'none' }}>
          {t('title', { mode: modeLabel.toLocaleLowerCase() })}
        </Typography>
        {/* Pushes the Scan Language, Info and Done to the right edge. */}
        <Box sx={{ flex: 1 }} />
        {screen.scanLanguageShown ? (
          <ScanLanguageChip
            value={screen.scanLanguage}
            locale={screen.uiLocale}
            disabled={screen.scanLanguageLocked}
            onChange={screen.setScanLanguage}
          />
        ) : null}
        <Box
          component="button"
          type="button"
          aria-label={t('info.label')}
          onClick={() => setInfoOpen(true)}
          sx={roundButton(40)}
        >
          <InfoIcon size={20} />
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={t('gallery')}
          disabled={screen.controlsDisabled}
          onClick={screen.openGallery}
          sx={roundButton(40)}
        >
          <GalleryIcon size={20} />
        </Box>
        <Box
          component="button"
          type="button"
          disabled={screen.scans.length === 0}
          onClick={screen.done}
          aria-label={
            screen.scans.length > 0
              ? t('doneCount', { count: screen.scans.length })
              : undefined
          }
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: 40,
            px: '12px',
            borderRadius: radius.pill,
            border: 0,
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'inherit',
            backgroundColor: tokens.color.ink,
            color: tokens.color.bg,
            opacity: screen.scans.length === 0 ? 0.45 : 1,
            cursor: screen.scans.length === 0 ? 'default' : 'pointer',
            '&:focus-visible': glassFocusRing,
          }}
        >
          {screen.scans.length > 0 ? (
            <Box
              component="span"
              data-testid="done-count"
              aria-hidden="true"
              data-reading={screen.pending > 0}
              sx={{
                minWidth: 20,
                height: 20,
                px: '6px',
                borderRadius: radius.pill,
                fontSize: 12,
                lineHeight: '20px',
                textAlign: 'center',
                backgroundColor:
                  screen.pending > 0
                    ? tokens.color.soonFg
                    : translucent(tokens.color.surface, 82),
                color: screen.pending > 0 ? tokens.color.bg : tokens.color.ink,
              }}
            >
              {screen.scans.length}
            </Box>
          ) : null}
          {/* On the narrowest phones the count alone stands for Done; its name still says Done. */}
          <Box
            component="span"
            sx={{
              '@media (max-width: 389px)': {
                display: screen.scans.length > 0 ? 'none' : undefined,
              },
            }}
          >
            {t('done')}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: 'calc(100% - 80px)',
          overflowY: 'auto',
          px: 2.5,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <Box
          role="status"
          sx={{ mt: '24px', minHeight: 24, textAlign: 'center', fontSize: 13 }}
        >
          {screen.reading ? t('reading') : null}
          {screen.camera.status === 'unavailable' ? t('noCamera') : null}
        </Box>
        {screen.capped ? (
          <Box sx={{ mt: 1 }}>
            <Alert severity="warning">{t('capReached')}</Alert>
          </Box>
        ) : null}
        {screen.error ? (
          <Box sx={{ mt: 1 }}>
            <Alert>{screen.error}</Alert>
          </Box>
        ) : null}

        <ModeDial
          mode={screen.mode}
          disabled={screen.modesDisabled || infoOpen}
          keysDisabled={screen.modesDisabled || infoOpen || screen.reading}
          dragEndedAt={dragEndedAt}
          onChange={screen.setMode}
        />
      </Box>

      <Snackbar
        open={screen.toast !== null}
        onClose={screen.clearToast}
        bottom={170}
      >
        <Alert severity={screen.toast?.severity} role="status">
          {screen.toast?.text}
        </Alert>
      </Snackbar>

      <Box role="status" sx={visuallyHidden}>
        {screen.scans.some((scan) => scan.status === 'failed')
          ? t('session.failed')
          : null}
        {screen.scans.length > 0
          ? t('photoAdded', { count: screen.scans.length })
          : null}
      </Box>

      <Snackbar open={screen.notAdded} onClose={screen.dismissNotAdded}>
        <Alert severity="warning" role="status">
          {t('notAdded')}
        </Alert>
      </Snackbar>

      {infoOpen ? <InfoSheet onClose={closeInfo} /> : null}

      <Box
        component="input"
        ref={screen.fileInput}
        type="file"
        accept="image/*"
        multiple
        onChange={screen.pickFile}
        data-testid="gallery-input"
        sx={{ display: 'none' }}
      />
    </Box>
  );
}
