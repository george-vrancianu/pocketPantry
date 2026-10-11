import { randomUUID } from 'node:crypto';
import { and, asc, eq, inArray, notInArray } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Tx } from '../database/database.types';
import { hasPgCode, pgConstraint } from '../database/pg-errors';
import {
  eatingMoments,
  ingredients,
  recipeEatingMomentTranslations,
  recipeEatingMoments,
  recipeNutritionNoteTranslations,
  recipePairings,
  recipePairingTranslations,
  recipes,
} from '../database/schema';
import { itemNotFound } from './recipe-errors';
import {
  MAX_EATING_MOMENTS,
  MAX_NUTRITION_NOTE,
  MAX_PAIRINGS,
  type GuidanceBody,
  type PairingInput,
} from './recipe-guidance.schemas';

/** The part of a Recipe the guidance rules need: its id and owner (null = Catalog). */
export type GuidanceRecipe = { id: string; familyId: string | null };

export const nutritionNoteTooLong = () =>
  new ApiException(400, 'recipes.nutrition_note_too_long', {
    max: MAX_NUTRITION_NOTE,
  });

/** Characters, not UTF-16 units: an emoji or a combined letter counts once per code point. */
export function assertNutritionNoteLength(note: string | null | undefined) {
  if (note && [...note].length > MAX_NUTRITION_NOTE) {
    throw nutritionNoteTooLong();
  }
}

/**
 * The link rules for the Pairings of `recipe`, checked before any write. A
 * Pairing links at most one Ingredient or Recipe, never its own Recipe, and a
 * Recipe only when that Recipe is Catalog content or owned by the same Family
 * (so a Catalog Recipe links only to Catalog content, a Family Recipe to
 * Catalog content or its own Family's Recipes). Archived targets are allowed,
 * so saving existing guidance never fails after something was archived.
 * Reused for Family Recipes (#137).
 */
export async function assertPairingLinks(
  tx: Tx,
  recipe: GuidanceRecipe,
  pairings: Pick<PairingInput, 'linkedIngredientId' | 'linkedRecipeId'>[],
) {
  for (const p of pairings) {
    if (p.linkedIngredientId && p.linkedRecipeId) {
      throw new ApiException(400, 'recipes.pairing_link_conflict');
    }
    if (p.linkedRecipeId === recipe.id) {
      throw new ApiException(400, 'recipes.pairing_self_link');
    }
  }
  const ingredientIds = [
    ...new Set(pairings.flatMap((p) => p.linkedIngredientId ?? [])),
  ];
  if (ingredientIds.length > 0) {
    const found = await tx
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(inArray(ingredients.id, ingredientIds))
      .orderBy(ingredients.id)
      // Blocks a concurrent Ingredient delete until we commit.
      .for('key share');
    if (found.length !== ingredientIds.length) {
      throw new ApiException(404, 'recipes.pairing_link_not_found');
    }
  }
  const recipeIds = [
    ...new Set(pairings.flatMap((p) => p.linkedRecipeId ?? [])),
  ];
  if (recipeIds.length > 0) {
    const found = await tx
      .select({ id: recipes.id, familyId: recipes.familyId })
      .from(recipes)
      .where(inArray(recipes.id, recipeIds))
      .orderBy(recipes.id)
      .for('key share');
    if (found.length !== recipeIds.length) {
      throw new ApiException(404, 'recipes.pairing_link_not_found');
    }
    if (
      found.some((r) => r.familyId !== null && r.familyId !== recipe.familyId)
    ) {
      throw new ApiException(409, 'recipes.pairing_link_not_allowed');
    }
  }
}

/** Limits, duplicates, the Nutrition Note length and the Eating Moments' existence. */
async function validateGuidance(tx: Tx, guidance: GuidanceBody) {
  if (guidance.pairings.length > MAX_PAIRINGS) {
    throw new ApiException(400, 'recipes.pairings_too_many', {
      max: MAX_PAIRINGS,
    });
  }
  if (guidance.eatingMoments.length > MAX_EATING_MOMENTS) {
    throw new ApiException(400, 'recipes.eating_moments_too_many', {
      max: MAX_EATING_MOMENTS,
    });
  }
  assertNutritionNoteLength(guidance.nutritionNote);
  const pairingIds = guidance.pairings.flatMap((p) => (p.id ? [p.id] : []));
  if (new Set(pairingIds).size !== pairingIds.length) {
    throw new ApiException(400, 'recipes.duplicate_item', { kind: 'pairing' });
  }
  const momentIds = guidance.eatingMoments.map((m) => m.eatingMomentId);
  if (new Set(momentIds).size !== momentIds.length) {
    throw new ApiException(400, 'recipes.eating_moment_duplicate');
  }
  if (momentIds.length > 0) {
    const found = await tx
      .select({ id: eatingMoments.id })
      .from(eatingMoments)
      .where(inArray(eatingMoments.id, momentIds))
      .orderBy(eatingMoments.id)
      .for('key share');
    if (found.length !== momentIds.length) {
      throw new ApiException(404, 'recipes.eating_moment_not_found');
    }
  }
}

