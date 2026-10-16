import { Box, Typography, tokens, radius } from '@pocket-pantry/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SCAN_MODES } from '../../../lib/scan';
import { glassFocusRing, shade, translucent } from './glass';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
        backgroundColor: shade(45),
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
          borderRadius: `${radius.card} ${radius.card} 0 0`,
          backgroundColor: translucent(tokens.color.surface, 82),
          backdropFilter: 'blur(14px)',
          color: tokens.color.ink,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 36,
            height: 4,
            mx: 'auto',
            mb: 2,
            borderRadius: radius.pill,
            backgroundColor: tokens.color.muted,
          }}
        />
        <Typography
          id="scan-info-title"
          component="h2"
          sx={{ fontSize: 18, fontWeight: 700 }}
        >
          {t('info.title')}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: tokens.color.muted }}>
          {t('info.body')}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: tokens.color.muted }}>
          {t('info.dial')}
        </Typography>
        <Box
          component="ul"
          sx={{ mt: 1.5, mb: 0, p: 0, listStyle: 'none', fontSize: 14 }}
        >
          {SCAN_MODES.map((mode) => (
            <Box component="li" key={mode} sx={{ mt: 0.75 }}>
              <strong>{t(`mode.${mode}`)}</strong>{' '}
              <Box component="span" sx={{ color: tokens.color.muted }}>
                {t(`detail.${mode}`)}
              </Box>
              {mode === 'receipt'
                ? (['guide.receipt', 'guide.receiptFold'] as const).map(
                    (key) => (
                      <Box
                        key={key}
                        sx={{ mt: 0.5, color: tokens.color.muted }}
                      >
                        {t(key)}
                      </Box>
                    ),
                  )
                : null}
            </Box>
          ))}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          sx={{
            mt: 2,
            height: 44,
            width: '100%',
            border: 0,
            borderRadius: radius.pill,
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: tokens.color.accent,
            color: tokens.color.bg,
            '&:focus-visible': glassFocusRing,
          }}
        >
          {t('info.dismiss')}
        </Box>
      </Box>
    </Box>
  );
}
