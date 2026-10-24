import { z } from 'zod';
import { recipeDifficulty } from '../database/schema';
import { MAX_LINES, MAX_STEPS, MAX_TIPS } from '../recipes/recipes.schemas';

/** Most Recipe Drafts one Member can hold (ADR 0028). */
export const MAX_RECIPE_DRAFTS = 20;
/** A Recipe Draft is deleted this many days after its last edit (ADR 0028). */
export const RECIPE_DRAFT_TTL_DAYS = 30;

const MAX_PAIRINGS = 10;
const MAX_EATING_MOMENTS = 10;

// Text is stored as typed, so there is no minimum, no trimming and no format:
// only a length ceiling at the Recipe's own maximums so a Recipe Draft never
// grows into something that cannot be saved.
const text = (max: number) => z.string().max(max);
const short = text(64);

const draftLine = z
  .object({
    id: z.uuid().optional(),
    ingredientId: short,
    name: text(100),
    quantity: short,
    unit: short,
    optional: z.boolean(),
    note: text(200),
  })
  .strict();

const draftTip = z.object({ text: text(2000) }).strict();

const draftStep = z
  .object({
    id: z.uuid().optional(),
    text: text(2000),
    timer: short,
    tips: z.array(draftTip).max(MAX_TIPS).optional(),
  })
  .strict();

const draftPairing = z
  .object({
    id: z.uuid().optional(),
    kind: short,
    label: text(200),
    reason: text(1000),
    principle: short,
    linkType: short,
    linkTarget: short,
    linkName: text(200).optional(),
    linkTitle: text(200).optional(),
    /** Proposed by Suggest Guidance and not yet kept by the Member. */
    suggested: z.boolean().optional(),
  })
  .strict();

const draftEatingMoment = z
  .object({
    eatingMomentId: short,
    polarity: short,
    reason: text(1000),
    suggested: z.boolean().optional(),
  })
  .strict();

const draftGuidance = z
  .object({
    nutritionNote: text(500),
    pairings: z.array(draftPairing).max(MAX_PAIRINGS),
    eatingMoments: z.array(draftEatingMoment).max(MAX_EATING_MOMENTS),
  })
  .strict();

/**
 * The Family Recipe form state as typed: meta fields as strings, Ingredient
 * Lines, Steps (with their Tips and timers), Guidance, the picked base, the
 * Source Link and its language. The server checks shape and maximums only.
 */
export const recipeDraftContent = z
  .object({
    title: text(200),
    servings: short,
    prepMinutes: short,
    cookMinutes: short,
    difficulty: z.union([z.enum(recipeDifficulty.enumValues), z.literal('')]),
    cuisineId: short,
    methodId: short,
    lines: z.array(draftLine).max(MAX_LINES),
    steps: z.array(draftStep).max(MAX_STEPS),
    guidance: draftGuidance.nullable().default(null),
    /** Plate Scan: the Base Recipe the Member picked from the closest matches. */
    pickedBaseId: short.nullable().default(null),
    sourceLink: text(2048).nullable().default(null),
    sourceLanguage: text(10).nullable().default(null),
    /** The fill came from a Plate Scan (the list shows "Plate scan"). */
    plateScan: z.boolean().default(false),
  })
  .strict()
  .superRefine((content, ctx) => {
    const tips = content.steps.reduce(
      (sum, step) => sum + (step.tips?.length ?? 0),
      0,
    );
    if (tips > MAX_TIPS) {
      ctx.addIssue({
        code: 'custom',
        path: ['steps'],
        message: 'too many Tips',
      });
    }
  });

export type RecipeDraftContent = z.infer<typeof recipeDraftContent>;

export const recipeDraftKinds = ['new_recipe', 'variant'] as const;
export type RecipeDraftKind = (typeof recipeDraftKinds)[number];

export const recipeDraftCreate = z
  .object({
    kind: z.enum(recipeDraftKinds),
    baseRecipeId: z.uuid().nullable().default(null),
    content: recipeDraftContent,
  })
  .strict()
  .refine((body) => body.kind === 'variant' || body.baseRecipeId === null, {
    message: 'a New Recipe has no base',
    path: ['baseRecipeId'],
  });
export type RecipeDraftCreate = z.infer<typeof recipeDraftCreate>;

export const recipeDraftUpdate = z
  .object({
    /** The version the client last saw. */
    version: z.number().int().min(1),
    content: recipeDraftContent,
  })
  .strict();
export type RecipeDraftUpdate = z.infer<typeof recipeDraftUpdate>;

export const recipeDraftParam = z.object({ id: z.uuid() });

export type RecipeDraftOrigin =
  { type: 'link'; domain: string } | { type: 'plate_scan' } | null;

export type RecipeDraftSummary = {
  id: string;
  kind: RecipeDraftKind;
  baseRecipeId: string | null;
  baseRecipeName: string | null;
  title: string;
  origin: RecipeDraftOrigin;
  updatedAt: string;
  expiresAt: string;
  version: number;
};

export type RecipeDraftView = {
  id: string;
  kind: RecipeDraftKind;
  baseRecipeId: string | null;
  baseRecipeName: string | null;
  /** The base still exists, is not archived and is one the Family can see. */
  baseAvailable: boolean;
  content: RecipeDraftContent;
  version: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};
