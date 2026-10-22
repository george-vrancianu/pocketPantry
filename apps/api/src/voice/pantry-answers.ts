import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import {
  isExpiringSoon,
  isUnexpired,
} from '../recipes/matching/batch-freshness';

import type { VoiceLocation, VoiceUnit } from './voice-actions';

/**
 * The server-side Pantry answer (ADR 0020): read-only, from the Family's
 * Batches, Shopping List, Running low flags and Stale Threshold alone. Pure,
 * so the caller loads everything once and nothing here can write.
 *
 * `kind` is the discriminant. The kinds the ADR adds later (`notSure`) are
 * new members of the union, with their own fields.
 */
export type PantryAnswerKind = 'yes' | 'onlyExpired' | 'no';

/** One Pantry Question the Match step has already looked at. */
export type PantryQuestion = {
  id: string;
  /** What was said. */
  text: string;
  /** The confident Catalog Match; the resolver answers only matched questions. */
  ingredient: CatalogSearchResult;
};

type AnswerBase = Pick<PantryQuestion, 'id' | 'text' | 'ingredient'>;

/** One quantity total: units that disagree are listed separately, never converted. */
export type UnitTotal = { unit: VoiceUnit; quantity: number };

export type PantryAnswer =
  | (AnswerBase & {
      kind: 'yes';
      /** Summed per unit over the Batches that are not Expired, like the Pantry roll-up (ADR 0002); empty for a Pantry Basic with no Batch. */
      totals: UnitTotal[];
      /** Where the stock is, in Location order. */
      locations: VoiceLocation[];
      /** A Batch expires within the Family's Stale Threshold. */
      expiringSoon: boolean;
      /** The Ingredient is flagged Running low. */
      runningLow: boolean;
    })
  | (AnswerBase & { kind: 'onlyExpired'; onShoppingList: boolean })
  | (AnswerBase & { kind: 'no'; onShoppingList: boolean });

/** The Batch fields an answer reads. */
export type AnswerBatch = {
  ingredientId: string | null;
  quantity: number | null;
  unit: VoiceUnit | null;
  location: VoiceLocation;
  expiryDate: string | null;
};

/** What the answers are read from; later kinds add fields (Unmatched rows). */
export type AnswerContext = {
  batches: readonly AnswerBatch[];
  /** The Ingredients that have a line on the Shopping List. */
  shoppingIngredientIds: ReadonlySet<string>;
  /** The Ingredients flagged Running low. */
  runningLowIds: ReadonlySet<string>;
  /** The Pantry Basics among the asked Ingredients (water, salt): in stock with no Batch. */
  pantryBasicIds: ReadonlySet<string>;
  /** The Family's Stale Threshold, in days. */
  staleThresholdDays: number;
  /** The Member's local date. */
  today: string;
};

const LOCATION_ORDER: readonly VoiceLocation[] = [
  'fridge',
  'freezer',
  'cupboard',
  'spices',
];
const UNIT_ORDER: readonly VoiceUnit[] = ['g', 'kg', 'ml', 'l', 'pcs'];

/**
 * Yes when the Ingredient has a Batch that is not Expired (one expiring today
 * still counts) or is a Pantry Basic with no Batch at all; only expired when it
 * has Batches and every one is Expired; no otherwise. A yes carries the
 * quantity summed per unit (never converted), the Locations, Expiring Soon and
 * Running low; a no and an only expired say whether the Ingredient is already
 * on the Shopping List. `today` is the Member's local date.
 */
export function answerPantryQuestions(
  questions: readonly PantryQuestion[],
  context: AnswerContext,
): PantryAnswer[] {
  const { batches, today } = context;
  return questions.map((question): PantryAnswer => {
    const base = {
      id: question.id,
      text: question.text,
      ingredient: question.ingredient,
    };
    const ingredientId = question.ingredient.id;
    const own = batches.filter((batch) => batch.ingredientId === ingredientId);
    const stock = own.filter((batch) => isUnexpired(batch.expiryDate, today));
    const onShoppingList = context.shoppingIngredientIds.has(ingredientId);
    if (
      stock.length > 0 ||
      (own.length === 0 && isBasic(context, ingredientId))
    ) {
      return {
        ...base,
        kind: 'yes',
        totals: totalsOf(stock),
        locations: LOCATION_ORDER.filter((location) =>
          stock.some((batch) => batch.location === location),
        ),
        expiringSoon: stock.some((batch) =>
          isExpiringSoon(batch.expiryDate, today, context.staleThresholdDays),
        ),
        runningLow: context.runningLowIds.has(ingredientId),
      };
    }
    return {
      ...base,
      kind: own.length > 0 ? 'onlyExpired' : 'no',
      onShoppingList,
    };
  });
}

const isBasic = (context: AnswerContext, ingredientId: string): boolean =>
  context.pantryBasicIds.has(ingredientId);

/** One total per unit, in a fixed unit order; Batches with no quantity or no unit add nothing. */
function totalsOf(stock: readonly AnswerBatch[]): UnitTotal[] {
  const sums = new Map<VoiceUnit, number>();
  for (const { quantity, unit } of stock) {
    if (quantity === null || unit === null) continue;
    // Round away float noise: quantities have at most 3 decimals (as the client roll-up does).
    sums.set(
      unit,
      Math.round(((sums.get(unit) ?? 0) + quantity) * 1000) / 1000,
    );
  }
  return UNIT_ORDER.filter((unit) => sums.has(unit)).map((unit) => ({
    unit,
    quantity: sums.get(unit) as number,
  }));
}
