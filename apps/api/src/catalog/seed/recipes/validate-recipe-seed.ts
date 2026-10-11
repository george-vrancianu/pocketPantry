import type { z } from 'zod';
import { normalizeName } from '../../normalize';
import { recipeDocument, tipCreate } from '../../../recipes/recipes.schemas';
import {
  guidanceBody,
  MAX_EATING_MOMENTS,
  MAX_NUTRITION_NOTE,
  MAX_PAIRINGS,
} from '../../../recipes/recipe-guidance.schemas';
import type {
  BaseRecipeSeed,
  RecipeSeed,
  SeedNamed,
  Text,
  VariantSeed,
} from './recipe-seed-types';

export type RecipeSeedInput = {
  bases: BaseRecipeSeed[];
  cuisines: SeedNamed[];
  methods: SeedNamed[];
  eatingMoments: SeedNamed[];
  /** Slugs of the Catalog seed's Ingredients. */
  ingredientSlugs: Set<string>;
};

const blank = (value: string | undefined) => (value ?? '').trim() === '';

function textProblems(where: string, label: string, text: Text): string[] {
  return (['en', 'ro'] as const)
    .filter((locale) => blank(text?.[locale]))
    .map((locale) => `${where}: ${label}: missing ${locale}`);
}

function registryProblems(label: string, rows: SeedNamed[]): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  const names = new Map<string, string>();
  for (const row of rows) {
    if (slugs.has(row.slug)) {
      problems.push(`duplicate ${label} slug "${row.slug}"`);
    }
    slugs.add(row.slug);
    for (const locale of ['en', 'ro', 'da'] as const) {
      if (blank(row[locale])) {
        problems.push(`${label} "${row.slug}": missing ${locale} name`);
      }
    }
    // The database keeps normalised English names unique.
    const key = normalizeName(row.en);
    const other = names.get(key);
    if (other !== undefined && other !== row.slug) {
      problems.push(
        `${label} "${other}" and "${row.slug}" share the name "${key}"`,
      );
    }
    names.set(key, row.slug);
  }
  return problems;
}

function recipeProblems(
  recipe: RecipeSeed,
  input: RecipeSeedInput,
  recipeSlugs: Set<string>,
): string[] {
  const where = `recipe "${recipe.slug}"`;
  const problems: string[] = [];
  const add = (message: string) => problems.push(`${where}: ${message}`);

  problems.push(...textProblems(where, 'title', recipe.title));
  if (!Number.isInteger(recipe.servings) || recipe.servings <= 0) {
    add('servings must be a positive integer');
  }

  const lineKeys = new Set<string>();
  for (const line of recipe.lines) {
    if (!input.ingredientSlugs.has(line.ingredient)) {
      add(`line uses unknown Ingredient "${line.ingredient}"`);
    }
    const key = line.key ?? line.ingredient;
    if (lineKeys.has(key)) add(`duplicate line key "${key}"`);
    lineKeys.add(key);
    if ((line.quantity === undefined) !== (line.unit === undefined)) {
      add(`line "${line.ingredient}": quantity and unit come together`);
    }
    if (line.quantity !== undefined && !(line.quantity > 0)) {
      add(`line "${line.ingredient}": quantity must be positive`);
    }
    if (line.note) {
      problems.push(
        ...textProblems(where, `line "${line.ingredient}" note`, line.note),
      );
    }
  }
  if (recipe.lines.length === 0) add('has no Ingredient Lines');

  const steps = new Set<string>();
  for (const step of recipe.steps) {
    if (steps.has(step.key)) add(`duplicate step key "${step.key}"`);
    steps.add(step.key);
    problems.push(...textProblems(where, `step "${step.key}"`, step.text));
  }
  if (recipe.steps.length === 0) add('has no Steps');

  for (const [i, tip] of (recipe.tips ?? []).entries()) {
    problems.push(...textProblems(where, `Tip ${i + 1}`, tip));
  }
  for (const [i, tip] of (recipe.stepTips ?? []).entries()) {
    if (!steps.has(tip.step)) add(`Tip on unknown step "${tip.step}"`);
    problems.push(...textProblems(where, `step Tip ${i + 1}`, tip.text));
  }

  problems.push(...textProblems(where, 'Nutrition Note', recipe.nutritionNote));
  for (const locale of ['en', 'ro'] as const) {
    const length = [...(recipe.nutritionNote?.[locale] ?? '')].length;
    if (length > MAX_NUTRITION_NOTE) {
      add(
        `${locale} Nutrition Note is ${length} characters, the limit is ${MAX_NUTRITION_NOTE}`,
      );
    }
  }

  if (recipe.pairings.length < 1 || recipe.pairings.length > MAX_PAIRINGS) {
    add(`needs 1 to ${MAX_PAIRINGS} Pairings, found ${recipe.pairings.length}`);
  }
  for (const [i, p] of recipe.pairings.entries()) {
    const label = `Pairing ${i + 1}`;
    problems.push(...textProblems(where, `${label} label`, p.label));
    problems.push(...textProblems(where, `${label} reason`, p.reason));
    if (p.ingredient !== undefined && p.recipe !== undefined) {
      add(`${label} links both an Ingredient and a Recipe`);
    }
    if (
      p.ingredient !== undefined &&
      !input.ingredientSlugs.has(p.ingredient)
    ) {
      add(`${label} links unknown Ingredient "${p.ingredient}"`);
    }
    if (p.recipe === recipe.slug) add(`${label} links its own Recipe`);
    else if (p.recipe !== undefined && !recipeSlugs.has(p.recipe)) {
      add(`${label} links unknown Recipe "${p.recipe}"`);
    }
  }

  const moments = new Set(input.eatingMoments.map((m) => m.slug));
  const used = new Set<string>();
  if (
    recipe.eatingMoments.length < 1 ||
    recipe.eatingMoments.length > MAX_EATING_MOMENTS
  ) {
    add(
      `needs 1 to ${MAX_EATING_MOMENTS} Eating Moment uses, found ${recipe.eatingMoments.length}`,
    );
  }
  for (const use of recipe.eatingMoments) {
    if (!moments.has(use.moment)) {
      add(`uses unknown Eating Moment "${use.moment}"`);
    }
    if (used.has(use.moment)) add(`Eating Moment "${use.moment}" used twice`);
    used.add(use.moment);
    problems.push(
      ...textProblems(
        where,
        `Eating Moment "${use.moment}" reason`,
        use.reason,
      ),
    );
  }
  problems.push(...apiLimitProblems(recipe, where));
  return problems;
}

