import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { addDays } from '../common/dates';
import type { Executor } from '../database/database.types';
import {
  eatingMoments,
  mealPlanSlots,
  mealPlans,
  recipeEatingMoments,
  recipes,
} from '../database/schema';
import type { FillRecipe, FillSlot } from '../recipes/matching/plan-fill';
import {
  MEALTIME_ORDER,
  type ForecastBatch,
  type ForecastListEntry,
  type Mealtime,
} from '../recipes/matching/plan-forecast';
import { visibleTo } from '../recipes/recipe-view';
import {
  loadBatches,
  loadLines,
  loadShoppingList,
  slotKey,
} from './plan-forecast.loader';

type PlanRow = typeof mealPlans.$inferSelect;

/** Days before today whose slots still count for Fill's variety window. */
const LOOKBACK_DAYS = 2;

export type LoadedFill = {
  slots: FillSlot[];
  /** Where each empty slot sits in its plan, by slot id. */
  emptySlots: Map<string, { dayIndex: number; mealtime: Mealtime }>;
  recipes: FillRecipe[];
  eatingMomentIds: string[];
  batches: ForecastBatch[];
  shoppingList: ForecastListEntry[];
};

/**
 * Loads what `fillPlan` needs for one plan: its slots, empty ones included,
 * plus the Family's other filled slots from two days before `today` on (they
 * share the stock and the variety window); the Recipes the Family can see
 * (and those the slots use), with lines and Eating Moment uses; the Eating
 * Moments; the unexpired Batches and the active Shopping List.
 */
export async function loadFill(
  executor: Executor,
  familyId: string,
  plan: PlanRow,
  today: string,
): Promise<LoadedFill> {
  const from = addDays(today, -LOOKBACK_DAYS);
  const rows = await executor
    .select({ slot: mealPlanSlots, plan: mealPlans })
    .from(mealPlanSlots)
    .innerJoin(mealPlans, eq(mealPlans.id, mealPlanSlots.mealPlanId))
    .where(
      and(
        eq(mealPlans.familyId, familyId),
        sql`${mealPlans.startDate} + ${mealPlanSlots.dayIndex} >= ${from}::date`,
      ),
    );
  const filled: FillSlot[] = rows.map(({ slot, plan: owner }) => ({
    id: slotKey(owner.id, slot.dayIndex, slot.mealtime),
    date: addDays(owner.startDate, slot.dayIndex),
    mealtime: slot.mealtime,
    recipeId: slot.recipeId,
    servings: slot.servings ?? owner.servings,
  }));

  const taken = new Set(filled.map(({ id }) => id));
  const empty: FillSlot[] = [];
  const emptySlots: LoadedFill['emptySlots'] = new Map();
  for (let dayIndex = 0; dayIndex < plan.days; dayIndex++) {
    for (const mealtime of MEALTIME_ORDER) {
      const id = slotKey(plan.id, dayIndex, mealtime);
      if (taken.has(id)) continue;
      empty.push({
        id,
        date: addDays(plan.startDate, dayIndex),
        mealtime,
        recipeId: null,
        servings: plan.servings,
      });
      emptySlots.set(id, { dayIndex, mealtime });
    }
  }

  const visible = await executor
    .select()
    .from(recipes)
    .where(and(visibleTo(familyId), isNull(recipes.archivedAt)));
  const known = new Set(visible.map((recipe) => recipe.id));
  const extraIds = [
    ...new Set(
      filled.flatMap(({ recipeId }) =>
        recipeId === null || known.has(recipeId) ? [] : [recipeId],
      ),
    ),
  ];
  const extra =
    extraIds.length === 0
      ? []
      : await executor
          .select()
          .from(recipes)
          .where(inArray(recipes.id, extraIds));
  const recipeRows = [...visible, ...extra];

  const lines = await loadLines(executor, familyId, recipeRows);
  const uses = new Map<string, FillRecipe['moments']>();
  if (recipeRows.length > 0) {
    const momentRows = await executor
      .select({
        recipeId: recipeEatingMoments.recipeId,
        momentId: recipeEatingMoments.eatingMomentId,
        polarity: recipeEatingMoments.polarity,
      })
      .from(recipeEatingMoments)
      .where(
        inArray(
          recipeEatingMoments.recipeId,
          recipeRows.map((recipe) => recipe.id),
        ),
      );
    for (const { recipeId, ...use } of momentRows) {
      uses.set(recipeId, [...(uses.get(recipeId) ?? []), use]);
    }
  }
  const moments = await executor
    .select({ id: eatingMoments.id })
    .from(eatingMoments);

  return {
    slots: [...filled, ...empty],
    emptySlots,
    recipes: recipeRows.map((recipe) => ({
      id: recipe.id,
      groupId: recipe.parentId ?? recipe.id,
      servings: recipe.servings,
      archived: recipe.archivedAt !== null,
      lines: lines.get(recipe.id) ?? [],
      moments: uses.get(recipe.id) ?? [],
    })),
    eatingMomentIds: moments.map(({ id }) => id),
    batches: await loadBatches(executor, familyId, today),
    shoppingList: await loadShoppingList(executor, familyId),
  };
}
