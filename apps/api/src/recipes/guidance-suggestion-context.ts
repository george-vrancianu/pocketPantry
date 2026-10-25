import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor } from '../database/database.types';
import {
  allergens,
  ingredientAllergens,
  recipeIngredientLines,
  recipes,
} from '../database/schema';
import type { IngredientCatalog } from '../ingredients/ingredient-catalog';
import { loadViewerAllergies } from './recipe-allergens';
import { recipeTitles, visibleTo } from './recipe-view';

/**
 * What Suggest Guidance may link to and must steer clear of, decided before the model is
 * asked. A Member's request builds it from their Family (`memberSuggestionContext`); an
 * Admin's (Catalog mode, #556) supplies its own: Catalog-only candidates and no Allergens.
 * The service never looks at who is asking, only at this.
 */
export type SuggestionContext = {
  /** Catalog Ingredients a Pairing may link to, in the form Recipe from Link offers (`catalogPrompt`). */
  catalog: IngredientCatalog;
  /** Recipes a Pairing may link to (Catalog Recipes, the Family's own unarchived ones), never the page's own. */
  linkableRecipes: { id: string; title: string }[];
  /** Allergens to name in the prompt as things to avoid. Empty for none. */
  avoidAllergens: { id: string; name: string }[];
  /**
   * Ingredient and Recipe ids that contain an avoided Allergen. They are left out of the
   * offered lists; a Pairing the model still links to one is dropped, not just unlinked.
   */
  unsafeLinkIds: ReadonlySet<string>;
};

/** For requests that do not ask for Pairings: nothing to link to, nothing to avoid. */
export const NO_CONTEXT: SuggestionContext = {
  catalog: { categories: [], ingredients: [] },
  linkableRecipes: [],
  avoidAllergens: [],
  unsafeLinkIds: new Set(),
};

/** The context of a Member: Catalog and Family Recipes to link, the Family's Allergies to avoid. */
export async function memberSuggestionContext(
  executor: Executor,
  input: {
    memberId: string;
    familyId: string;
    locale: CatalogLocale;
    catalog: IngredientCatalog;
    /** The saved Recipe being edited; excluded from the links only when it is the Family's own. */
    recipeId?: string;
  },
): Promise<SuggestionContext> {
  const { familyId, catalog } = input;
  const rows = await executor
    .select()
    .from(recipes)
    .where(and(isNull(recipes.archivedAt), visibleTo(familyId)));
  // A `recipeId` that is not the Family's own matches no row here, so it changes nothing.
  const own = rows.filter(
    (r) => !(r.id === input.recipeId && r.familyId === familyId),
  );
  const titles = await recipeTitles(executor, own, input.locale);

  const allergies = await loadViewerAllergies(
    executor,
    input.memberId,
    familyId,
  );
  const avoidIds = [...new Set(allergies.map((a) => a.allergenId))];
  const avoidAllergens = avoidIds.length
    ? await executor
        .select({ id: allergens.id, name: allergens.name })
        .from(allergens)
        .where(inArray(allergens.id, avoidIds))
    : [];

  const unsafeIngredients = avoidIds.length
    ? new Set(
        (
          await executor
            .select({ id: ingredientAllergens.ingredientId })
            .from(ingredientAllergens)
            .where(
              and(
                inArray(ingredientAllergens.allergenId, avoidIds),
                inArray(
                  ingredientAllergens.ingredientId,
                  catalog.ingredients.map((i) => i.id),
                ),
              ),
            )
        ).map((row) => row.id),
      )
    : new Set<string>();
  // Any required line whose Ingredient is tagged with an avoided Allergen, checked or not: the
  // same raw tags the direct Ingredient check reads. Optional lines can be left out.
  const unsafeRecipes =
    avoidIds.length && own.length
      ? new Set(
          (
            await executor
              .selectDistinct({ id: recipeIngredientLines.recipeId })
              .from(recipeIngredientLines)
              .innerJoin(
                ingredientAllergens,
                eq(
                  ingredientAllergens.ingredientId,
                  recipeIngredientLines.ingredientId,
                ),
              )
              .where(
                and(
                  inArray(
                    recipeIngredientLines.recipeId,
                    own.map((r) => r.id),
                  ),
                  eq(recipeIngredientLines.optional, false),
                  inArray(ingredientAllergens.allergenId, avoidIds),
                ),
              )
          ).map((row) => row.id),
        )
      : new Set<string>();
  const unsafeLinkIds = new Set([...unsafeIngredients, ...unsafeRecipes]);

  return {
    catalog: {
      categories: catalog.categories,
      ingredients: catalog.ingredients.filter(
        (i) => !unsafeIngredients.has(i.id),
      ),
    },
    linkableRecipes: own
      .filter((r) => !unsafeRecipes.has(r.id))
      .map((r) => ({ id: r.id, title: titles.get(r.id) ?? r.title })),
    avoidAllergens,
    unsafeLinkIds,
  };
}
