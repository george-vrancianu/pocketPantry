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
  /** What Add missing for the window would put on the Shopping List: one entry per Ingredient not on it yet. */
  missing: MissingItem[];
};

/** Mirror of the API's `MissingItemView`. */
export type MissingItem = {
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: BaseUnit | null;
  recipeIds: string[];
};

/** What Add missing covers; the server works out the amounts itself, so none is ever sent. */
export type AddMissingScope =
  | { scope: 'window' }
  | { scope: 'plan'; planId: string }
  | { scope: 'date'; date: IsoDate }
  | { scope: 'ingredient'; ingredientId: string }
  | { scope: 'ingredient'; name: string };

/** Mirror of the API's `AddedMissingView`: the Shopping Items created (Undo deletes them) and how many Ingredients were added. */
export type AddedMissing = { createdIds: string[]; count: number };

/** Identifies an Ingredient across issues: its id, or the normalised name of an Unmatched one (as the server's forecast does). */
export const ingredientKey = (
  issue: Pick<PlanIssue, 'ingredientId' | 'name'>,
): string => issue.ingredientId ?? `name:${issue.name.trim().toLowerCase()}`;

/** Issues Add missing would put on the list: not uncertain, not on it already. */
const isAddable = (issue: PlanIssue) =>
  issue.kind !== 'uncertain' && !issue.onList;

/** The Ingredients of a day that Add missing for that day would add. */
export function dayMissing(day: WindowDay): PlanIssue[] {
  const byKey = new Map<string, PlanIssue>();
  for (const slot of day.slots) {
    if (slot.status === 'unavailable') continue;
    for (const issue of slot.issues) {
      if (isAddable(issue) && !byKey.has(ingredientKey(issue))) {
        byKey.set(ingredientKey(issue), issue);
      }
    }
  }
  return [...byKey.values()];
}

const WORST_FIRST: SlotStatus[] = ['short', 'onList', 'covered'];

/**
 * The window as it will read once the scope is on the Shopping List: those Ingredients' issues
 * turn "On list", so short slots become on list, and the missing list loses them. The same
 * rules as the server's forecast; the refetch that follows has the final say.
 */
export function flipOnList(view: MealWindow, add: AddMissingScope): MealWindow {
  const flipped = new Set<string>();
  const matches = (day: WindowDay, issue: PlanIssue): boolean => {
    if (!isAddable(issue)) return false;
    if (add.scope === 'window') return true;
    if (add.scope === 'date') return day.date === add.date;
    // The Widget never sends a plan scope; it covers the same days as the window it shows.
    if (add.scope === 'plan')
      return day.slots.some((s) => s.planId === add.planId);
    return 'ingredientId' in add
      ? issue.ingredientId === add.ingredientId
      : issue.ingredientId === null &&
          ingredientKey(issue) ===
            ingredientKey({ ingredientId: null, name: add.name });
  };
  for (const day of view.days) {
    for (const slot of day.slots) {
      if (slot.status === 'unavailable') continue;
      for (const issue of slot.issues) {
        if (matches(day, issue)) flipped.add(ingredientKey(issue));
      }
    }
  }
  const days = view.days.map((day): WindowDay => {
    const slots = day.slots.map((slot): WindowSlot => {
      if (slot.status === 'unavailable') return slot;
      const issues = slot.issues.map((issue) =>
        isAddable(issue) && flipped.has(ingredientKey(issue))
          ? { ...issue, onList: true }
          : issue,
      );
      const short = issues.some(isAddable);
      return {
        ...slot,
        issues,
        status: short
          ? 'short'
          : issues.some((issue) => issue.kind !== 'uncertain' && issue.onList)
            ? 'onList'
            : slot.status,
      };
    });
    const status =
      day.slots.length === 0
        ? day.status
        : (WORST_FIRST.find((s) => slots.some((sl) => sl.status === s)) ??
          'unavailable');
    return { ...day, slots, status };
  });
  const counted = days
    .flatMap((day) => day.slots)
    .filter((slot) => slot.status !== 'unavailable');
  const short = counted.filter((slot) => slot.status === 'short').length;
  const tag: PlanTag =
    counted.length === 0
      ? { kind: 'none' }
      : short > 0
        ? { kind: 'short', count: short }
        : counted.some((slot) => slot.status === 'onList')
          ? { kind: 'coveredOnceYouShop' }
          : { kind: 'allCovered' };
  return {
    ...view,
    days,
    tag,
    missing: view.missing.filter((item) => !flipped.has(ingredientKey(item))),
  };
}

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
