import { Box, color, radius, shadow, Typography } from '@pocket-pantry/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { aboveMic, VOICE_LAYER } from '../../lib/voicePlacement';
import { VOICE_BUTTON_ATTRIBUTE } from '../../lib/voiceFocus';

/** How long the callout stays up when nobody touches anything, ms. */
export const MIC_TEACH_MS = 4800;

/**
 * "Hold the mic, talk, let go": the callout over the lit mic. It never records by itself. It clears
 * after 4.8 s, on a tap outside the capsule, or when the mic is pressed (the normal Voice Note flow
 * takes over); the Dock's tabs and camera stay usable throughout.
 */
export function MicTeachCallout({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('voice');
  useEffect(() => {
    const timer = window.setTimeout(onDone, MIC_TEACH_MS);
    const onPointerDown = (event: Event) => {
      const target = event.target as Element | null;
      const inCapsule = target?.closest('[data-dock-capsule]') != null;
      const onMic = target?.closest(`[${VOICE_BUTTON_ATTRIBUTE}]`) != null;
      if (!inCapsule || onMic) onDone();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [onDone]);
  return (
    <Box
      role="status"
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        mx: 'auto',
        width: 260,
        maxWidth: 'calc(100% - 32px)',
        boxSizing: 'border-box',
        bottom: aboveMic(56),
        zIndex: VOICE_LAYER.card,
        px: '14px',
        py: '10px',
        textAlign: 'center',
        pointerEvents: 'none',
        borderRadius: radius.card,
        backgroundColor: color.cardBg,
        boxShadow: shadow.float,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: -6,
          width: 12,
          height: 12,
          backgroundColor: color.cardBg,
          transform: 'translateX(-50%) rotate(45deg)',
        },
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
        {t('teach.title')}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
        {t('teach.line')}
      </Typography>
    </Box>
  );
}
