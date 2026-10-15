import { describe, expect, it } from 'vitest';
import {
  dayMissing,
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
