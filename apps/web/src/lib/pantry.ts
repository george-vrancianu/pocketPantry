import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { LOCATIONS, UNITS, type StorageLocation, type Unit } from './catalog';

export type Batch = {
  id: string;
  /** Localised Ingredient name, or the typed name for an Unmatched Batch. */
  name: string;
  ingredientId: string | null;
  unmatched: boolean;
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  /** `YYYY-MM-DD`, or null. */
  expiryDate: string | null;
  productDescription: string | null;
  /** Within the Family's Stale Threshold; derived by the API, never stored on the Batch. */
  expiringSoon: boolean;
  createdAt: string;
};

export type NewBatch = {
  ingredientId?: string;
  rawName?: string;
  /** With `rawName` only: the Parent Category whose Other Leaf receives the Batch. */
  parentCategoryId?: string;
  /** Unmatched only: the Scan Mode (or typed entry) the name came from, for the Admin queue. */
  source?: 'product' | 'receipt' | 'ingredients' | 'manual';
  quantity?: number | null;
  unit?: Unit | null;
  location: StorageLocation;
  /** `null` means no expiry. */
  expiryDate: string | null;
  productDescription?: string | null;
};

export type ExpiryChip =
  | { tone: 'urgent'; kind: 'today' | 'expired' }
  | { tone: 'soon'; kind: 'days'; days: number }
  | { tone: 'ok'; kind: 'date'; expiryDate: string };

const pad = (n: number) => String(n).padStart(2, '0');

function localIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Whole calendar days from `today` to the expiry date (negative once expired). */
export function daysUntil(expiryDate: string, today: Date): number {
  return dayNumber(expiryDate) - dayNumber(localIso(today));
}

/** `expiringSoon` comes from the API, which applies the Family's Stale Threshold. */
export function expiryChipFor(
  expiryDate: string | null,
  today: Date,
  expiringSoon: boolean,
): ExpiryChip | null {
  if (!expiryDate) return null;
  const days = daysUntil(expiryDate, today);
  if (days < 0) return { tone: 'urgent', kind: 'expired' };
  if (days === 0) return { tone: 'urgent', kind: 'today' };
  if (expiringSoon) return { tone: 'soon', kind: 'days', days };
  return { tone: 'ok', kind: 'date', expiryDate };
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

/** Lower-case and strip diacritics so "mamaliga" finds "Mămăligă". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
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

export function useBatches(locale: string, today: Date) {
  const localToday = localIso(today);
  return useQuery({
    queryKey: ['pantry', locale, localToday],
    queryFn: () =>
      apiRequest<{ batches: Batch[] }>(
        `/pantry?${new URLSearchParams({ locale, today: localToday })}`,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
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
    // `Number` accepts exponents such as 1e3; the user should type the number out.
    !/e/i.test(text) &&
    Number.isFinite(value) &&
    value >= 0.001 &&
    value <= 1_000_000 &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6;
  return { value, valid };
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/pantry/batches/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
  });
}
