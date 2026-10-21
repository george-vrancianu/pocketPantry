import {
  Box,
  color,
  MicIcon,
  MicOffIcon,
  palette,
  radius,
  shadow,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { useId } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MAX_VOICE_NOTE_MS, type VoiceList } from '../../lib/voice';
import type { useVoiceNote } from '../../lib/useVoiceNote';
import { usePressGesture } from '../../lib/usePressGesture';
import { LanguageMenu } from './LanguageMenu';
import { useVoiceHost } from './VoiceHost';
import { ListeningCard } from './ListeningCard';
import { useElapsedMs } from './useElapsed';
import {
  abovePill,
  aboveButton,
  BUTTON_SIZE,
  buttonBottom,
  VOICE_LAYER,
} from '../../lib/voicePlacement';
import { isPillUp, useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { VOICE_BUTTON_ATTRIBUTE } from '../../lib/voiceFocus';

type Voice = ReturnType<typeof useVoiceNote>;

/**
 * The round hold-to-talk button bottom-right above the Dock (handoff variant B), with the Scan
 * Language chip to its left, the page scrim, the progress ring and the Listening card.
 */
export function VoiceButton({
  voice,
  target,
}: {
  voice: Voice;
  target: VoiceList;
}) {
  const { t } = useTranslation('voice');
  const active = voice.recording || voice.pressing;
  // While the status pill is up (reading, a failure) the tip must not cover its buttons.
  const { phase, startedAt } = useVoiceNoteState();
  const pillUp = isPillUp(phase);

  const host = useVoiceHost();
  const destinationId = useId();
  const blockedId = useId();
  const { armed, buttonProps } = usePressGesture({
    active,
    start: () => void voice.press(),
    send: voice.release,
    cancel: voice.cancel,
  });

  return createPortal(
    <>
      {active ? (
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: VOICE_LAYER.scrim,
            pointerEvents: 'none',
            backgroundColor: `color-mix(in srgb, ${palette('text-primary')} 16%, transparent)`,
          }}
        />
      ) : null}
      {voice.tip ? (
        <Box
          role="status"
          sx={{
            position: 'fixed',
            right: 18,
            bottom: pillUp ? abovePill : aboveButton(10),
            zIndex: VOICE_LAYER.card,
            // A hint, never a target: taps reach whatever is under it.
            pointerEvents: 'none',
            px: '12px',
            py: '8px',
            borderRadius: radius.control,
            backgroundColor: 'pp.toastBg',
            color: 'pp.toastInk',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {voice.tip === 'busy'
            ? t('send.tipBusy')
            : voice.tip === 'failed'
              ? t('send.tipFailed')
              : t('listening.tip')}
        </Box>
      ) : null}
      {active ? (
        <ListeningCard
          starting={!voice.recording}
          startedAt={startedAt}
          target={target}
          scanLanguage={voice.scanLanguage}
          level={voiceNote.level}
          armed={armed}
        />
      ) : null}
      <Box
        sx={{
          position: 'fixed',
          right: 18,
          bottom: buttonBottom,
          zIndex: VOICE_LAYER.button,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <LanguageMenu
          value={voice.scanLanguage}
          disabled={active || voice.sending}
          onChange={voice.setScanLanguage}
        />
        <Box component="span" id={destinationId} hidden sx={visuallyHidden}>
          {target === 'pantry'
            ? t('listening.toPantry')
            : t('listening.toShopping')}
        </Box>
        <Box component="span" id={blockedId} hidden sx={visuallyHidden}>
          {t('voiceButton.blocked')}
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={t('voiceButton.label')}
          {...{ [VOICE_BUTTON_ATTRIBUTE]: '' }}
          aria-pressed={voice.recording}
          aria-describedby={
            voice.mic.blocked ? `${destinationId} ${blockedId}` : destinationId
          }
          {...buttonProps}
          sx={{
            position: 'relative',
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            border: 0,
            borderRadius: '50%',
            backgroundColor: armed
              ? `color-mix(in srgb, ${palette('text-primary')} 55%, ${color.cardBg})`
              : active
                ? color.rec
                : 'pp.accent',
            color: active ? 'pp.cardBg' : 'pp.accentInk',
            boxShadow: shadow.float,
            cursor: 'pointer',
            // The Voice Cap is used up, or the microphone is blocked: the press shows why.
            opacity: voice.capped || voice.mic.blocked ? 0.55 : 1,
            transform: armed ? 'scale(.9)' : active ? 'scale(1.14)' : 'none',
            transition:
              'transform 180ms cubic-bezier(.2,.8,.2,1), background-color 180ms cubic-bezier(.2,.8,.2,1)',
            // A held press must not scroll, select or open the context menu.
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'background-color 180ms',
              transform: 'none',
            },
          }}
        >
          {voice.recording ? <ProgressRing startedAt={startedAt} /> : null}
          {voice.mic.blocked ? <MicOffIcon size={27} /> : <MicIcon size={27} />}
          {voice.kept ? (
            <Box
              aria-hidden
              data-testid="failed-dot"
              component="span"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: palette('warning-main'),
                border: `2px solid ${color.cardBg}`,
                boxSizing: 'content-box',
              }}
            />
          ) : null}
        </Box>
      </Box>
    </>,
    host,
  );
}

/** The ring around the button that fills over the 60 seconds, on its own clock. */
function ProgressRing({ startedAt }: { startedAt?: number }) {
  const progress = Math.min(1, useElapsedMs(startedAt) / MAX_VOICE_NOTE_MS);
  return (
    <Box
      aria-hidden
      data-testid="progress-ring"
      sx={{
        position: 'absolute',
        inset: -7,
        borderRadius: '50%',
        pointerEvents: 'none',
        background: `conic-gradient(${color.rec} 0 ${progress * 360}deg, color-mix(in srgb, ${color.rec} 18%, transparent) 0)`,
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), currentColor calc(100% - 3px))',
        WebkitMask:
          'radial-gradient(farthest-side, transparent calc(100% - 4px), currentColor calc(100% - 3px))',
      }}
    />
  );
}
