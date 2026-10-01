export type IngredientUsageCounts = { batches: number; shoppingItems: number };

/**
 * Seam for the Admin delete guard: how many Batches and Shopping Items still
 * point at an Ingredient. Those tables arrive in later tickets, which replace
 * the default provider (see AdminModule) with real queries.
 */
export abstract class IngredientUsage {
  abstract count(ingredientId: string): Promise<IngredientUsageCounts>;
}

/** Until Batches and Shopping Items exist, nothing can reference an Ingredient. */
export class NoIngredientUsage extends IngredientUsage {
  count(): Promise<IngredientUsageCounts> {
    return Promise.resolve({ batches: 0, shoppingItems: 0 });
  }
}
