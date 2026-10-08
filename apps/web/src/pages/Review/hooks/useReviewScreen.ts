import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogParents,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  clearReview,
  readReview,
  isLineValid,
  toNewBatch,
  toReviewLine,
  withMatch,
  type ReviewLine,
} from '../../../lib/review';
import { toNewShoppingItem, useAddShoppingItems } from '../../../lib/plate';
import { useReceiptConfirm, type TickFailures } from '../../../lib/receiptScan';
import { MAX_BULK_BATCHES, useAddBatches } from '../../../lib/scan';

/**
 * Review screen state. The Member's edits live here, in client state, until
 * Save. Batch Scan Modes (Product, Receipt, Ingredients) save through the bulk
 * Batch endpoint; a mode that saves elsewhere (Plate adds Shopping Items)
 * branches on `draft.mode` at `save`.
 */
export function useReviewScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  // Read once: clearing the draft on save must not bounce the page to /scan.
  const [draft] = useState(readReview);
  const [lines, setLines] = useState<ReviewLine[]>(() => {
    const today = new Date();
    return (draft?.lines ?? []).map((line, index) =>
      toReviewLine(line, `line-${index}`, today),
    );
  });
  const addBatches = useAddBatches(i18n.language);
  const confirmReceipt = useReceiptConfirm(i18n.language);
  const addShoppingItems = useAddShoppingItems(i18n.language);
  // Plate lines are things to buy, not things in the Pantry.
  const shopping = draft?.mode === 'plate';
  // Each Scan Mode saves through one mutation; Product and Ingredients share the bulk Batch endpoint.
  const savers = {
    product: addBatches,
    ingredients: addBatches,
    receipt: confirmReceipt,
    plate: addShoppingItems,
  };
  const saver = savers[draft?.mode ?? 'product'];
  // Excluded lines (Receipt Scan) wait outside the list and are never saved.
  const included = lines.filter((line) => line.excluded === null);
  const excluded = lines.filter((line) => line.excluded !== null);
  // Only Unmatched Pantry lines choose a category; Plate lines go to the Shopping List, which has no category picker.
  const parents = useCatalogParents(
    i18n.language,
    !shopping && included.some((line) => line.match === null),
  );
  // Receipt Scan: ticking Shopping Items happens after the save; if any tick failed, say so here before leaving.
  const [tickFailures, setTickFailures] = useState<TickFailures | null>(null);
  // Focus follows an included line, whose card replaces the Excluded entry the Member was on.
  const [focusKey, setFocusKey] = useState<string | null>(null);
  useEffect(() => {
    if (focusKey === null) return;
    document.getElementById(`review-line-${focusKey}`)?.focus();
    setFocusKey(null);
  }, [focusKey, lines]);
  const overLimit = shopping
    ? 0
    : Math.max(0, included.length - MAX_BULK_BATCHES);

  const change = (key: string, patch: Partial<ReviewLine>) =>
    setLines((all) =>
      all.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  const changeMatch = (key: string, match: CatalogSearchResult) =>
    setLines((all) =>
      all.map((line) =>
        line.key === key ? withMatch(line, match, new Date()) : line,
      ),
    );
  const include = (key: string) => {
    change(key, { excluded: null });
    setFocusKey(key);
  };
  const drop = (key: string) =>
    setLines((all) => all.filter((line) => line.key !== key));

  const save = () => {
    const to = shopping ? '/shopping' : '/pantry';
    const done = {
      onSuccess: (result?: unknown) => {
        clearReview();
        const failures = (result as { tickFailures?: TickFailures } | undefined)
          ?.tickFailures;
        if (
          failures &&
          failures.missing + failures.changed + failures.other > 0
        ) {
          setTickFailures(failures);
          return;
        }
        navigate(to);
      },
    };
    if (shopping) {
      addShoppingItems.mutate(included.map(toNewShoppingItem), done);
      return;
    }
    const mode = draft?.mode;
    const batches = included.map(toNewBatch).map((batch) =>
      // The queue only records the source of Unmatched names.
      batch.rawName && mode && mode !== 'plate'
        ? { ...batch, source: mode }
        : batch,
    );
    if (mode === 'receipt') confirmReceipt.mutate(batches, done);
    else addBatches.mutate(batches, done);
  };
  const discard = () => {
    clearReview();
    navigate('/scan');
  };

  return {
    hadDraft: draft !== null,
    mode: draft?.mode ?? 'product',
    shopping,
    lines: included,
    excluded,
    parents: parents.data ?? [],
    canSave:
      included.length > 0 &&
      overLimit === 0 &&
      included.every(isLineValid) &&
      !saver.isPending,
    overLimit,
    maxItems: MAX_BULK_BATCHES,
    saving: saver.isPending,
    error: saver.error ? translateApiError(t, saver.error) : null,
    tickFailures,
    toPantry: () => navigate('/pantry'),
    change,
    changeMatch,
    drop,
    include,
    save,
    discard,
  };
}
