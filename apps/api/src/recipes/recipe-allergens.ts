import { asc, eq, inArray } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { CatalogScope } from '../catalog/catalog-scope';
import { loadDisplayNames } from '../catalog/display-names';
import type { Executor } from '../database/database.types';
import { allergens, ingredientAllergens, user } from '../database/schema';
import {
  loadFamilyAllergies,
  loadOtherMemberAllergies,
} from '../settings/family-allergies';
import { loadMemberAllergenIds } from '../settings/member-allergies';
import {
  deriveAllergens,
  type AllergenLine,
  type AllergyInput,
} from './matching/allergens';
import type {
  AllergyWarningView,
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
): Promise<AllergyInput[]> {
  const [self] = await executor
    .select({ familyId: user.familyId })
    .from(user)
    .where(eq(user.id, memberId))
    .limit(1);
  const [own, family, members] = await Promise.all([
    loadMemberAllergenIds(executor, memberId),
    self ? loadFamilyAllergies(executor, self.familyId) : [],
    self ? loadOtherMemberAllergies(executor, self.familyId, memberId) : [],
  ]);
  return [
    ...own.map((allergenId) => ({ allergenId, owner: OWN })),
    ...family.map((row) => ({
      allergenId: row.allergenId,
      owner: { kind: 'family' as const, label: row.label },
    })),
    ...members.map((row) => ({
      allergenId: row.allergenId,
      owner: { kind: 'member' as const, name: row.name },
    })),
  ];
}

const OWN = { kind: 'own' } as const;

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
    allergies,
  });
  const warning = derived.allergyWarning;
  const allergenIds = [
    ...new Set([
      ...derived.allergens.map((a) => a.allergenId),
      ...(warning?.entries.map((e) => e.allergenId) ?? []),
    ]),
  ];
  const names = allergenIds.length
    ? await loadDisplayNames(executor, scope, locale, allergenIds)
    : null;
  const canonical = new Map(allergenRows.map((row) => [row.id, row.name]));
  const named = (id: string) => ({
    id,
    name: names?.pick('allergen', id, canonical.get(id) ?? '') ?? '',
  });
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
        severity: entry.severity,
        lines: entry.lines,
      })),
      uncheckedCount: warning.uncheckedCount,
    },
  };
}
