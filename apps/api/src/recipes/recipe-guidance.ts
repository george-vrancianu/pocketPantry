import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor } from '../database/database.types';
import {
  eatingMoments,
  ingredients,
  recipeEatingMomentTranslations,
  recipeEatingMoments,
  recipeNutritionNoteTranslations,
  recipePairings,
  recipePairingTranslations,
  recipes,
  recipeTranslations,
} from '../database/schema';
import type {
  AdminGuidance,
  GuidanceTranslationsView,
  ResolvedGuidance,
} from './recipe-guidance.schemas';

/** The source-text guidance of a Recipe for the Admin (archived Eating Moments included). */
export async function loadAdminGuidance(
  executor: Executor,
  recipeId: string,
  nutritionNote: string | null,
): Promise<AdminGuidance> {
  const [pairings, uses] = await Promise.all([
    executor
      .select()
      .from(recipePairings)
      .where(eq(recipePairings.recipeId, recipeId))
      .orderBy(asc(recipePairings.position)),
    executor
      .select()
      .from(recipeEatingMoments)
      .where(eq(recipeEatingMoments.recipeId, recipeId))
      .orderBy(asc(recipeEatingMoments.position)),
  ]);
  return {
    nutritionNote,
    pairings: pairings.map((p) => ({
      id: p.id,
      kind: p.kind,
      label: p.label,
      reason: p.reason,
      principle: p.principle,
      linkedIngredientId: p.linkedIngredientId,
      linkedRecipeId: p.linkedRecipeId,
    })),
    eatingMoments: uses.map((u) => ({
      eatingMomentId: u.eatingMomentId,
      polarity: u.polarity,
      reason: u.reason,
    })),
  };
}

const emptyTranslations = (): GuidanceTranslationsView => ({
  nutritionNote: null,
  pairings: {},
  eatingMoments: {},
});

/** Every locale's guidance translations of a Recipe, keyed by locale. */
export async function loadGuidanceTranslations(
  executor: Executor,
  recipeId: string,
): Promise<Record<string, GuidanceTranslationsView>> {
  const [notes, pairingRows, useRows] = await Promise.all([
    executor
      .select()
      .from(recipeNutritionNoteTranslations)
      .where(eq(recipeNutritionNoteTranslations.recipeId, recipeId)),
    executor
      .select({
        pairingId: recipePairingTranslations.pairingId,
        locale: recipePairingTranslations.locale,
        label: recipePairingTranslations.label,
        reason: recipePairingTranslations.reason,
      })
      .from(recipePairingTranslations)
      .innerJoin(
        recipePairings,
        eq(recipePairings.id, recipePairingTranslations.pairingId),
      )
      .where(eq(recipePairings.recipeId, recipeId)),
    executor
      .select({
        eatingMomentId: recipeEatingMoments.eatingMomentId,
        locale: recipeEatingMomentTranslations.locale,
        reason: recipeEatingMomentTranslations.reason,
      })
      .from(recipeEatingMomentTranslations)
      .innerJoin(
        recipeEatingMoments,
        eq(
          recipeEatingMoments.id,
          recipeEatingMomentTranslations.recipeEatingMomentId,
        ),
      )
      .where(eq(recipeEatingMoments.recipeId, recipeId)),
  ]);
  const result: Record<string, GuidanceTranslationsView> = {};
  const of = (locale: string) => (result[locale] ??= emptyTranslations());
  for (const row of notes) of(row.locale).nutritionNote = row.nutritionNote;
  for (const row of pairingRows) {
    of(row.locale).pairings[row.pairingId] = {
      label: row.label,
      reason: row.reason,
    };
  }
  for (const row of useRows) {
    of(row.locale).eatingMoments[row.eatingMomentId] = row.reason;
  }
  return result;
}

export { emptyTranslations as emptyGuidanceTranslations };

/**
 * A Recipe's guidance resolved for `locale`: translated text where there is
 * some, else the source text. Takes a Recipe id only, so Family Recipes reuse
 * it. A link to an archived Recipe is dropped (the label stays), and archived
 * Eating Moments are left out.
 */
