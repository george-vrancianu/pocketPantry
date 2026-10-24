import { Box, Button, GatorImage, radius, shadow } from '@pocket-pantry/ui';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  isStripUp,
  useVoiceNoteState,
  voiceNote,
  type VoiceNoteState,
} from '../../lib/voiceNote';
import { pillBottom, VOICE_LAYER } from '../../lib/voicePlacement';
import { VOICE_PILL_ATTRIBUTE } from '../../lib/voiceFocus';
import { enter } from './enter';
import { VoiceInboxSheet } from './VoiceInboxSheet';
import { useVoiceHost } from './VoiceHost';

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/**
 * The Voice Inbox strip, where the status pill was: Gator, how many Voice Notes there are, what
 * state they are in, and a button: Review when exactly one is ready (it opens that note), else Open,
 * which opens the Voice Inbox sheet.
 * Hidden while recording, while a sheet or a failure is up, and when nothing is being read or ready.
 */
export function VoiceInboxStrip() {
  const state = useVoiceNoteState();
  return isStripUp(state) ? <Strip state={state} /> : null;
}

/** Mounted only while the strip is up, so the sheet's open state goes with it. */
function Strip({ state }: { state: VoiceNoteState }) {
  const { t } = useTranslation('voice');
  const host = useVoiceHost();
  const [sheet, setSheet] = useState(false);
  const { reading, ready, failed } = state.inbox;
  const total = reading + ready + failed;
  const summary = [
    reading > 0 ? t('inbox.reading', { count: reading }) : null,
    ready > 0 ? t('inbox.ready', { count: ready }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const open = () => {
    if (ready === 1) voiceNote.openReady();
    else setSheet(true);
  };

  return createPortal(
    <>
      <Box
        {...{ [VOICE_PILL_ATTRIBUTE]: '' }}
        onClick={open}
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
          cursor: 'pointer',
          ...enter,
        }}
      >
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
        <Button
          variant="primary"
          size="sm"
          shape="pill"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
        >
          {ready === 1
            ? t('inbox.review')
            : ready > 1
              ? t('inbox.openCount', { count: ready })
              : t('inbox.open')}
        </Button>
      </Box>
      {sheet ? <VoiceInboxSheet onClose={() => setSheet(false)} /> : null}
    </>,
    host,
  );
}
