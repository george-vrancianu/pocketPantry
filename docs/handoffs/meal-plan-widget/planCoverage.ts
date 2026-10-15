// Reference implementation of the Meal Plan coverage rule (handoff §4–§5).
// Pure: no React, no fetching. Ported from the prototype's `simulate()`; runs the same on the
// API (recommended, §6.2) or the client. Adapt the input types to the real query results and
// reuse the comparable-unit helpers from `recipes/matching` instead of `toBase` below if they exist.

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';
export type Slot = 'breakfast' | 'lunch' | 'dinner';
export const SLOT_ORDER: Slot[] = ['breakfast', 'lunch', 'dinner'];

export interface CoverageBatch {
  id: string;
  ingredientId: string | null; // null = Unmatched
  normalizedName: string | null; // Unmatched Batches: normalised rawName
  quantity: number | null;
  unit: Unit | null;
  expiryDate: string | null; // YYYY-MM-DD
}

export interface CoverageLine {
  ingredientId: string | null; // null = Unmatched line (Family Recipes)
  normalizedName: string | null;
  quantity: number | null;
  unit: Unit | null;
  optional: boolean;
  pantryBasic: boolean; // from the Ingredient
}

export interface CoverageRecipe {
  id: string;
  servings: number; // the Recipe's own Servings
  lines: CoverageLine[];
}

export interface PlanEntry {
  id: string;
  date: string; // YYYY-MM-DD, Family-local
  slot: Slot;
  recipeId: string;
  servings: number; // planned Servings
}

export interface CoverageInput {
  today: string; // YYYY-MM-DD, Family-local
  entries: PlanEntry[];
  recipes: Record<string, CoverageRecipe>;
  batches: CoverageBatch[];
  /** Keys (see `keyOf`) of everything on the active Shopping List, checked or not. */
  onShoppingList: Set<string>;
}

/** Ingredient id, or `name:{normalizedName}` for Unmatched lines and Batches. */
export const keyOf = (x: { ingredientId: string | null; normalizedName: string | null }) =>
  x.ingredientId ?? `name:${x.normalizedName ?? ''}`;

/** g↔kg and ml↔l only (ADR 0007). Mass, volume and count never convert. */
export function toBase(q: number, u: Unit): [number, 'g' | 'ml' | 'pcs'] {
  if (u === 'kg') return [q * 1000, 'g'];
  if (u === 'l') return [q * 1000, 'ml'];
  return [q, u];
}

export interface MealRef { entryId: string; date: string; slot: Slot; recipeId: string }

export type Reason =
  | { code: 'usesLast'; meals: MealRef[] } // earlier meals took the last usable stock
  | { code: 'expires'; date: string } // every Batch expires before this meal's day
  | { code: 'notInPantry' }
  | { code: 'onlyLeftAfter'; amount: number; unit: string; meals: MealRef[] }
  | { code: 'onlyInPantry'; amount: number; unit: string };

export interface Issue {
  key: string;
  ingredientId: string | null;
  normalizedName: string | null;
  kind: 'short' | 'missing'; // short = some taken, missing = none
  /** Shortfall in base unit (g / ml / pcs); null for a quantity-less line. */
  need: number | null;
  unit: 'g' | 'ml' | 'pcs' | null;
  onList: boolean;
  reason: Reason;
}

export type MealStatus = 'covered' | 'onList' | 'short';
export type DayStatus = MealStatus | 'empty';

export interface MealCoverage { entry: PlanEntry; status: MealStatus; issues: Issue[] }
export interface DayCoverage { date: string; status: DayStatus; meals: MealCoverage[] }

export type PlanTag = { kind: 'short'; meals: number } | { kind: 'coveredOnceYouShop' } | { kind: 'allCovered' } | { kind: 'none' };

export interface PlanCoverage { days: DayCoverage[]; tag: PlanTag }

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
};

/**
 * Walks the plan in order (date, then Breakfast → Lunch → Dinner). Each meal consumes what it
 * covers from a working copy of the Batches, earliest expiry first (undated last). A Batch only
 * counts for meals on or before its expiry date. The Shopping List never covers anything; it only
 * turns a short meal into `onList`.
 */
