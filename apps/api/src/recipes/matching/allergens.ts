/**
 * Pure deriving of a Recipe's Allergens from its Ingredient Lines (ADR 0014):
 * no database, no Nest. A Recipe's Allergens are never stored; the detail
 * endpoint loads each line's Allergen tags, hands them in, and reads the result.
 */

/** One Ingredient Line with what is known about its Allergens. */
export type AllergenLine = {
  id: string;
  /** The Allergens the line's Ingredient is tagged with; empty for none or unknown. */
  allergenIds: readonly string[];
  /** The line's Ingredient; null for an Unmatched line. */
  ingredient: {
    /** Null for a shared Catalog Ingredient. */
    ownerFamilyId: string | null;
    /** A Member tagged the Family Ingredient (or ticked "None"). */
    allergensChecked: boolean;
  } | null;
  optional: boolean;
};

/**
 * What the derivation works from. An object, so later inputs (Allergies, for
 * Allergy Warnings and hiding) can join `lines` without changing callers.
 */
export type DeriveAllergensInput<L extends AllergenLine = AllergenLine> = {
  lines: readonly L[];
  /** Allergen ids in the Admin-curated list order; others sort last. */
  allergenOrder: readonly string[];
};

export type DerivedAllergen<L extends AllergenLine = AllergenLine> = {
  allergenId: string;
  /** The lines that contain it, in Recipe order. */
  sources: L[];
  /** Every source line is optional, so the Allergen can be left out. */
  optionalOnly: boolean;
};

export type DerivedAllergens<L extends AllergenLine = AllergenLine> = {
  /** In the Admin-curated Allergen order. */
  allergens: DerivedAllergen<L>[];
  /** Lines (optional ones too) that could not be checked for Allergens. */
  uncheckedCount: number;
};

/**
 * Whether a line could be checked for Allergens: a shared Ingredient always
 * can, a Family Ingredient once a Member tagged it (or ticked "None"), and an
 * Unmatched line never. Unchecked lines are counted, never assumed free.
 */
export function isLineChecked(line: Pick<AllergenLine, 'ingredient'>): boolean {
  const { ingredient } = line;
  if (!ingredient) return false;
  return ingredient.ownerFamilyId === null || ingredient.allergensChecked;
}

export function deriveAllergens<L extends AllergenLine>(
  input: DeriveAllergensInput<L>,
): DerivedAllergens<L> {
  const sourcesOf = new Map<string, L[]>();
  let uncheckedCount = 0;
  for (const line of input.lines) {
    if (!isLineChecked(line)) uncheckedCount += 1;
    for (const allergenId of new Set(line.allergenIds)) {
      const sources = sourcesOf.get(allergenId) ?? [];
      sources.push(line);
      sourcesOf.set(allergenId, sources);
    }
  }
  const rank = (id: string) => {
    const index = input.allergenOrder.indexOf(id);
    return index === -1 ? input.allergenOrder.length : index;
  };
  return {
    // Array sort is stable, so unlisted Allergens keep their order of appearance.
    allergens: [...sourcesOf]
      .sort(([a], [b]) => rank(a) - rank(b))
      .map(([allergenId, sources]) => ({
        allergenId,
        sources,
        optionalOnly: sources.every((line) => line.optional),
      })),
    uncheckedCount,
  };
}
