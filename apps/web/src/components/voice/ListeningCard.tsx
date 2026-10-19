import {
  Box,
  CloseIcon,
  color,
  palette,
  radius,
  shadow,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanLanguage } from '../../i18n/resources';
import type { VoiceList } from '../../lib/voice';
import { aboveButton } from './placement';
import { MAX_VOICE_NOTE_MS } from '../../lib/voice';

/** From here the time turns amber and counts down. */
const SOON_MS = 50_000;
/** The last stretch announced to a screen reader, "10 seconds left". */
const ANNOUNCE_MS = 50_000;

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
  /** Letting go now would cancel (the pointer is far outside the button). */
  armed?: boolean;
};

/** The card above the button while a Voice Note is being recorded. */
export function ListeningCard({
  starting,
  elapsedMs,
  target,
  scanLanguage,
  level,
  armed = false,
}: Props) {
  const { t } = useTranslation('voice');
  const [bars, setBars] = useState<number[]>(() => Array(BARS).fill(0));

  // Newest on the right: the meter scrolls left.
  useEffect(() => {
    if (starting) return;
    const id = setInterval(
      () => setBars((was) => [...was.slice(1), armed ? 0 : level()]),
      METER_MS,
    );
    return () => clearInterval(id);
  }, [starting, armed, level]);

  const soon = elapsedMs >= SOON_MS;
  const left = Math.max(0, Math.ceil((MAX_VOICE_NOTE_MS - elapsedMs) / 1000));
  // What a screen reader hears, once per change: never the ticking time.
  const announcement = starting
    ? ''
    : armed
      ? t('listening.cancelArmed')
      : elapsedMs >= ANNOUNCE_MS
        ? t('listening.tenLeft')
        : t('listening.recording');

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
        p: '14px 16px 13px',
        backgroundColor: armed ? 'pp.subtle' : 'pp.cardBg',
        color: 'text.primary',
        borderRadius: radius.card,
        boxShadow: shadow.float,
        ...enter,
      }}
    >
      <Box
        aria-hidden
        sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          {armed ? (
            <Box
              component="span"
              data-testid="cancel-mark"
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'text.primary',
                color: 'pp.cardBg',
              }}
            >
              <CloseIcon size={14} />
            </Box>
          ) : (
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: color.rec,
                ...blink,
              }}
            />
          )}
          <Box component="span" sx={{ fontSize: 15, fontWeight: 700, flex: 1 }}>
            {starting
              ? t('listening.starting')
              : armed
                ? t('listening.cancelArmed')
                : t('listening.title')}
          </Box>
          {starting ? null : (
            <>
              <Box
                component="span"
                data-testid="elapsed"
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: soon && !armed ? palette('warning-main') : 'inherit',
                }}
              >
                {formatElapsed(elapsedMs)}
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    soon && !armed ? palette('warning-main') : 'text.secondary',
                }}
              >
                {soon
                  ? t('listening.left', { count: left })
                  : t('listening.of')}
              </Box>
            </>
          )}
        </Box>
        <Box
          data-testid="level-meter"
          sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 38 }}
        >
          {bars.map((value, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                borderRadius: radius.box,
                backgroundColor: armed ? color.lineStrong : color.rec,
                transition: 'height 90ms linear',
              }}
              style={{
                height: armed ? 3 : 3 + Math.min(1, Math.max(0, value)) * 35,
              }}
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
            color: 'text.secondary',
          }}
        >
          <Box
            component="span"
            sx={{
              px: '8px',
              py: '2px',
              borderRadius: radius.chip,
              backgroundColor: 'pp.chip',
              color: 'text.primary',
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            {scanLanguage.toUpperCase()}
          </Box>
          <span>{armed ? t('listening.slideBack') : t('listening.hint')}</span>
          <Box sx={{ flexBasis: '100%' }}>
            {target === 'pantry'
              ? t('listening.toPantry')
              : t('listening.toShopping')}
          </Box>
        </Box>
      </Box>
      <Box component="span" sx={visuallyHidden}>
        {announcement}
      </Box>
    </Box>
  );
}
