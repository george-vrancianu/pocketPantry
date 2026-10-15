import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { MAX_QUANTITY } from '../common/quantity';
import { ingredientUnit, recipeDifficulty } from '../database/schema';
import type { RecipeDiff } from './recipe-diff';
import {
  guidanceBody,
  guidanceTranslationsBody,
  type AdminGuidance,
  type GuidanceBody,
  type GuidanceTranslationsView,
  type ResolvedGuidance,
} from './recipe-guidance.schemas';

const id = z.uuid();
const title = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(2000);
const note = z.string().trim().min(1).max(200);
const minutes = z.number().int().min(0).max(100_000).nullable();

export const MAX_LINES = 100;
export const MAX_STEPS = 100;
export const MAX_TIPS = 200;

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

/** A Family line: an Ingredient or an Unmatched name, exactly one (the service checks, with a coded error). */
export const familyLineInput = lineInput.extend({
  ingredientId: id.nullable().default(null),
  rawName: z.string().trim().min(1).max(100).nullable().default(null),
});

/** The Member's locale (required): the Unmatched queue entries of new names record it. */
const memberLocale = z.enum(CATALOG_LOCALES);

/** Replacing a Family Recipe's document; its base is fixed at creation. */
export const familyRecipeUpdate = recipeDocument
  .extend({ lines: z.array(familyLineInput).max(MAX_LINES).default([]) })
  .extend({ locale: memberLocale });

/** A step Tip in a create document: it refers to a Step of the document by index. */
const newStepTip = z
  .object({ stepIndex: z.number().int().min(0), text: longText })
  .strict();

/** Creating a Family Recipe: `parentId` makes it a Variant, null/absent a standalone Base Recipe. */
export const familyRecipeCreate = familyRecipeUpdate.extend({
  parentId: id.nullable().default(null),
  /** Optional: a saved draft brings its guidance along; edits go through the guidance endpoint. */
  guidance: guidanceBody.optional(),
  /**
   * Optional step Tips for a new Recipe (a Variant draft brings the source's).
   * `stepIndex` is the position of a Step in `steps` of this same document;
   * the array order is the Tip order. Later edits use the Tip endpoints.
   */
  tips: z.array(newStepTip).max(MAX_TIPS).optional(),
});

/** The Plate Scan dish the Review wants the closest Catalog Base Recipe for. */
export const plateMatchesBody = z
  .object({
    locale: memberLocale,
    dishTitle: z.string().trim().max(200),
    ingredientIds: z.array(id).max(100),
  })
  .strict();