const DUMMY_ID = '00000000-0000-4000-8000-000000000000';

/**
 * The Admin API's own schemas, run per locale on what the seed would write, so
 * the seed cannot hold text or numbers the API would refuse (length limits,
 * quantity range, line and step caps, minutes). Blank text is reported by
 * `textProblems`; these checks add what only the schemas know.
 */
function apiLimitProblems(recipe: RecipeSeed, where: string): string[] {
  const problems: string[] = [];
  const report = (
    locale: string,
    label: string,
    result: z.ZodSafeParseResult<unknown>,
  ) => {
    if (result.success) return;
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      problems.push(
        `${where}: [${locale}] ${label}${path ? ` ${path}` : ''}: ${issue.message}`,
      );
    }
  };
  for (const locale of ['en', 'ro'] as const) {
    const text = (value: Text | undefined) => value?.[locale] ?? '';
    report(
      locale,
      'document',
      recipeDocument.safeParse({
        title: text(recipe.title),
        servings: recipe.servings,
        prepMinutes: recipe.prepMinutes ?? null,
        cookMinutes: recipe.cookMinutes ?? null,
        difficulty: recipe.difficulty ?? null,
        lines: recipe.lines.map((line) => ({
          ingredientId: DUMMY_ID,
          quantity: line.quantity ?? null,
          unit: line.unit ?? null,
          optional: line.optional ?? false,
          note: line.note ? text(line.note) : null,
        })),
        steps: recipe.steps.map((step) => ({
          text: text(step.text),
          timerSeconds: step.timerSeconds ?? null,
        })),
      }),
    );
    report(
      locale,
      'guidance',
      guidanceBody.safeParse({
        nutritionNote: text(recipe.nutritionNote),
        pairings: recipe.pairings.map((p) => ({
          kind: p.kind,
          label: text(p.label),
          reason: text(p.reason),
          principle: p.principle ?? null,
        })),
        eatingMoments: recipe.eatingMoments.map((use) => ({
          eatingMomentId: DUMMY_ID,
          polarity: use.polarity,
          reason: text(use.reason),
        })),
      }),
    );
    for (const [i, tip] of (recipe.tips ?? []).entries()) {
      report(locale, `tip ${i + 1}`, tipCreate.safeParse({ text: text(tip) }));
    }
    for (const [i, tip] of (recipe.stepTips ?? []).entries()) {
      report(
        locale,
        `step tip ${i + 1}`,
        tipCreate.safeParse({ text: text(tip.text) }),
      );
    }
  }
  return problems;
}

/**
 * Everything structurally wrong with the Recipe seed, as readable lines. The
 * minimum counts of the acceptance criteria live in `findAcceptanceGaps`, so a
 * seed with only some of the bases can still be structurally valid.
 */