/**
 * `writeGuidance` with the unique-index backstop mapped to its coded error:
 * the Recipe lock serialises writers, so a duplicate Eating Moment normally
 * fails validation first. Used by the Family paths (edit and create).
 */
export async function writeGuidanceChecked(
  tx: Tx,
  recipe: GuidanceRecipe,
  guidance: GuidanceBody,
) {
  try {
    await writeGuidance(tx, recipe, guidance);
  } catch (error) {
    if (
      hasPgCode(error, '23505') &&
      pgConstraint(error) === 'recipe_eating_moments_recipe_moment_idx'
    ) {
      throw new ApiException(400, 'recipes.eating_moment_duplicate');
    }
    throw error;
  }
}

/**
 * Replaces all guidance of `recipe` with `guidance` (array order is position).
 * Pairings carrying an `id` of this Recipe are updated and keep it, so their
 * translations survive; Eating Moment uses are keyed by `eatingMomentId` and
 * keep their row (and translations) while the moment stays. Everything else
 * listed is inserted, the rest deleted. The caller holds the Recipe row lock.
 *
 * Also the seed's entry point (#136): with `allowNewIds`, a Pairing `id` that
 * is not on the Recipe yet is inserted with that id (a stable seed id) instead
 * of refused.
 */
export async function writeGuidance(
  tx: Tx,
  recipe: GuidanceRecipe,
  guidance: GuidanceBody,
  options: { allowNewIds?: boolean } = {},
) {
  await validateGuidance(tx, guidance);
  await assertPairingLinks(tx, recipe, guidance.pairings);

  const existingPairings = new Set(
    (
      await tx
        .select({ id: recipePairings.id })
        .from(recipePairings)
        .where(eq(recipePairings.recipeId, recipe.id))
    ).map((r) => r.id),
  );
  const kept = guidance.pairings.flatMap((p) => (p.id ? [p.id] : []));
  const unknown = kept.filter((pairingId) => !existingPairings.has(pairingId));
  if (unknown.length > 0) {
    // With allowNewIds an unknown id is a new stable id, unless another Recipe owns it.
    const taken = options.allowNewIds
      ? await tx
          .select({ id: recipePairings.id })
          .from(recipePairings)
          .where(inArray(recipePairings.id, unknown))
      : [{ id: unknown[0] }];
    if (taken.length > 0) throw itemNotFound('pairing');
  }
  await tx
    .delete(recipePairings)
    .where(
      and(
        eq(recipePairings.recipeId, recipe.id),
        kept.length > 0 ? notInArray(recipePairings.id, kept) : undefined,
      ),
    );
  for (const [position, p] of guidance.pairings.entries()) {
    const values = {
      position,
      kind: p.kind,
      label: p.label,
      reason: p.reason,
      principle: p.principle,
      linkedIngredientId: p.linkedIngredientId,
      linkedRecipeId: p.linkedRecipeId,
    };
    if (p.id && existingPairings.has(p.id)) {
      await tx
        .update(recipePairings)
        .set(values)
        .where(eq(recipePairings.id, p.id));
    } else {
      await tx.insert(recipePairings).values({
        id: p.id ?? randomUUID(),
        recipeId: recipe.id,
        ...values,
      });
    }
  }

  const existingUses = new Map(
    (
      await tx
        .select({
          id: recipeEatingMoments.id,
          eatingMomentId: recipeEatingMoments.eatingMomentId,
        })
        .from(recipeEatingMoments)
        .where(eq(recipeEatingMoments.recipeId, recipe.id))
    ).map((r) => [r.eatingMomentId, r.id]),
  );
  const wantedMoments = guidance.eatingMoments.map((m) => m.eatingMomentId);
  await tx
    .delete(recipeEatingMoments)
    .where(
      and(
        eq(recipeEatingMoments.recipeId, recipe.id),
        wantedMoments.length > 0
          ? notInArray(recipeEatingMoments.eatingMomentId, wantedMoments)
          : undefined,
      ),
    );
  for (const [position, m] of guidance.eatingMoments.entries()) {
    const values = { position, polarity: m.polarity, reason: m.reason };
    const useId = existingUses.get(m.eatingMomentId);
    if (useId) {
      await tx
        .update(recipeEatingMoments)
        .set(values)
        .where(eq(recipeEatingMoments.id, useId));
      // A cleared reason leaves nothing to translate.
      if (m.reason === null) {
        await tx
          .delete(recipeEatingMomentTranslations)
          .where(
            eq(recipeEatingMomentTranslations.recipeEatingMomentId, useId),
          );
      }
    } else {
      await tx.insert(recipeEatingMoments).values({
        id: randomUUID(),
        recipeId: recipe.id,
        eatingMomentId: m.eatingMomentId,
        ...values,
      });
    }
  }

  await tx
    .update(recipes)
    .set({ nutritionNote: guidance.nutritionNote })
    .where(eq(recipes.id, recipe.id));
  if (guidance.nutritionNote === null) {
    await tx
      .delete(recipeNutritionNoteTranslations)
      .where(eq(recipeNutritionNoteTranslations.recipeId, recipe.id));
  }
}

