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
 * Whose Allergy it is. The viewer's own and Family Allergies count as the
 * viewer's own (they can hide Recipes, #359); another Member's never does.
 */
export type AllergyOwner =
  | { kind: 'own' }
  | { kind: 'family'; label: string | null }
  | { kind: 'member'; memberId: string; name: string };

/**
 * Whether an Allergy counts as the viewer's own: theirs and the Family's do, another
 * Member's never does. The one place this rule lives (#359 reuses it to hide Recipes).
 */
export function countsAsViewersOwn(owner: AllergyOwner): boolean {
  return owner.kind !== 'member';
}

/** An Allergy that applies to the viewer, and whose it is. */
export type AllergyInput = {
  allergenId: string;
  owner: AllergyOwner;
};

/**
 * What the derivation works from. An object, so later inputs can join it
 * without changing callers.
 */
export type DeriveAllergensInput<L extends AllergenLine = AllergenLine> = {
  lines: readonly L[];
  /** Allergen ids in the Admin-curated list order; others sort last. */
  allergenOrder: readonly string[];
  /**
   * The Allergies that apply: the viewer's own, the Family's and other Members'.
   * None (the default) means no Allergy Warning.
   */
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

/** A line that contains an Allergy: `soft` when the line is optional, so it can be left out. */
export type AllergyWarningLine = {
  lineId: string;
  severity: AllergyWarningSeverity;
};

/** One person's Allergy the Recipe contains, with the lines that contain it. */
export type AllergyWarningEntry = {
  allergenId: string;
  /** Whose Allergy it is. */
  owner: AllergyOwner;
  /** `yours` when it counts as the viewer's own (their own, the Family's), `members` for another Member's. */
  tier: 'yours' | 'members';
  /** `strong` when a required line contains it, `soft` when only optional lines do. */
  severity: AllergyWarningSeverity;
  /** Every line (optional ones too) that contains it, in Recipe order, each with its own severity. */
  lines: AllergyWarningLine[];
};

/** The notice for a Recipe that contains, or might contain, one of the viewer's Allergies. */
export type AllergyWarning = {
  /** `strong` when any entry is strong; `soft` otherwise. */
  severity: AllergyWarningSeverity;
  /**
   * One entry per person and Allergen. The viewer's own come first, then Family
   * Allergies (each in the Admin-curated Allergen order), then other Members
   * grouped by name. Empty when only Unchecked lines raise it.
   */
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
  /**
   * Whether "Hide Recipes with my Allergies" would leave this Recipe out (#359): true only
   * when the viewer's own or a Family Allergy is in a required, checked line. Another
   * Member's Allergy, optional lines and Unchecked lines never hide a Recipe.
   */
  hidden: boolean;
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
      input.allergies ?? [],
      rank,
    ),
    hidden: isHidden(allergens, input.allergies ?? []),
  };
}

function isHidden<L extends AllergenLine>(
  allergens: readonly DerivedAllergen<L>[],
  allergies: readonly AllergyInput[],
): boolean {
  const mine = new Set(
    allergies
      .filter((a) => countsAsViewersOwn(a.owner))
      .map((a) => a.allergenId),
  );
  return allergens.some(
    (a) =>
      mine.has(a.allergenId) &&
      a.sources.some((line) => !line.optional && isLineChecked(line)),
  );
}

function warningFor<L extends AllergenLine>(
  allergens: readonly DerivedAllergen<L>[],
  uncheckedCount: number,
  allergies: readonly AllergyInput[],
  rank: (allergenId: string) => number,
): AllergyWarning | null {
  if (allergies.length === 0) return null;
  const sourcesOf = new Map(allergens.map((a) => [a.allergenId, a]));
  const entries = uniqueAllergies(allergies)
    .flatMap((allergy) => {
      const found = sourcesOf.get(allergy.allergenId);
      if (!found) return [];
      return [
        {
          allergenId: allergy.allergenId,
          owner: allergy.owner,
          tier: countsAsViewersOwn(allergy.owner)
            ? ('yours' as const)
            : ('members' as const),
          severity: found.optionalOnly
            ? ('soft' as const)
            : ('strong' as const),
          lines: found.sources.map((line) => ({
            lineId: line.id,
            severity: line.optional ? ('soft' as const) : ('strong' as const),
          })),
        },
      ];
    })
    .sort((a, b) => compareOwners(a, b, rank));
  if (entries.length === 0 && uncheckedCount === 0) return null;
  return {
    severity: entries.some((e) => e.severity === 'strong') ? 'strong' : 'soft',
    entries,
    uncheckedCount,
  };
}

const ownerKey = (owner: AllergyOwner): string =>
  owner.kind === 'own'
    ? 'own'
    : owner.kind === 'family'
      ? `family:${owner.label ?? ''}`
      : `member:${owner.memberId}`;

/** An exact repeat (same Allergen, same person) is one Allergy. */
function uniqueAllergies(allergies: readonly AllergyInput[]): AllergyInput[] {
  const seen = new Set<string>();
  return allergies.filter((a) => {
    const key = `${a.allergenId}|${ownerKey(a.owner)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const OWNER_TIER = { own: 0, family: 1, member: 2 } as const;

/**
 * Own; then Family grouped by label (unlabeled first, then alphabetical); then other Members
 * grouped by name (then id). Within a person, Allergen order. Grouping each person together
 * means the banner's per-person phrases never reorder anything. Stable otherwise.
 */
function compareOwners(
  a: Pick<AllergyWarningEntry, 'allergenId' | 'owner'>,
  b: Pick<AllergyWarningEntry, 'allergenId' | 'owner'>,
  rank: (allergenId: string) => number,
): number {
  const tier = OWNER_TIER[a.owner.kind] - OWNER_TIER[b.owner.kind];
  if (tier !== 0) return tier;
  if (a.owner.kind === 'family' && b.owner.kind === 'family') {
    const [x, y] = [a.owner.label, b.owner.label];
    if (x !== y) {
      if (x === null) return -1;
      if (y === null) return 1;
      const byLabel = x.localeCompare(y);
      if (byLabel !== 0) return byLabel;
    }
  }
  if (a.owner.kind === 'member' && b.owner.kind === 'member') {
    const byName = a.owner.name.localeCompare(b.owner.name);
    if (byName !== 0) return byName;
    if (a.owner.memberId !== b.owner.memberId) {
      return a.owner.memberId < b.owner.memberId ? -1 : 1;
    }
  }
  return rank(a.allergenId) - rank(b.allergenId);
}
