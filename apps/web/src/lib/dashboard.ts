import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import { LOCATIONS, daysUntil, type Batch } from './pantry';
import type { StorageLocation } from './catalog';
import type { ShoppingList } from './shopping';

export type WidgetType =
  | 'use-soon'
  | 'shopping'
  | 'pantry-stock'
  | 'quick-scan'
  | 'meal-plan'
  | 'budget'
  | 'nutrition';
/** `tall` is two rows high on the four-column grid (900 px and up) and behaves as `wide` below it. */
export type WidgetSize = 'small' | 'wide' | 'tall';

/** One Widget on a Member's Dashboard. The same type may appear more than once. */
export type WidgetInstance = { id: string; type: WidgetType; size: WidgetSize };
export type DashboardLayout = { widgets: WidgetInstance[] };

export const DASHBOARD_LAYOUT_KEY = ['dashboard-layout'] as const;

/** The signed-in Member's own layout (a default one until they customise it). */
export function useDashboardLayout() {
  return useQuery({
    queryKey: DASHBOARD_LAYOUT_KEY,
    queryFn: () => apiRequest<DashboardLayout>('/dashboard-layout'),
  });
}

/** How many Batches the Use Soon Widget lists. */
export const USE_SOON_COUNT = 3;

/** The soonest-expiring Batches (already expired ones first); Batches without an expiry never qualify. */
export function soonestExpiring(
  batches: Batch[],
  today: Date,
  count = USE_SOON_COUNT,
): Batch[] {
  return batches
    .filter((batch) => batch.expiryDate !== null)
    .sort(
      (a, b) =>
        daysUntil(a.expiryDate as string, today) -
        daysUntil(b.expiryDate as string, today),
    )
    .slice(0, count);
}

/** Batch count per Location, in the fixed Location order, including empty Locations. */
export function stockByLocation(
  batches: Batch[],
): Array<{ location: StorageLocation; count: number }> {
  return LOCATIONS.map((location) => ({
    location,
    count: batches.filter((batch) => batch.location === location).length,
  }));
}

/** Names of the first unchecked Shopping Items, in Aisle order, and whether more remain. */
export function firstUncheckedNames(list: ShoppingList, count = 3) {
  const names = list.groups
    .flatMap((group) => group.items)
    .filter((item) => !item.checked)
    .map((item) => item.name);
  return { names: names.slice(0, count), hasMore: names.length > count };
}
