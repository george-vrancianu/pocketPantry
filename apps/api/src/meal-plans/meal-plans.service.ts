import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, asc, count, desc, eq, gte, isNull, ne } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { addDays } from '../common/dates';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import { mealPlanSlots, mealPlans, recipes, user } from '../database/schema';
import { lockMemberAndFamily, runLocked } from '../family/family-locks';
import {
  dayStatus,
  planTag,
  type SlotStatus,
} from '../recipes/matching/plan-forecast';
import { recipeTitles, visibleTo } from '../recipes/recipe-view';
import { SettingsService } from '../settings/settings.service';
import { utcToday } from '../shopping/batch-presence';
import {
  forecastFieldsOf,
  loadForecast,
  planEnd,
  slotKey,
} from './plan-forecast.loader';
import {
  MAX_SERVINGS,
  WINDOW_DAYS,
  MAX_START_AHEAD_DAYS,
  nameOrNull,
  type CreateMealPlanBody,
  type MealPlanSummary,
  type MealPlanView,
  type MealWindowView,
  type PlanSlotView,
  type WindowSlotView,
  type SetSlotBody,
  type SlotParams,
  type UpdateMealPlanBody,
} from './meal-plans.schemas';

type PlanRow = typeof mealPlans.$inferSelect;

const summary = (row: PlanRow): MealPlanSummary => ({
  id: row.id,
  name: row.name,
  startDate: row.startDate,
  days: row.days,
  servings: row.servings,
});

const notFound = () => new ApiException(404, 'meal_plan.not_found');

/**
 * Meal Plans are Family data: any Member reads and edits them, and another
 * Family's plan is a 404. Every write holds the Family lock, which serialises
 * the plan cap and the no-overlap rule.
 */
