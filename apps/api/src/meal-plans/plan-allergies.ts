import { catalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor } from '../database/database.types';
import {
  loadAllergyWarnings,
  loadViewerAllergies,
} from '../recipes/recipe-allergens';
import type { CompactAllergyWarning } from '../recipes/recipes.schemas';

/**
 * The Allergy Warning of each Recipe a Meal Plan uses, from the viewer's side: their own,
 * their Family's and the other Members' Allergies, each named (ADR 0014). Plan Slots are never
 * hidden (ADR 0012), so the hide preference is never read here. A Recipe with no warning is
 * absent from the map.
 */
export async function loadSlotWarnings(
  executor: Executor,
  familyId: string,
  memberId: string,
  locale: CatalogLocale,
  recipeIds: readonly string[],
): Promise<ReadonlyMap<string, CompactAllergyWarning>> {
  const allergies = await loadViewerAllergies(executor, memberId, familyId);
  const { warnings } = await loadAllergyWarnings(
    executor,
    catalogScope(familyId),
    [...new Set(recipeIds)],
    locale,
    allergies,
  );
  return warnings;
}

/**
 * What Fill must not pick: the Recipes with any Member's or a Family Allergy in a required,
 * checked line. Fill chooses for the whole Family, so the filler's hide preference and whose
 * Allergy it is do not matter; `deriveAllergens` decides, this only loads.
 */
export async function loadFillBlocks(
  executor: Executor,
  familyId: string,
  memberId: string,
  recipeIds: readonly string[],
): Promise<ReadonlySet<string>> {
  const allergies = await loadViewerAllergies(executor, memberId, familyId);
  const { blocksFill } = await loadAllergyWarnings(
    executor,
    catalogScope(familyId),
    [...recipeIds],
    'en',
    allergies,
  );
  return blocksFill;
}