export function findRecipeSeedProblems(input: RecipeSeedInput): string[] {
  const problems = [
    ...registryProblems('Cuisine', input.cuisines),
    ...registryProblems('Method', input.methods),
    ...registryProblems('Eating Moment', input.eatingMoments),
  ];
  const all: RecipeSeed[] = input.bases.flatMap((b) => [b, ...b.variants]);
  const recipeSlugs = new Set<string>();
  for (const recipe of all) {
    if (recipeSlugs.has(recipe.slug)) {
      problems.push(`duplicate slug "${recipe.slug}"`);
    }
    recipeSlugs.add(recipe.slug);
  }
  const cuisines = new Set(input.cuisines.map((c) => c.slug));
  const methods = new Set(input.methods.map((m) => m.slug));
  for (const base of input.bases) {
    problems.push(...recipeProblems(base, input, recipeSlugs));
    for (const variant of base.variants) {
      problems.push(...recipeProblems(variant, input, recipeSlugs));
      const hasCuisine = variant.cuisine !== undefined;
      const hasMethod = variant.method !== undefined;
      if (hasCuisine === hasMethod) {
        problems.push(
          `recipe "${variant.slug}": a Variant needs exactly one of cuisine and method`,
        );
      }
      if (hasCuisine && !cuisines.has(variant.cuisine)) {
        problems.push(
          `recipe "${variant.slug}": unknown Cuisine "${variant.cuisine}"`,
        );
      }
      if (hasMethod && !methods.has(variant.method)) {
        problems.push(
          `recipe "${variant.slug}": unknown Method "${variant.method}"`,
        );
      }
      const hidden = new Set<number>();
      for (const index of variant.hideBaseTips ?? []) {
        if (hidden.has(index)) {
          problems.push(
            `recipe "${variant.slug}": hideBaseTips lists ${index} twice`,
          );
        }
        hidden.add(index);
        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= (base.tips ?? []).length
        ) {
          problems.push(
            `recipe "${variant.slug}": hideBaseTips index ${index} is not a base Tip`,
          );
        }
      }
    }
  }
  return problems;
}

export function assertRecipeSeedValid(input: RecipeSeedInput): void {
  const problems = findRecipeSeedProblems(input);
  if (problems.length > 0) {
    throw new Error(
      `Recipe seed is invalid:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
  }
}

/** The minimum Variant counts per Base Recipe from the acceptance criteria of #136. */
export const BASE_MINIMUMS: Record<
  string,
  { cuisine: number; method: number }
> = {
  omelette: { cuisine: 3, method: 2 },
  'potato-puree': { cuisine: 3, method: 1 },
  'fried-chicken': { cuisine: 3, method: 1 },
  'chicken-salad': { cuisine: 3, method: 1 },
  'appetizer-platter': { cuisine: 5, method: 0 },
};

export const MIN_CROSS_RECIPE_PAIRINGS = 3;

/**
 * What the seed still lacks against the acceptance criteria of #136. By
 * default it checks only the bases present (the others arrive in later
 * passes); `requireBases` also reports a missing base, `requireCrossLinks`
 * the count of Pairings that link another seeded Recipe.
 */
export function findAcceptanceGaps(
  bases: BaseRecipeSeed[],
  options: { requireBases?: boolean; requireCrossLinks?: boolean } = {},
): string[] {
  const gaps: string[] = [];
  for (const [slug, min] of Object.entries(BASE_MINIMUMS)) {
    const base = bases.find((b) => b.slug === slug);
    if (!base) {
      if (options.requireBases) gaps.push(`${slug}: base Recipe is missing`);
      continue;
    }
    if ((base.tips ?? []).length === 0) {
      gaps.push(`${slug}: needs at least one Recipe-level Tip`);
    }
    if ((base.stepTips ?? []).length === 0) {
      gaps.push(`${slug}: needs at least one step Tip`);
    }
    const count = (kind: 'cuisine' | 'method') =>
      base.variants.filter((v: VariantSeed) => v[kind] !== undefined).length;
    if (count('cuisine') < min.cuisine) {
      gaps.push(
        `${slug}: needs at least ${min.cuisine} Cuisine Variants, has ${count('cuisine')}`,
      );
    }
    if (count('method') < min.method) {
      gaps.push(
        `${slug}: needs at least ${min.method} Method Variants, has ${count('method')}`,
      );
    }
  }
  if (options.requireCrossLinks) {
    const familyOf = new Map<string, string>();
    for (const base of bases) {
      for (const recipe of [base, ...base.variants]) {
        familyOf.set(recipe.slug, base.slug);
      }
    }
    const linked = bases.flatMap((base) =>
      [base, ...base.variants].flatMap((recipe) =>
        recipe.pairings.filter((p) => {
          const family =
            p.recipe === undefined ? undefined : familyOf.get(p.recipe);
          return family !== undefined && family !== base.slug;
        }),
      ),
    ).length;
    if (linked < MIN_CROSS_RECIPE_PAIRINGS) {
      gaps.push(
        `at least ${MIN_CROSS_RECIPE_PAIRINGS} Pairings link a Recipe of another base, found ${linked}`,
      );
    }
  }
  return gaps;
}

/** Throws unless the seed meets every acceptance count of #136 (all five bases, cross-Recipe Pairings). */
export function assertAcceptance(bases: BaseRecipeSeed[]): void {
  const gaps = findAcceptanceGaps(bases, {
    requireBases: true,
    requireCrossLinks: true,
  });
  if (gaps.length > 0) {
    throw new Error(
      `Recipe seed misses its acceptance counts:\n${gaps.map((g) => `  - ${g}`).join('\n')}`,
    );
  }
}
