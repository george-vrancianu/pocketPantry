import { inArray } from 'drizzle-orm';
import type { CatalogScope } from '../catalog/catalog-scope';
import { ApiException } from '../common/api-exception';
import type { Tx } from '../database/database.types';
import { recipes } from '../database/schema';

/** The Ingredient Line fields both the Catalog and Family writers check. */
interface RecipeLineShape {
  id?: string | undefined;
  ingredientId: string | null;
  quantity: number | null;
  unit: string | null;
}

/** The parts of a Recipe document both writers check. */
interface RecipeDocumentShape<L extends RecipeLineShape> {
  lines: L[];
  steps: { id?: string | undefined }[];
}

/** The Recipe columns a document sets (the same for an insert and an update). */
export function recipeColumns(document: {
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: (typeof recipes.$inferInsert)['difficulty'];
}) {
  return {
    title: document.title,
    servings: document.servings,
    prepMinutes: document.prepMinutes,
    cookMinutes: document.cookMinutes,
    difficulty: document.difficulty,
  };
}

/**
 * The coded rules every Recipe document meets, checked before any write:
 * quantity and unit come together, `ingredientRule` (Catalog and Family differ
 * on raw names) per line, no repeated line or Step ids, and the Ingredients
 * exist (key-share locked, so a concurrent delete waits
 * until we commit).
 */
export async function validateRecipeDocument<L extends RecipeLineShape>(
  tx: Tx,
  scope: CatalogScope,
  document: RecipeDocumentShape<L>,
  ingredientRule: (line: L, index: number) => void,
) {
  document.lines.forEach((line, index) => {
    if ((line.quantity === null) !== (line.unit === null)) {
      throw new ApiException(400, 'recipes.quantity_unit_mismatch', {
        line: index,
      });
    }
    ingredientRule(line, index);
  });
  for (const [kind, items] of [
    ['line', document.lines],
    ['step', document.steps],
  ] as const) {
    const given = items.flatMap((item) => (item.id ? [item.id] : []));
    if (new Set(given).size !== given.length) {
      throw new ApiException(400, 'recipes.duplicate_item', { kind });
    }
  }
  const wanted = [
    ...new Set(document.lines.flatMap((l) => l.ingredientId ?? [])),
  ];
  if (wanted.length > 0) {
    const ingredients = scope.ingredients(tx);
    const found = await tx
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(inArray(ingredients.id, wanted))
      .orderBy(ingredients.id)
      // Blocks a concurrent Ingredient delete until we commit.
      .for('key share');
    if (found.length !== wanted.length) {
      throw new ApiException(404, 'catalog.not_found', {
        entity: 'ingredient',
      });
    }
  }
}

/**
 * A Variant's parent must be a live Catalog Base Recipe (`parent` is the row
 * read under a shared lock, or undefined when there is none the caller may
 * see): Variants of Variants and Variants under a Family Recipe are refused,
 * and so is an archived base. Existing Variants of an archived base keep working.
 */
export function assertLiveCatalogBase(
  parent: typeof recipes.$inferSelect | undefined,
): void {
  if (!parent) throw new ApiException(404, 'recipes.parent_not_found');
  if (parent.parentId) {
    throw new ApiException(409, 'recipes.variant_of_variant');
  }
  if (parent.familyId !== null) {
    throw new ApiException(404, 'recipes.parent_not_found');
  }
  if (parent.archivedAt) {
    throw new ApiException(409, 'recipes.parent_archived');
  }
}
