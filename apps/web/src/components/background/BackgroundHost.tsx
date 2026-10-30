import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { haptic } from '../../lib/haptic';
import {
  recipeReads as recipeReadsHolder,
  type RecipeReadKind,
} from '../../lib/recipeReads';
import type { TFunction } from 'i18next';
import type { BackgroundItem } from './backgroundItem';
import {
  announcedScanFailed,
  announceScanFailed,
  useScanSession,
} from '../../lib/scanSession';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { focusVoiceButton } from '../../lib/voiceFocus';
import { useVoiceBackgroundItems } from '../voice/useVoiceBackgroundItems';
import { VoiceReviewAllFooter } from '../voice/VoiceReviewAllFooter';
import { BackgroundSheet } from './BackgroundSheet';
import { BackgroundStrip } from './BackgroundStrip';
import { useRecipeReadBackgroundItems } from './useRecipeReadBackgroundItems';
import {
  summarizeScanSession,
  useScanSessionBackgroundItems,
} from './useScanSessionBackgroundItems';

/** Each recipe read kind's failure alert, by the `background` key: a new kind adds its own. */
const RECIPE_READ_FAILED_ALERT: Record<RecipeReadKind, string> = {
  link: 'link.failedAlert',
};

/** The alert for the failed recipe reads, worded per kind ("2 recipe links failed"). */
function recipeFailedAlert(
  items: BackgroundItem[],
  t: TFunction<'background'>,
): string {
  return (Object.keys(RECIPE_READ_FAILED_ALERT) as RecipeReadKind[])
    .map((kind) => ({
      kind,
      count: items.filter((i) => i.kind === kind && i.status === 'failed')
        .length,
    }))
    .filter(({ count }) => count > 0)
    .map(({ kind, count }) => t(RECIPE_READ_FAILED_ALERT[kind], { count }))
    .join('. ');
}

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
  // A rise counts as announced only once the strip is up to show it: a failure that lands while the
  // strip is hidden stays unannounced, and is shown when the strip comes back. A drop counts at once.
  useEffect(() => {
    if (up || failed < announced()) announce(failed);
  }, [announce, announced, failed, up]);
  return alertedAt > 0 && failed >= alertedAt;
}

/**
 * The background strip and its sheet, hosted once by the app layout on pages with the Dock (so they
 * show whether or not voice is configured): the Voice Notes and, when the host asks for them
 * (`scanSession`, `recipeReads`), the Scan Session and the recipe reads adapted into background items. A host chooses its kinds: the
 * Intro's Say it hosts Voice Notes only, the Scan Session waits for the app's Review. A failed note,
 * Scan or recipe read is announced once as an alert (the rest of the strip is a polite status); the Scan Session
 * buzzes once when it becomes all read. Hidden while recording or while a Voice Note sheet is up, and when nothing is in the
 * background.
 *
 * The sheet is hosted here, outside the strip: when the last note leaves while it is open, the sheet
 * closes with its animation and focus goes to the voice button, not to the page behind.
 */
export function BackgroundHost({
  scanSession = false,
  recipeReads = false,
}: {
  /** Whether the Scan Session is one of the strip's items. Default: no, Voice Notes only. */
  scanSession?: boolean;
  /** Whether recipe reads are among the strip's items. Default: no; the Intro leaves them to the app. */
  recipeReads?: boolean;
}) {
  const { t } = useTranslation('voice');
  const { t: tBackground } = useTranslation('background');
  const { pathname } = useLocation();
  const state = useVoiceNoteState();
  const voiceItems = useVoiceBackgroundItems();
  const sessionItems = useScanSessionBackgroundItems();
  const scanItems = scanSession ? sessionItems : [];
  const scans = useScanSession().scans;
  const summary = summarizeScanSession(scanSession ? scans : []);
  const recipeItems = useRecipeReadBackgroundItems(recipeReads);
  const items = [...voiceItems, ...scanItems, ...recipeItems];
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
    announced: announcedScanFailed,
    announce: announceScanFailed,
  });
  const recipeFailed = recipeItems.filter(
    (item) => item.status === 'failed',
  ).length;
  const recipeAlerting = useFailureAlert({
    failed: recipeFailed,
    up,
    page: pathname,
    announced: recipeReadsHolder.announcedFailed,
    announce: recipeReadsHolder.announceFailed,
  });
  const alert = [
    voiceAlerting ? t('inbox.failedAlert', { count: failed }) : null,
    scanAlerting
      ? tBackground('scan.failedAlert', { count: summary.failed })
      : null,
    recipeAlerting ? recipeFailedAlert(recipeItems, tBackground) : null,
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
