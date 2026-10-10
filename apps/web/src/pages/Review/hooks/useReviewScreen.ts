import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogParents,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  clearReview,
  displayName,
  statusOf,
  readReview,
  invalidFields,
  type ReviewField,
  toSaveBatches,
  toReviewLine,
  type ReviewLine,
} from '../../../lib/review';
import { firstFocusField } from '../../../lib/reviewFocus';
import {
  initReviewState,
  reviewCounts,
  reviewGroups,
  reviewReducer,
} from '../../../lib/reviewState';
import { dispatchScanSession, getScanSession } from '../../../lib/scanSession';
import { toNewShoppingItem, useAddShoppingItems } from '../../../lib/plate';
import { useReceiptConfirm, type TickFailures } from '../../../lib/receiptScan';
import { MAX_BULK_BATCHES, useAddBatches } from '../../../lib/scan';
import {
  unverifiedState,
  type UnverifiedState,
} from '../../../lib/unverifiedState';
import { EXCLUDED_TOGGLE_ID, fieldId, rowId } from '../components/layout';

/**
 * Review screen state. The Member's edits live here, in client state, until
 * Save. Batch Scan Modes (Product, Receipt, Ingredients) save through the bulk
 * Batch endpoint; a mode that saves elsewhere (Plate adds Shopping Items)
 * branches on `draft.mode` at `save`.
 */
