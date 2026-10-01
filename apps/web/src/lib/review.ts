import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation } from './catalog';
import { defaultExpiryDate, type NewBatch, type Unit } from './pantry';
import type { ExclusionReason, ProposedLine, ScanMode } from './scan';

/**
 * The Review seam. Every Scan Mode ends by calling `startReview` with its
 * proposed lines and navigating to `/scan/review`; the Review screen turns
 * those lines into editable `ReviewLine`s and, on confirm, saves them.
 * Nothing is saved before that: the draft lives in client state only.
 */
export type ReviewDraft = { mode: ScanMode; lines: ProposedLine[] };

let draft: ReviewDraft | null = null;
const listeners = new Set<() => void>();

function publish(next: ReviewDraft | null) {
  draft = next;
  listeners.forEach((listener) => listener());
}

export const startReview = (next: ReviewDraft) => publish(next);
export const clearReview = () => publish(null);

export function useReviewDraft(): ReviewDraft | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => draft,
  );
}

const FALLBACK_LOCATION: StorageLocation = 'cupboard';
const FALLBACK_UNIT: Unit = 'pcs';

/** A proposed line while the Member edits it. Form fields are strings so half-typed input survives. */
export type ReviewLine = {
  key: string;
  /** The name the Scan read; the raw name when the line stays Unmatched. */
  name: string;
  match: CatalogSearchResult | null;
  lowConfidence: boolean;
  quantity: string;
  unit: Unit;
  location: StorageLocation;
  /** `YYYY-MM-DD`, or empty for no expiry. */
  expiryDate: string;
  /** The date was read off the packaging or typed by the Member, so changing the Match keeps it instead of re-deriving from Catalog defaults. */
  expiryExplicit: boolean;
  /** Unmatched only: the Parent Category the Batch lands in; '' leaves it to the server's default (top-level Other). */
  parentCategoryId: string;
  description: string;
  /** Receipt Scan: left out of the Pantry until the Member re-includes it. Excluded lines are never saved. */
  excluded: { reason: ExclusionReason } | null;
};

export function toReviewLine(
  line: ProposedLine,
  key: string,
  today: Date,
): ReviewLine {
  const { match } = line;
  const base = {
    key,
    name: line.name,
    match,
    lowConfidence: line.lowConfidence,
    quantity: line.quantity === null ? '' : String(line.quantity),
    unit: line.unit ?? match?.defaultUnit ?? FALLBACK_UNIT,
    location: match?.defaults.location ?? FALLBACK_LOCATION,
    expiryExplicit: line.expiryDate !== null,
    parentCategoryId: '',
    description: line.productDescription ?? '',
    excluded: line.excluded ?? null,
  };
  return {
    ...base,
    expiryDate:
      line.expiryDate ??
      (match ? defaultExpiryDate(match.defaults.expiryDays, today) : ''),
  };
}

/** The Member picked another Ingredient: take its defaults, keep an expiry read off the packaging. */
export function withMatch(
  line: ReviewLine,
  match: CatalogSearchResult,
  today: Date,
): ReviewLine {
  return {
    ...line,
    match,
    parentCategoryId: '',
    lowConfidence: false,
    unit: match.defaultUnit,
    location: match.defaults.location ?? FALLBACK_LOCATION,
    expiryDate: line.expiryExplicit
      ? line.expiryDate
      : defaultExpiryDate(match.defaults.expiryDays, today),
  };
}

/** Unmatched or low-confidence lines are flagged so the Member checks them first. */
export const needsAttention = (line: ReviewLine) =>
  line.match === null || line.lowConfidence;

/** numeric(10,3) on the server: at least 0.001, at most 3 decimals. */
export function isQuantityValid(quantity: string): boolean {
  if (quantity.trim() === '') return true;
  const value = Number(quantity);
  return (
    Number.isFinite(value) &&
    value >= 0.001 &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6
  );
}

export const isLineValid = (line: ReviewLine) =>
  isQuantityValid(line.quantity) &&
  (line.match !== null || line.name.trim() !== '');

export function toNewBatch(line: ReviewLine): NewBatch {
  const quantity = line.quantity.trim() === '' ? null : Number(line.quantity);
  return {
    ...(line.match
      ? { ingredientId: line.match.id }
      : {
          rawName: line.name.trim(),
          ...(line.parentCategoryId
            ? { parentCategoryId: line.parentCategoryId }
            : {}),
        }),
    quantity,
    unit: quantity === null ? null : line.unit,
    location: line.location,
    expiryDate: line.expiryDate === '' ? null : line.expiryDate,
    productDescription: line.description.trim() || null,
  };
}
