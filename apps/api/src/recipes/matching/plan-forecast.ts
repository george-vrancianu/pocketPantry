import { normalizeName } from '../../catalog/normalize';
import { addDays } from '../../common/dates';
import type { mealtime } from '../../database/schema';
import { toComparable, type Dimension, type Unit } from './units';

/**
 * The Plan Forecast: whether the Pantry still covers each Plan Slot once the
 * earlier slots have used up their ingredients and Batches have expired by
 * that day (ADR 0012). Pure, like `pantry-match.ts`: no database, no Nest.
 * The caller loads the slots, Recipes, Batches and Shopping List and reads the
 * result back. Comparable units and expiry follow ADR 0007.
 */

export type Mealtime = (typeof mealtime.enumValues)[number];
/** Breakfast, Lunch, Dinner: the order slots are used in within a day. */
const MEALTIME_ORDER: readonly Mealtime[] = ['breakfast', 'lunch', 'dinner'];

/** The unit a shortfall is reported in, one per dimension. */
export type BaseUnit = 'g' | 'ml' | 'pcs';
const BASE_UNIT: Record<Dimension, BaseUnit> = {
  mass: 'g',
  volume: 'ml',
  count: 'pcs',
};

export type ForecastSlot = {
  /** Opaque to the forecast; copied to the slot's result and to reasons. */
  id: string;
  /** YYYY-MM-DD. */
  date: string;
  mealtime: Mealtime;
  recipeId: string;
  /** The slot's effective Servings: its own override, else the plan's. */
  servings: number;
};

export type ForecastLine = {
  /** Null for an Unmatched line on a Family Recipe. */
  ingredientId: string | null;
  /** The Unmatched line's name as typed. */
  name: string | null;
  quantity: number | null;
  unit: Unit | null;
  optional: boolean;
  pantryBasic: boolean;
};

export type ForecastRecipe = {
  /** The Recipe's own Servings, which its line quantities are for. */
  servings: number;
  archived: boolean;
  lines: ForecastLine[];
};

export type ForecastBatch = {
  id: string;
  /** Null for an Unmatched Batch. */
  ingredientId: string | null;
  /** The Unmatched Batch's name as typed. */
  name: string | null;
  quantity: number | null;
  unit: Unit | null;
  expiryDate: string | null;
};

/** One unchecked entry of the active Shopping List (as Cook Tonight counts them). */
export type ForecastListEntry = {
  ingredientId: string | null;
  name: string | null;
};

export type ForecastInput = {
  /** The Member's local date; slots before it are left out. */
  today: string;
  slots: readonly ForecastSlot[];
  /** By Recipe id; a slot whose Recipe is missing here is unavailable. */
  recipes: Readonly<Record<string, ForecastRecipe>>;
  /** The Family's unexpired Batches. The caller drops those expired before `today`. */
  batches: readonly ForecastBatch[];
  /** Only turns short into onList; it is never stock. */
  shoppingList: readonly ForecastListEntry[];
};

export type MealRef = {
  slotId: string;
  date: string;
  mealtime: Mealtime;
  recipeId: string;
};

/** Why a line is short, with what the client needs to word it. */
export type Reason =
  | { code: 'usesLast'; meals: MealRef[] }
  | { code: 'expires'; date: string }
  | { code: 'notInPantry' }
  | { code: 'onlyLeftAfter'; amount: number; unit: BaseUnit; meals: MealRef[] }
  | { code: 'onlyInPantry'; amount: number; unit: BaseUnit }
  | { code: 'noQuantity' };

export type IssueKind = 'short' | 'missing' | 'uncertain';

export type ForecastIssue = {
  /** The Ingredient, or null for an Unmatched line. */
  ingredientId: string | null;
  /** The Unmatched line's name as typed; null for a matched line. */
  name: string | null;
  /** `short`: some was taken. `missing`: none was. `uncertain`: the amount can't be judged. */
  kind: IssueKind;
  /**
   * What is needed in `unit` (the shortfall for short and missing, the whole
   * scaled amount for uncertain); null when the line has no quantity.
   */
  quantity: number | null;
  unit: BaseUnit | null;
  onList: boolean;
  reason: Reason;
};

export type SlotStatus = 'covered' | 'onList' | 'short' | 'unavailable';
export type DayStatus = SlotStatus | 'empty';

export type SlotForecast = ForecastSlot & {
  status: SlotStatus;
  issues: ForecastIssue[];
};

export type DayForecast = {
  date: string;
  status: DayStatus;
  slots: SlotForecast[];
};

export type PlanTag =
  | { kind: 'short'; count: number }
  | { kind: 'coveredOnceYouShop' }
  | { kind: 'allCovered' }
  | { kind: 'none' };

export type Forecast = {
  /** In the order they were used. */
  slots: SlotForecast[];
  /** Planned days: today to the last date with a slot, gap days `empty`. */
  days: DayForecast[];
  tag: PlanTag;
};

type Identity = { ingredientId: string | null; name: string | null };

/** The Ingredient id, or the normalised name for an Unmatched line, Batch or list entry. */
const keyOf = ({ ingredientId, name }: Identity): string =>
  ingredientId ?? `name:${normalizeName(name ?? '')}`;

