import { and, asc, eq, inArray } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import {
  loadIngredientPlacements,
  type AisleView,
  type IngredientPlacement,
} from '../catalog/ingredient-placement';
import { addDays } from '../common/dates';
import type { Executor } from '../database/database.types';
import {
  batches,
  mealPlanSlots,
  mealPlans,
  recipeIngredientLines,
  recipes,
  shoppingItems,
  shoppingLists,
} from '../database/schema';
import { recipeTitles } from '../recipes/recipe-view';
import {
  forecastPlan,
  missingItems,
  type Forecast,
  type ForecastBatch,
  type ForecastLine,
  type ForecastListEntry,
  type ForecastRecipe,
  type ForecastSlot,
  type MealRef,
  type Reason,
} from '../recipes/matching/plan-forecast';
import { unexpiredBatch } from '../shopping/batch-presence';
import type {
  MissingItemView,
  PlanIssueView,
  PlanReasonView,
  PlanSlotView,
  WindowSlotView,
} from './meal-plans.schemas';

type PlanRow = typeof mealPlans.$inferSelect;

/** The date of a plan's last day. */
export const planEnd = (plan: Pick<PlanRow, 'startDate' | 'days'>) =>
  addDays(plan.startDate, plan.days - 1);

/** Identifies a Plan Slot across plans. */
export const slotKey = (
  planId: string,
  dayIndex: number,
  mealtime: string,
): string => `${planId}:${dayIndex}:${mealtime}`;

export type LoadedForecast = {
  /** Every Meal Plan of the Family, earliest start first. */
  plans: PlanRow[];
  forecast: Forecast;
  /** The forecast's slots from today to `through`, by `slotKey`, ready to send. */
  slots: Map<string, WindowSlotView>;
  /** What Add missing would add for those slots. */
  missing: MissingItemView[];
};

/**
 * Loads a Family's Plan Slots from `today` to `through` (across all of its
 * plans), the Recipes they use, its unexpired Batches and its active Shopping
 * List, and works out the Plan Forecast. Reads only the Family's own rows.
 */
export async function loadForecast(
  executor: Executor,
  familyId: string,
  locale: CatalogLocale,
  today: string,
  through: string,
): Promise<LoadedForecast> {
  const plans = await executor
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.familyId, familyId))
    .orderBy(asc(mealPlans.startDate));
  const ahead = plans.filter(
    (plan) => plan.startDate <= through && planEnd(plan) >= today,
  );
  const planOf = new Map(ahead.map((plan) => [plan.id, plan]));

  const rows =
    ahead.length === 0
      ? []
      : await executor
          .select({ slot: mealPlanSlots, recipe: recipes })
          .from(mealPlanSlots)
          .innerJoin(recipes, eq(recipes.id, mealPlanSlots.recipeId))
          .where(
            inArray(
              mealPlanSlots.mealPlanId,
              ahead.map((plan) => plan.id),
            ),
          );
  const placed = rows
    .map(({ slot, recipe }) => {
      const plan = planOf.get(slot.mealPlanId) as PlanRow;
      return {
        plan,
        slot,
        recipe,
        date: addDays(plan.startDate, slot.dayIndex),
      };
    })
    .filter(({ date }) => date >= today && date <= through);

  const recipeRows = [
    ...new Map(placed.map(({ recipe }) => [recipe.id, recipe])).values(),
  ];
  const titles = await recipeTitles(executor, recipeRows, locale);
  const lines = await loadLines(executor, familyId, recipeRows);

  const scope = catalogScope(familyId);
  const placements = await loadIngredientPlacements(executor, scope, locale, [
    ...new Set(
      [...lines.values()].flatMap((recipeLines) =>
        recipeLines.flatMap((line) =>
          line.ingredientId === null ? [] : [line.ingredientId],
        ),
      ),
    ),
  ]);

  const forecastRecipes: Record<string, ForecastRecipe> = {};
  for (const recipe of recipeRows) {
    forecastRecipes[recipe.id] = {
      servings: recipe.servings,
      archived: recipe.archivedAt !== null,
      lines: lines.get(recipe.id) ?? [],
    };
  }
  const slots: ForecastSlot[] = placed.map(({ plan, slot, recipe, date }) => ({
    id: slotKey(plan.id, slot.dayIndex, slot.mealtime),
    date,
    mealtime: slot.mealtime,
    recipeId: recipe.id,
    servings: slot.servings ?? plan.servings,
  }));

  const forecast = forecastPlan({
    today,
    slots,
    recipes: forecastRecipes,
    batches: await loadBatches(executor, familyId, today),
    shoppingList: await loadShoppingList(executor, familyId),
  });

  const nameOf = (ingredientId: string | null, name: string | null) =>
    ingredientId === null
      ? (name ?? '')
      : (placements.get(ingredientId)?.name ?? '');
  const titleOf = (recipeId: string) => titles.get(recipeId) ?? '';
  const meals = (refs: MealRef[]) =>
    refs.map(({ date, mealtime, recipeId }) => ({
      date,
      mealtime,
      recipeId,
      recipeTitle: titleOf(recipeId),
    }));
  const reasonView = (reason: Reason): PlanReasonView =>
    'meals' in reason ? { ...reason, meals: meals(reason.meals) } : reason;

  const details = new Map(
    placed.map((entry) => [
      slotKey(entry.plan.id, entry.slot.dayIndex, entry.slot.mealtime),
      entry,
    ]),
  );
  const views = new Map<string, WindowSlotView>();
  for (const result of forecast.slots) {
    const { plan, slot, recipe, date } = details.get(
      result.id,
    ) as (typeof placed)[number];
    views.set(result.id, {
      planId: plan.id,
      dayIndex: slot.dayIndex,
      date,
      mealtime: slot.mealtime,
      recipeId: recipe.id,
      recipeTitle: titleOf(recipe.id),
      minutes: minutesOf(recipe),
      aisle: tileAisle(lines.get(recipe.id) ?? [], placements),
      servings: result.servings,
      servingsOverride: slot.servings,
      unavailable: recipe.archivedAt !== null,
      status: result.status,
      issues: result.issues.map((issue): PlanIssueView => ({
        ingredientId: issue.ingredientId,
        name: nameOf(issue.ingredientId, issue.name),
        kind: issue.kind,
        quantity: issue.quantity,
        unit: issue.unit,
        onList: issue.onList,
        reason: reasonView(issue.reason),
      })),
    });
  }
  const missing = missingItems(forecast.days).map((item): MissingItemView => ({
    ingredientId: item.ingredientId,
    name: nameOf(item.ingredientId, item.name),
    quantity: item.quantity,
    unit: item.unit,
    recipeIds: item.recipeIds,
  }));
  return { plans, forecast, slots: views, missing };
}