export function useReviewScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  // A Scan Session card is edited at /scan/review/:scanId; the draft of the old flow (Plate, gallery) has no id.
  const { scanId } = useParams();
  const sessionId = scanId === 'draft' ? undefined : scanId;
  // Read once: clearing the draft on save must not bounce the page to /scan.
  const [draft] = useState(() => {
    if (sessionId === undefined) return readReview();
    const scan = getScanSession().scans.find((s) => s.id === sessionId);
    return scan?.lines
      ? { mode: scan.mode, lines: scan.lines, scanLanguage: scan.scanLanguage }
      : null;
  });
  // Saving or discarding a card drops it from the Scan Session; the other cards are still to do.
  const leaveCard = (fallback: string) => {
    if (sessionId !== undefined)
      dispatchScanSession({ type: 'remove', id: sessionId });
    return sessionId !== undefined && getScanSession().scans.length > 0
      ? '/scan/review'
      : fallback;
  };
  const [state, dispatch] = useReducer(reviewReducer, draft, (d) => {
    const today = new Date();
    return initReviewState(
      (d?.lines ?? []).map((line, index) =>
        toReviewLine(line, `line-${index}`, today),
      ),
    );
  });
  const addBatches = useAddBatches(i18n.language, draft?.scanLanguage);
  const confirmReceipt = useReceiptConfirm(i18n.language, draft?.scanLanguage);
  const addShoppingItems = useAddShoppingItems(i18n.language);
  // Plate lines are things to buy, not things in the Pantry.
  const mode = draft?.mode ?? 'product';
  const shopping = mode === 'plate';
  // Each Scan Mode saves through one mutation; Product and Ingredients share the bulk Batch endpoint.
  const savers = {
    product: addBatches,
    ingredients: addBatches,
    receipt: confirmReceipt,
    plate: addShoppingItems,
  };
  const saver = savers[mode];
  // Excluded lines (Scan-excluded or removed by the Member) wait outside the list and are never saved.
  const groups = reviewGroups(state);
  const counts = reviewCounts(state);
  const included = state.lines.filter((line) => line.excluded === null);
  // Only Unmatched Pantry lines choose a category; Plate lines go to the Shopping List, which has no category picker.
  const parents = useCatalogParents(
    i18n.language,
    !shopping && included.some((line) => line.match === null),
  );
  // Receipt Scan: ticking Shopping Items happens after the save; if any tick failed, say so here before leaving.
  const [tickFailures, setTickFailures] = useState<TickFailures | null>(null);
  // Saved lines the Member never verified, told on the page Save lands on.
  const [savedState, setSavedState] = useState<{
    landing: string;
    state: UnverifiedState | undefined;
  }>();
  // Focus lands on an element that only exists after the render that opened or restored it.
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => {
    if (focusId === null) return;
    document.getElementById(focusId)?.focus();
    setFocusId(null);
  }, [focusId, state]);
  const overLimit = shopping
    ? 0
    : Math.max(0, included.length - MAX_BULK_BATCHES);

  const change = (key: string, patch: Partial<ReviewLine>) =>
    dispatch({ type: 'update', key, patch });
  // The line whose Match is being swapped in the one page-level dialog. The key
  // outlives the dialog so its title does not change while it fades out.
  const [swapKey, setSwapKey] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const swapOpener = useRef<HTMLElement | null>(null);
  const [restoreOpener, setRestoreOpener] = useState(false);
  const swapLine = state.lines.find((l) => l.key === swapKey) ?? null;
  const openSwap = (key: string) => {
    // Safari and macOS Firefox do not focus a clicked button: then there is no opener to return to.
    const el = document.activeElement;
    swapOpener.current =
      el instanceof HTMLElement && el !== document.body ? el : null;
    setSwapKey(key);
    setSwapOpen(true);
  };
  const closeSwap = () => {
    setSwapOpen(false);
    setRestoreOpener(true);
  };
  // After the render that closed the dialog: back to the opener, or to the row if a regroup replaced it.
  useEffect(() => {
    if (!restoreOpener) return;
    setRestoreOpener(false);
    const opener = swapOpener.current;
    if (opener?.isConnected) opener.focus();
    else if (swapKey) document.getElementById(rowId(swapKey))?.focus();
  }, [restoreOpener, swapKey]);
  const changeMatch = (match: CatalogSearchResult) => {
    if (swapKey === null) return;
    dispatch({ type: 'changeMatch', key: swapKey, match, today: new Date() });
    closeSwap();
  };
  // Opening a row by hand puts focus on its first empty field (else Match); shutting it returns to its button.
  // Rows open on load never come through here, so they do not steal focus.
  // The tablet has no Match field to open on, so it names the input to land on instead.
  const toggle = (key: string, instead?: ReviewField) => {
    const line = state.lines.find((l) => l.key === key);
    dispatch({ type: 'toggle', key });
    if (!line) return;
    const field = firstFocusField(line);
    setFocusId(
      state.open[key]
        ? rowId(key)
        : fieldId(key, field === 'match' ? (instead ?? 'match') : field),
    );
  };
  const open = (key: string) => dispatch({ type: 'open', key });
  // Rows whose Save or Confirm was blocked, so their panels show every error.
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  // Focus moves to the next row in display order, else the Excluded button, rather than being lost to the page.
  const remove = (key: string) => {
    // Confident rows only exist on screen while that group is shown.
    const rendered = state.sureOpen
      ? [...groups.review, ...groups.sure]
      : groups.review;
    const order = rendered.map((l) => l.key);
    const next = order[order.indexOf(key) + 1];
    dispatch({ type: 'remove', key });
    setFocusId(next ? rowId(next) : EXCLUDED_TOGGLE_ID);
  };
  const restore = (key: string) => {
    dispatch({ type: 'restore', key });
    setFocusId(rowId(key));
  };
  /** Open the first line with an invalid value and focus that field. Returns whether there was one. */
  const focusInvalid = (candidates: ReviewLine[]) => {
    const line = candidates.find((l) => invalidFields(l).length > 0);
    if (!line) return false;
    dispatch({ type: 'open', key: line.key });
    setBlocked((was) => ({ ...was, [line.key]: true }));
    setFocusId(fieldId(line.key, invalidFields(line)[0]));
    return true;
  };
  // Confirm and Done shut the row; an invalid value keeps it open and takes focus instead.
  const confirm = (key: string) => {
    const line = state.lines.find((l) => l.key === key);
    if (line && focusInvalid([line])) return;
    dispatch({ type: 'confirm', key });
    setFocusId(rowId(key));
  };

  const save = () => {
    // Display order, so the Member lands on the topmost problem.
    if (focusInvalid([...groups.review, ...groups.sure])) return;
    const to = shopping ? '/shopping' : '/pantry';
    const navState = unverifiedState(
      included.filter((l) => statusOf(l, !!state.confirmed[l.key]) === 'low')
        .length,
    );
    const done = {
      onSuccess: (result?: unknown) => {
        clearReview();
        const landing = leaveCard(to);
        const failures = (result as { tickFailures?: TickFailures } | undefined)
          ?.tickFailures;
        if (
          failures &&
          failures.missing + failures.changed + failures.other > 0
        ) {
          setTickFailures(failures);
          setSavedState({ landing, state: navState });
          return;
        }
        navigate(landing, { state: navState });
      },
    };
    if (shopping) {
      addShoppingItems.mutate(included.map(toNewShoppingItem), done);
      return;
    }
    const batches = toSaveBatches(included, mode);
    if (mode === 'receipt') confirmReceipt.mutate(batches, done);
    else addBatches.mutate(batches, done);
  };
  const discard = () => {
    clearReview();
    navigate(leaveCard('/scan'));
  };

  return {
    hadDraft: draft !== null,
    /** Where a missing draft sends the Member: the overview for a card that is gone or still being read. */
    missingTo: sessionId !== undefined ? '/scan/review' : '/scan',
    mode,
    shopping,
    state,
    groups,
    counts,
    parents: parents.data ?? [],
    canSave: included.length > 0 && overLimit === 0 && !saver.isPending,
    overLimit,
    maxItems: MAX_BULK_BATCHES,
    saving: saver.isPending,
    error: saver.error ? translateApiError(t, saver.error) : null,
    tickFailures,
    // After a tick-failure notice the toast still follows, on the Pantry the lines were saved to.
    toPantry: () =>
      navigate(savedState?.landing ?? '/pantry', { state: savedState?.state }),
    blocked,
    toggle,
    open,
    change,
    swapName: swapLine ? displayName(swapLine) : '',
    swapOpen,
    openSwap,
    closeSwap,
    changeMatch,
    remove,
    restore,
    confirm,
    toggleSureGroup: () => dispatch({ type: 'toggleSureGroup' }),
    save,
    discard,
  };
}
