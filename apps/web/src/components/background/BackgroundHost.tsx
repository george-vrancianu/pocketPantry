import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { haptic } from '../../lib/haptic';
import { linkReads as linkReadsHolder } from '../../lib/linkReads';
import { useScanSession } from '../../lib/scanSession';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { focusVoiceButton } from '../../lib/voiceFocus';
import { useVoiceBackgroundItems } from '../voice/useVoiceBackgroundItems';
import { VoiceReviewAllFooter } from '../voice/VoiceReviewAllFooter';
import { BackgroundSheet } from './BackgroundSheet';
import { BackgroundStrip } from './BackgroundStrip';
import { useLinkReadBackgroundItems } from './useLinkReadBackgroundItems';
import {
  summarizeScanSession,
  useScanSessionBackgroundItems,
} from './useScanSessionBackgroundItems';

/** How many failed Scans the strip has announced as an alert. Outlives the host, which remounts on every page change. */
let announcedScanFailed = 0;
const announceScanFailed = (failed: number) => {
  announcedScanFailed = failed;
};
export const resetScanFailureAlert = () => {
  announcedScanFailed = 0;
};

/**
 * Announced assertively once, when something fails, even if it fails while the strip is hidden. The
 * announced count lives outside the component, which remounts when the Dock hides, so a
 * remount does not announce the same failure again. The host lives in the app layout and stays
 * mounted across pages, so the alert is also taken down when the Member changes page. A drop (a
 * failed item retried or discarded) takes the alert down rather than announcing the smaller count;
 * it goes with the strip too.
 */
function useFailureAlert({
  failed,
  up,
  page,
  announced,
  announce,
}: {
  failed: number;
  up: boolean;
  /** The current page; the alert goes down when the Member moves to another. */
  page: string;
  announced: () => number;
  announce: (failed: number) => void;
}): boolean {
  const [alertedAt, setAlertedAt] = useState(0);
  const [wasUp, setWasUp] = useState(up);
  const [wasPage, setWasPage] = useState(page);
  if (page !== wasPage) {
    setWasPage(page);
    setAlertedAt(0);
  }
  const isNew = failed > announced();
  if (isNew && alertedAt !== failed) setAlertedAt(failed);
  if (up !== wasUp) {
    setWasUp(up);
    // The alert goes with the strip, which comes back without it.
    if (!up && !isNew) setAlertedAt(0);
  }
  useEffect(() => {
    announce(failed);
  }, [announce, failed]);
  return alertedAt > 0 && failed >= alertedAt;
}

/**
 * The background strip and its sheet, hosted once by the app layout on pages with the Dock (so they
 * show whether or not voice is configured): the Voice Notes and, when the host asks for them
 * (`scanSession`, `linkReads`), the Scan Session and the link reads adapted into background items. A host chooses its kinds: the
 * Intro's Say it hosts Voice Notes only, the Scan Session waits for the app's Review. A failed note,
 * Scan or link read is announced once as an alert (the rest of the strip is a polite status); the Scan Session
 * buzzes once when it becomes all read. Hidden while recording or while a Voice Note sheet is up, and when nothing is in the
 * background.
 *
 * The sheet is hosted here, outside the strip: when the last note leaves while it is open, the sheet
 * closes with its animation and focus goes to the voice button, not to the page behind.
 */
export function BackgroundHost({
  scanSession = false,
  linkReads = false,
}: {
  /** Whether the Scan Session is one of the strip's items. Default: no, Voice Notes only. */
  scanSession?: boolean;
  /** Whether link reads are among the strip's items. Default: no; the Intro leaves them to the app. */
  linkReads?: boolean;
}) {
  const { t } = useTranslation('voice');
  const { t: tBackground } = useTranslation('background');
  const { pathname } = useLocation();
  const state = useVoiceNoteState();
  const voiceItems = useVoiceBackgroundItems();
  const adapted = useScanSessionBackgroundItems();
  const scanItems = scanSession ? adapted : [];
  const scans = useScanSession().scans;
  const summary = summarizeScanSession(scanSession ? scans : []);
  const linkItems = useLinkReadBackgroundItems(linkReads);
  const items = [...voiceItems, ...scanItems, ...linkItems];
  const [wantSheet, setWantSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const up = state.phase === 'idle' && items.length > 0;

  const failed = state.inbox.failed;
  const voiceAlerting = useFailureAlert({
    failed,
    up,
    page: pathname,
    announced: voiceNote.announcedFailed,
    announce: voiceNote.announceFailed,
  });
  const scanAlerting = useFailureAlert({
    failed: summary.failed,
    up,
    page: pathname,
    announced: () => announcedScanFailed,
    announce: announceScanFailed,
  });
  const linkFailed = linkItems.filter(
    (item) => item.status === 'failed',
  ).length;
  const linkAlerting = useFailureAlert({
    failed: linkFailed,
    up,
    page: pathname,
    announced: linkReadsHolder.announcedFailed,
    announce: linkReadsHolder.announceFailed,
  });
  const alert = [
    voiceAlerting ? t('inbox.failedAlert', { count: failed }) : null,
    scanAlerting
      ? tBackground('scan.failedAlert', { count: summary.failed })
      : null,
    linkAlerting
      ? tBackground('link.failedAlert', { count: linkFailed })
      : null,
  ]
    .filter(Boolean)
    .join('. ');

  // One short buzz when the Scan Session turns all read while the host is mounted; a host that
  // mounts with it already read (a page change) stays quiet.
  const allRead = summary.allRead;
  const wasAllRead = useRef(allRead);
  useEffect(() => {
    if (allRead && !wasAllRead.current) haptic(14);
    wasAllRead.current = allRead;
  }, [allRead]);

  return (
    <>
      {up ? (
        <BackgroundStrip
          items={items}
          alert={alert || undefined}
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
            // The opener went with the last item; otherwise focus is wherever the Member went.
            if (items.length === 0) focusVoiceButton();
          }}
        />
      ) : null}
    </>
  );
}