/** The slot fields a plan read shares with the window. */
export function forecastFieldsOf(
  view: WindowSlotView | undefined,
): Pick<PlanSlotView, 'status' | 'issues'> {
  return view
    ? { status: view.status, issues: view.issues }
    : { status: null, issues: [] };
}

const minutesOf = (recipe: typeof recipes.$inferSelect): number | null =>
  recipe.prepMinutes === null && recipe.cookMinutes === null
    ? null
    : (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

type LoadedLine = ForecastLine;

async function loadLines(
  executor: Executor,
  familyId: string,
  recipeRows: (typeof recipes.$inferSelect)[],
): Promise<Map<string, LoadedLine[]>> {
  const result = new Map<string, LoadedLine[]>();
  if (recipeRows.length === 0) return result;
  const ingredients = catalogScope(familyId).ingredients(executor);
  const rows = await executor
    .select({
      recipeId: recipeIngredientLines.recipeId,
      ingredientId: recipeIngredientLines.ingredientId,
      name: recipeIngredientLines.rawName,
      quantity: recipeIngredientLines.quantity,
      unit: recipeIngredientLines.unit,
      optional: recipeIngredientLines.optional,
      pantryBasic: ingredients.pantryBasic,
    })
    .from(recipeIngredientLines)
    .leftJoin(
      ingredients,
      eq(ingredients.id, recipeIngredientLines.ingredientId),
    )
    .where(
      inArray(
        recipeIngredientLines.recipeId,
        recipeRows.map((recipe) => recipe.id),
      ),
    )
    .orderBy(asc(recipeIngredientLines.position));
  for (const { recipeId, pantryBasic, ...line } of rows) {
    const list = result.get(recipeId) ?? [];
    list.push({ ...line, pantryBasic: pantryBasic ?? false });
    result.set(recipeId, list);
  }
  return result;
}

/** The Aisle of the Recipe's first Ingredient Line that has one. */
function tileAisle(
  lines: LoadedLine[],
  placements: Map<string, IngredientPlacement>,
): AisleView | null {
  for (const line of lines) {
    const aisle =
      line.ingredientId === null
        ? undefined
        : placements.get(line.ingredientId)?.aisle;
    if (aisle) return aisle;
  }
  return null;
}

async function loadBatches(
  executor: Executor,
  familyId: string,
  today: string,
): Promise<ForecastBatch[]> {
  const rows = await executor
    .select({
      id: batches.id,
      ingredientId: batches.ingredientId,
      name: batches.rawName,
      quantity: batches.quantity,
      unit: batches.unit,
      expiryDate: batches.expiryDate,
    })
    .from(batches)
    .where(and(eq(batches.familyId, familyId), unexpiredBatch(today)));
  return rows;
}

/** The unchecked items on the active list, as Cook Tonight counts them (by stored normalised name). */
async function loadShoppingList(
  executor: Executor,
  familyId: string,
): Promise<ForecastListEntry[]> {
  return executor
    .select({
      ingredientId: shoppingItems.ingredientId,
      name: shoppingItems.normalizedName,
    })
    .from(shoppingItems)
    .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
    .where(
      and(
        eq(shoppingLists.familyId, familyId),
        eq(shoppingLists.status, 'active'),
        eq(shoppingItems.checked, false),
      ),
    );
}
