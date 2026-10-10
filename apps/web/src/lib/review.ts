import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import { defaultExpiryDate, parseQuantity, type NewBatch } from './pantry';
import { isIsoDate } from './dateFormat';
import type { ExclusionReason, ProposedLine, ScanMode } from './scan';
import type { SessionScan } from './scanSession';

const FALLBACK_LOCATION: StorageLocation = 'cupboard';
const FALLBACK_UNIT: Unit = 'pcs';

/** A proposed line while the Member edits it. Form fields are strings so half-typed input survives. */
export type ReviewLine = {
  key: string;
  /** The name the Scan read; the raw name when the line stays Unmatched. */
  name: string;
  /** The text the Scan read for this line, or null. Shown under the name; saved with an Unmatched line as its printed text. */
  sourceText: string | null;
  match: CatalogSearchResult | null;
  lowConfidence: boolean;
  quantity: string;
  unit: Unit;
  location: StorageLocation;
  /** `YYYY-MM-DD`, or empty for no expiry. While the Member is mid-way through typing a date it holds the half-typed text, which is invalid until it parses. */
  expiryDate: string;
  /** The date was read off the packaging or typed by the Member, so changing the Match keeps it instead of re-deriving from Catalog defaults. */
  expiryExplicit: boolean;
  /** Unmatched only: the Parent Category the Batch lands in; '' leaves it to the server's default (top-level Other). */
  parentCategoryId: string;
  description: string;
  /** Left out of the Pantry until the Member adds it back: the Scan excluded it (Receipt) or the Member removed it. Excluded lines are never saved. */
  excluded: { reason: ExclusionReason | 'removed' } | null;
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
    sourceText: line.sourceText,
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

/** The lines of a Scan as the Member left them: their edits if any, else what was read; a merged card's sections in order. */
export function reviewLinesOf(
  scan: SessionScan,
  today = new Date(),
): ReviewLine[] {
  const lines =
    scan.edited ??
    (scan.sections
      ? scan.sections.flatMap((section) => reviewLinesOf(section, today))
      : (scan.lines ?? []).map((line, index) =>
          toReviewLine(line, `line-${index}`, today),
        ));
  // Keys only need to differ within the card.
  return lines.map((line, index) => ({ ...line, key: `line-${index}` }));
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

/** What the Review screen calls a line: the Ingredient it matched, else the name the Scan read. */
export const displayName = (line: ReviewLine) => line.match?.name ?? line.name;

/** Where each line sits among the lines sharing its display name, in the given order. Only repeated names are present. */
function positionsOf(
  lines: ReviewLine[],
): Map<string, { index: number; total: number }> {
  const byName = new Map<string, ReviewLine[]>();
  for (const line of lines) {
    const name = displayName(line);
    byName.set(name, [...(byName.get(name) ?? []), line]);
  }
  const positions = new Map<string, { index: number; total: number }>();
  for (const same of byName.values()) {
    if (same.length < 2) continue;
    same.forEach((line, index) =>
      positions.set(line.key, { index: index + 1, total: same.length }),
    );
  }
  return positions;
}

/**
 * Names each of `lines` for assistive tech: its display name, qualified by
 * position when other lines share it, e.g. "Tomato (2 of 2)", so every
 * per-line control and landmark is told apart. `qualify` words the position.
 */
export function accessibleNamesOf(
  lines: ReviewLine[],
  qualify: (name: string, position: { index: number; total: number }) => string,
): (line: ReviewLine) => string {
  const positions = positionsOf(lines);
  return (line) => {
    const position = positions.get(line.key);
    return position ? qualify(displayName(line), position) : displayName(line);
  };
}

/** How sure the Review screen is of a line: `low` needs a look at the Match, `qty` a quantity, `ok` is fine. */
export type RowStatus = 'low' | 'qty' | 'ok';

/** Unmatched counts as low: the Scan found no Ingredient. A confirmed line is always ok. */
export function statusOf(line: ReviewLine, confirmed: boolean): RowStatus {
  if (confirmed) return 'ok';
  if (line.lowConfidence || line.match === null) return 'low';
  if (line.quantity.trim() === '') return 'qty';
  return 'ok';
}

export type ReviewField = 'name' | 'quantity' | 'expiry';

/** The fields holding an entered value that cannot be saved, in the order they appear on screen. A missing quantity or expiry is fine. */
export function invalidFields(line: ReviewLine): ReviewField[] {
  const fields: ReviewField[] = [];
  if (line.match === null && line.name.trim() === '') fields.push('name');
  if (!parseQuantity(line.quantity).valid) fields.push('quantity');
  if (line.expiryDate !== '' && !isIsoDate(line.expiryDate))
    fields.push('expiry');
  return fields;
}

export const isLineValid = (line: ReviewLine) =>
  invalidFields(line).length === 0;

export function toNewBatch(line: ReviewLine): NewBatch {
  const quantity = line.quantity.trim() === '' ? null : Number(line.quantity);
  return {
    ...(line.match
      ? { ingredientId: line.match.id }
      : {
          rawName: line.name.trim(),
          // The paper's text, whatever the Member renamed the line to.
          ...(line.sourceText?.trim()
            ? { sourceText: line.sourceText.trim() }
            : {}),
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

/** The Batches a Scan's lines are saved as; the queue only records the source of Unmatched names. */
export const toSaveBatches = (
  lines: ReviewLine[],
  mode: Exclude<ScanMode, 'plate'>,
) =>
  lines
    .map(toNewBatch)
    .map((batch) => (batch.rawName ? { ...batch, source: mode } : batch));
