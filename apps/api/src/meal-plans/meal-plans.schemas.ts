import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { mealtime } from '../database/schema';

export const MAX_PLAN_DAYS = 7;
export const MAX_SERVINGS = 1000;
export const MAX_NAME_LENGTH = 60;
/** How far ahead of the Member's today a plan may start. */
export const MAX_START_AHEAD_DAYS = 14;

export type Mealtime = (typeof mealtime.enumValues)[number];

/** `today` is the Member's local date; it defaults to the server's UTC date. */
export const mealPlanQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  today: z.iso.date().optional(),
});
export type MealPlanQuery = z.infer<typeof mealPlanQuery>;

const name = z.string().trim().max(MAX_NAME_LENGTH);
const startDate = z.iso.date();
const days = z.number().int().min(1).max(MAX_PLAN_DAYS);
const servings = z.number().int().min(1).max(MAX_SERVINGS);

/** An empty name is no name. */
export const nameOrNull = (value: string | null | undefined) =>
  value ? value : null;

/** `servings` defaults to the number of Members in the Family. */
export const createMealPlanBody = z.object({
  name: name.optional(),
  startDate,
  days,
  servings: servings.optional(),
});
export type CreateMealPlanBody = z.infer<typeof createMealPlanBody>;

export const updateMealPlanBody = z
  .object({
    name: name.nullable().optional(),
    startDate: startDate.optional(),
    days: days.optional(),
    servings: servings.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Provide at least one field',
  });
export type UpdateMealPlanBody = z.infer<typeof updateMealPlanBody>;

export const mealPlanIdParam = z.object({ id: z.uuid() });

export const slotParams = z.object({
  id: z.uuid(),
  dayIndex: z.coerce
    .number()
    .int()
    .min(0)
    .max(MAX_PLAN_DAYS - 1),
  mealtime: z.enum(mealtime.enumValues),
});
export type SlotParams = z.infer<typeof slotParams>;

/** `servings` overrides the plan's for this slot; leave it out to follow the plan. */
export const setSlotBody = z.object({
  recipeId: z.uuid(),
  servings: servings.optional(),
});
export type SetSlotBody = z.infer<typeof setSlotBody>;

export type MealPlanSummary = {
  id: string;
  name: string | null;
  startDate: string;
  days: number;
  servings: number;
};

export type PlanSlotView = {
  dayIndex: number;
  /** The plan's start date plus `dayIndex`. */
  date: string;
  mealtime: Mealtime;
  recipeId: string;
  recipeTitle: string;
  /** What the slot cooks for: its own override, else the plan's. */
  servings: number;
  /** The slot's own Servings; null follows the plan. */
  servingsOverride: number | null;
  /** The Recipe has been archived since. */
  unavailable: boolean;
};

export type MealPlanView = MealPlanSummary & { slots: PlanSlotView[] };
