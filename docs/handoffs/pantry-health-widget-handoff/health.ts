// Reference implementation of the Pantry health score and to-dos (handoff §4–§5).
// Pure: no React, no fetching. Ported from the prototype's logic; adapt the input
// types to the app's existing Pantry / Staples / Shopping query results.

export type Location = 'fridge' | 'freezer' | 'cupboard' | 'spices';
export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';

export interface HealthBatch {
  id: string;
  ingredientId: string | null; // null = Unmatched
  location: Location;
  quantity: number | null;
  unit: Unit | null;
  expiryDate: string | null; // YYYY-MM-DD
  createdAt: string; // ISO
  checkedAt?: string | null; // ISO, new column (handoff §6.3)
}

export interface HealthStaple {
  ingredientId: string;
  quantity: number | null;
  unit: Unit | null;
}

export interface HealthInput {
  today: string; // local YYYY-MM-DD
  staleThresholdDays: number;
  batches: HealthBatch[];
  staples: HealthStaple[];
  runningLow: Set<string>; // ingredient ids flagged Running low
  onShoppingList: Set<string>; // ingredient ids on the active list (checked or not)
}

export const CHECKS = ['fresh', 'staples', 'dated', 'rotation'] as const;
export type Check = (typeof CHECKS)[number];
export const WEIGHTS: Record<Check, number> = { fresh: 0.4, staples: 0.3, dated: 0.15, rotation: 0.15 };
export const LOCATION_LIMIT_DAYS: Record<Location, number> = { fridge: 21, freezer: 180, cupboard: 365, spices: 730 };

const DAY = 86_400_000;
const dayNum = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};
export const daysUntil = (expiryDate: string, today: string) => dayNum(expiryDate) - dayNum(today);

/** Days since the Batch was added or last checked ("Still good"). */
export function ageDays(b: HealthBatch, today: string): number {
  const from = b.checkedAt && b.checkedAt > b.createdAt ? b.checkedAt : b.createdAt;
  return dayNum(today) - dayNum(from);
}

const isLive = (b: HealthBatch, today: string) => b.expiryDate == null || daysUntil(b.expiryDate, today) >= 0;

export type StapleState = 'ok' | 'low' | 'onList' | 'missing';
export function stapleState(s: HealthStaple, input: HealthInput): StapleState {
  const stocked = input.batches.some((b) => b.ingredientId === s.ingredientId && isLive(b, input.today));
  if (!stocked) return input.onShoppingList.has(s.ingredientId) ? 'onList' : 'missing';
  return input.runningLow.has(s.ingredientId) ? 'low' : 'ok';
}

export const isForgotten = (b: HealthBatch, today: string) => ageDays(b, today) > LOCATION_LIMIT_DAYS[b.location];

export interface HealthScore {
  fresh: number;
  staples: number;
  dated: number;
  rotation: number;
  total: number;
}

export function healthScore(input: HealthInput): HealthScore {
  const { batches, staples, today, staleThresholdDays: thr } = input;
  const dated = batches.filter((b) => b.expiryDate != null);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 1);

  const fresh = mean(dated.map((b) => {
    const d = daysUntil(b.expiryDate!, today);
    return d < 0 ? 0 : d <= thr ? 0.6 : 1;
  }));
  const STAPLE_VALUE: Record<StapleState, number> = { ok: 1, low: 0.6, onList: 0.5, missing: 0 };
  const stp = mean(staples.map((s) => STAPLE_VALUE[stapleState(s, input)]));
  const datedShare = batches.length ? dated.length / batches.length : 1;
  const rotation = batches.length ? 1 - batches.filter((b) => isForgotten(b, today)).length / batches.length : 1;

  const r = { fresh: Math.round(fresh * 100), staples: Math.round(stp * 100), dated: Math.round(datedShare * 100), rotation: Math.round(rotation * 100) };
  const total = Math.round(CHECKS.reduce((s, k) => s + WEIGHTS[k] * r[k], 0));
  return { ...r, total };
}