const EPSILON = 1e-9;
const round = (value: number) => Math.round(value * 1000) / 1000;
/** Rounds up, so a shortfall is never reported as nothing. */
const roundUp = (value: number) => Math.ceil(value * 1000 - 1e-9) / 1000;

/** A Batch's working copy: what is left of it as the slots use it up. */
type Stock = {
  batch: ForecastBatch;
  dimension: Dimension | null;
  remaining: number;
};

/**
 * Uses slots in order (date, then Breakfast, Lunch, Dinner). Each takes what it
 * covers from a working copy of the stock, soonest-expiring Batch first and
 * undated ones last, counting only Batches not Expired on the slot's day.
 */
export function forecastPlan(input: ForecastInput): Forecast {
  const { results, days, tag } = run(input);
  return { slots: results, days, tag };
}

/**
 * What the Batches have left once all `input.slots` have used them up, in
 * base units (g, ml, pcs) for Batches with a comparable quantity and as they
 * were for the rest. Fill ranks Recipes against this for a slot's day.
 */
export function stockLeft(input: ForecastInput): ForecastBatch[] {
  return run(input).stock.map(({ batch, dimension, remaining }) =>
    dimension === null
      ? batch
      : { ...batch, quantity: round(remaining), unit: BASE_UNIT[dimension] },
  );
}

function run(input: ForecastInput) {
  const slots = input.slots
    .filter((slot) => slot.date >= input.today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        MEALTIME_ORDER.indexOf(a.mealtime) - MEALTIME_ORDER.indexOf(b.mealtime),
    );
  const onList = new Set(input.shoppingList.map(keyOf));
  const stock = new Map<string, Stock[]>();
  for (const batch of input.batches) {
    const comparable = toComparable(batch.quantity, batch.unit);
    const list = stock.get(keyOf(batch)) ?? [];
    list.push({
      batch,
      dimension: comparable?.dimension ?? null,
      remaining: comparable?.amount ?? 0,
    });
    stock.set(keyOf(batch), list);
  }
  /** Who took from each Ingredient so far, for the reasons. */
  const takers = new Map<string, MealRef[]>();
  /** Ingredients already used once on a Batch with no comparable quantity. */
  const guessed = new Set<string>();

  const results = slots.map((slot): SlotForecast => {
    const recipe = input.recipes[slot.recipeId];
    if (!recipe || recipe.archived) {
      return { ...slot, status: 'unavailable', issues: [] };
    }
    const ref: MealRef = {
      slotId: slot.id,
      date: slot.date,
      mealtime: slot.mealtime,
      recipeId: slot.recipeId,
    };
    const issues: ForecastIssue[] = [];
    for (const line of recipe.lines) {
      if (line.optional || line.pantryBasic) continue;
      const key = keyOf(line);
      const all = stock.get(key) ?? [];
      const usable = all
        .filter(
          ({ batch }) =>
            batch.expiryDate === null || batch.expiryDate >= slot.date,
        )
        .sort(
          (a, b) =>
            (a.batch.expiryDate ?? '9999-12-31').localeCompare(
              b.batch.expiryDate ?? '9999-12-31',
            ) || a.batch.id.localeCompare(b.batch.id),
        );
      const prior = takers.get(key) ?? [];
      const issue = (
        kind: IssueKind,
        quantity: number | null,
        unit: BaseUnit | null,
        reason: Reason,
      ): ForecastIssue => ({
        ingredientId: line.ingredientId,
        name: line.ingredientId === null ? line.name : null,
        kind,
        quantity,
        unit,
        onList: onList.has(key),
        reason,
      });
      const absent = (): Reason => {
        // Only leftovers really expired: a Batch earlier slots used up did not.
        // A Batch with no comparable quantity is never used up, so it counts.
        const expired = all
          .filter(
            ({ dimension, remaining }) =>
              dimension === null || remaining > EPSILON,
          )
          .map(({ batch }) => batch.expiryDate)
          .filter((date): date is string => date !== null && date < slot.date);
        return expired.length > 0
          ? { code: 'expires', date: expired.sort().at(-1) as string }
          : { code: 'notInPantry' };
      };

      const required = toComparable(
        line.quantity === null
          ? null
          : (line.quantity * slot.servings) / recipe.servings,
        line.unit,
      );
      // No quantity to meet: presence is enough, and nothing is used up.
      if (required === null) {
        if (usable.length === 0)
          issues.push(issue('missing', null, null, absent()));
        continue;
      }
      const unit = BASE_UNIT[required.dimension];
      const comparable = usable.filter(
        (s) => s.dimension === required.dimension,
      );
      if (comparable.length === 0 && usable.length > 0) {
        // Batches exist but none can be compared: the first use is covered
        // and uses nothing up, later uses are uncertain.
        if (guessed.has(key)) {
          issues.push(
            issue('uncertain', round(required.amount), unit, {
              code: 'noQuantity',
            }),
          );
        }
        guessed.add(key);
        continue;
      }

      let outstanding = required.amount;
      for (const s of comparable) {
        const taken = Math.min(s.remaining, outstanding);
        s.remaining -= taken;
        outstanding -= taken;
        if (outstanding <= EPSILON) break;
      }
      const taken = required.amount - Math.max(outstanding, 0);
      if (taken > EPSILON) takers.set(key, [...prior, ref]);
      if (outstanding <= EPSILON) continue;

      // The usesLast / onlyLeftAfter split follows the handoff §5.4 table and
      // deliberately differs from planCoverage.ts, where onlyLeftAfter practically never
      // fires (only when just Batches in another unit are left).
      // usesLast needs the earlier slots to have emptied the stock: a remainder
      // that has expired by this slot's day is an expiry, not use.
      const expiredLeftover = all.some(
        ({ batch, dimension, remaining }) =>
          dimension === required.dimension &&
          remaining > EPSILON &&
          batch.expiryDate !== null &&
          batch.expiryDate < slot.date,
      );
      const reason: Reason =
        taken > EPSILON
          ? prior.length > 0
            ? {
                code: 'onlyLeftAfter',
                amount: round(taken),
                unit,
                meals: prior,
              }
            : { code: 'onlyInPantry', amount: round(taken), unit }
          : prior.length > 0 && !expiredLeftover
            ? { code: 'usesLast', meals: prior }
            : absent();
      issues.push(
        issue(
          taken > EPSILON ? 'short' : 'missing',
          roundUp(outstanding),
          unit,
          reason,
        ),
      );
    }
    return { ...slot, status: statusOf(issues), issues };
  });

  return {
    results,
    days: daysOf(input.today, results),
    tag: planTag(results),
    stock: [...stock.values()].flat(),
  };
}