/**
 * Copies the guidance (and its translations) of one Recipe onto another that
 * has none yet: the Nutrition Note, Pairings and Eating Moment uses, all with
 * new ids. Used by "Make a variant"; nothing stays linked afterwards.
 */
export async function copyGuidance(tx: Tx, fromId: string, toId: string) {
  const [from] = await tx
    .select({ nutritionNote: recipes.nutritionNote })
    .from(recipes)
    .where(eq(recipes.id, fromId));
  if (from?.nutritionNote) {
    await tx
      .update(recipes)
      .set({ nutritionNote: from.nutritionNote })
      .where(eq(recipes.id, toId));
    const notes = await tx
      .select()
      .from(recipeNutritionNoteTranslations)
      .where(eq(recipeNutritionNoteTranslations.recipeId, fromId));
    if (notes.length > 0) {
      await tx.insert(recipeNutritionNoteTranslations).values(
        notes.map((t) => ({
          recipeId: toId,
          locale: t.locale,
          nutritionNote: t.nutritionNote,
        })),
      );
    }
  }

  const pairings = await tx
    .select()
    .from(recipePairings)
    .where(eq(recipePairings.recipeId, fromId))
    .orderBy(asc(recipePairings.position));
  if (pairings.length > 0) {
    const ids = new Map(pairings.map((p) => [p.id, randomUUID()]));
    await tx.insert(recipePairings).values(
      pairings.map((p) => ({
        id: ids.get(p.id) as string,
        recipeId: toId,
        position: p.position,
        kind: p.kind,
        label: p.label,
        reason: p.reason,
        principle: p.principle,
        linkedIngredientId: p.linkedIngredientId,
        linkedRecipeId: p.linkedRecipeId,
      })),
    );
    const texts = await tx
      .select()
      .from(recipePairingTranslations)
      .where(inArray(recipePairingTranslations.pairingId, [...ids.keys()]));
    if (texts.length > 0) {
      await tx.insert(recipePairingTranslations).values(
        texts.map((t) => ({
          pairingId: ids.get(t.pairingId) as string,
          locale: t.locale,
          label: t.label,
          reason: t.reason,
        })),
      );
    }
  }

  const uses = await tx
    .select()
    .from(recipeEatingMoments)
    .where(eq(recipeEatingMoments.recipeId, fromId))
    .orderBy(asc(recipeEatingMoments.position));
  if (uses.length > 0) {
    const ids = new Map(uses.map((u) => [u.id, randomUUID()]));
    await tx.insert(recipeEatingMoments).values(
      uses.map((u) => ({
        id: ids.get(u.id) as string,
        recipeId: toId,
        eatingMomentId: u.eatingMomentId,
        position: u.position,
        polarity: u.polarity,
        reason: u.reason,
      })),
    );
    const texts = await tx
      .select()
      .from(recipeEatingMomentTranslations)
      .where(
        inArray(recipeEatingMomentTranslations.recipeEatingMomentId, [
          ...ids.keys(),
        ]),
      );
    if (texts.length > 0) {
      await tx.insert(recipeEatingMomentTranslations).values(
        texts.map((t) => ({
          recipeEatingMomentId: ids.get(t.recipeEatingMomentId) as string,
          locale: t.locale,
          reason: t.reason,
        })),
      );
    }
  }
}
