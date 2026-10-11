import { and, eq, inArray } from 'drizzle-orm';
import type { Tx } from '../database/database.types';
import {
  recipeEatingMomentTranslations,
  recipeEatingMoments,
  recipeNutritionNoteTranslations,
  recipePairings,
  recipePairingTranslations,
  recipes,
} from '../database/schema';
import { itemNotFound, nothingToTranslate } from './recipe-errors';
import { assertNutritionNoteLength } from './recipe-guidance-write';
import type { z } from 'zod';
import type { guidanceTranslationsBody } from './recipe-guidance.schemas';

type GuidanceTranslations = {
  [K in keyof typeof guidanceTranslationsBody]: z.infer<
    (typeof guidanceTranslationsBody)[K]
  >;
};

/**
 * One locale's translations of the guidance text, with the upsert / `null`
 * deletes / untouched-when-absent rules of the other Recipe translations.
 * Pairing ids must be the Recipe's Pairings; Eating Moment ids must be moments
 * the Recipe uses (and only uses with a source reason have text to translate);
 * a Nutrition Note translation needs a source note. The caller holds the Recipe
 * lock. Shared with the seed.
 */
export async function writeGuidanceTranslations(
  tx: Tx,
  recipeId: string,
  locale: string,
  body: Partial<GuidanceTranslations>,
) {
  await writeNutritionNote(tx, recipeId, locale, body.nutritionNote);
  await writePairings(tx, recipeId, locale, body.pairings ?? {});
  await writeEatingMoments(tx, recipeId, locale, body.eatingMoments ?? {});
}

async function writeNutritionNote(
  tx: Tx,
  recipeId: string,
  locale: string,
  note: string | null | undefined,
) {
  if (note === undefined) return;
  if (note === null) {
    await tx
      .delete(recipeNutritionNoteTranslations)
      .where(
        and(
          eq(recipeNutritionNoteTranslations.recipeId, recipeId),
          eq(recipeNutritionNoteTranslations.locale, locale),
        ),
      );
    return;
  }
  assertNutritionNoteLength(note);
  const [recipe] = await tx
    .select({ nutritionNote: recipes.nutritionNote })
    .from(recipes)
    .where(eq(recipes.id, recipeId));
  // Nothing to translate without a source note.
  if (!recipe?.nutritionNote) throw nothingToTranslate();
  await tx
    .insert(recipeNutritionNoteTranslations)
    .values({ recipeId, locale, nutritionNote: note })
    .onConflictDoUpdate({
      target: [
        recipeNutritionNoteTranslations.recipeId,
        recipeNutritionNoteTranslations.locale,
      ],
      set: { nutritionNote: note, updatedAt: new Date() },
    });
}

async function writePairings(
  tx: Tx,
  recipeId: string,
  locale: string,
  entries: NonNullable<GuidanceTranslations['pairings']>,
) {
  const ids = Object.keys(entries);
  if (ids.length === 0) return;
  const owned = await tx
    .select({ id: recipePairings.id })
    .from(recipePairings)
    .where(
      and(
        eq(recipePairings.recipeId, recipeId),
        inArray(recipePairings.id, ids),
      ),
    );
  if (owned.length !== ids.length) throw itemNotFound('pairing');
  for (const [pairingId, text] of Object.entries(entries)) {
    if (text === null) {
      await tx
        .delete(recipePairingTranslations)
        .where(
          and(
            eq(recipePairingTranslations.pairingId, pairingId),
            eq(recipePairingTranslations.locale, locale),
          ),
        );
    } else {
      await tx
        .insert(recipePairingTranslations)
        .values({ pairingId, locale, label: text.label, reason: text.reason })
        .onConflictDoUpdate({
          target: [
            recipePairingTranslations.pairingId,
            recipePairingTranslations.locale,
          ],
          set: {
            label: text.label,
            reason: text.reason,
            updatedAt: new Date(),
          },
        });
    }
  }
}

async function writeEatingMoments(
  tx: Tx,
  recipeId: string,
  locale: string,
  entries: NonNullable<GuidanceTranslations['eatingMoments']>,
) {
  const momentIds = Object.keys(entries);
  if (momentIds.length === 0) return;
  const uses = await tx
    .select({
      id: recipeEatingMoments.id,
      eatingMomentId: recipeEatingMoments.eatingMomentId,
      reason: recipeEatingMoments.reason,
    })
    .from(recipeEatingMoments)
    .where(
      and(
        eq(recipeEatingMoments.recipeId, recipeId),
        inArray(recipeEatingMoments.eatingMomentId, momentIds),
      ),
    );
  if (uses.length !== momentIds.length) throw itemNotFound('eating_moment');
  const useOf = new Map(uses.map((u) => [u.eatingMomentId, u]));
  for (const [momentId, reason] of Object.entries(entries)) {
    const use = useOf.get(momentId);
    if (!use) throw itemNotFound('eating_moment');
    if (reason === null) {
      await tx
        .delete(recipeEatingMomentTranslations)
        .where(
          and(
            eq(recipeEatingMomentTranslations.recipeEatingMomentId, use.id),
            eq(recipeEatingMomentTranslations.locale, locale),
          ),
        );
    } else {
      // A use without a source reason has nothing to translate.
      if (use.reason === null) throw nothingToTranslate();
      await tx
        .insert(recipeEatingMomentTranslations)
        .values({ recipeEatingMomentId: use.id, locale, reason })
        .onConflictDoUpdate({
          target: [
            recipeEatingMomentTranslations.recipeEatingMomentId,
            recipeEatingMomentTranslations.locale,
          ],
          set: { reason, updatedAt: new Date() },
        });
    }
  }
}