/** Uncertain issues never make a slot short. */
function statusOf(issues: readonly ForecastIssue[]): SlotStatus {
  const shortfalls = issues.filter((issue) => issue.kind !== 'uncertain');
  if (shortfalls.length === 0) return 'covered';
  return shortfalls.every((issue) => issue.onList) ? 'onList' : 'short';
}

/** The worst status of a day's slots: short, onList, covered, then unavailable. */
export function dayStatus(slots: readonly { status: SlotStatus }[]): DayStatus {
  if (slots.length === 0) return 'empty';
  for (const status of ['short', 'onList', 'covered'] as const) {
    if (slots.some((slot) => slot.status === status)) return status;
  }
  return 'unavailable';
}

function daysOf(today: string, slots: readonly SlotForecast[]): DayForecast[] {
  const last = slots.at(-1)?.date;
  if (last === undefined) return [];
  const days: DayForecast[] = [];
  for (let date = today; date <= last; date = addDays(date, 1)) {
    const onDay = slots.filter((slot) => slot.date === date);
    days.push({ date, status: dayStatus(onDay), slots: onDay });
  }
  return days;
}

/**
 * The plan tag over some slots: how many are short, else whether they are
 * covered once the Member shops, else all covered. Unavailable slots don't count.
 */
export function planTag(slots: readonly { status: SlotStatus }[]): PlanTag {
  const counted = slots.filter((slot) => slot.status !== 'unavailable');
  if (counted.length === 0) return { kind: 'none' };
  const short = counted.filter((slot) => slot.status === 'short').length;
  if (short > 0) return { kind: 'short', count: short };
  return counted.some((slot) => slot.status === 'onList')
    ? { kind: 'coveredOnceYouShop' }
    : { kind: 'allCovered' };
}

export type MissingItem = {
  ingredientId: string | null;
  /** The Unmatched name as typed; null for an Ingredient. */
  name: string | null;
  /** Shortfalls added up; null when any contributing shortfall has no quantity (or they mix dimensions). */
  quantity: number | null;
  unit: BaseUnit | null;
  /** The Recipes that need it, in first-use order: its Source Recipes. */
  recipeIds: string[];
};

/**
 * What Add missing puts on the Shopping List: one item per Ingredient not
 * already on it, shortfalls added up in g, ml or pcs. Uncertain issues and
 * unavailable slots are left out. Works on any slice of days (one day, a plan).
 */
export function missingItems(days: readonly DayForecast[]): MissingItem[] {
  const items = new Map<string, MissingItem>();
  for (const day of days) {
    for (const slot of day.slots) {
      if (slot.status === 'unavailable') continue;
      for (const issue of slot.issues) {
        if (issue.kind === 'uncertain' || issue.onList) continue;
        const key = keyOf(issue);
        const item = items.get(key);
        if (!item) {
          items.set(key, {
            ingredientId: issue.ingredientId,
            name: issue.name,
            quantity: issue.quantity,
            unit: issue.unit,
            recipeIds: [slot.recipeId],
          });
          continue;
        }
        if (
          item.quantity === null ||
          issue.quantity === null ||
          item.unit !== issue.unit
        ) {
          item.quantity = null;
          item.unit = null;
        } else {
          item.quantity = round(item.quantity + issue.quantity);
        }
        if (!item.recipeIds.includes(slot.recipeId))
          item.recipeIds.push(slot.recipeId);
      }
    }
  }
  return [...items.values()];
}
