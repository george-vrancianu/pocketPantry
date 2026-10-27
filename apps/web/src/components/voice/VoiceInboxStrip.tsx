import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isStripUp, useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { focusVoiceButton } from '../../lib/voiceFocus';
import { BackgroundSheet } from '../background/BackgroundSheet';
import { BackgroundStrip } from '../background/BackgroundStrip';
import { useVoiceBackgroundItems } from './useVoiceBackgroundItems';
import { VoiceReviewAllFooter } from './VoiceReviewAllFooter';

/**
 * The Voice Inbox on the background strip: the Voice Notes adapted into background items. A failed
 * note is announced once as an alert (the rest of the strip is a polite status).
 * Hidden while recording or while a sheet is up, and when the Voice Inbox is empty.
 *
 * The sheet is hosted here, outside the strip: when the last note leaves while it is open, the sheet
 * closes with its animation and focus goes to the voice button, not to the page behind.
 */
export function VoiceInboxStrip() {
  const { t } = useTranslation('voice');
  const state = useVoiceNoteState();
  const items = useVoiceBackgroundItems();
  const [wantSheet, setWantSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const up = isStripUp(state);

  // Announced assertively once, when a note fails, even if it fails while the strip is hidden. The
  // announced count lives in the Voice Note store: this component remounts when the Dock hides or the
  // Member changes page, and would announce the same failure again. A drop (a failed note retried or
  // discarded) takes the alert down rather than announcing the smaller count.
  const failed = state.inbox.failed;
  const [alertedAt, setAlertedAt] = useState(0);
  const [wasUp, setWasUp] = useState(up);
  const isNew = failed > voiceNote.announcedFailed();
  if (isNew && alertedAt !== failed) setAlertedAt(failed);
  if (up !== wasUp) {
    setWasUp(up);
    // The alert goes with the strip, which comes back without it.
    if (!up && !isNew) setAlertedAt(0);
  }
  useEffect(() => {
    voiceNote.announceFailed(failed);
  }, [failed]);
  const alerting = alertedAt > 0 && failed >= alertedAt;
  return (
    <>
      {up ? (
        <BackgroundStrip
          items={items}
          alert={
            alerting ? t('inbox.failedAlert', { count: failed }) : undefined
          }
          openSheet={() => {
            setMounted(true);
            setWantSheet(true);
          }}
        />
      ) : null}
      {mounted ? (
        <BackgroundSheet
          items={items}
          footer={<VoiceReviewAllFooter onClose={() => setWantSheet(false)} />}
          open={wantSheet && state.inbox.total > 0 && state.phase === 'idle'}
          onClose={() => setWantSheet(false)}
          onExited={() => {
            setMounted(false);
            setWantSheet(false);
            // The opener went with the last note; otherwise focus is wherever the Member went.
            if (voiceNote.getState().inbox.total === 0) focusVoiceButton();
          }}
        />
      ) : null}
    </>
  );
}
