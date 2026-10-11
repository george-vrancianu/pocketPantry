import { normalizeName } from '../../catalog/normalize';
import {
  fromComparable,
  toComparable,
  type Comparable,
  type Unit,
} from './units';

/**
 * Pure Recipe-to-Pantry matching: no database, no Nest. The detail page,
 * add-missing and Cook Tonight load a Family's Batches and a Recipe's
 * Ingredient Lines, hand them in, and read the result.
 */

/** One Ingredient Line; quantities are numbers (convert the stored numerics first). */
export type MatchLine = {
  id: string;
  /** Null for an Unmatched line on a Family Recipe. */
  ingredientId: string | null;
  /** The Unmatched line's name as typed (normalised inside the matcher). */
  name: string | null;
  quantity: number | null;
  unit: Unit | null;
  optional: boolean;
  /** The line's Ingredient is a Pantry Basic (false for Unmatched lines). */
  pantryBasic: boolean;
};

/**
 * One Batch of the Family's stock. The caller drops expired Batches first
 * (`isUnexpired`) and sets `expiringSoon` (`isExpiringSoon`).
 */
export type MatchBatch = {
  ingredientId: string | null;
  /** The Unmatched Batch's name as typed (normalised when indexed). */
  name: string | null;
  quantity: number | null;
  unit: Unit | null;
  expiringSoon: boolean;
};

export type LineStatus = 'covered' | 'short' | 'missing';

export type LineMatch = {
  lineId: string;
  /** The line's identity, copied from the input: the Ingredient, or null for an Unmatched line. */
  ingredientId: string | null;
  /** The Unmatched line's name as typed; null for a matched line. */
  name: string | null;
  status: LineStatus;
  optional: boolean;
  pantryBasic: boolean;
  /** The line's quantity scaled to the requested Servings. */
  quantity: number | null;
  unit: Unit | null;
  /** Set whenever the line is short (its units always compare then), in the line's unit. */
  shortfall: { quantity: number; unit: Unit } | null;
  /** A covered line whose stock includes an Expiring Soon Batch. */
  usesExpiringSoon: boolean;
};

export type RecipeMatch = {
  lines: LineMatch[];
  /** No required line is short or missing. */
  canMake: boolean;
  /** Required lines only. */
  shortOrMissingCount: number;
  /** Required covered lines that use an Expiring Soon Batch. */
  expiringCoveredCount: number;
  /** Covered required lines over required lines; 1 when there are none. */
  coverageRatio: number;
};

/** A Family's stock indexed by Ingredient and by normalised Unmatched name. */
export type StockIndex = {
  byIngredient: Map<string, MatchBatch[]>;
  byName: Map<string, MatchBatch[]>;
};

/**
 * Indexes the Family's Batches once, so matching many Recipes does not rescan
 * them per line. Unmatched Batch names are normalised here.
 */
export function indexStock(stock: readonly MatchBatch[]): StockIndex {
  const byIngredient = new Map<string, MatchBatch[]>();
  const byName = new Map<string, MatchBatch[]>();
  const push = (map: Map<string, MatchBatch[]>, key: string, b: MatchBatch) =>
    map.set(key, [...(map.get(key) ?? []), b]);
  for (const batch of stock) {
    if (batch.ingredientId !== null) {
      push(byIngredient, batch.ingredientId, batch);
    } else if (batch.name !== null) {
      push(byName, normalizeName(batch.name), batch);
    }
  }
  return { byIngredient, byName };
}

export type MatchInput = {
  lines: MatchLine[];
  recipeServings: number;
  /** Defaults to the Recipe's own Servings. */
  requestedServings?: number;
  /** Batches, or an index built once with `indexStock` and shared across Recipes. */
  stock: readonly MatchBatch[] | StockIndex;
};