@Injectable()
export class MealPlansService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async list(memberId: string): Promise<{ mealPlans: MealPlanSummary[] }> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.familyId, familyId))
      .orderBy(desc(mealPlans.startDate), asc(mealPlans.id));
    return { mealPlans: rows.map(summary) };
  }

  async get(
    memberId: string,
    id: string,
    locale: CatalogLocale,
    today = utcToday(),
  ): Promise<MealPlanView> {
    const familyId = await this.settings.familyIdOf(memberId);
    return this.view(this.database, familyId, id, locale, today);
  }

  /**
   * The Widget's read: the Plan Forecast from the Member's `today` for up to
   * `WINDOW_DAYS` days across plans. Planned days run to the last date that has
   * a slot, so gap days inside the window come back `empty`.
   */
  async window(
    memberId: string,
    locale: CatalogLocale,
    today = utcToday(),
  ): Promise<MealWindowView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const through = addDays(today, WINDOW_DAYS - 1);
    const { plans, forecast, slots, missing } = await loadForecast(
      this.database,
      familyId,
      locale,
      today,
      through,
    );
    // The plan covering today, else the next one to start.
    const headline =
      plans.find((plan) => plan.startDate <= today && planEnd(plan) >= today) ??
      plans.find((plan) => plan.startDate > today);
    const beyond = plans.find((plan) => plan.startDate > through);
    return {
      today,
      days: forecast.days.map((day) => ({
        date: day.date,
        status: day.status,
        planId:
          plans.find(
            (plan) => plan.startDate <= day.date && planEnd(plan) >= day.date,
          )?.id ?? null,
        slots: day.slots.map((slot) => slots.get(slot.id) as WindowSlotView),
      })),
      tag: forecast.tag,
      plan: headline ? summary(headline) : null,
      nextPlanStart: beyond?.startDate ?? null,
      missing,
    };
  }

  async create(
    memberId: string,
    body: CreateMealPlanBody,
    locale: CatalogLocale,
    today = utcToday(),
  ): Promise<MealPlanView> {
    return runLocked(this.database, async (tx) => {
      const { familyId } = await lockMemberAndFamily(tx, memberId);
      const existing = await tx
        .select()
        .from(mealPlans)
        .where(eq(mealPlans.familyId, familyId));
      const cap = this.config.get('MEAL_PLAN_CAP', { infer: true });
      if (existing.length >= cap) {
        throw new ApiException(409, 'meal_plan.cap_reached', { cap });
      }
      assertStartDate(body.startDate, today);
      assertNoOverlap(existing, body.startDate, body.days);
      const [{ members }] = await tx
        .select({ members: count() })
        .from(user)
        .where(eq(user.familyId, familyId));
      const [row] = await tx
        .insert(mealPlans)
        .values({
          familyId,
          name: nameOrNull(body.name),
          startDate: body.startDate,
          days: body.days,
          servings:
            body.servings ?? Math.min(Math.max(members, 1), MAX_SERVINGS),
        })
        .returning();
      return this.view(tx, familyId, row.id, locale, today);
    });
  }

  async update(
    memberId: string,
    id: string,
    body: UpdateMealPlanBody,
    locale: CatalogLocale,
    today = utcToday(),
  ): Promise<MealPlanView> {
    return runLocked(this.database, async (tx) => {
      const { familyId } = await lockMemberAndFamily(tx, memberId);
      const plan = await this.findPlan(tx, familyId, id);
      const startDate = body.startDate ?? plan.startDate;
      const days = body.days ?? plan.days;

      const moved = startDate !== plan.startDate;
      if (moved) {
        // Moving would re-date past slots and make them editable again.
        if (plan.startDate < today) {
          throw new ApiException(400, 'meal_plan.already_started');
        }
        assertStartDate(startDate, today);
      }
      if (moved || days > plan.days) {
        const others = await tx
          .select()
          .from(mealPlans)
          .where(
            and(eq(mealPlans.familyId, familyId), ne(mealPlans.id, plan.id)),
          );
        assertNoOverlap(others, startDate, days);
      }
      if (days < plan.days) {
        const pastEnd = and(
          eq(mealPlanSlots.mealPlanId, plan.id),
          gte(mealPlanSlots.dayIndex, days),
        );
        const dropped = await tx
          .select({ dayIndex: mealPlanSlots.dayIndex })
          .from(mealPlanSlots)
          .where(pastEnd);
        // Past days are read-only, so their slots can't be dropped either.
        if (dropped.some((slot) => isPast(plan, slot.dayIndex, today))) {
          throw new ApiException(400, 'meal_plan.day_in_past');
        }
        await tx.delete(mealPlanSlots).where(pastEnd);
      }
      await tx
        .update(mealPlans)
        .set({
          ...(body.name !== undefined && { name: nameOrNull(body.name) }),
          startDate,
          days,
          ...(body.servings !== undefined && { servings: body.servings }),
        })
        .where(eq(mealPlans.id, plan.id));
      return this.view(tx, familyId, plan.id, locale, today);
    });
  }

  async remove(memberId: string, id: string): Promise<void> {
    await runLocked(this.database, async (tx) => {
      const { familyId } = await lockMemberAndFamily(tx, memberId);
      const plan = await this.findPlan(tx, familyId, id);
      await tx.delete(mealPlans).where(eq(mealPlans.id, plan.id));
    });
  }

  /** Puts a Recipe in a slot, replacing what was there. Omitting `servings` follows the plan. */
  async setSlot(
    memberId: string,
    { id, dayIndex, mealtime }: SlotParams,
    body: SetSlotBody,
    locale: CatalogLocale,
    today = utcToday(),
  ): Promise<MealPlanView> {
    return runLocked(this.database, async (tx) => {
      const { familyId } = await lockMemberAndFamily(tx, memberId);
      const plan = await this.findPlan(tx, familyId, id);
      assertEditableDay(plan, dayIndex, today);
      const [recipe] = await tx
        .select({ id: recipes.id })
        .from(recipes)
        .where(
          and(
            eq(recipes.id, body.recipeId),
            visibleTo(familyId),
            isNull(recipes.archivedAt),
          ),
        );
      if (!recipe) throw new ApiException(404, 'meal_plan.recipe_not_found');
      const servings = body.servings ?? null;
      await tx
        .insert(mealPlanSlots)
        .values({
          mealPlanId: plan.id,
          dayIndex,
          mealtime,
          recipeId: recipe.id,
          servings,
        })
        .onConflictDoUpdate({
          target: [
            mealPlanSlots.mealPlanId,
            mealPlanSlots.dayIndex,
            mealPlanSlots.mealtime,
          ],
          set: { recipeId: recipe.id, servings },
        });
      return this.view(tx, familyId, plan.id, locale, today);
    });
  }

  /** Empties a slot; clearing an empty one is fine. */
  async clearSlot(
    memberId: string,
    { id, dayIndex, mealtime }: SlotParams,
    today = utcToday(),
  ): Promise<void> {
    await runLocked(this.database, async (tx) => {
      const { familyId } = await lockMemberAndFamily(tx, memberId);
      const plan = await this.findPlan(tx, familyId, id);
      assertEditableDay(plan, dayIndex, today);
      await tx
        .delete(mealPlanSlots)
        .where(
          and(
            eq(mealPlanSlots.mealPlanId, plan.id),
            eq(mealPlanSlots.dayIndex, dayIndex),
            eq(mealPlanSlots.mealtime, mealtime),
          ),
        );
    });
  }

  private async findPlan(
    executor: Executor,
    familyId: string,
    id: string,
  ): Promise<PlanRow> {
    const [plan] = await executor
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.familyId, familyId)));
    if (!plan) throw notFound();
    return plan;
  }

  private async view(
    executor: Executor,
    familyId: string,
    id: string,
    locale: CatalogLocale,
    today: string,
  ): Promise<MealPlanView> {
    const plan = await this.findPlan(executor, familyId, id);
    const rows = await executor
      .select({ slot: mealPlanSlots, recipe: recipes })
      .from(mealPlanSlots)
      .innerJoin(recipes, eq(recipes.id, mealPlanSlots.recipeId))
      .where(eq(mealPlanSlots.mealPlanId, plan.id));
    const titles = await recipeTitles(
      executor,
      rows.map((row) => row.recipe),
      locale,
    );
    const { slots: forecasted } = await loadForecast(
      executor,
      familyId,
      locale,
      today,
      planEnd(plan),
    );
    const order = { breakfast: 0, lunch: 1, dinner: 2 };
    const slots = rows
      .map(({ slot, recipe }): PlanSlotView => ({
        dayIndex: slot.dayIndex,
        date: addDays(plan.startDate, slot.dayIndex),
        mealtime: slot.mealtime,
        recipeId: recipe.id,
        recipeTitle: titles.get(recipe.id) ?? recipe.title,
        servings: slot.servings ?? plan.servings,
        servingsOverride: slot.servings,
        unavailable: recipe.archivedAt !== null,
        ...forecastFieldsOf(
          forecasted.get(slotKey(plan.id, slot.dayIndex, slot.mealtime)),
        ),
      }))
      .sort(
        (a, b) =>
          a.dayIndex - b.dayIndex || order[a.mealtime] - order[b.mealtime],
      );
    // Past days carry no status; the tag and day statuses cover today onwards.
    const upcoming = slots.filter(
      (slot): slot is PlanSlotView & { status: SlotStatus } =>
        slot.status !== null,
    );
    const days = [];
    for (let i = 0; i < plan.days; i++) {
      const date = addDays(plan.startDate, i);
      if (date < today) continue;
      days.push({
        date,
        status: dayStatus(upcoming.filter((slot) => slot.date === date)),
      });
    }
    return {
      ...summary(plan),
      slots,
      forecast: { tag: planTag(upcoming), days },
    };
  }
}

