import {
  Alert,
  Box,
  CloseIcon,
  FlashIcon,
  GalleryIcon,
  InfoIcon,
  ManualEntryIcon,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_RECEIPT_SECTIONS } from '../../lib/receiptSections';
import { glassControl, glassFocusRing } from './components/glass';
import { DishPicker } from './components/DishPicker';
import { ScanLanguageChip } from './components/ScanLanguageChip';
import { ReceiptCropper } from './components/ReceiptCropper';
import { ReceiptSections } from './components/ReceiptSections';
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

/** The dark camera screen (handoff section 7). */
export function ScanPage() {
  const { t } = useTranslation('scan');
  const screen = useScanScreen();
  const modeLabel = t(`mode.${screen.mode}`);
  const [infoOpen, setInfoOpen] = useState(false);
  const closeInfo = useCallback(() => setInfoOpen(false), []);

  return (
    <Box
      data-testid="scan-screen"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        overflow: 'hidden',
        backgroundColor: tokens.color.cameraBg,
        color: tokens.color.camFg,
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
          background: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${tokens.color.camScrim} 100%)`,
        }}
      />
      <Viewfinder
        scanning={screen.reading}
        receiptGuide={screen.mode === 'receipt'}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          px: 2.5,
          pt: 'calc(22px + env(safe-area-inset-top))',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label={t('close')}
          onClick={screen.close}
          sx={roundButton(44)}
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
              ...roundButton(44),
              ...(screen.flash && {
                backgroundColor: tokens.color.camFg,
                color: tokens.color.ink,
              }),
            }}
          >
            <FlashIcon size={20} />
          </Box>
        ) : null}
        <Typography
          component="h1"
          sx={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700 }}
        >
          {t('title', { mode: modeLabel.toLocaleLowerCase() })}
        </Typography>
        <Box
          component="button"
          type="button"
          aria-label={t('info.label')}
          onClick={() => setInfoOpen(true)}
          sx={roundButton(44)}
        >
          <InfoIcon size={20} />
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
        {screen.scanLanguageShown ? (
          <Box sx={{ mt: '16px', textAlign: 'center' }}>
            <ScanLanguageChip
              value={screen.scanLanguage}
              locale={screen.uiLocale}
              disabled={screen.scanLanguageLocked}
              onChange={screen.setScanLanguage}
            />
          </Box>
        ) : null}

        <Box sx={{ mt: '24px', textAlign: 'center', minHeight: 72 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {t(`hint.${screen.mode}`)}
          </Typography>
          <Typography
            sx={{ mt: '6px', fontSize: 13, color: tokens.color.cameraMuted }}
          >
            {t(`detail.${screen.mode}`)}
          </Typography>
          {screen.mode === 'receipt' ? (
            <>
              <Typography sx={{ mt: '6px', fontSize: 13 }}>
                {t('guide.receipt')}
              </Typography>
              <Typography sx={{ mt: '6px', fontSize: 13 }}>
                {t('guide.receiptFold')}
              </Typography>
            </>
          ) : null}
        </Box>

        <Box
          role="status"
          sx={{ minHeight: 24, textAlign: 'center', fontSize: 13 }}
        >
          {screen.reading
            ? screen.receiptSections.readingNumber !== null
              ? screen.photoQueue.total > 1
                ? t('sections.readingBatch', {
                    number: screen.photoQueue.number,
                    total: screen.photoQueue.total,
                  })
                : t('sections.reading', {
                    number: screen.receiptSections.readingNumber,
                  })
              : t('reading')
            : null}
          {screen.mode === 'receipt' &&
          !screen.reading &&
          !screen.cropping &&
          screen.photoQueue.waiting > 0
            ? t('sections.queued', { count: screen.photoQueue.waiting })
            : null}
          {screen.mode === 'receipt' &&
          screen.receiptSections.full &&
          !screen.receiptSections.deciding
            ? t('sections.full', { max: MAX_RECEIPT_SECTIONS })
            : null}
          {screen.camera.status === 'unavailable' ? t('noCamera') : null}
        </Box>
        {screen.error ? (
          <Box sx={{ mt: 1 }}>
            <Alert>{screen.error}</Alert>
          </Box>
        ) : null}
        {screen.notice ? (
          <Box sx={{ mt: 1 }}>
            <Alert severity="warning">{screen.notice}</Alert>
          </Box>
        ) : null}

        {screen.mode === 'receipt' ? (
          <ReceiptSections
            batch={screen.receiptSections}
            onFinish={screen.finishSections}
          />
        ) : null}

        {screen.plate.dishes ? (
          <DishPicker
            dishes={screen.plate.dishes}
            disabled={screen.reading}
            onPick={screen.plate.pick}
            onRetake={screen.plate.reset}
          />
        ) : null}

        <ModeDial
          mode={screen.mode}
          disabled={screen.modesDisabled || infoOpen}
          keysDisabled={
            screen.modesDisabled ||
            infoOpen ||
            screen.reading ||
            !!screen.cropping ||
            !!screen.plate.dishes
          }
          onChange={screen.setMode}
        />

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '44px',
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label={t('gallery')}
            disabled={screen.controlsDisabled}
            onClick={screen.openGallery}
            sx={roundButton(48)}
          >
            <GalleryIcon size={22} />
          </Box>
          <Box
            component="button"
            type="button"
            aria-label={t('shutter')}
            disabled={
              screen.controlsDisabled || screen.camera.status !== 'ready'
            }
            onClick={() => void screen.shoot()}
            sx={{
              width: 76,
              height: 76,
              boxSizing: 'border-box',
              borderRadius: '50%',
              border: '4px solid #FFFFFF',
              background: 'transparent',
              p: '5px',
              cursor: 'pointer',
              '&:disabled': { opacity: 0.5, cursor: 'default' },
              '&:focus-visible': {
                outline: `2px solid ${tokens.color.accentMid}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: tokens.color.camFg,
              }}
            />
          </Box>
          <Box
            component="button"
            type="button"
            aria-label={t('manual')}
            onClick={screen.addManually}
            sx={roundButton(48)}
          >
            <ManualEntryIcon size={22} />
          </Box>
        </Box>
      </Box>

      {screen.cropping ? (
        <ReceiptCropper
          key={screen.photoQueue.number}
          progress={
            screen.photoQueue.total > 1
              ? t('sections.photoOf', {
                  number: screen.photoQueue.number,
                  total: screen.photoQueue.total,
                })
              : undefined
          }
          photo={screen.cropping}
          onConfirm={screen.confirmCrop}
          onCancel={screen.cancelCrop}
        />
      ) : null}

      {infoOpen ? <InfoSheet onClose={closeInfo} /> : null}

      <Box
        component="input"
        ref={screen.fileInput}
        type="file"
        accept="image/*"
        multiple={screen.mode === 'receipt'}
        onChange={screen.pickFile}
        data-testid="gallery-input"
        sx={{ display: 'none' }}
      />
    </Box>
  );
}
