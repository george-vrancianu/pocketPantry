import { describe, expect, it } from 'vitest';
import {
  dayMissing,
  flipOnList,
  type MealWindow,
  type PlanIssue,
  type WindowDay,
  type WindowSlot,
} from './mealPlan';

const issue = (name: string): PlanIssue => ({
  ingredientId: null,
  name,
  kind: 'short',
  quantity: 1,
  unit: 'pcs',
  onList: false,
  reason: { code: 'notInPantry' },
});

const slot = (
  mealtime: WindowSlot['mealtime'],
  issues: PlanIssue[],
): WindowSlot => ({
  dayIndex: 0,
  date: '2026-10-15',
  mealtime,
  planId: 'p1',
  recipeId: `r-${mealtime}`,
  recipeTitle: 'Soup',
  servings: 2,
  servingsOverride: null,
  unavailable: false,
  minutes: 20,
  allergyWarning: null,
  aisle: null,
  status: 'short',
  issues,
});

describe('dayMissing', () => {
  it('counts Unmatched names as one when they normalise the same', () => {
    const day: WindowDay = {
      date: '2026-10-15',
      status: 'short',
      planId: 'p1',
      slots: [
        slot('lunch', [issue('Crème fraîche')]),
        slot('dinner', [issue('creme fraiche')]),
      ],
    };
    expect(dayMissing(day)).toHaveLength(1);
  });
});

describe('flipOnList', () => {
  const dayOf = (date: string, issues: PlanIssue[]): WindowDay => ({
    date,
    status: 'short',
    planId: 'p1',
    slots: [{ ...slot('dinner', issues), date }],
  });
  const view = (): MealWindow =>
    ({
      today: '2026-10-15',
      days: [
        dayOf('2026-10-15', [issue('Basil')]),
        dayOf('2026-10-16', [issue('basil')]),
      ],
      tag: { kind: 'short', count: 2 },
      missing: [],
    }) as unknown as MealWindow;

  it('turns only the added day on list, not a later day needing the same Ingredient', () => {
    const next = flipOnList(view(), { scope: 'date', date: '2026-10-15' });
    expect(next.days.map((d) => d.status)).toEqual(['onList', 'short']);
    expect(next.days[1].slots[0].issues[0].onList).toBe(false);
    expect(next.tag).toEqual({ kind: 'short', count: 1 });
  });

  it('turns a later day and the earlier days needing the same Ingredient on list when that day is added', () => {
    const next = flipOnList(view(), { scope: 'date', date: '2026-10-16' });
    expect(next.days.map((d) => d.status)).toEqual(['onList', 'onList']);
    expect(next.tag).toEqual({ kind: 'coveredOnceYouShop' });
  });

  it('turns every day on list for the window scope', () => {
    const next = flipOnList(view(), { scope: 'window' });
    expect(next.days.map((d) => d.status)).toEqual(['onList', 'onList']);
  });
});
