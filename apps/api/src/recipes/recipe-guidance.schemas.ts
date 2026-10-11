import { z } from 'zod';
import {
  eatingMomentPolarity,
  pairingKind,
  pairingPrinciple,
} from '../database/schema';

const id = z.uuid();

export const MAX_PAIRINGS = 10;
export const MAX_EATING_MOMENTS = 10;
/** Counted in characters; checked by the service so the refusal is a coded error. */
export const MAX_NUTRITION_NOTE = 500;

const label = z.string().trim().min(1).max(200);
const reason = z.string().trim().min(1).max(1000);
/** A generous safety cap: the real limit is MAX_NUTRITION_NOTE, enforced with its own code. */
const nutritionNote = z.string().trim().min(1).max(5000);

export const pairingInput = z
  .object({
    /** Present on an existing Pairing: it is updated and keeps its id (and translations). */
    id: id.optional(),
    kind: z.enum(pairingKind.enumValues),
    label,
    reason,
    principle: z.enum(pairingPrinciple.enumValues).nullable().default(null),
    linkedIngredientId: id.nullable().default(null),
    linkedRecipeId: id.nullable().default(null),
  })
  .strict();

export const eatingMomentUseInput = z
  .object({
    eatingMomentId: id,
    polarity: z.enum(eatingMomentPolarity.enumValues),
    reason: reason.nullable().default(null),
  })
  .strict();

/**
 * All guidance of one Recipe. Array order is position. The counts are capped
 * generously here; the real limits (10) are coded errors in the service.
 */
export const guidanceBody = z
  .object({
    nutritionNote: nutritionNote.nullable(),
    pairings: z.array(pairingInput).max(100),
    eatingMoments: z.array(eatingMomentUseInput).max(100),
  })
  .strict();

/**
 * One locale's translations of guidance text, merged into the Recipe
 * translations body. Pairings are keyed by Pairing id, Eating Moment reasons by
 * Eating Moment id (unique per Recipe). `null` deletes a translation.
 */
export const guidanceTranslationsBody = {
  nutritionNote: z.union([nutritionNote, z.null()]).optional(),
  pairings: z
    .record(id, z.union([z.object({ label, reason }).strict(), z.null()]))
    .default({}),
  eatingMoments: z.record(id, z.union([reason, z.null()])).default({}),
};

export type GuidanceBody = z.infer<typeof guidanceBody>;
export type PairingInput = z.infer<typeof pairingInput>;
export type EatingMomentUseInput = z.infer<typeof eatingMomentUseInput>;

export type PairingKind = (typeof pairingKind.enumValues)[number];
export type PairingPrinciple = (typeof pairingPrinciple.enumValues)[number];
export type EatingMomentPolarity =
  (typeof eatingMomentPolarity.enumValues)[number];

export type PairingView = {
  id: string;
  kind: PairingKind;
  label: string;
  reason: string;
  principle: PairingPrinciple | null;
  linkedIngredientId: string | null;
  linkedRecipeId: string | null;
};
export type EatingMomentUseView = {
  id: string;
  eatingMomentId: string;
  polarity: EatingMomentPolarity;
  reason: string | null;
};

/** The Admin's source-text view of a Recipe's guidance (archived Eating Moments included). */
export type AdminGuidance = {
  nutritionNote: string | null;
  pairings: PairingView[];
  eatingMoments: EatingMomentUseView[];
};

/** One locale's guidance translations in the Admin detail. */
export type GuidanceTranslationsView = {
  nutritionNote: string | null;
  pairings: Record<string, { label: string; reason: string }>;
  eatingMoments: Record<string, string>;
};

/** Guidance resolved for a locale (fallback: the source text), as a Member sees it. */
export type ResolvedGuidance = {
  nutritionNote: string | null;
  pairings: (Omit<PairingView, 'linkedIngredientId' | 'linkedRecipeId'> & {
    /** Null without a link, or when the linked Recipe is archived (the label stays). */
    link:
      | { type: 'ingredient'; id: string; name: string }
      | { type: 'recipe'; id: string; title: string }
      | null;
  })[];
  /** Archived Eating Moments are left out. */
  eatingMoments: {
    eatingMomentId: string;
    name: string;
    polarity: EatingMomentPolarity;
    reason: string | null;
  }[];
};
