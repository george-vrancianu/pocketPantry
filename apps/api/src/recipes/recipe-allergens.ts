import { asc, inArray } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { CatalogScope } from '../catalog/catalog-scope';
import { loadDisplayNames } from '../catalog/display-names';
import type { Executor } from '../database/database.types';
import { allergens, ingredientAllergens } from '../database/schema';
import { deriveAllergens, type AllergenLine } from './matching/allergens';
import type { RecipeAllergens, ResolvedRecipe } from './recipes.schemas';

type SourceLine = AllergenLine & { ingredientName: string };

/**
 * A Recipe's Allergens (ADR 0014): loads the Allergen tags of its lines'
 * Ingredients and derives them. The Recipe's own lines are used, so a Variant
 * is judged apart from its base, and Servings never matter.
 */
export async function loadRecipeAllergens(
  executor: Executor,
  scope: CatalogScope,
  recipe: Pick<ResolvedRecipe, 'lines'>,
  locale: CatalogLocale,
): Promise<RecipeAllergens> {
  const ingredientIds = [
    ...new Set(
      recipe.lines.flatMap((l) => (l.ingredientId ? [l.ingredientId] : [])),
    ),
  ];
  const catalog = scope.ingredients(executor);
  const [ingredientRows, tagRows] = ingredientIds.length
    ? await Promise.all([
        executor
          .select({
            id: catalog.id,
            ownerFamilyId: catalog.ownerFamilyId,
            allergensChecked: catalog.allergensChecked,
          })
          .from(catalog)
          .where(inArray(catalog.id, ingredientIds)),
        executor
          .select()
          .from(ingredientAllergens)
          .where(inArray(ingredientAllergens.ingredientId, ingredientIds)),
      ])
    : [[], []];
  const ingredientOf = new Map(
    ingredientRows.map((row) => [
      row.id,
      {
        ownerFamilyId: row.ownerFamilyId,
        allergensChecked: row.allergensChecked,
      },
    ]),
  );
  const tags = new Map<string, string[]>();
  for (const row of tagRows) {
    tags.set(row.ingredientId, [
      ...(tags.get(row.ingredientId) ?? []),
      row.allergenId,
    ]);
  }

  const lines: SourceLine[] = recipe.lines.map((line) => ({
    id: line.id,
    ingredientName: line.ingredientName,
    optional: line.optional,
    allergenIds: (line.ingredientId && tags.get(line.ingredientId)) || [],
    ingredient:
      (line.ingredientId && ingredientOf.get(line.ingredientId)) || null,
  }));
  // The whole list is small; its curated order orders the card.
  const allergenRows = await executor
    .select()
    .from(allergens)
    .orderBy(asc(allergens.sortOrder), asc(allergens.name));
  const derived = deriveAllergens({
    lines,
    allergenOrder: allergenRows.map((row) => row.id),
  });
  const allergenIds = derived.allergens.map((a) => a.allergenId);
  const names = allergenIds.length
    ? await loadDisplayNames(executor, scope, locale, allergenIds)
    : null;
  const canonical = new Map(allergenRows.map((row) => [row.id, row.name]));
  return {
    items: derived.allergens.map((item) => ({
      allergen: {
        id: item.allergenId,
        name:
          names?.pick(
            'allergen',
            item.allergenId,
            canonical.get(item.allergenId) ?? '',
          ) ?? '',
      },
      lines: item.sources.map((line) => ({
        id: line.id,
        ingredientName: line.ingredientName,
        optional: line.optional,
      })),
      optionalOnly: item.optionalOnly,
    })),
    uncheckedCount: derived.uncheckedCount,
  };
}
