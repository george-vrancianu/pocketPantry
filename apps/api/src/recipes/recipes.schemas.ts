import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { MAX_QUANTITY } from '../common/quantity';
import { ingredientUnit, recipeDifficulty } from '../database/schema';
import type { RecipeDiff } from './recipe-diff';

const id = z.uuid();
const title = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(2000);
const note = z.string().trim().min(1).max(200);
const minutes = z.number().int().min(0).max(100_000).nullable();

export const MAX_LINES = 100;
export const MAX_STEPS = 100;

/** An Ingredient Line quantity, numeric(10,3): positive, at most 3 decimals. */
const lineQuantity = z
  .number()
  .min(0.001)
  .max(MAX_QUANTITY)
  .refine((value) => Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6, {
    message: 'at most 3 decimals',
  });

/**
 * Quantity and unit are both set or both null, and a Catalog line needs an
 * Ingredient; the service enforces those two with coded errors, so the schema
 * lets `ingredientId`, `quantity` and `unit` be null independently.
 */
export const lineInput = z
  .object({
    /** Present on an existing line: it is updated and keeps its id. */
    id: id.optional(),
    ingredientId: id.nullable(),
    quantity: lineQuantity.nullable().default(null),
    unit: z.enum(ingredientUnit.enumValues).nullable().default(null),
    optional: z.boolean().default(false),
    note: note.nullable().default(null),
  })
  .strict();

export const stepInput = z
  .object({
    /** Present on an existing Step: it is updated and keeps its id (and its Tips). */
    id: id.optional(),
    text: longText,
    timerSeconds: z
      .number()
      .int()
      .min(0)
      .max(1_000_000)
      .nullable()
      .default(null),
  })
  .strict();

/** The whole Recipe document an Admin edits. Position is the array order. */
export const recipeDocument = z
  .object({
    title,
    servings: z.number().int().min(1).max(1000),
    prepMinutes: minutes.default(null),
    cookMinutes: minutes.default(null),
    difficulty: z.enum(recipeDifficulty.enumValues).nullable().default(null),
    cuisineId: id.nullable().default(null),
    methodId: id.nullable().default(null),
    lines: z.array(lineInput).max(MAX_LINES).default([]),
    steps: z.array(stepInput).max(MAX_STEPS).default([]),
  })
  .strict();

/** Creating a Variant: the title is required, anything else overrides the copy. */
export const variantCreate = z
  .object({
    title,
  })
  .strict();

export const tipCreate = z
  .object({ text: longText, stepId: id.nullable().default(null) })
  .strict();
export const tipUpdate = z
  .object({ text: longText, stepId: id.nullable() })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'at least one field is required',
  });
/** Every Tip of the Recipe, in the wanted order. */
export const tipOrder = z.object({
  ids: z
    .array(id)
    .refine((ids) => new Set(ids).size === ids.length, 'ids must be unique'),
});

/** The base Recipe-level Tips a Variant hides (the full set; empty shows all). */
export const hiddenTipsBody = z.object({
  tipIds: z
    .array(id)
    .refine((ids) => new Set(ids).size === ids.length, 'ids must be unique'),
});

const optionalText = <T extends z.ZodType<string>>(schema: T) =>
  z.union([schema, z.null()]);

/**
 * One locale's translations of a Recipe's text. Keys not mentioned stay as
 * they are; `null` deletes that translation (the source text shows again).
 */
export const translationsBody = z
  .object({
    title: optionalText(title).optional(),
    steps: z.record(id, optionalText(longText)).default({}),
    lines: z.record(id, optionalText(note)).default({}),
    tips: z.record(id, optionalText(longText)).default({}),
  })
  .strict();

export const translationLocaleParam = z.object({
  id,
  locale: z.enum(CATALOG_LOCALES),
});

export const recipeListQuery = z.object({
  /** Only Base Recipes (no parent): the "new Variant" picker. */
  baseOnly: z.enum(['true', 'false']).default('false'),
  /** Include archived Recipes; the picker leaves them out. */
  archived: z.enum(['include', 'exclude']).default('include'),
});

/** Member browsing: no search or filter lists Base Recipes only. */
export const browseQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  search: z.string().trim().max(100).optional(),
  cuisineId: id.optional(),
  methodId: id.optional(),
});
export const localeQuery = browseQuery.pick({ locale: true });

export const recipeParam = z.object({ id });
export const recipeTipParam = z.object({ id, tipId: id });

