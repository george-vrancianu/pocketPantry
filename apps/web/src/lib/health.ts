import type { StorageLocation } from './catalog';
import {
  daysUntil,
  defaultExpiryDate,
  fromIso,
  isExpiringSoon,
  localIso,
  type IsoDate,
} from './pantry';

/**
 * Pantry Health: the 0-100 score of how well a Family's Pantry is kept, and the Health To-dos behind
 * it. Pure and client-side; the Widget feeds it what the Dashboard already loads.
 */

/** A Pantry holding fewer Batches than this gets no score, only a progress ring. */
export const MIN_BATCHES_FOR_SCORE = 10;

export const FACTORS = ['fresh', 'staples', 'dated', 'rotation'] as const;
export type HealthFactor = (typeof FACTORS)[number];

/** Each Health Factor's share of the total, in percent. */
export const FACTOR_WEIGHTS: Record<HealthFactor, number> = {
  fresh: 40,
  staples: 30,
  dated: 15,
  rotation: 15,
};

/** How long an undated Batch may sit in a Location before it counts as Forgotten, in days. */
export const FORGOTTEN_AFTER_DAYS: Record<StorageLocation, number> = {
  fridge: 21,
  freezer: 180,
  cupboard: 365,
  spices: 730,
};

export type HealthBatch = {
  id: string;
  /** Null for an Unmatched Batch. */
  ingredientId: string | null;
  location: StorageLocation;
  expiryDate: IsoDate | null;
  /** The Default Expiry in days, resolved by the server; null when there is none. */
  defaultExpiryDays: number | null;
  createdAt: string;
};

export type HealthInput = {
  /** The device's local date. */
  today: IsoDate;
  staleThresholdDays: number;
  batches: HealthBatch[];
  staples: Array<{ ingredientId: string }>;
  /** Ingredient ids flagged Running low. */
  runningLow: ReadonlySet<string>;
  /** Ingredient ids on the Shopping List, checked or not. */
  onShoppingList: ReadonlySet<string>;
  /** Ingredient ids whose missing-Staple Suggestion was dismissed. */
  dismissed: ReadonlySet<string>;
};

export type Verdict = 'good' | 'some' | 'attention';

export const verdictOf = (total: number): Verdict =>
  total >= 85 ? 'good' : total >= 65 ? 'some' : 'attention';

export type PantryHealth =
  | { scored: false; batchCount: number }
  | {
      scored: true;
      factors: Record<HealthFactor, number>;
      total: number;
      verdict: Verdict;
    };

const todayDate = (input: HealthInput) => fromIso(input.today);

const daysLeft = (batch: HealthBatch, input: HealthInput) =>
  daysUntil(batch.expiryDate as IsoDate, todayDate(input));

/** Not expired: undated, or expiring today or later. */
const isLive = (batch: HealthBatch, input: HealthInput) =>
  batch.expiryDate === null || daysLeft(batch, input) >= 0;

/** Whole days since the Batch was added, by the device's calendar. */
export const ageDays = (
  batch: Pick<HealthBatch, 'createdAt'>,
  today: IsoDate,
) => -daysUntil(localIso(new Date(batch.createdAt)), fromIso(today));

const overdueRatio = (batch: HealthBatch, input: HealthInput) =>
  ageDays(batch, input.today) / FORGOTTEN_AFTER_DAYS[batch.location];

/** An undated Batch older than its Location's limit. A dated Batch is never Forgotten. */
export function isForgotten(batch: HealthBatch, today: IsoDate): boolean {
  return (
    batch.expiryDate === null &&
    ageDays(batch, today) > FORGOTTEN_AFTER_DAYS[batch.location]
  );
}

type StapleState = 'stocked' | 'low' | 'onList' | 'missing';

function stapleState(ingredientId: string, input: HealthInput): StapleState {
  const stocked = input.batches.some(
    (batch) => batch.ingredientId === ingredientId && isLive(batch, input),
  );
  if (!stocked)
    return input.onShoppingList.has(ingredientId) ? 'onList' : 'missing';
  return input.runningLow.has(ingredientId) ? 'low' : 'stocked';
}

const STAPLE_VALUE: Record<StapleState, number> = {
  stocked: 1,
  low: 0.6,
  onList: 0.5,
  missing: 0,
};

const mean = (values: number[]) =>
  values.length === 0 ? 1 : values.reduce((a, b) => a + b, 0) / values.length;

export function pantryHealth(input: HealthInput): PantryHealth {
  const { batches } = input;
  if (batches.length < MIN_BATCHES_FOR_SCORE)
    return { scored: false, batchCount: batches.length };

  const dated = batches.filter((batch) => batch.expiryDate !== null);
  const fresh = mean(
    dated.map((batch) => {
      const days = daysLeft(batch, input);
      if (days < 0) return 0;
      return isExpiringSoon(days, input.staleThresholdDays) ? 0.6 : 1;
    }),
  );
  const staples = mean(
    input.staples
      .filter((staple) => !input.dismissed.has(staple.ingredientId))
      .map((staple) => STAPLE_VALUE[stapleState(staple.ingredientId, input)]),
  );
  const datedShare = dated.length / batches.length;
  const rotation =
    1 -
    batches.filter((batch) => isForgotten(batch, input.today)).length /
      batches.length;

  const percent = (value: number) => Math.round(value * 100);
  const factors = {
    fresh: percent(fresh),
    staples: percent(staples),
    dated: percent(datedShare),
    rotation: percent(rotation),
  };
  const total = Math.round(
    FACTORS.reduce(
      (sum, factor) => sum + (FACTOR_WEIGHTS[factor] * factors[factor]) / 100,
      0,
    ),
  );
  return { scored: true, factors, total, verdict: verdictOf(total) };
}

