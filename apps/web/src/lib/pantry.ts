import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from './api';
import {
  recipeMatchingQueryKeys,
  suggestionsQueryKey,
  templateDetailsQueryKey,
} from './queryKeys';
import type { Aisle } from './staples';
import type { AmountScale } from './usualAmounts';
import { LOCATIONS, UNITS, type StorageLocation, type Unit } from './catalog';
import { useStaleThresholdDays } from './settings';

/** A calendar date as `YYYY-MM-DD`. */
export type IsoDate = string;

export type Batch = {
  id: string;
  /** Localised Ingredient name, or the typed name for an Unmatched Batch. */
  name: string;
  ingredientId: string | null;
  unmatched: boolean;
  /** The Ingredient's Aisle; null for an Unmatched Batch. */
  aisle: Aisle | null;
  /** The Ingredient's Amount Scale; null for an Unmatched Batch. */
  amountScale: AmountScale | null;
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  expiryDate: IsoDate | null;
  productDescription: string | null;
  createdAt: string;
};

export type NewBatch = {
  ingredientId?: string;
  rawName?: string;
  /** With `rawName` only: the Parent Category whose Other Leaf receives the Batch. */
  parentCategoryId?: string;
  /** With `rawName` only: the text as printed on the receipt or package, for the Admin queue to turn into a Synonym. */
  sourceText?: string;
  /** Unmatched only: the Scan Mode (or typed entry) the name came from, for the Admin queue. */
  source?: 'product' | 'receipt' | 'ingredients' | 'manual';
  quantity?: number | null;
  unit?: Unit | null;
  location: StorageLocation;
  /** `null` means no expiry. */
  expiryDate: IsoDate | null;
  productDescription?: string | null;
};

/** The days-left tag of an expiry date; `none` (no date) is shown only where its absence is worth saying. */
export type ExpiryTagState =
  | { tone: 'none'; kind: 'none' }
  | { tone: 'urgent'; kind: 'expired' | 'today' }
  | { tone: 'soon'; kind: 'tomorrow' }
  | { tone: 'soon'; kind: 'daysLeft'; days: number }
  | { tone: 'ok'; kind: 'days'; days: number };

const pad = (n: number) => String(n).padStart(2, '0');

export function localIso(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayNumber(iso: IsoDate): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Whole calendar days from `today` to the expiry date (negative once expired). */
export function daysUntil(expiryDate: IsoDate, today: Date): number {
  return dayNumber(expiryDate) - dayNumber(localIso(today));
}

/** Expiring Soon: from today through the Stale Threshold, in days. */
export function isExpiringSoon(days: number, staleThresholdDays: number) {
  return days >= 0 && days <= staleThresholdDays;
}

/**
 * The tag for an expiry date on the device's local `today`. Expiring Soon (at most the Family's Stale
 * Threshold days away) is amber, and so is tomorrow at any threshold; it always counts in days.
 */
export function expiryTagFor(
  expiryDate: IsoDate | null,
  today: Date,
  staleThresholdDays: number,
): ExpiryTagState {
  if (expiryDate === null) return { tone: 'none', kind: 'none' };
  const days = daysUntil(expiryDate, today);
  if (days < 0) return { tone: 'urgent', kind: 'expired' };
  if (days === 0) return { tone: 'urgent', kind: 'today' };
  if (days === 1) return { tone: 'soon', kind: 'tomorrow' };
  if (isExpiringSoon(days, staleThresholdDays))
    return { tone: 'soon', kind: 'daysLeft', days };
  return { tone: 'ok', kind: 'days', days };
}

/**
 * The Family's Stale Threshold, and the tag an expiry date gets on `today` with it. Changing the threshold
 * re-colours every tag on the next render.
 */
export function useExpiryTags(today: Date): {
  staleThresholdDays: number;
  tagFor: (expiryDate: IsoDate | null) => ExpiryTagState;
} {
  const { i18n } = useTranslation();
  const staleThresholdDays = useStaleThresholdDays(i18n.language);
  return {
    staleThresholdDays,
    tagFor: (expiryDate) => expiryTagFor(expiryDate, today, staleThresholdDays),
  };
}

/** A `YYYY-MM-DD` calendar date as local midnight, for formatting. */
export function fromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return localDate(y, m - 1, d);
}

