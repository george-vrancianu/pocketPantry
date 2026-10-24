import {
  Box,
  Button,
  GatorImage,
  palette,
  radius,
  shadow,
} from '@pocket-pantry/ui';
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
import { focusVoiceButton, VOICE_PILL_ATTRIBUTE } from '../../lib/voiceFocus';
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
 * which opens the Voice Inbox sheet. A failed note outlines it in the warning colour and makes it an alert.
 * Hidden while recording or while a sheet is up, and when the Voice Inbox is empty.
 *
 * The sheet is hosted here, outside the strip: when the last note leaves while it is open, the sheet
 * closes with its animation and focus goes to the voice button, not to the page behind.
 */
export function VoiceInboxStrip() {
  const state = useVoiceNoteState();
  const [wantSheet, setWantSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const up = isStripUp(state);
  return (
    <>
      {up ? (
        <Strip
          state={state}
          openSheet={() => {
            setMounted(true);
            setWantSheet(true);
          }}
        />
      ) : null}
      {mounted ? (
        <VoiceInboxSheet
          open={wantSheet && state.inbox.total > 0 && state.phase === 'idle'}
          onClose={() => setWantSheet(false)}
          onExited={() => {
            setMounted(false);
            setWantSheet(false);
            // The opener went with the last note.
            if (!isStripUp(voiceNote.getState())) focusVoiceButton();
          }}
        />
      ) : null}
    </>
  );
}

function Strip({
  state,
  openSheet,
}: {
  state: VoiceNoteState;
  openSheet: () => void;
}) {
  const { t } = useTranslation('voice');
  const host = useVoiceHost();
  const { reading, ready, failed } = state.inbox;
  const total = reading + ready + failed;
  const summary = [
    reading > 0 ? t('inbox.reading', { count: reading }) : null,
    ready > 0 ? t('inbox.ready', { count: ready }) : null,
    failed > 0 ? t('inbox.failed', { count: failed }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const open = () => {
    if (ready === 1) voiceNote.openReady();
    else openSheet();
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
          border: failed > 0 ? `2px solid ${palette('warning-main')}` : 'none',
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
        <Box
          // A fresh node when a note fails, so it is announced as an alert.
          key={failed > 0 ? 'alert' : 'status'}
          role={failed > 0 ? 'alert' : 'status'}
          sx={{ flex: 1, minWidth: 0 }}
        >
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
    </>,
    host,
  );
}
