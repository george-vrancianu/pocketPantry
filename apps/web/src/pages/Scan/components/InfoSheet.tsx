import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { glassFocusRing } from './glass';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]';

/**
 * The Info bottom sheet over the camera. Tab stays inside it, Escape or a scrim tap closes it,
 * and focus goes back to whatever opened it.
 */
export function InfoSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('scan');
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(sheet.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return onClose();
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = sheet.current?.contains(active);
      if (!inside || (event.shiftKey ? active === first : active === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <Box
      data-testid="info-scrim"
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        backgroundColor: tokens.color.camScrim,
      }}
    >
      <Box
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-info-title"
        onClick={(event) => event.stopPropagation()}
        sx={{
          width: '100%',
          p: 3,
          pt: 1.5,
          pb: 'calc(24px + env(safe-area-inset-bottom))',
          borderRadius: '28px 28px 0 0',
          backgroundColor: tokens.color.camGlassStrong,
          backdropFilter: 'blur(14px)',
          color: tokens.color.camFg,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 36,
            height: 4,
            mx: 'auto',
            mb: 2,
            borderRadius: 2,
            backgroundColor: tokens.color.camDim,
          }}
        />
        <Typography
          id="scan-info-title"
          component="h2"
          sx={{ fontSize: 18, fontWeight: 700 }}
        >
          {t('info.title')}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: tokens.color.camDim }}>
          {t('info.body')}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={onClose}
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
  );
}
