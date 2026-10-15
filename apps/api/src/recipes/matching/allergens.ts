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

/** An Allergy that applies to the viewer. Later tickets add whose it is (Family Allergies, other Members'). */
export type AllergyInput = {
  allergenId: string;
};

/**
 * What the derivation works from. An object, so later inputs can join it
 * without changing callers.
 */
export type DeriveAllergensInput<L extends AllergenLine = AllergenLine> = {
  lines: readonly L[];
  /** Allergen ids in the Admin-curated list order; others sort last. */
  allergenOrder: readonly string[];
  /** The Allergies that apply to the viewer; none (the default) means no Allergy Warning. */
  allergies?: readonly AllergyInput[];
};

export type DerivedAllergen<L extends AllergenLine = AllergenLine> = {
  allergenId: string;
  /** The lines that contain it, in Recipe order. */
  sources: L[];
  /** Every source line is optional, so the Allergen can be left out. */
  optionalOnly: boolean;
};

export type AllergyWarningSeverity = 'strong' | 'soft';

/** One Allergy the Recipe contains, with the lines that contain it. */
export type AllergyWarningEntry = {
  allergenId: string;
  /** `strong` when a required line contains it, `soft` when only optional lines do. */
  severity: AllergyWarningSeverity;
  /** Every line (optional ones too) that contains it, in Recipe order. */
  lineIds: string[];
};

/** The notice for a Recipe that contains, or might contain, one of the viewer's Allergies. */
export type AllergyWarning = {
  /** `strong` when any entry is strong; `soft` otherwise. */
  severity: AllergyWarningSeverity;
  /** In the Admin-curated Allergen order. Empty when only Unchecked lines raise it. */
  entries: AllergyWarningEntry[];
  /** Lines that could not be checked, counted whenever the viewer has an Allergy. */
  uncheckedCount: number;
};

export type DerivedAllergens<L extends AllergenLine = AllergenLine> = {
  /** In the Admin-curated Allergen order. */
  allergens: DerivedAllergen<L>[];
  /** Lines (optional ones too) that could not be checked for Allergens. */
  uncheckedCount: number;
  /** Null when nothing the viewer must avoid is, or might be, in the Recipe. */
  allergyWarning: AllergyWarning | null;
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
  // Array sort is stable, so unlisted Allergens keep their order of appearance.
  const allergens = [...sourcesOf]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([allergenId, sources]) => ({
      allergenId,
      sources,
      optionalOnly: sources.every((line) => line.optional),
    }));
  return {
    allergens,
    uncheckedCount,
    allergyWarning: warningFor(
      allergens,
      uncheckedCount,
      new Set((input.allergies ?? []).map((a) => a.allergenId)),
    ),
  };
}

function warningFor<L extends AllergenLine>(
  allergens: readonly DerivedAllergen<L>[],
  uncheckedCount: number,
  allergyIds: ReadonlySet<string>,
): AllergyWarning | null {
  if (allergyIds.size === 0) return null;
  const entries = allergens
    .filter((a) => allergyIds.has(a.allergenId))
    .map((a) => ({
      allergenId: a.allergenId,
      severity: a.optionalOnly ? ('soft' as const) : ('strong' as const),
      lineIds: a.sources.map((line) => line.id),
    }));
  if (entries.length === 0 && uncheckedCount === 0) return null;
  return {
    severity: entries.some((e) => e.severity === 'strong') ? 'strong' : 'soft',
    entries,
    uncheckedCount,
  };
}
