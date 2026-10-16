import {
  Alert,
  Box,
  Button,
  Sheet,
  Stack,
  Typography,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { VoiceReview } from './VoiceReview';
import { ScanLanguageChip } from '../pages/Scan/components/ScanLanguageChip';
import { useVoiceConfigured, type VoiceList } from '../lib/voice';
import { useVoiceNote } from '../lib/useVoiceNote';

const formatElapsed = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

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
 * Voice Notes on the Shopping List: a hold-to-talk button carrying the Scan Language chip,
 * its notices, and the Review sheet that shows "What I heard". Hidden until the server says
 * transcription is configured.
 */
export function VoiceNote({
  defaultTarget = 'shopping',
}: {
  /** The list the page this sits on acts on. */
  defaultTarget?: VoiceList;
}) {
  const configured = useVoiceConfigured();
  if (!configured) return null;
  return <VoiceNoteControls defaultTarget={defaultTarget} />;
}

function VoiceNoteControls({ defaultTarget }: { defaultTarget: VoiceList }) {
  const { t } = useTranslation(['voice', 'scan', 'common']);
  const voice = useVoiceNote(defaultTarget);
  const busy = voice.sending;

  const label = voice.recording
    ? t('voice:button.release')
    : voice.sending
      ? t('voice:button.sending')
      : t('voice:button.label');

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
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box
          component="button"
          type="button"
          aria-label={t('voice:button.label')}
          disabled={busy}
          onPointerDown={() => void voice.press()}
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
            flex: 1,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 0,
            borderRadius: radius.pill,
            font: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.6 : 1,
            backgroundColor: voice.recording
              ? tokens.color.urgentBg
              : tokens.color.surface,
            color: voice.recording ? tokens.color.urgentFg : tokens.color.ink,
            boxShadow: `inset 0 0 0 1px ${tokens.color.line}`,
            // A held press must not scroll, select or open the context menu.
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
          }}
        >
          <MicIcon />
          {label}
        </Box>
        <ScanLanguageChip
          variant="surface"
          value={voice.scanLanguage}
          locale={voice.locale}
          disabled={voice.recording || busy}
          onChange={voice.setScanLanguage}
        />
      </Box>

      {voice.recording ? (
        <Box
          role="status"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: tokens.color.muted,
            fontSize: 14,
          }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: tokens.color.urgentBg,
            }}
          />
          <span>{t('voice:recording.label')}</span>
          <span>{formatElapsed(voice.elapsedMs)}</span>
          <span>· {t('voice:recording.cancelHint')}</span>
        </Box>
      ) : null}

      {voice.notice ? (
        <Alert>
          <Stack spacing={1}>
            <span>
              {voice.notice.kind === 'failed'
                ? voice.notice.message
                : voice.notice.kind === 'denied'
                  ? `${t('voice:denied.title')} ${t('voice:denied.body')}`
                  : voice.notice.kind === 'unavailable'
                    ? t('voice:unavailable')
                    : voice.notice.kind === 'tooShort'
                      ? t('voice:tooShort')
                      : t('voice:nothingHeard')}
            </span>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              {voice.notice.kind === 'failed' && voice.notice.canRetry ? (
                <Button onClick={voice.retry}>{t('voice:retry')}</Button>
              ) : null}
              <Button onClick={voice.dismiss}>{t('voice:dismiss')}</Button>
            </Box>
          </Stack>
        </Alert>
      ) : null}

      <Sheet
        open={voice.explaining}
        onClose={voice.dismissExplainer}
        label={t('voice:explainer.title')}
        size="content"
      >
        <Stack spacing={2}>
          <Typography variant="h2">{t('voice:explainer.title')}</Typography>
          <Typography>{t('voice:explainer.body')}</Typography>
          <Button onClick={() => void voice.allowMicrophone()}>
            {t('voice:explainer.allow')}
          </Button>
          <Button onClick={voice.dismissExplainer}>
            {t('voice:explainer.notNow')}
          </Button>
        </Stack>
      </Sheet>

      <VoiceReview />
    </Stack>
  );
}
