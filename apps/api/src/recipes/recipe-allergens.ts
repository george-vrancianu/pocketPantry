import { asc, eq, inArray } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { CatalogScope } from '../catalog/catalog-scope';
import { loadDisplayNames } from '../catalog/display-names';
import type { Executor } from '../database/database.types';
import {
  allergens,
  ingredientAllergens,
  recipeIngredientLines,
  user,
} from '../database/schema';
import {
  loadFamilyAllergies,
  loadOtherMemberAllergies,
} from '../settings/family-allergies';
import { loadMemberAllergenIds } from '../settings/member-allergies';
import {
  deriveAllergens,
  type AllergenLine,
  type AllergyInput,
  type AllergyWarning,
} from './matching/allergens';
import type {
  AllergyWarningView,
  CompactAllergyWarning,
  RecipeAllergens,
  ResolvedRecipe,
} from './recipes.schemas';

type SourceLine = AllergenLine & { ingredientName: string };

/**
 * The Allergies that apply to the viewer: their own, their Family's, and the
 * other Members' of that Family. Who is named, and in what order, is decided
 * only by `deriveAllergens`.
 */
export async function loadViewerAllergies(
  executor: Executor,
  memberId: string,
  /** The Member's Family when the caller already has it; saves a lookup. */
  knownFamilyId?: string,
): Promise<AllergyInput[]> {
  const familyId =
    knownFamilyId ??
    (
      await executor
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, memberId))
        .limit(1)
    )[0]?.familyId;
  const [own, family, members] = await Promise.all([
    loadMemberAllergenIds(executor, memberId),
    familyId ? loadFamilyAllergies(executor, familyId) : [],
    familyId ? loadOtherMemberAllergies(executor, familyId, memberId) : [],
  ]);
  return [
    ...own.map((allergenId) => ({ allergenId, owner: OWN })),
    ...family.map((row) => ({
      allergenId: row.allergenId,
      owner: { kind: 'family' as const, label: row.label },
    })),
    ...members.map((row) => ({
      allergenId: row.allergenId,
      owner: {
        kind: 'member' as const,
        memberId: row.memberId,
        name: row.name,
      },
    })),
  ];
}

const OWN = { kind: 'own' } as const;

type LineRow = Pick<
  ResolvedRecipe['lines'][number],
  'id' | 'ingredientId' | 'optional'
>;

