import { vi } from 'vitest';
import type { Mealtime, PlanIssue, SlotStatus } from '../lib/mealPlan';
import type { MealPlanDetail, PlanSlot } from '../lib/mealPlanPage';
import { stubViewport } from './viewport';

/** Thursday 15 October 2026. */
export const NOW = new Date(2026, 9, 15, 12, 0, 0);

export const iso = (offset: number) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function useFixedToday() {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  stubViewport(390);
}

export const issue = (over: Partial<PlanIssue> = {}): PlanIssue => ({
  ingredientId: 'ing-1',
  name: 'Tomatoes',
  kind: 'missing',
  quantity: 400,
  unit: 'g',
  onList: false,
  reason: { code: 'notInPantry' },
  ...over,
});

export const slot = (
  startOffset: number,
  dayIndex: number,
  mealtime: Mealtime,
  over: Partial<PlanSlot> = {},
): PlanSlot => ({
  dayIndex,
  date: iso(startOffset + dayIndex),
  mealtime,
  recipeId: `r-${dayIndex}-${mealtime}`,
  recipeTitle: `Recipe ${dayIndex} ${mealtime}`,
  servings: 2,
  servingsOverride: null,
  unavailable: false,
  status: 'covered' as SlotStatus,
  issues: [],
  ...over,
});

/** A plan starting `startOffset` days from the fixed today. */
export const plan = (
  over: Partial<MealPlanDetail> & { startOffset?: number } = {},
): MealPlanDetail => {
  const { startOffset = 0, ...rest } = over;
  return {
    id: 'p1',
    name: null,
    startDate: iso(startOffset),
    days: 3,
    servings: 2,
    slots: [],
    forecast: { tag: { kind: 'none' }, days: [] },
    ...rest,
  };
};

export const summary = (view: MealPlanDetail) => ({
  id: view.id,
  name: view.name,
  startDate: view.startDate,
  days: view.days,
  servings: view.servings,
});