/**
 * The date "Date all" gives a Batch: its Default Expiry counted from the day it was added, or from today
 * when that date has already passed. Null when the Batch has no Default Expiry.
 */
export function usualExpiryDate(
  batch: Pick<HealthBatch, 'createdAt' | 'defaultExpiryDays'>,
  today: IsoDate,
): IsoDate | null {
  if (batch.defaultExpiryDays === null) return null;
  const fromAdded = defaultExpiryDate(
    batch.defaultExpiryDays,
    new Date(batch.createdAt),
  );
  return fromAdded < today
    ? defaultExpiryDate(batch.defaultExpiryDays, fromIso(today))
    : fromAdded;
}

export type HealthTodoKey =
  'expired' | 'missingStaples' | 'expiringSoon' | 'runningLow' | 'undated';
/** The Health To-do keys in display order. */
export const HEALTH_TODO_KEYS: HealthTodoKey[] = [
  'expired',
  'missingStaples',
  'expiringSoon',
  'runningLow',
  'undated',
];
export type HealthTodoGroup = 'now' | 'week' | 'tidy';

export type HealthTodo = {
  key: HealthTodoKey;
  group: HealthTodoGroup;
  factor: HealthFactor;
  /** Batch ids (expired, expiringSoon, undated) or Ingredient ids (missingStaples, runningLow). */
  itemIds: string[];
  /** Points the bulk fix adds to the score; 0 hides the pill (also while not scored). */
  gain: number;
};

type PendingTodo = Omit<HealthTodo, 'gain'>;

/** The input after the bulk fix of a Health To-do, or null when the fix cannot be simulated. */
function afterFix(todo: PendingTodo, input: HealthInput): HealthInput | null {
  const ids = new Set(todo.itemIds);
  switch (todo.key) {
    case 'expired':
      return {
        ...input,
        batches: input.batches.filter((batch) => !ids.has(batch.id)),
      };
    case 'missingStaples':
    case 'runningLow':
      return {
        ...input,
        onShoppingList: new Set([...input.onShoppingList, ...ids]),
      };
    case 'undated':
      return {
        ...input,
        batches: input.batches.map((batch) =>
          ids.has(batch.id)
            ? {
                ...batch,
                expiryDate:
                  usualExpiryDate(batch, input.today) ?? batch.expiryDate,
              }
            : batch,
        ),
      };
    case 'expiringSoon': // The fix is cooking, which cannot be simulated.
      return null;
  }
}

/** Points the bulk fix adds to the score, 0 when it adds none, cannot be simulated or the Pantry is not scored. */
function gainOf(todo: PendingTodo, input: HealthInput): number {
  const now = pantryHealth(input);
  const fixed = afterFix(todo, input);
  if (!now.scored || fixed === null) return 0;
  const after = pantryHealth(fixed);
  return after.scored ? Math.max(0, after.total - now.total) : 0;
}

const byDaysLeft = (input: HealthInput) => (a: HealthBatch, b: HealthBatch) =>
  daysLeft(a, input) - daysLeft(b, input);

/**
 * The Health To-dos in group order (Now, This week, Tidy up). Items of Ingredient-based to-dos and the
 * undated rest keep the order given; putting them in Aisle order is the caller's job.
 */
export function healthTodos(input: HealthInput): HealthTodo[] {
  const dated = input.batches.filter((batch) => batch.expiryDate !== null);
  const expired = dated
    .filter((batch) => daysLeft(batch, input) < 0)
    .sort(byDaysLeft(input));
  const expiringSoon = dated
    .filter((batch) =>
      isExpiringSoon(daysLeft(batch, input), input.staleThresholdDays),
    )
    .sort(byDaysLeft(input));
  const missingStaples = input.staples
    .map((staple) => staple.ingredientId)
    .filter(
      (id) => !input.dismissed.has(id) && stapleState(id, input) === 'missing',
    );
  const runningLow = [...input.runningLow].filter(
    (id) =>
      !input.onShoppingList.has(id) &&
      input.batches.some(
        (batch) => batch.ingredientId === id && isLive(batch, input),
      ),
  );
  const undated = input.batches.filter((batch) => batch.expiryDate === null);
  const forgotten = undated
    .filter((batch) => isForgotten(batch, input.today))
    .sort((a, b) => overdueRatio(b, input) - overdueRatio(a, input));
  const rest = undated.filter((batch) => !isForgotten(batch, input.today));

  const todos: PendingTodo[] = [
    {
      key: 'expired',
      group: 'now',
      factor: 'fresh',
      itemIds: expired.map((batch) => batch.id),
    },
    {
      key: 'missingStaples',
      group: 'now',
      factor: 'staples',
      itemIds: missingStaples,
    },
    {
      key: 'expiringSoon',
      group: 'week',
      factor: 'fresh',
      itemIds: expiringSoon.map((batch) => batch.id),
    },
    {
      key: 'runningLow',
      group: 'week',
      factor: 'staples',
      itemIds: runningLow,
    },
    {
      key: 'undated',
      group: 'tidy',
      factor: 'dated',
      itemIds: [...forgotten, ...rest].map((batch) => batch.id),
    },
  ];
  return todos
    .filter((todo) => todo.itemIds.length > 0)
    .map((todo) => ({ ...todo, gain: gainOf(todo, input) }));
}
