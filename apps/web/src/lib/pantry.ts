import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { StorageLocation } from './catalog';

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';

export const LOCATIONS: StorageLocation[] = [
  'fridge',
  'freezer',
  'cupboard',
  'spices',
];
export const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'pcs'];

/** Batches expiring within this many days are Expiring Soon (configurable in a later ticket). */
export const STALE_THRESHOLD_DAYS = 3;

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
  createdAt: string;
};

export type NewBatch = {
  ingredientId?: string;
  rawName?: string;
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
  | { tone: 'ok'; kind: 'date'; days: number };

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

export function expiryChipFor(
  expiryDate: string | null,
  today: Date,
): ExpiryChip | null {
  if (!expiryDate) return null;
  const days = daysUntil(expiryDate, today);
  if (days < 0) return { tone: 'urgent', kind: 'expired' };
  if (days === 0) return { tone: 'urgent', kind: 'today' };
  if (days <= STALE_THRESHOLD_DAYS) return { tone: 'soon', kind: 'days', days };
  return { tone: 'ok', kind: 'date', days };
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
  });
}

/** Parse the quantity field: blank is no quantity; otherwise numeric(10,3) rules (at least 0.001, at most 3 decimals). */
export function parseQuantity(text: string): {
  value: number | null;
  valid: boolean;
} {
  if (text.trim() === '') return { value: null, valid: true };
  const value = Number(text);
  const valid =
    Number.isFinite(value) &&
    value >= 0.001 &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6;
  return { value, valid };
}

export type BatchEdit = {
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  /** `null` clears the expiry. */
  expiryDate: string | null;
  productDescription: string | null;
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