/** Local midnight of a date. Unlike `new Date(y, m, d)`, years 0 to 99 stay as written. */
export function localDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(2000, 0, 1);
  date.setFullYear(year, monthIndex, day);
  return date;
}

/**
 * "Sat, Oct 11" in the UI locale, with the year only when it is not this year. `long` spells the weekday and
 * month out ("Saturday, October 11"), for accessible names.
 */
export function fullDate(
  expiryDate: IsoDate,
  today: Date,
  locale: string,
  width: 'short' | 'long' = 'short',
): string {
  const date = fromIso(expiryDate);
  return new Intl.DateTimeFormat(locale, {
    weekday: width,
    day: 'numeric',
    month: width,
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

/** "in 10 days", "tomorrow", "today", "yesterday", "3 days ago" in the UI locale. */
export function relativeDay(
  expiryDate: IsoDate,
  today: Date,
  locale: string,
): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    daysUntil(expiryDate, today),
    'day',
  );
}

/** An expiry date and how far away it is, e.g. `{ date: 'Sat, Oct 11', relative: 'in 10 days' }`. */
export function dateAndRelativeDay(
  expiryDate: IsoDate,
  today: Date,
  locale: string,
  width: 'short' | 'long' = 'short',
): { date: string; relative: string } {
  return {
    date: fullDate(expiryDate, today, locale, width),
    relative: relativeDay(expiryDate, today, locale),
  };
}

/** The pre-filled expiry (a `YYYY-MM-DD` string, or empty) for a Catalog default in days. */
export function defaultExpiryDate(days: number | null, today: Date): string {
  if (days === null) return '';
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  date.setDate(date.getDate() + days);
  return localIso(date);
}

/** Group Batches into Location sections, keeping row order and skipping empty Locations. */
export function groupByLocation(batches: Batch[]) {
  return LOCATIONS.map((location) => ({
    location,
    batches: batches.filter((batch) => batch.location === location),
  })).filter((group) => group.batches.length > 0);
}

export type PantryFilter = 'all' | StorageLocation;

export const FILTERS: PantryFilter[] = ['all', ...LOCATIONS];

/**
 * Lower-case and strip diacritics so "mamaliga" finds "Mămăligă". The Danish
 * letters fold as the API's matching key does (æ→ae, ø→oe, å→aa), so "maelk"
 * finds "Mælk".
 */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .toLocaleLowerCase()
    .replace(/a\u030A/g, 'aa')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/\p{Diacritic}/gu, '');
}

/** Search matches the localised name and the Product Description. */
export function matchesSearch(batch: Batch, query: string): boolean {
  const needle = fold(query.trim());
  if (needle === '') return true;
  return [batch.name, batch.productDescription ?? ''].some((text) =>
    fold(text).includes(needle),
  );
}

/** Batch counts for the filter chips: `all` plus one per Location. */
export function countByLocation(
  batches: Batch[],
): Record<PantryFilter, number> {
  const counts: Record<PantryFilter, number> = {
    all: batches.length,
    fridge: 0,
    freezer: 0,
    cupboard: 0,
    spices: 0,
  };
  for (const batch of batches) counts[batch.location] += 1;
  return counts;
}

export type RollUp = {
  /** Stable key: the Ingredient id, or the folded typed name for Unmatched Batches. */
  key: string;
  name: string;
  unmatched: boolean;
  /** The Ingredient's id; null for Unmatched Batches, which get the Default Icon. */
  ingredientId: string | null;
  /** The Ingredient's Aisle id, for the icon tint; null for Unmatched Batches. */
  aisleId: string | null;
  /** Soonest expiry first, Batches without one last. */
  batches: Batch[];
  /** One total per unit: units that disagree are listed separately, never converted. */
  totals: Array<{ unit: Unit; quantity: number }>;
  soonestExpiry: string | null;
};

