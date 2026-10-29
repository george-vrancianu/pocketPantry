import type { recipeDifficulty } from '../../../database/schema';
import type {
  EatingMomentPolarity,
  PairingKind,
  PairingPrinciple,
} from '../../../recipes/recipe-guidance.schemas';
import type { Unit } from '../seed-types';

/**
 * Recipe text is written in English (the source text, stored on the row) and
 * Romanian (a translation row). Danish falls back to English.
 */
export type Text = { en: string; ro: string };

/** Shorthand for the data files: `t('English', 'Română')`. */
export const t = (en: string, ro: string): Text => ({ en, ro });

export type Difficulty = (typeof recipeDifficulty.enumValues)[number];

/** A Catalog Tag, Tag Group or Eating Moment: Catalog-level, so it carries Danish too. */
export type SeedNamed = {
  slug: string;
  en: string;
  ro: string;
  da: string;
};

/** One Ingredient Line. `ingredient` is a Catalog Ingredient slug. */
export type LineSeed = {
  ingredient: string;
  /**
   * Stable identity of the line within its Recipe (its id derives from it);
   * defaults to the Ingredient slug. Set it to list one Ingredient twice.
   * Unique per Recipe.
   */
  key?: string;
  /** Quantity and unit come together; leave both out for "to taste". */
  quantity?: number;
  unit?: Unit;
  optional?: boolean;
  /** Preparation note, e.g. "finely chopped". */
  note?: Text;
};

/** A Step. `key` is stable (ids derive from it) and unique within the Recipe. */
export type StepSeed = {
  key: string;
  text: Text;
  timerSeconds?: number;
};

/** A Tip on one Step of the same Recipe. Step Tips are never inherited. */
export type StepTipSeed = { step: string; text: Text };

export type PairingSeed = {
  kind: PairingKind;
  label: Text;
  reason: Text;
  principle?: PairingPrinciple;
  /** Catalog Ingredient slug. At most one of `ingredient` and `recipe`. */
  ingredient?: string;
  /** Slug of another seeded Recipe (base or Variant). */
  recipe?: string;
};

export type EatingMomentSeed = {
  /** Eating Moment slug from registries.ts. */
  moment: string;
  polarity: EatingMomentPolarity;
  reason: Text;
};

/** Everything one Recipe holds, Base Recipe and Variant alike (a Variant is a full Recipe). */
export type RecipeSeed = {
  /** Permanent: ids derive from it. Unique across all seeded Recipes. */
  slug: string;
  title: Text;
  servings: number;
  prepMinutes?: number;
  cookMinutes?: number;
  difficulty?: Difficulty;
  lines: LineSeed[];
  steps: StepSeed[];
  /** Recipe-level Tips. A Variant inherits its base's live; its own are extra. */
  tips?: Text[];
  stepTips?: StepTipSeed[];
  /** General direction, never values; both the good and the bad; at most 500 characters. */
  nutritionNote: Text;
  /** 1 to 10. */
  pairings: PairingSeed[];
  /** 1 to 10, one use per Eating Moment. */
  eatingMoments: EatingMomentSeed[];
};

/** A Variant is made by one Catalog Tag, named `group:slug` after the registry it comes from (`SEED_TAGS`). */
export type VariantSeed = RecipeSeed & {
  tag: string;
  /**
   * Indexes into the base's `tips` (Recipe-level Tips) this Variant does not
   * inherit. Unique and in range.
   */
  hideBaseTips?: number[];
};

export type BaseRecipeSeed = RecipeSeed & { variants: VariantSeed[] };