/** From the Member's today up to `MAX_START_AHEAD_DAYS` later. */
function assertStartDate(startDate: string, today: string): void {
  if (startDate < today) {
    throw new ApiException(400, 'meal_plan.start_date_in_past');
  }
  if (startDate > addDays(today, MAX_START_AHEAD_DAYS)) {
    throw new ApiException(400, 'meal_plan.start_date_too_far', {
      max: MAX_START_AHEAD_DAYS,
    });
  }
}

/** Plans that only touch at the edges (one ends Tuesday, the next starts Wednesday) don't overlap. */
function assertNoOverlap(
  others: PlanRow[],
  startDate: string,
  days: number,
): void {
  const end = addDays(startDate, days - 1);
  const clash = others.find(
    (other) => other.startDate <= end && startDate <= planEnd(other),
  );
  if (clash) {
    throw new ApiException(409, 'meal_plan.overlap', {
      id: clash.id,
      name: clash.name,
      startDate: clash.startDate,
      days: clash.days,
    });
  }
}

/** The day must be inside the plan and not before the Member's today. */
function assertEditableDay(
  plan: Pick<PlanRow, 'startDate' | 'days'>,
  dayIndex: number,
  today: string,
): void {
  if (dayIndex >= plan.days) {
    throw new ApiException(400, 'meal_plan.day_out_of_range', {
      days: plan.days,
    });
  }
  if (isPast(plan, dayIndex, today)) {
    throw new ApiException(400, 'meal_plan.day_in_past');
  }
}

/** A day is past once its date is before the Member's today. */
const isPast = (
  plan: Pick<PlanRow, 'startDate'>,
  dayIndex: number,
  today: string,
) => addDays(plan.startDate, dayIndex) < today;