function byExpiry(a: Batch, b: Batch): number {
  if (a.expiryDate === b.expiryDate) return 0;
  if (a.expiryDate === null) return 1;
  if (b.expiryDate === null) return -1;
  return a.expiryDate < b.expiryDate ? -1 : 1;
}

/** Roll Batches of the same Ingredient up into one row each, in order of soonest expiry. */
export function rollUp(batches: Batch[]): RollUp[] {
  const groups = new Map<string, Batch[]>();
  for (const batch of batches) {
    const key = batch.ingredientId ?? `unmatched:${fold(batch.name)}`;
    groups.set(key, [...(groups.get(key) ?? []), batch]);
  }
  return [...groups.entries()]
    .map(([key, members]) => {
      const sorted = [...members].sort(byExpiry);
      const sums = new Map<Unit, number>();
      for (const { quantity, unit } of sorted) {
        if (quantity === null || unit === null) continue;
        // Round away float noise: quantities have at most 3 decimals.
        sums.set(
          unit,
          Math.round(((sums.get(unit) ?? 0) + quantity) * 1000) / 1000,
        );
      }
      return {
        key,
        name: sorted[0].name,
        unmatched: sorted[0].unmatched,
        ingredientId: sorted[0].ingredientId,
        aisleId: sorted[0].aisle?.id ?? null,
        batches: sorted,
        totals: UNITS.filter((unit) => sums.has(unit)).map((unit) => ({
          unit,
          quantity: sums.get(unit) as number,
        })),
        soonestExpiry: sorted[0].expiryDate,
      };
    })
    .sort((a, b) => byExpiry(a.batches[0], b.batches[0]));
}

export function useBatches(locale: string) {
  return useQuery({
    queryKey: ['pantry', locale],
    queryFn: () =>
      apiRequest<{ batches: Batch[] }>(
        `/pantry?${new URLSearchParams({ locale })}`,
      ).then((body) => body.batches),
  });
}

export function useAddBatch(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batch: NewBatch) =>
      apiRequest<Batch>(`/pantry/batches?${new URLSearchParams({ locale })}`, {
        method: 'POST',
        body: batch,
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
        ...recipeMatchingQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: templateDetailsQueryKey }),
      ]),
  });
}

/** Parse the quantity field: blank is no quantity; otherwise the server's rules (0.001 to 1,000,000, at most 3 decimals, plain digits only). */
export function parseQuantity(text: string): {
  value: number | null;
  valid: boolean;
} {
  if (text.trim() === '') return { value: null, valid: true };
  const value = Number(text);
  const valid =
    // `Number` also takes 1e3, 0x10, Infinity and padding; only plain digits are valid.
    /^(\d+(\.\d*)?|\.\d+)$/.test(text) &&
    value >= 0.001 &&
    value <= 1_000_000 &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6;
  return { value, valid };
}

/** Parse a typed amount, where a decimal comma ("1,5") counts as a point. */
export function parseAmountText(text: string) {
  return parseQuantity(text.replace(',', '.'));
}

/** The fields to change; anything left out stays as it is. */
export type BatchEdit = {
  quantity?: number | null;
  unit?: Unit | null;
  location?: StorageLocation;
  /** `null` clears the expiry. */
  expiryDate?: string | null;
  productDescription?: string | null;
};

export function useUpdateBatch(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, edit }: { id: string; edit: BatchEdit }) =>
      apiRequest<Batch>(
        `/pantry/batches/${id}?${new URLSearchParams({ locale })}`,
        { method: 'PATCH', body: edit },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
        ...recipeMatchingQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: templateDetailsQueryKey }),
      ]),
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/pantry/batches/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
        ...recipeMatchingQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: templateDetailsQueryKey }),
      ]),
  });
}
