import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { focusVoiceButton } from '../../lib/voiceFocus';
import { useVoiceBackgroundItems } from '../voice/useVoiceBackgroundItems';
import { VoiceReviewAllFooter } from '../voice/VoiceReviewAllFooter';
import { BackgroundSheet } from './BackgroundSheet';
import { BackgroundStrip } from './BackgroundStrip';
import { useScanSessionBackgroundItems } from './useScanSessionBackgroundItems';

/**
 * The background strip and its sheet, hosted once by the app layout on pages with the Dock (so they
 * show whether or not voice is configured): the Voice Notes and the Scan Session adapted into
 * background items. A failed note is announced once as an alert (the rest of the strip is a polite
 * status). Hidden while recording or while a Voice Note sheet is up, and when nothing is in the
 * background.
 *
 * The sheet is hosted here, outside the strip: when the last note leaves while it is open, the sheet
 * closes with its animation and focus goes to the voice button, not to the page behind.
 */
export function BackgroundHost() {
  const { t } = useTranslation('voice');
  const state = useVoiceNoteState();
  const voiceItems = useVoiceBackgroundItems();
  const scanItems = useScanSessionBackgroundItems();
  const items = [...voiceItems, ...scanItems];
  const [wantSheet, setWantSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const up = state.phase === 'idle' && items.length > 0;

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
          footer={
            state.inbox.notes.filter((n) => n.hasActions).length > 1 ? (
              <VoiceReviewAllFooter onClose={() => setWantSheet(false)} />
            ) : undefined
          }
          open={wantSheet && items.length > 0 && state.phase === 'idle'}
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
