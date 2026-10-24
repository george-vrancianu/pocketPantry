import { Box, Button, GatorImage, radius, shadow } from '@pocket-pantry/ui';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { isStripUp, useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { pillBottom, VOICE_LAYER } from '../../lib/voicePlacement';
import { VOICE_PILL_ATTRIBUTE } from '../../lib/voiceFocus';
import { enter } from './enter';
import { useVoiceHost } from './VoiceHost';

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/**
 * The Voice Inbox strip, where the status pill was: Gator, how many Voice Notes there are, what
 * state they are in, and Review when exactly one is ready. Tapping it opens the oldest ready note.
 * Hidden while recording, while a sheet or a failure is up, and when nothing is being read or ready.
 */
export function VoiceInboxStrip() {
  const { t } = useTranslation('voice');
  const state = useVoiceNoteState();
  const host = useVoiceHost();
  if (!isStripUp(state)) return null;
  const { reading, ready, failed } = state.inbox;
  const total = reading + ready + failed;
  const summary = [
    reading > 0 ? t('inbox.reading', { count: reading }) : null,
    ready > 0 ? t('inbox.ready', { count: ready }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return createPortal(
    <Box
      {...{ [VOICE_PILL_ATTRIBUTE]: '' }}
      onClick={() => voiceNote.openReady()}
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
        cursor: ready > 0 ? 'pointer' : 'default',
        ...enter,
      }}
    >
      {ready > 1 ? (
        <Box
          component="button"
          type="button"
          aria-label={t('inbox.reviewOldest')}
          onClick={() => voiceNote.openReady()}
          sx={{
            position: 'absolute',
            inset: 0,
            border: 0,
            p: 0,
            background: 'transparent',
            borderRadius: 'inherit',
            cursor: 'pointer',
          }}
        />
      ) : null}
      <Box
        aria-hidden
        sx={{ flex: 'none', display: 'flex', alignItems: 'center' }}
      >
        <GatorImage
          mood={reading > 0 ? 'thinking' : 'happy'}
          size={44}
          decorative
        />
      </Box>
      <Box role="status" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}>
          {t('inbox.title', { count: total })}
        </Box>
        <Box sx={{ fontSize: 12, color: 'text.secondary', ...oneLine }}>
          {summary}
        </Box>
      </Box>
      {ready === 1 ? (
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="primary"
            size="sm"
            shape="pill"
            onClick={(event) => {
              event.stopPropagation();
              voiceNote.openReady();
            }}
          >
            {t('inbox.review')}
          </Button>
        </Box>
      ) : null}
    </Box>,
    host,
  );
}
