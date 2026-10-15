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
  /**
   * The line's Ingredient has been checked for Allergens: always true for a
   * shared Ingredient, true for a Family Ingredient once a Member tagged it
   * (or ticked "None"), and false for an Unmatched line.
   */
  checked: boolean;
  optional: boolean;
};

/**
 * What the derivation works from. An object, so later inputs (Allergies, for
 * Allergy Warnings and hiding) can join `lines` without changing callers.
 */
export type DeriveAllergensInput<L extends AllergenLine = AllergenLine> = {
  lines: readonly L[];
};

export type DerivedAllergen<L extends AllergenLine = AllergenLine> = {
  allergenId: string;
  /** The lines that contain it, in Recipe order. */
  sources: L[];
  /** Every source line is optional, so the Allergen can be left out. */
  optionalOnly: boolean;
};

export type DerivedAllergens<L extends AllergenLine = AllergenLine> = {
  /** In order of first appearance in the Recipe. */
  allergens: DerivedAllergen<L>[];
  /** Lines (optional ones too) that could not be checked for Allergens. */
  uncheckedCount: number;
};

export function deriveAllergens<L extends AllergenLine>(
  input: DeriveAllergensInput<L>,
): DerivedAllergens<L> {
  const sourcesOf = new Map<string, L[]>();
  let uncheckedCount = 0;
  for (const line of input.lines) {
    if (!line.checked) uncheckedCount += 1;
    for (const allergenId of new Set(line.allergenIds)) {
      const sources = sourcesOf.get(allergenId) ?? [];
      sources.push(line);
      sourcesOf.set(allergenId, sources);
    }
  }
  return {
    allergens: [...sourcesOf].map(([allergenId, sources]) => ({
      allergenId,
      sources,
      optionalOnly: sources.every((line) => line.optional),
    })),
    uncheckedCount,
  };
}