export type RecipeDocument = z.infer<typeof recipeDocument>;
export type LineInput = z.infer<typeof lineInput>;
export type StepInput = z.infer<typeof stepInput>;
export type VariantCreate = z.infer<typeof variantCreate>;
export type TipCreate = z.infer<typeof tipCreate>;
export type TipUpdate = z.infer<typeof tipUpdate>;
export type TipOrder = z.infer<typeof tipOrder>;
export type HiddenTipsBody = z.infer<typeof hiddenTipsBody>;
export type TranslationsBody = z.infer<typeof translationsBody>;
export type RecipeListQuery = z.infer<typeof recipeListQuery>;
export type BrowseQuery = z.infer<typeof browseQuery>;
export type LocaleQuery = z.infer<typeof localeQuery>;

export type RecipeLineView = {
  id: string;
  ingredientId: string | null;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  optional: boolean;
  note: string | null;
};
export type RecipeStepView = {
  id: string;
  text: string;
  timerSeconds: number | null;
};
export type RecipeTipView = {
  id: string;
  stepId: string | null;
  text: string;
};
export type RecipeTranslationsView = Record<
  string,
  {
    title: string | null;
    steps: Record<string, string>;
    lines: Record<string, string>;
    tips: Record<string, string>;
  }
>;

/** The Admin's view of a Catalog Recipe: source text plus every translation. */
export type AdminRecipeDetail = {
  id: string;
  parentId: string | null;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: (typeof recipeDifficulty.enumValues)[number] | null;
  cuisineId: string | null;
  methodId: string | null;
  archived: boolean;
  archivedAt: string | null;
  lines: RecipeLineView[];
  steps: RecipeStepView[];
  /** This Recipe's own Tips, in order; `stepId` null for Recipe-level Tips. */
  tips: RecipeTipView[];
  /** A Variant's base Recipe-level Tips with whether this Variant hides each; null on a Base Recipe. */
  parentTips: (RecipeTipView & { hidden: boolean })[] | null;
  translations: RecipeTranslationsView;
};

export type AdminRecipeListItem = {
  id: string;
  parentId: string | null;
  title: string;
  servings: number;
  difficulty: AdminRecipeDetail['difficulty'];
  cuisineId: string | null;
  methodId: string | null;
  archived: boolean;
};

export type RecipeOwner = 'catalog' | 'family';

/** A Recipe with its text resolved for one locale (source text as fallback). */
export type ResolvedRecipe = {
  id: string;
  parentId: string | null;
  /** Whose Recipe it is: the Catalog's, or the Member's Family's own. */
  owner: RecipeOwner;
  locale: string;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: AdminRecipeDetail['difficulty'];
  cuisine: { id: string; name: string } | null;
  method: { id: string; name: string } | null;
  archived: boolean;
  lines: (RecipeLineView & { ingredientName: string })[];
  steps: RecipeStepView[];
  /** Own Tips plus, on a Variant, the base's non-hidden Recipe-level Tips (`inherited`). */
  tips: (RecipeTipView & { inherited: boolean })[];
};

type NamedRef = { id: string; name: string };

/** One row of the Member's Recipe list. */
export type RecipeListItem = {
  id: string;
  title: string;
  parentId: string | null;
  /** The base of a Variant (its title in the requested locale), null on a Base Recipe. */
  base: { id: string; title: string } | null;
  cuisine: NamedRef | null;
  method: NamedRef | null;
  /** Live Variants of a Base Recipe; 0 on a Variant. */
  variantCount: number;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: AdminRecipeDetail['difficulty'];
  owner: RecipeOwner;
};

/** A Variant as listed on its base's detail. */
export type RecipeVariantItem = {
  id: string;
  title: string;
  cuisine: NamedRef | null;
  method: NamedRef | null;
  owner: RecipeOwner;
};

/**
 * The Member's Recipe detail. Extend with more sections (guidance, Pantry
 * status per line id) by adding fields here.
 */
export type RecipeDetail = ResolvedRecipe & {
  /** Null on a Base Recipe. */
  base: { id: string; title: string; archived: boolean } | null;
  /** The live Variants of a Base Recipe, ordered by title; empty on a Variant. */
  variants: RecipeVariantItem[];
  /** Ingredients that differ from the base; null on a Base Recipe. */
  diff: RecipeDiff | null;
};

export type RecipeFilters = { cuisines: NamedRef[]; methods: NamedRef[] };
