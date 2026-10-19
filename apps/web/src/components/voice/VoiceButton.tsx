import { Box, MicIcon, shadow, tokens } from '@pocket-pantry/ui';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { VoiceList } from '../../lib/voice';
import type { useVoiceNote } from '../../lib/useVoiceNote';
import { LanguageMenu } from './LanguageMenu';
import { ListeningCard } from './ListeningCard';
import { aboveButton, BUTTON_SIZE, buttonBottom } from './placement';

type Voice = ReturnType<typeof useVoiceNote>;

/** Whether the pointer has left the button's box (a drag off), with a small allowance for the finger. */
function outside(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return false;
  const slack = 12;
  return (
    event.clientX < box.left - slack ||
    event.clientX > box.right + slack ||
    event.clientY < box.top - slack ||
    event.clientY > box.bottom + slack
  );
}

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
  const busy = voice.sending;
  const active = voice.recording || voice.pressing;
  const progress = Math.min(1, voice.elapsedMs / 60_000);

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      void voice.press();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') voice.release();
  };

  return (
    <>
      {active ? (
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            pointerEvents: 'none',
            backgroundColor: `color-mix(in srgb, ${tokens.color.ink} 16%, transparent)`,
          }}
        />
      ) : null}
      {voice.tip ? (
        <Box
          role="status"
          sx={{
            position: 'fixed',
            right: 18,
            bottom: aboveButton(10),
            zIndex: 1250,
            px: '12px',
            py: '8px',
            borderRadius: '10px',
            backgroundColor: tokens.color.ink,
            color: tokens.color.bg,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {t('listening.tip')}
        </Box>
      ) : null}
      {active ? (
        <ListeningCard
          starting={!voice.recording}
          elapsedMs={voice.elapsedMs}
          target={target}
          scanLanguage={voice.scanLanguage}
          level={voice.level}
        />
      ) : null}
      <Box
        sx={{
          position: 'fixed',
          right: 18,
          bottom: buttonBottom,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <LanguageMenu
          value={voice.scanLanguage}
          disabled={active || busy}
          onChange={voice.setScanLanguage}
        />
        <Box
          component="button"
          type="button"
          aria-label={t('voiceButton.label')}
          aria-pressed={voice.recording}
          disabled={busy}
          onPointerDown={(event: PointerEvent<HTMLElement>) => {
            try {
              event.currentTarget.setPointerCapture?.(event.pointerId);
            } catch {
              // No active pointer to capture (e.g. a synthetic event).
            }
            void voice.press();
          }}
          onPointerUp={voice.release}
          onPointerCancel={voice.cancel}
          onPointerLeave={voice.cancel}
          onPointerMove={(event: PointerEvent<HTMLElement>) => {
            if (voice.recording && outside(event)) voice.cancel();
          }}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onContextMenu={(event: { preventDefault(): void }) =>
            event.preventDefault()
          }
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
            backgroundColor: voice.recording
              ? tokens.color.urgentFg
              : tokens.color.accent,
            color: 'primary.contrastText',
            boxShadow: shadow.float,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.6 : 1,
            transform: voice.recording ? 'scale(1.14)' : 'none',
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
          {voice.recording ? (
            <Box
              aria-hidden
              data-testid="progress-ring"
              sx={{
                position: 'absolute',
                inset: -7,
                borderRadius: '50%',
                pointerEvents: 'none',
                background: `conic-gradient(${tokens.color.urgentFg} 0 ${progress * 360}deg, color-mix(in srgb, ${tokens.color.urgentFg} 18%, transparent) 0)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
              }}
            />
          ) : null}
          <MicIcon size={27} />
        </Box>
      </Box>
    </>
  );
}
