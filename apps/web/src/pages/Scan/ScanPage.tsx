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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_RECEIPT_SECTIONS } from '../../lib/receiptSections';
import { SCAN_MODES } from '../../lib/scan';
import { glassControl, glassFocusRing } from './components/glass';
import { DishPicker } from './components/DishPicker';
import { ScanLanguageChip } from './components/ScanLanguageChip';
import { ReceiptCropper } from './components/ReceiptCropper';
import { ReceiptSections } from './components/ReceiptSections';
import { Viewfinder } from './components/Viewfinder';
import { useScanScreen } from './hooks/useScanScreen';

const roundButton = (size: number, disabled: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: size,
  height: size,
  borderRadius: '50%',
  border: 0,
  ...glassControl(disabled),
  '&:focus-visible': glassFocusRing,
});

/** The dark camera screen (handoff section 7). */
export function ScanPage() {
  const { t } = useTranslation('scan');
  const screen = useScanScreen();
  const modeLabel = t(`mode.${screen.mode}`);
  const [infoOpen, setInfoOpen] = useState(false);

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
        px: 2.5,
        pt: 'calc(22px + env(safe-area-inset-top))',
        pb: 'calc(16px + env(safe-area-inset-bottom))',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label={t('close')}
          onClick={screen.close}
          sx={roundButton(44, false)}
        >
          <CloseIcon size={20} />
        </Box>
        <Typography component="h1" sx={{ fontSize: 15, fontWeight: 700 }}>
          {t('title', { mode: modeLabel.toLocaleLowerCase() })}
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          {screen.camera.torchSupported ? (
            <Box
              component="button"
              type="button"
              aria-label={t('flash')}
              aria-pressed={screen.flash}
              onClick={() => void screen.toggleFlash()}
              sx={{
                ...roundButton(44, false),
                ...(screen.flash && {
                  backgroundColor: tokens.color.camFg,
                  color: tokens.color.ink,
                }),
              }}
            >
              <FlashIcon size={20} />
            </Box>
          ) : null}
          <Box
            component="button"
            type="button"
            aria-label={t('info.label')}
            onClick={() => setInfoOpen(true)}
            sx={roundButton(44, false)}
          >
            <InfoIcon size={20} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: '40px' }}>
        <Viewfinder
          videoRef={screen.camera.videoRef}
          scanning={screen.reading}
          receiptGuide={screen.mode === 'receipt'}
        />
      </Box>

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

      <Box
        role="group"
        aria-label={t('modes')}
        sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: '6px' }}
      >
        {SCAN_MODES.map((mode) => {
          const active = mode === screen.mode;
          return (
            <Box
              key={mode}
              component="button"
              type="button"
              aria-pressed={active}
              disabled={screen.modesDisabled}
              onClick={() => screen.setMode(mode)}
              sx={{
                height: 40,
                px: '14px',
                borderRadius: '20px',
                border: 0,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                cursor: 'pointer',
                '&:disabled': { opacity: 0.5, cursor: 'default' },
                backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.10)',
                color: active ? tokens.color.ink : '#D5DED8',
              }}
            >
              {t(`mode.${mode}`)}
            </Box>
          );
        })}
      </Box>

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
          sx={roundButton(48, screen.controlsDisabled)}
        >
          <GalleryIcon size={22} />
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={t('shutter')}
          disabled={screen.controlsDisabled || screen.camera.status !== 'ready'}
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
              backgroundColor: '#FFFFFF',
            }}
          />
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={t('manual')}
          onClick={screen.addManually}
          sx={roundButton(48, false)}
        >
          <ManualEntryIcon size={22} />
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

      {infoOpen ? (
        <Box
          data-testid="info-scrim"
          onClick={() => setInfoOpen(false)}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <Box
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-info-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.key === 'Escape' && setInfoOpen(false)}
            sx={{
              width: '100%',
              p: 3,
              pb: 'calc(24px + env(safe-area-inset-bottom))',
              borderRadius: '24px 24px 0 0',
              backgroundColor: tokens.color.cameraSurface,
              color: tokens.color.camFg,
            }}
          >
            <Typography
              id="scan-info-title"
              component="h2"
              sx={{ fontSize: 18, fontWeight: 700 }}
            >
              {t('info.title')}
            </Typography>
            <Typography
              sx={{ mt: 1, fontSize: 14, color: tokens.color.camDim }}
            >
              {t('info.body')}
            </Typography>
            <Box
              component="button"
              type="button"
              autoFocus
              onClick={() => setInfoOpen(false)}
              sx={{
                mt: 2,
                height: 44,
                width: '100%',
                border: 0,
                borderRadius: '22px',
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: tokens.color.camAccent,
                color: tokens.color.camAccentInk,
                '&:focus-visible': glassFocusRing,
              }}
            >
              {t('info.dismiss')}
            </Box>
          </Box>
        </Box>
      ) : null}

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
