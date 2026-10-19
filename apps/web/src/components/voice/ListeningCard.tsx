import { Box, radius, shadow, tokens } from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanLanguage } from '../../i18n/resources';
import type { VoiceList } from '../../lib/voice';
import { aboveButton } from './placement';

const BARS = 30;
const METER_MS = 90;

const formatElapsed = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const enter = {
  animation: 'pp-voice-card-in 200ms cubic-bezier(.2,.8,.2,1)',
  '@keyframes pp-voice-card-in': {
    from: { opacity: 0, transform: 'translateY(8px) scale(.98)' },
    to: { opacity: 1, transform: 'none' },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

const blink = {
  animation: 'pp-voice-blink 1.1s ease-in-out infinite',
  '@keyframes pp-voice-blink': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.25 },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

type Props = {
  /** The pointer is down but the stream is not live yet. */
  starting: boolean;
  elapsedMs: number;
  target: VoiceList;
  scanLanguage: ScanLanguage;
  /** The current input loudness, 0 to 1. */
  level: () => number;
};

/** The card above the button while a Voice Note is being recorded. */
export function ListeningCard({
  starting,
  elapsedMs,
  target,
  scanLanguage,
  level,
}: Props) {
  const { t } = useTranslation('voice');
  const [bars, setBars] = useState<number[]>(() => Array(BARS).fill(0));

  // Newest on the right: the meter scrolls left.
  useEffect(() => {
    if (starting) return;
    const id = setInterval(
      () => setBars((was) => [...was.slice(1), level()]),
      METER_MS,
    );
    return () => clearInterval(id);
  }, [starting, level]);

  return (
    <Box
      role="status"
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: aboveButton(22),
        mx: 'auto',
        maxWidth: 420,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        p: '14px 16px 13px',
        backgroundColor: tokens.color.surface,
        color: tokens.color.ink,
        borderRadius: radius.card,
        boxShadow: shadow.float,
        ...enter,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <Box
          component="span"
          aria-hidden
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: tokens.color.urgentFg,
            ...blink,
          }}
        />
        <Box component="span" sx={{ fontSize: 15, fontWeight: 700, flex: 1 }}>
          {starting ? t('listening.starting') : t('listening.title')}
        </Box>
        {starting ? null : (
          <>
            <Box
              component="span"
              sx={{
                fontSize: 22,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatElapsed(elapsedMs)}
            </Box>
            <Box
              component="span"
              sx={{ fontSize: 12, fontWeight: 600, color: tokens.color.muted }}
            >
              {t('listening.of')}
            </Box>
          </>
        )}
      </Box>
      <Box
        aria-hidden
        data-testid="level-meter"
        sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 38 }}
      >
        {bars.map((value, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              borderRadius: '2px',
              backgroundColor: tokens.color.urgentFg,
              transition: 'height 90ms linear',
            }}
            style={{ height: 3 + Math.min(1, Math.max(0, value)) * 35 }}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px 8px',
          fontSize: 12.5,
          color: tokens.color.muted,
        }}
      >
        <Box
          component="span"
          sx={{
            px: '8px',
            py: '2px',
            borderRadius: radius.chip,
            backgroundColor: tokens.color.chipNeutral,
            color: tokens.color.ink,
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          {scanLanguage.toUpperCase()}
        </Box>
        <span>{t('listening.hint')}</span>
        <Box sx={{ flexBasis: '100%' }}>
          {target === 'pantry'
            ? t('listening.toPantry')
            : t('listening.toShopping')}
        </Box>
      </Box>
    </Box>
  );
}