/** Each Ingredient's Allergen tags and checked state, for a batch of lines at once. */
async function loadIngredientAllergenData(
  executor: Executor,
  scope: CatalogScope,
  lines: readonly Pick<LineRow, 'ingredientId'>[],
) {
  const ingredientIds = [
    ...new Set(lines.flatMap((l) => (l.ingredientId ? [l.ingredientId] : []))),
  ];
  const catalog = scope.ingredients(executor);
  const [ingredientRows, tagRows] = ingredientIds.length
    ? await Promise.all([
        executor
          .select({
            id: catalog.id,
            ownerFamilyId: catalog.ownerFamilyId,
            allergensChecked: catalog.allergensChecked,
            allergensReviewPending: catalog.allergensReviewPending,
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
        allergensReviewPending: row.allergensReviewPending,
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
  return (line: Pick<LineRow, 'ingredientId'>) => ({
    allergenIds: (line.ingredientId && tags.get(line.ingredientId)) || [],
    ingredient:
      (line.ingredientId && ingredientOf.get(line.ingredientId)) || null,
  });
}

/** The whole Allergen list is small; its curated order orders every card and warning. */
const loadAllergenList = (executor: Executor) =>
  executor
    .select()
    .from(allergens)
    .orderBy(asc(allergens.sortOrder), asc(allergens.name));

/** Allergen ids to `{ id, name }` in `locale`, falling back to the canonical name. */
async function allergenNamer(
  executor: Executor,
  scope: CatalogScope,
  locale: CatalogLocale,
  allergenRows: readonly { id: string; name: string }[],
  allergenIds: readonly string[],
) {
  const names = allergenIds.length
    ? await loadDisplayNames(executor, scope, locale, [...allergenIds])
    : null;
  const canonical = new Map(allergenRows.map((row) => [row.id, row.name]));
  return (id: string) => ({
    id,
    name: names?.pick('allergen', id, canonical.get(id) ?? '') ?? '',
  });
}

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
  allergies: readonly AllergyInput[],
): Promise<{
  allergens: RecipeAllergens;
  allergyWarning: AllergyWarningView | null;
}> {
  const allergenDataOf = await loadIngredientAllergenData(
    executor,
    scope,
    recipe.lines,
  );
  const lines: SourceLine[] = recipe.lines.map((line) => ({
    id: line.id,
    ingredientName: line.ingredientName,
    optional: line.optional,
    ...allergenDataOf(line),
  }));
  const allergenRows = await loadAllergenList(executor);
  const derived = deriveAllergens({
    lines,
    allergenOrder: allergenRows.map((row) => row.id),
    allergies,
  });
  const warning = derived.allergyWarning;
  const named = await allergenNamer(executor, scope, locale, allergenRows, [
    ...new Set([
      ...derived.allergens.map((a) => a.allergenId),
      ...(warning?.entries.map((e) => e.allergenId) ?? []),
    ]),
  ]);
  return {
    allergens: {
      items: derived.allergens.map((item) => ({
        allergen: named(item.allergenId),
        lines: item.sources.map((line) => ({
          id: line.id,
          ingredientName: line.ingredientName,
          optional: line.optional,
        })),
        optionalOnly: item.optionalOnly,
      })),
      uncheckedCount: derived.uncheckedCount,
    },
    allergyWarning: warning && {
      severity: warning.severity,
      entries: warning.entries.map((entry) => ({
        allergen: named(entry.allergenId),
        owner: entry.owner,
        tier: entry.tier,
        severity: entry.severity,
        lines: entry.lines,
      })),
      uncheckedCount: warning.uncheckedCount,
    },
  };
}

/**
 * The compact Allergy Warning of many Recipes at once (browse, Cook Tonight, Plate Scan
 * matches), through the same `deriveAllergens` as Recipe detail. Lines and Allergen tags are
 * loaded in a fixed number of queries, however many Recipes. A Recipe with no warning is
 * absent from the map; with no Allergies at all nothing is queried.
 *
 * #359's `hidden` and `hiddenByAllergiesCount` will sit beside these compact warnings
 * (derived by the same `deriveAllergens` call); they are not built here.
 */
export async function loadAllergyWarnings(
  executor: Executor,
  scope: CatalogScope,
  recipeIds: readonly string[],
  locale: CatalogLocale,
  allergies: readonly AllergyInput[],
): Promise<Map<string, CompactAllergyWarning>> {
  const result = new Map<string, CompactAllergyWarning>();
  if (allergies.length === 0 || recipeIds.length === 0) return result;
  const lineRows = await executor
    .select({
      id: recipeIngredientLines.id,
      recipeId: recipeIngredientLines.recipeId,
      ingredientId: recipeIngredientLines.ingredientId,
      optional: recipeIngredientLines.optional,
    })
    .from(recipeIngredientLines)
    .where(inArray(recipeIngredientLines.recipeId, [...recipeIds]))
    .orderBy(asc(recipeIngredientLines.position));
  const [allergenDataOf, allergenRows] = await Promise.all([
    loadIngredientAllergenData(executor, scope, lineRows),
    loadAllergenList(executor),
  ]);
  const allergenOrder = allergenRows.map((row) => row.id);
  const linesOf = new Map<string, AllergenLine[]>();
  for (const row of lineRows) {
    linesOf.set(row.recipeId, [
      ...(linesOf.get(row.recipeId) ?? []),
      { id: row.id, optional: row.optional, ...allergenDataOf(row) },
    ]);
  }
  const warnings = new Map<string, AllergyWarning>();
  for (const [recipeId, lines] of linesOf) {
    const { allergyWarning } = deriveAllergens({
      lines,
      allergenOrder,
      allergies,
    });
    if (allergyWarning) warnings.set(recipeId, allergyWarning);
  }
  const named = await allergenNamer(executor, scope, locale, allergenRows, [
    ...new Set(
      [...warnings.values()].flatMap((w) => w.entries.map((e) => e.allergenId)),
    ),
  ]);
  for (const [recipeId, warning] of warnings) {
    result.set(recipeId, compactWarning(warning, named));
  }
  return result;
}

/** One item per Allergen: `yours` if anyone whose Allergy counts as the viewer's has it. */
function compactWarning(
  warning: AllergyWarning,
  named: (id: string) => { id: string; name: string },
): CompactAllergyWarning {
  const byAllergen = new Map<
    string,
    CompactAllergyWarning['allergens'][number]
  >();
  for (const entry of warning.entries) {
    const seen = byAllergen.get(entry.allergenId);
    if (!seen) {
      byAllergen.set(entry.allergenId, {
        ...named(entry.allergenId),
        tier: entry.tier,
        severity: entry.severity,
      });
    } else if (entry.tier === 'yours') {
      seen.tier = 'yours';
    }
  }
  return {
    severity: warning.severity,
    allergens: [...byAllergen.values()],
    uncheckedCount: warning.uncheckedCount,
  };
}