/** Saving a Plate Scan as a Family Recipe: one serving, ingredient lines only. */
export const fromPlateBody = z
  .object({
    locale: memberLocale,
    title,
    parentId: id.nullable(),
    lines: z.array(familyLineInput.omit({ id: true })).max(MAX_LINES),
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
    ...guidanceTranslationsBody,
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
export type FamilyLineInput = z.infer<typeof familyLineInput>;
export type FamilyRecipeUpdate = z.infer<typeof familyRecipeUpdate>;
export type FamilyRecipeCreate = z.infer<typeof familyRecipeCreate>;
export type PlateMatchesBody = z.infer<typeof plateMatchesBody>;
export type FromPlateBody = z.infer<typeof fromPlateBody>;
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
  } & GuidanceTranslationsView
>;

/** The Admin's view of a Catalog Recipe: source text plus every translation. */
export type AdminRecipeDetail = AdminGuidance & {
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
  /** Pairings, Eating Moments and the Nutrition Note, resolved for the locale. */
  guidance: ResolvedGuidance;
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

/** One Allergen a Recipe is known to contain, with the lines it comes from. */
export type RecipeAllergenItem = {
  allergen: { id: string; name: string };
  lines: { id: string; ingredientName: string; optional: boolean }[];
  /** Every source line is optional, so the Allergen can be left out. */
  optionalOnly: boolean;
};

/** A Recipe's Allergens, derived from its own Ingredient Lines (ADR 0014). */
export type RecipeAllergens = {
  /** In Recipe order. */
  items: RecipeAllergenItem[];
  /** Lines that could not be checked: untagged Family Ingredients and Unmatched lines. */
  uncheckedCount: number;
};

/** One Allergy a Recipe contains, with the lines that contain it (markers in the Ingredients tab). */
export type AllergyWarningEntryView = {
  allergen: { id: string; name: string };
  /** `strong` when a required line contains it, `soft` when only optional lines do. */
  severity: 'strong' | 'soft';
  /** Every line that contains it, each with its own severity (`soft` for an optional line). */
  lines: { lineId: string; severity: 'strong' | 'soft' }[];
};

/**
 * The Allergy Warning on a Recipe, from the viewer's Allergies (ADR 0014). Null when the
 * Recipe holds none of them and every line could be checked.
 */
export type AllergyWarningView = {
  /** `strong` when any entry is strong; `soft` when only optional or Unchecked lines raise it. */
  severity: 'strong' | 'soft';
  /** The Allergies the Recipe contains, in the Allergen list's order. Empty when only Unchecked lines raise it. */
  entries: AllergyWarningEntryView[];
  /** Lines that could not be checked for Allergens. */
  uncheckedCount: number;
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
  /** What the Recipe is known to contain, worked out from its own lines. */
  allergens: RecipeAllergens;
  /** Null when nothing the viewer must avoid is, or might be, in the Recipe. */
  allergyWarning: AllergyWarningView | null;
};

export type RecipeFilters = {
  cuisines: NamedRef[];
  methods: NamedRef[];
  /** Live Eating Moments in sort order. They feed the guidance editor's picker, not a browsing filter. */
  eatingMoments: NamedRef[];
};

/** What `createIn` takes: the create body without the transport-level locale default. */
export type FamilyRecipeDocument = Omit<FamilyRecipeCreate, 'locale'>;

/**
 * The editable view of a Family Recipe (`GET /api/recipes/:id/edit` and the
 * response of every Family write). Lines carry ids, the Ingredient's name in
 * the requested locale (or the raw name) and `rawName` for Unmatched lines.
 */
export type FamilyRecipeEdit = Omit<
  AdminRecipeDetail,
  'translations' | 'lines' | 'pairings'
> & {
  /** Pairings with display names for their links: null without a link, or when the Recipe is archived or not visible. */
  pairings: (AdminGuidance['pairings'][number] & {
    linkedIngredientName: string | null;
    linkedRecipeTitle: string | null;
  })[];
  lines: (RecipeLineView & {
    rawName: string | null;
    ingredientName: string;
  })[];
};

/** An unsaved "Make a variant" draft: a document to edit and POST to `/api/recipes`. No ids. */
export type FamilyRecipeDraft = {
  /** The Base Recipe the draft goes under: the source itself, or the source's base. */
  parentId: string;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: AdminRecipeDetail['difficulty'];
  cuisineId: string | null;
  methodId: string | null;
  /** `ingredientName` is for display only; drop it when posting. */
  lines: {
    ingredientId: string | null;
    rawName: string | null;
    ingredientName: string;
    quantity: number | null;
    unit: RecipeLineView['unit'];
    optional: boolean;
    note: string | null;
  }[];
  steps: { text: string; timerSeconds: number | null }[];
  /** The source's own step Tips (not inherited ones), in order; `stepIndex` is the index into `steps`. */
  tips: { stepIndex: number; text: string }[];
  /** The source's guidance in the requested locale, ready to post (no ids). */
  guidance: GuidanceBody;
};
/** `today` is the Member's local date; it defaults to the server's UTC date. */
export const cookTonightQuery = localeQuery.extend({
  today: z.iso.date().optional(),
});
export type CookTonightQuery = z.infer<typeof cookTonightQuery>;

/** One Base Recipe's card: the best matching Recipe of its group. */
export type CookTonightCard = {
  /** The group's Base Recipe (the best match itself on a base or standalone card). */
  base: { id: string; title: string; archived: boolean };
  recipe: {
    id: string;
    title: string;
    parentId: string | null;
    owner: RecipeOwner;
    servings: number;
    prepMinutes: number | null;
    cookMinutes: number | null;
  };
  canMake: boolean;
  /** Set only for a near miss: the one short or missing required line. */
  missing: { ingredientId: string | null; name: string } | null;
  expiringCount: number;
  /** Other Recipes in the group the Family can make; near misses are not counted. */
  otherVariantsCount: number;
};

export type CookTonightView = { cards: CookTonightCard[] };