/** Numeric columns hold three decimals; keep scaled amounts there. */
const round = (value: number) => Math.round(value * 1000) / 1000;
/** A positive quantity never rounds down to nothing. */
const scale = (value: number) => Math.max(round(value), 0.001);
/** Rounds up, so a short line always has a shortfall of at least 0.001. */
const roundUp = (value: number) => Math.ceil(value * 1000 - 1e-9) / 1000;
const EPSILON = 1e-9;

function stockFor(line: MatchLine, stock: StockIndex): MatchBatch[] {
  if (line.ingredientId !== null) {
    return stock.byIngredient.get(line.ingredientId) ?? [];
  }
  if (line.name === null) return [];
  return stock.byName.get(normalizeName(line.name)) ?? [];
}

function matchLine(
  line: MatchLine,
  stock: StockIndex,
  factor: number,
): LineMatch {
  const quantity =
    line.quantity === null
      ? null
      : line.quantity > 0
        ? scale(line.quantity * factor)
        : 0;
  const result: LineMatch = {
    lineId: line.id,
    ingredientId: line.ingredientId,
    name: line.name,
    status: 'covered',
    optional: line.optional,
    pantryBasic: line.pantryBasic,
    quantity,
    unit: line.unit,
    shortfall: null,
    usesExpiringSoon: false,
  };
  if (line.pantryBasic) return result;

  const batches = stockFor(line, stock);
  if (batches.length === 0) return { ...result, status: 'missing' };

  const covered = {
    ...result,
    usesExpiringSoon: batches.some((batch) => batch.expiringSoon),
  };
  const required = toComparable(quantity, line.unit);
  // No quantity to meet: presence is enough.
  if (required === null) return covered;

  const comparable = batches
    .map((batch) => toComparable(batch.quantity, batch.unit))
    .filter(
      (c): c is Comparable => c !== null && c.dimension === required.dimension,
    );
  // Benefit of the doubt: Batches exist but none can be compared.
  if (comparable.length === 0) return covered;

  const have = comparable.reduce((sum, c) => sum + c.amount, 0);
  if (have + EPSILON >= required.amount) return covered;

  // A comparable line always has a unit of the Batches' dimension.
  const unit = line.unit as Unit;
  const gap = fromComparable(required.amount - have, required.dimension, unit);
  return {
    ...result,
    status: 'short',
    shortfall: { quantity: roundUp(gap as number), unit },
  };
}

export function matchRecipe(input: MatchInput): RecipeMatch {
  const { recipeServings, requestedServings = recipeServings } = input;
  const factor = recipeServings > 0 ? requestedServings / recipeServings : 1;
  const stock = Array.isArray(input.stock)
    ? indexStock(input.stock)
    : (input.stock as StockIndex);
  const lines = input.lines.map((line) => matchLine(line, stock, factor));

  const required = lines.filter((line) => !line.optional);
  const covered = required.filter((line) => line.status === 'covered');
  return {
    lines,
    canMake: covered.length === required.length,
    shortOrMissingCount: required.length - covered.length,
    expiringCoveredCount: covered.filter((line) => line.usesExpiringSoon)
      .length,
    coverageRatio: required.length === 0 ? 1 : covered.length / required.length,
  };
}

/**
 * Orders matches best first: fewest short-or-missing required lines, then
 * most covered lines using an Expiring Soon Batch, then highest coverage.
 * Negative when `a` ranks before `b`; 0 on a tie.
 */
export function compareRecipeMatches(a: RecipeMatch, b: RecipeMatch): number {
  return (
    a.shortOrMissingCount - b.shortOrMissingCount ||
    b.expiringCoveredCount - a.expiringCoveredCount ||
    b.coverageRatio - a.coverageRatio
  );
}

/** A stable best-first copy of `items`, ranked by `matchOf(item)`. */
export function rankRecipeMatches<T>(
  items: readonly T[],
  matchOf: (item: T) => RecipeMatch,
): T[] {
  return [...items].sort((a, b) =>
    compareRecipeMatches(matchOf(a), matchOf(b)),
  );
}