export type Verdict = 'good' | 'some' | 'attention';
export const verdictOf = (v: number): Verdict => (v >= 85 ? 'good' : v >= 65 ? 'some' : 'attention');

/* ---------- to-dos ---------- */

export type TodoKey = 'expired' | 'missingStaples' | 'useSoon' | 'runningLow' | 'undated' | 'forgotten';
export type TodoGroup = 'now' | 'week' | 'tidy';

export interface Todo {
  key: TodoKey;
  group: TodoGroup;
  check: Check;
  /** Batch ids (expired, useSoon, undated, forgotten) or ingredient ids (missingStaples, runningLow). */
  itemIds: string[];
  /** Score points the bulk fix would add; 0 = hide the pill. */
  gain: number;
}

const GROUP: Record<TodoKey, TodoGroup> = { expired: 'now', missingStaples: 'now', useSoon: 'week', runningLow: 'week', undated: 'tidy', forgotten: 'tidy' };
const CHECK_OF: Record<TodoKey, Check> = { expired: 'fresh', missingStaples: 'staples', useSoon: 'fresh', runningLow: 'staples', undated: 'dated', forgotten: 'rotation' };

/** The bulk fix of each to-do applied to a copy of the input, for the gain pill (§5.4). */
function applyBulk(key: TodoKey, ids: string[], input: HealthInput): HealthInput | null {
  const set = new Set(ids);
  switch (key) {
    case 'expired':
      return { ...input, batches: input.batches.filter((b) => !set.has(b.id)) };
    case 'missingStaples':
    case 'runningLow':
      return { ...input, onShoppingList: new Set([...input.onShoppingList, ...ids]) };
    case 'undated':
      // Any date counts for the Dated check; use a far date so Fresh is not penalised.
      return { ...input, batches: input.batches.map((b) => (set.has(b.id) ? { ...b, expiryDate: '9999-12-31' } : b)) };
    case 'forgotten':
      return { ...input, batches: input.batches.map((b) => (set.has(b.id) ? { ...b, checkedAt: input.today + 'T12:00:00Z' } : b)) };
    case 'useSoon':
      return null; // cooking can't be simulated
  }
}

export function healthTodos(input: HealthInput): Todo[] {
  const { batches, staples, today, staleThresholdDays: thr } = input;
  const d = (b: HealthBatch) => daysUntil(b.expiryDate!, today);
  const ids: Record<TodoKey, string[]> = {
    // Sorting by Aisle for staples / running low / undated is left to the caller (needs Catalog data).
    expired: batches.filter((b) => b.expiryDate && d(b) < 0).sort((a, b) => d(a) - d(b)).map((b) => b.id),
    missingStaples: staples.filter((s) => stapleState(s, input) === 'missing').map((s) => s.ingredientId),
    useSoon: batches.filter((b) => b.expiryDate && d(b) >= 0 && d(b) <= thr).sort((a, b) => d(a) - d(b)).map((b) => b.id),
    runningLow: [...input.runningLow].filter((i) => !input.onShoppingList.has(i) && batches.some((b) => b.ingredientId === i && isLive(b, today))),
    undated: batches.filter((b) => b.expiryDate == null).map((b) => b.id),
    forgotten: batches
      .filter((b) => isForgotten(b, today))
      .sort((a, b) => ageDays(b, today) / LOCATION_LIMIT_DAYS[b.location] - ageDays(a, today) / LOCATION_LIMIT_DAYS[a.location])
      .map((b) => b.id),
  };
  const now = healthScore(input).total;
  const order: TodoKey[] = ['expired', 'missingStaples', 'useSoon', 'runningLow', 'undated', 'forgotten'];
  return order
    .filter((k) => ids[k].length > 0)
    .map((k) => {
      const after = applyBulk(k, ids[k], input);
      const gain = after ? Math.max(0, healthScore(after).total - now) : 0;
      return { key: k, group: GROUP[k], check: CHECK_OF[k], itemIds: ids[k], gain };
    });
}
