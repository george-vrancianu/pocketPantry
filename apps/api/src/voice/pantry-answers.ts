import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import { isUnexpired } from '../recipes/matching/batch-freshness';

/**
 * The server-side Pantry answer (ADR 0020): read-only, from the Family's
 * Batches alone. Pure, so the caller loads the Batches once and nothing here
 * can write.
 *
 * `kind` is the discriminant. #459 produces `yes` and `no`; the kinds the ADR
 * adds later (`onlyExpired`, `notSure`) are new members of the union, and the
 * details a kind carries (unit totals, Locations, Expiring Soon, Running low,
 * on the Shopping List) are new fields on that member only.
 */
export type PantryAnswerKind = 'yes' | 'no';

/** One Pantry Question the Match step has already looked at. */
export type PantryQuestion = {
  id: string;
  /** What was said. */
  text: string;
  /** The confident Catalog Match; the resolver answers only matched questions. */
  ingredient: CatalogSearchResult;
};

type AnswerBase = Pick<PantryQuestion, 'id' | 'text' | 'ingredient'>;
export type PantryAnswer =
  (AnswerBase & { kind: 'yes' }) | (AnswerBase & { kind: 'no' });

/** The Batch fields an answer reads. */
export type AnswerBatch = {
  ingredientId: string | null;
  expiryDate: string | null;
};

/** What the answers are read from; later kinds add fields (Shopping List, Stale Threshold, Unmatched rows). */
export type AnswerContext = {
  batches: readonly AnswerBatch[];
  /** The Member's local date. */
  today: string;
};

/**
 * Yes when the Ingredient has at least one Batch that is not Expired (a Batch
 * expiring today still counts); no otherwise. `today` is the Member's local date.
 */
export function answerPantryQuestions(
  questions: readonly PantryQuestion[],
  { batches, today }: AnswerContext,
): PantryAnswer[] {
  const inStock = new Set(
    batches
      .filter(
        (batch) =>
          batch.ingredientId !== null && isUnexpired(batch.expiryDate, today),
      )
      .map((batch) => batch.ingredientId),
  );
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    ingredient: question.ingredient,
    kind: inStock.has(question.ingredient.id) ? 'yes' : 'no',
  }));
}