export function planCoverage(input: CoverageInput, maxDays = 7): PlanCoverage {
  const { today, recipes, onShoppingList } = input;
  const last = addDays(today, maxDays - 1);
  const entries = input.entries
    .filter((e) => e.date >= today && e.date <= last && recipes[e.recipeId])
    .sort((a, b) => (a.date === b.date ? SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) : a.date < b.date ? -1 : 1));

  const pool = input.batches.map((b) => {
    const base = b.quantity != null && b.unit ? toBase(b.quantity, b.unit) : null;
    return { b, key: keyOf(b), rem: base ? base[0] : 0, bu: base ? base[1] : null };
  });
  const usedBy = new Map<string, MealRef[]>();
  const byDate = new Map<string, MealCoverage[]>();

  for (const entry of entries) {
    const recipe = recipes[entry.recipeId];
    const ref: MealRef = { entryId: entry.id, date: entry.date, slot: entry.slot, recipeId: entry.recipeId };
    const issues: Issue[] = [];

    for (const line of recipe.lines) {
      if (line.optional || line.pantryBasic) continue;
      const key = keyOf(line);
      const usable = pool
        .filter((p) => p.key === key && (p.b.expiryDate == null || p.b.expiryDate >= entry.date))
        .sort((a, b) => (a.b.expiryDate ?? '9999-12-31').localeCompare(b.b.expiryDate ?? '9999-12-31'));
      const prior = usedBy.get(key) ?? [];
      const onList = onShoppingList.has(key);

      // Quantity-less line: presence only, consumes nothing.
      if (line.quantity == null || line.unit == null) {
        if (!usable.length) issues.push(issue(line, key, null, null, 'missing', onList, reasonFor(0, null)));
        continue;
      }

      const [nq, nu] = toBase((line.quantity * entry.servings) / recipe.servings, line.unit);
      const comparable = usable.filter((p) => p.bu === nu);
      // Benefit of the doubt: a Batch exists but none can be compared → covered, nothing consumed.
      if (!comparable.length && usable.length) continue;

      let need = nq;
      for (const p of comparable) {
        const t = Math.min(p.rem, need);
        p.rem -= t;
        need -= t;
        if (need <= 1e-9) break;
      }
      const taken = nq - need;
      if (taken > 0) usedBy.set(key, [...prior, ref]);
      if (need > 1e-9) issues.push(issue(line, key, round(need), nu, taken > 0 ? 'short' : 'missing', onList, reasonFor(taken, nu)));

      function reasonFor(t: number, unit: string | null): Reason {
        const anyLeft = pool.some((p) => p.key === key && p.rem > 0 && (p.b.expiryDate == null || p.b.expiryDate >= entry.date));
        const expired = input.batches.filter((b) => keyOf(b) === key && b.expiryDate != null && b.expiryDate < entry.date);
        if (prior.length && !anyLeft) return { code: 'usesLast', meals: prior };
        if (expired.length && !usable.length) return { code: 'expires', date: expired.map((b) => b.expiryDate!).sort().at(-1)! };
        if (!input.batches.some((b) => keyOf(b) === key)) return { code: 'notInPantry' };
        if (prior.length) return { code: 'onlyLeftAfter', amount: round(t), unit: unit ?? '', meals: prior };
        return { code: 'onlyInPantry', amount: round(t), unit: unit ?? '' };
      }
    }

    const status: MealStatus = !issues.length ? 'covered' : issues.every((i) => i.onList) ? 'onList' : 'short';
    byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), { entry, status, issues }]);
  }

  // Planned days: today … the last date with an entry (gap days inside the plan are `empty`).
  const lastPlanned = entries.at(-1)?.date;
  const days: DayCoverage[] = [];
  if (lastPlanned) {
    for (let d = today; d <= lastPlanned; d = addDays(d, 1)) {
      const meals = byDate.get(d) ?? [];
      const status: DayStatus = !meals.length ? 'empty'
        : meals.some((m) => m.status === 'short') ? 'short'
        : meals.some((m) => m.status === 'onList') ? 'onList' : 'covered';
      days.push({ date: d, status, meals });
    }
  }

  const allMeals = days.flatMap((d) => d.meals);
  const shortMeals = allMeals.filter((m) => m.status === 'short').length;
  const tag: PlanTag = !allMeals.length ? { kind: 'none' }
    : shortMeals ? { kind: 'short', meals: shortMeals }
    : allMeals.some((m) => m.status === 'onList') ? { kind: 'coveredOnceYouShop' } : { kind: 'allCovered' };

  return { days, tag };
}

function issue(line: CoverageLine, key: string, need: number | null, unit: 'g' | 'ml' | 'pcs' | null, kind: Issue['kind'], onList: boolean, reason: Reason): Issue {
  return { key, ingredientId: line.ingredientId, normalizedName: line.normalizedName, kind, need, unit, onList, reason };
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export interface MissingItem { key: string; ingredientId: string | null; normalizedName: string | null; quantity: number | null; unit: 'g' | 'ml' | 'pcs' | null; recipeIds: string[] }

/**
 * What "Add n" (footer, whole plan) and "Add n missing" (popover, one day) send to the
 * Shopping List bulk-add: one item per Ingredient not already on the list, shortfalls summed,
 * with the Recipes as Source Recipes (§5.3). A quantity-less shortfall makes the item quantity-less.
 */
export function missingItems(days: DayCoverage[]): MissingItem[] {
  const m = new Map<string, MissingItem>();
  for (const day of days) for (const meal of day.meals) for (const i of meal.issues) {
    if (i.onList) continue;
    const cur = m.get(i.key) ?? { key: i.key, ingredientId: i.ingredientId, normalizedName: i.normalizedName, quantity: 0, unit: i.unit, recipeIds: [] };
    cur.quantity = cur.quantity == null || i.need == null ? null : round(cur.quantity + i.need);
    if (!cur.recipeIds.includes(meal.entry.recipeId)) cur.recipeIds.push(meal.entry.recipeId);
    m.set(i.key, cur);
  }
  return [...m.values()];
}