export async function loadResolvedGuidance(
  executor: Executor,
  recipeId: string,
  locale: CatalogLocale,
): Promise<ResolvedGuidance> {
  const [[owner], pairings, uses] = await Promise.all([
    executor
      .select({ nutritionNote: recipes.nutritionNote })
      .from(recipes)
      .where(eq(recipes.id, recipeId)),
    executor
      .select()
      .from(recipePairings)
      .where(eq(recipePairings.recipeId, recipeId))
      .orderBy(asc(recipePairings.position)),
    executor
      .select({
        id: recipeEatingMoments.id,
        eatingMomentId: recipeEatingMoments.eatingMomentId,
        polarity: recipeEatingMoments.polarity,
        reason: recipeEatingMoments.reason,
        name: eatingMoments.name,
      })
      .from(recipeEatingMoments)
      .innerJoin(
        eatingMoments,
        eq(eatingMoments.id, recipeEatingMoments.eatingMomentId),
      )
      .where(
        and(
          eq(recipeEatingMoments.recipeId, recipeId),
          // Archived Eating Moments are hidden from display.
          isNull(eatingMoments.archivedAt),
        ),
      )
      .orderBy(asc(recipeEatingMoments.position)),
  ]);

  const pairingIds = pairings.map((p) => p.id);
  const useIds = uses.map((u) => u.id);
  const linkedRecipeIds = pairings.flatMap((p) => p.linkedRecipeId ?? []);
  const linkedIngredientIds = pairings.flatMap(
    (p) => p.linkedIngredientId ?? [],
  );
  const [noteT, pairingT, useT, linkedRecipes, linkedIngredients, names] =
    await Promise.all([
      executor
        .select()
        .from(recipeNutritionNoteTranslations)
        .where(
          and(
            eq(recipeNutritionNoteTranslations.recipeId, recipeId),
            eq(recipeNutritionNoteTranslations.locale, locale),
          ),
        ),
      pairingIds.length === 0
        ? []
        : executor
            .select()
            .from(recipePairingTranslations)
            .where(
              and(
                inArray(recipePairingTranslations.pairingId, pairingIds),
                eq(recipePairingTranslations.locale, locale),
              ),
            ),
      useIds.length === 0
        ? []
        : executor
            .select()
            .from(recipeEatingMomentTranslations)
            .where(
              and(
                inArray(
                  recipeEatingMomentTranslations.recipeEatingMomentId,
                  useIds,
                ),
                eq(recipeEatingMomentTranslations.locale, locale),
              ),
            ),
      linkedRecipeIds.length === 0
        ? []
        : executor
            .select({
              id: recipes.id,
              title: recipes.title,
              archivedAt: recipes.archivedAt,
              translated: recipeTranslations.title,
            })
            .from(recipes)
            .leftJoin(
              recipeTranslations,
              and(
                eq(recipeTranslations.recipeId, recipes.id),
                eq(recipeTranslations.locale, locale),
              ),
            )
            .where(inArray(recipes.id, linkedRecipeIds)),
      linkedIngredientIds.length === 0
        ? []
        : executor
            .select({ id: ingredients.id, name: ingredients.name })
            .from(ingredients)
            .where(inArray(ingredients.id, linkedIngredientIds)),
      loadDisplayNames(executor, locale, [
        ...linkedIngredientIds,
        ...uses.map((u) => u.eatingMomentId),
      ]),
    ]);
  const pairingText = new Map(pairingT.map((t) => [t.pairingId, t]));
  const useReason = new Map(
    useT.map((t) => [t.recipeEatingMomentId, t.reason]),
  );
  const recipeRows = new Map(linkedRecipes.map((r) => [r.id, r]));
  const ingredientName = new Map(linkedIngredients.map((i) => [i.id, i.name]));

  return {
    nutritionNote:
      owner?.nutritionNote == null
        ? null
        : (noteT[0]?.nutritionNote ?? owner.nutritionNote),
    pairings: pairings.map((p) => {
      const text = pairingText.get(p.id);
      const linked = p.linkedRecipeId ? recipeRows.get(p.linkedRecipeId) : null;
      let link: ResolvedGuidance['pairings'][number]['link'] = null;
      if (p.linkedIngredientId) {
        link = {
          type: 'ingredient',
          id: p.linkedIngredientId,
          name: names.pick(
            'ingredient',
            p.linkedIngredientId,
            ingredientName.get(p.linkedIngredientId) ?? '',
          ),
        };
      } else if (linked && !linked.archivedAt) {
        link = {
          type: 'recipe',
          id: linked.id,
          title: linked.translated ?? linked.title,
        };
      }
      return {
        id: p.id,
        kind: p.kind,
        label: text?.label ?? p.label,
        reason: text?.reason ?? p.reason,
        principle: p.principle,
        link,
      };
    }),
    eatingMoments: uses.map((u) => ({
      eatingMomentId: u.eatingMomentId,
      name: names.pick('eating_moment', u.eatingMomentId, u.name),
      polarity: u.polarity,
      reason: u.reason === null ? null : (useReason.get(u.id) ?? u.reason),
    })),
  };
}
