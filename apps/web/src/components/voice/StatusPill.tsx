import {
  Box,
  Button,
  ClockIcon,
  EarIcon,
  radius,
  shadow,
  Spinner,
  tokens,
  WifiOffIcon,
} from '@pocket-pantry/ui';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { formatClock } from '../../lib/voice';
import { NOTHING_HEARD_MS, type useVoiceNote } from '../../lib/useVoiceNote';
import { useVoiceNoteState } from '../../lib/voiceNoteStore';
import { useVoiceHost } from './VoiceHost';
import { aboveButton } from './placement';

type Voice = ReturnType<typeof useVoiceNote>;
const { color } = tokens;

const enter = {
  animation: 'pp-voice-pill-in 200ms cubic-bezier(.2,.8,.2,1)',
  '@keyframes pp-voice-pill-in': {
    from: { opacity: 0, transform: 'translateY(8px) scale(.98)' },
    to: { opacity: 1, transform: 'none' },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

type Look = {
  icon: ReactNode;
  bg: string;
  fg: string;
  title: string;
  hint: string;
  /** Failure and the Voice Cap interrupt; reading and nothing heard are polite. */
  urgent: boolean;
  actions: ReactNode;
};

/**
 * The pill where the Listening card was: reading the note, a send that failed, nothing heard,
 * the Voice Cap. The page stays usable underneath.
 */
export function StatusPill({ voice }: { voice: Voice }) {
  const { t } = useTranslation('voice');
  const { phase, error, errorMessage, recording, voiceCap } =
    useVoiceNoteState();
  const host = useVoiceHost();
  const nothing = phase === 'failed' && error === 'nothingHeard';

  useEffect(() => {
    if (!nothing) return;
    const id = setTimeout(voice.dismiss, NOTHING_HEARD_MS);
    return () => clearTimeout(id);
  }, [nothing, voice.dismiss]);

  const look = ((): Look | null => {
    if (phase === 'reading') {
      return {
        icon: <Spinner label={t('send.reading')} />,
        bg: color.accentTint,
        fg: color.accentOnTint,
        title: t('send.reading'),
        hint: t('send.readingMeta', {
          duration: formatClock(recording?.seconds ?? 0),
          language: t(
            `settings:languageNames.${recording?.scanLanguage ?? 'en'}`,
          ),
        }),
        urgent: false,
        actions: (
          <Button
            variant="secondary"
            size="sm"
            shape="pill"
            onClick={voice.cancelReading}
          >
            {t('send.cancel')}
          </Button>
        ),
      };
    }
    if (phase !== 'failed') return null;
    const discard = (
      <Button
        variant="secondary"
        size="sm"
        shape="pill"
        onClick={voice.discardFailed}
      >
        {t('send.discard')}
      </Button>
    );
    const failed = (hint: string, canRetry: boolean): Look => ({
      icon: <WifiOffIcon size={17} />,
      bg: color.soonBg,
      fg: color.soonFg,
      title: t('send.failed'),
      hint,
      urgent: true,
      actions: (
        <>
          {discard}
          {canRetry ? (
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              onClick={voice.retry}
            >
              {t('send.retry')}
            </Button>
          ) : null}
        </>
      ),
    });
    switch (error) {
      case 'failed':
        return failed(errorMessage ?? t('send.failedHint'), voice.kept);
      case 'tooLong':
        return { ...failed(t('send.tooLong'), false), title: t('send.failed') };
      case 'unsupported':
        return {
          ...failed(t('send.unsupported'), false),
          title: t('send.failed'),
        };
      case 'nothingHeard':
        return {
          icon: <EarIcon size={17} />,
          bg: color.accentTint,
          fg: color.accentOnTint,
          title: t('send.nothing'),
          hint: t('send.nothingHint'),
          urgent: false,
          actions: null,
        };
      case 'capReached':
        return {
          icon: <ClockIcon size={17} />,
          bg: color.urgentBg,
          fg: color.urgentFg,
          title: t('send.cap', { cap: voiceCap?.cap ?? 0 }),
          hint: t('send.capHint'),
          urgent: true,
          actions: (
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              onClick={voice.dismiss}
            >
              {t('send.ok')}
            </Button>
          ),
        };
      default:
        return null;
    }
  })();
  if (!look) return null;

  return createPortal(
    <Box
      role={look.urgent ? 'alert' : 'status'}
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: aboveButton(22),
        mx: 'auto',
        maxWidth: 420,
        zIndex: 1250,
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        p: '11px 12px 11px 14px',
        backgroundColor: 'pp.cardBg',
        color: 'text.primary',
        borderRadius: radius.control,
        boxShadow: shadow.float,
        ...enter,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 30,
          height: 30,
          flex: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: look.bg,
          color: look.fg,
          // The spinner is 18 pt in the 30 pt circle.
          '& .MuiCircularProgress-root': {
            width: '18px !important',
            height: '18px !important',
            color: 'inherit',
          },
        }}
      >
        {look.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{look.title}</Box>
        <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{look.hint}</Box>
      </Box>
      {look.actions ? (
        <Box sx={{ display: 'flex', gap: '8px', flex: 'none' }}>
          {look.actions}
        </Box>
      ) : null}
    </Box>,
    host,
  );
}
