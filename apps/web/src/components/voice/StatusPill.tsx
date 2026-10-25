import {
  Box,
  Button,
  ClockIcon,
  EarIcon,
  GatorImage,
  radius,
  shadow,
  MicOffIcon,
  WifiOffIcon,
  palette,
} from '@pocket-pantry/ui';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { failureReason } from './failureReason';
import { formatClock } from '../../lib/voice';
import type { useVoiceNote } from '../../lib/useVoiceNote';
import { useVoiceNoteState } from '../../lib/voiceNote';
import { usePreferredSpokenLanguage } from '../../lib/usePreferredSpokenLanguage';
import { useVoiceHost } from './VoiceHost';
import { pillBottom, VOICE_LAYER } from '../../lib/voicePlacement';
import { enter } from './enter';
import { VOICE_PILL_ATTRIBUTE } from '../../lib/voiceFocus';

/** One line each, so the pill holds its PILL_HEIGHT; the full text stays in the DOM and the title. */
const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

type Voice = ReturnType<typeof useVoiceNote>;

type Look = {
  icon: ReactNode;
  /** Gator's own picture, drawn without the round badge the other icons sit in. */
  plain?: boolean;
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
  const { t } = useTranslation(['voice', 'errors']);
  const { spokenLanguage } = usePreferredSpokenLanguage();
  const { phase, error, rawError, recording, voiceCap } = useVoiceNoteState();
  const host = useVoiceHost();

  const look = ((): Look | null => {
    if (phase === 'reading') {
      return {
        // The title beside Gator says "Gator's reading your note…", so the image is decorative.
        icon: <GatorImage mood="thinking" size={52} decorative />,
        bg: palette('pp-accentTint'),
        fg: palette('pp-accentOnTint'),
        title: t('send.reading'),
        hint: t('send.readingMeta', {
          duration: formatClock(recording?.durationMs ?? 0),
          language: t(
            `settings:languageNames.${recording?.spokenLanguage ?? spokenLanguage}`,
          ),
        }),
        plain: true,
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
    const ok = (
      <Button variant="primary" size="sm" shape="pill" onClick={voice.dismiss}>
        {t('send.ok')}
      </Button>
    );
    // Nothing was kept (too long, unsupported): Discard only closes, with no "discarded" toast.
    const close = (
      <Button variant="primary" size="sm" shape="pill" onClick={voice.dismiss}>
        {t('send.discard')}
      </Button>
    );
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
    const reason = failureReason(t, error, rawError, voiceCap?.cap ?? 0);
    if (!reason) return null;
    const { title, hint } = reason;
    const failed = (canRetry: boolean): Look => ({
      icon: <WifiOffIcon size={17} />,
      bg: palette('warning-light'),
      fg: palette('warning-main'),
      title,
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
        return failed(recording !== undefined);
      case 'unavailable':
        // This browser cannot record at all: nothing to retry, only to close.
        return {
          ...failed(false),
          icon: <MicOffIcon size={17} />,
          actions: ok,
        };
      case 'tooLong':
      case 'unsupported':
        return { ...failed(false), actions: close };
      case 'nothingHeard':
        return {
          icon: <EarIcon size={17} />,
          bg: palette('pp-accentTint'),
          fg: palette('pp-accentOnTint'),
          title,
          hint,
          urgent: false,
          actions: null,
        };
      case 'capReached':
        return {
          icon: <ClockIcon size={17} />,
          bg: palette('error-light'),
          fg: palette('error-main'),
          title,
          hint,
          urgent: true,
          actions: ok,
        };
      default:
        return null;
    }
  })();
  if (!look) return null;

  return createPortal(
    <Box
      // A fresh node per state, so a status that becomes an alert is announced.
      key={phase === 'reading' ? 'reading' : error}
      role={look.urgent ? 'alert' : 'status'}
      {...{ [VOICE_PILL_ATTRIBUTE]: '' }}
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: pillBottom,
        mx: 'auto',
        maxWidth: 420,
        zIndex: VOICE_LAYER.card,
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
        sx={
          look.plain
            ? { flex: 'none', display: 'flex', alignItems: 'center' }
            : {
                width: 30,
                height: 30,
                flex: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: look.bg,
                color: look.fg,
              }
        }
      >
        {look.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          title={look.title}
          sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}
        >
          {look.title}
        </Box>
        <Box
          title={look.hint}
          sx={{ fontSize: 12, color: 'text.secondary', ...oneLine }}
        >
          {look.hint}
        </Box>
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
