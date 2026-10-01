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
