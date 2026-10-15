import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { IsoDate } from './pantry';
import { mealPlanQueryKey } from './queryKeys';

export type Mealtime = 'breakfast' | 'lunch' | 'dinner';
/** Breakfast, Lunch, Dinner: the order of the bars and of a day's meals. */
export const MEALTIMES: readonly Mealtime[] = ['breakfast', 'lunch', 'dinner'];

export type SlotStatus = 'covered' | 'onList' | 'short' | 'unavailable';
export type DayStatus = SlotStatus | 'empty';
export type BaseUnit = 'g' | 'ml' | 'pcs';

/** Mirrors of the API's `MealWindowView` and the types it is built from (apps/api/src/meal-plans). */
export type ReasonMeal = {
  date: IsoDate;
  mealtime: Mealtime;
  recipeId: string;
  recipeTitle: string;
};

export type PlanReason =
  | { code: 'usesLast'; meals: ReasonMeal[] }
  | { code: 'expires'; date: IsoDate }
  | { code: 'notInPantry' }
  | {
      code: 'onlyLeftAfter';
      amount: number;
      unit: BaseUnit;
      meals: ReasonMeal[];
    }
  | { code: 'onlyInPantry'; amount: number; unit: BaseUnit }
  | { code: 'noQuantity' };

export type PlanIssue = {
  ingredientId: string | null;
  name: string;
  /** `short`: some was taken. `missing`: none. `uncertain`: no Batch quantity to judge by. */
  kind: 'short' | 'missing' | 'uncertain';
  quantity: number | null;
  unit: BaseUnit | null;
  onList: boolean;
  reason: PlanReason;
};

export type WindowSlot = {
  dayIndex: number;
  date: IsoDate;
  mealtime: Mealtime;
  planId: string;
  recipeId: string;
  recipeTitle: string;
  servings: number;
  servingsOverride: number | null;
  unavailable: boolean;
  minutes: number | null;
  aisle: { id: string; name: string; sortOrder: number } | null;
  status: SlotStatus;
  issues: PlanIssue[];
};

export type WindowDay = {
  date: IsoDate;
  status: DayStatus;
  /** The plan covering this date; null for a day outside every plan. */
  planId: string | null;
  slots: WindowSlot[];
};

export type PlanTag =
  | { kind: 'short'; count: number }
  | { kind: 'coveredOnceYouShop' }
  | { kind: 'allCovered' }
  | { kind: 'none' };

export type MealPlanSummary = {
  id: string;
  name: string | null;
  startDate: IsoDate;
  days: number;
  servings: number;
};

export type MealWindow = {
  today: IsoDate;
  /** Planned days only, today to the last day with a Plan Slot; gap days are `empty`. */
  days: WindowDay[];
  tag: PlanTag;
  plan: MealPlanSummary | null;
  /** When the first plan starting beyond the window begins. */
  nextPlanStart: IsoDate | null;
  missing: unknown[];
};

export const mealWindowQueryKey = [...mealPlanQueryKey, 'window'] as const;

/** The Plan Forecast for the next 7 days from the Member's `today` (local date). */
export function useMealWindow(locale: string, today: IsoDate) {
  return useQuery({
    queryKey: [...mealWindowQueryKey, locale, today],
    queryFn: () =>
      apiRequest<MealWindow>(
        `/meal-plans/window?${new URLSearchParams({ locale, today })}`,
      ),
  });
}

/** The bar of one Mealtime in a day column: its slot's status, or `empty` with nothing planned there. */
export type BarStatus = SlotStatus | 'empty';

/** Three bars, Breakfast then Lunch then Dinner. */
export function barStatuses(day: WindowDay): BarStatus[] {
  return MEALTIMES.map(
    (mealtime) =>
      day.slots.find((slot) => slot.mealtime === mealtime)?.status ?? 'empty',
  );
}

/** What the 16 pt mark of a day column shows; `count` is the number of short meals. */
export type DayMark = { kind: DayStatus; count: number };

export function dayMark(day: WindowDay): DayMark {
  const count = day.slots.filter((slot) => slot.status === 'short').length;
  // A day of only unavailable Recipes has nothing to judge, like an empty one.
  return {
    kind: day.status === 'unavailable' ? 'empty' : day.status,
    count,
  };
}

/** The Recipe shown under the bars of a narrow window: Dinner, else the last planned meal. */
export function dayHeadline(day: WindowDay): WindowSlot | undefined {
  return (
    day.slots.find((slot) => slot.mealtime === 'dinner') ??
    day.slots[day.slots.length - 1]
  );
}

/** A day's slots in Mealtime order. */
export function slotsInOrder(day: WindowDay): WindowSlot[] {
  return [...day.slots].sort(
    (a, b) => MEALTIMES.indexOf(a.mealtime) - MEALTIMES.indexOf(b.mealtime),
  );
}

/** How many short ingredients a slot lists that are not on the Shopping List yet. */
export function unlistedShortCount(slot: WindowSlot): number {
  return slot.issues.filter(
    (issue) => issue.kind !== 'uncertain' && !issue.onList,
  ).length;
}
