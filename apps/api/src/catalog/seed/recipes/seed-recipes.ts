import type { Database, Tx } from '../../../database/database.types';
import {
  catalogTranslations,
  cuisines,
  eatingMoments,
  methods,
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipes,
  recipeSteps,
  recipeStepTranslations,
  recipeTips,
  recipeTipTranslations,
  recipeTranslations,
} from '../../../database/schema';
import { writeGuidanceTranslations } from '../../../recipes/recipe-guidance-translations';
import { writeGuidance } from '../../../recipes/recipe-guidance-write';
import type { EntityType } from '../../display-names';
import { normalizeName } from '../../normalize';
import { SEED_INGREDIENTS } from '../catalog-seed-data';
import { seedId, stableId, translationRows } from '../seed-catalog';
import { SEED_BASE_RECIPES } from './recipe-seed-data';
import type { RecipeSeed, SeedNamed, VariantSeed } from './recipe-seed-types';
import { SEED_CUISINES, SEED_EATING_MOMENTS, SEED_METHODS } from './registries';
import { assertRecipeSeedValid } from './validate-recipe-seed';

/** The Locale the Romanian text is stored under; English is the source text on the rows. */
const RO = 'ro';

type Existing = { id: string; normalizedName: string };

/**
 * Which rows of a registry need inserting, and the id every slug resolves to.
 * A row an Admin made with the same normalised name (names are unique) stands
 * in for the seed's, and a seed row that exists is never touched again.
 */
function planRegistry(
  existing: Existing[],
  rows: SeedNamed[],
  idOf: (slug: string) => string,
) {
  const ids = new Map<string, string>();
  const fresh: SeedNamed[] = [];
  const byId = new Set(existing.map((row) => row.id));
  const byName = new Map(existing.map((row) => [row.normalizedName, row.id]));
  for (const row of rows) {
    const id = idOf(row.slug);
    const sameName = byName.get(normalizeName(row.en));
    if (byId.has(id)) ids.set(row.slug, id);
    else if (sameName !== undefined) ids.set(row.slug, sameName);
    else {
      ids.set(row.slug, id);
      fresh.push(row);
    }
  }
  return { ids, fresh };
}

async function insertNames(
  tx: Tx,
  entityType: EntityType,
  fresh: SeedNamed[],
  ids: Map<string, string>,
) {
  if (fresh.length === 0) return;
  await tx
    .insert(catalogTranslations)
    .values(
      fresh.flatMap((row) =>
        translationRows(entityType, ids.get(row.slug) as string, row),
      ),
    )
    .onConflictDoNothing();
}

async function seedRegistries(tx: Tx) {
  const cuisinePlan = planRegistry(
    await tx
      .select({ id: cuisines.id, normalizedName: cuisines.normalizedName })
      .from(cuisines),
    SEED_CUISINES,
    seedId.cuisine,
  );
  if (cuisinePlan.fresh.length > 0) {
    await tx
      .insert(cuisines)
      .values(
        cuisinePlan.fresh.map((row) => ({
          id: cuisinePlan.ids.get(row.slug) as string,
          name: row.en,
          normalizedName: normalizeName(row.en),
        })),
      )
      .onConflictDoNothing({ target: cuisines.id });
  }
  await insertNames(tx, 'cuisine', cuisinePlan.fresh, cuisinePlan.ids);

  const methodPlan = planRegistry(
    await tx
      .select({ id: methods.id, normalizedName: methods.normalizedName })
      .from(methods),
    SEED_METHODS,
    seedId.method,
  );
  if (methodPlan.fresh.length > 0) {
    await tx
      .insert(methods)
      .values(
        methodPlan.fresh.map((row) => ({
          id: methodPlan.ids.get(row.slug) as string,
          name: row.en,
          normalizedName: normalizeName(row.en),
        })),
      )
      .onConflictDoNothing({ target: methods.id });
  }
  await insertNames(tx, 'method', methodPlan.fresh, methodPlan.ids);

  const existingMoments = await tx
    .select({
      id: eatingMoments.id,
      normalizedName: eatingMoments.normalizedName,
      sortOrder: eatingMoments.sortOrder,
    })
    .from(eatingMoments);
  const momentPlan = planRegistry(
    existingMoments,
    SEED_EATING_MOMENTS,
    seedId.eatingMoment,
  );
  if (momentPlan.fresh.length > 0) {
    // An Admin may have reordered the list: new moments go last.
    const last = Math.max(0, ...existingMoments.map((row) => row.sortOrder));
    await tx
      .insert(eatingMoments)
      .values(
        momentPlan.fresh.map((row, index) => ({
          id: momentPlan.ids.get(row.slug) as string,
          name: row.en,
          normalizedName: normalizeName(row.en),
          sortOrder: last + index + 1,
        })),
      )
      .onConflictDoNothing({ target: eatingMoments.id });
  }
  await insertNames(tx, 'eating_moment', momentPlan.fresh, momentPlan.ids);

  return {
    cuisine: cuisinePlan.ids,
    method: methodPlan.ids,
    moment: momentPlan.ids,
  };
}

type Registries = Awaited<ReturnType<typeof seedRegistries>>;

const id = {
  line: (recipe: string, ingredient: string) =>
    stableId(`recipe-line:${recipe}:${ingredient}`),
  step: (recipe: string, key: string) =>
    stableId(`recipe-step:${recipe}:${key}`),
  tip: (recipe: string, n: number) => stableId(`recipe-tip:${recipe}:${n}`),
  stepTip: (recipe: string, step: string, n: number) =>
    stableId(`recipe-tip:${recipe}:${step}:${n}`),
  pairing: (recipe: string, n: number) =>
    stableId(`recipe-pairing:${recipe}:${n}`),
};

type Parent = { id: string };

function recipeRow(
  recipe: RecipeSeed | VariantSeed,
  registries: Registries,
  parent?: Parent,
) {
  const variant = recipe as Partial<VariantSeed>;
  return {
    id: seedId.recipe(recipe.slug),
    parentId: parent?.id ?? null,
    familyId: null,
    title: recipe.title.en,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes ?? null,
    cookMinutes: recipe.cookMinutes ?? null,
    difficulty: recipe.difficulty ?? null,
    cuisineId: variant.cuisine
      ? (registries.cuisine.get(variant.cuisine) ?? null)
      : null,
    methodId: variant.method
      ? (registries.method.get(variant.method) ?? null)
      : null,
  };
}

/** Inserts the Recipe rows that do not exist yet; returns the slugs that were new. */
async function insertRecipes(
  tx: Tx,
  rows: { slug: string; row: ReturnType<typeof recipeRow> }[],
): Promise<Set<string>> {
  if (rows.length === 0) return new Set();
  const inserted = await tx
    .insert(recipes)
    .values(rows.map((r) => r.row))
    .onConflictDoNothing({ target: recipes.id })
    .returning({ id: recipes.id });
  const ids = new Set(inserted.map((r) => r.id));
  return new Set(rows.filter((r) => ids.has(r.row.id)).map((r) => r.slug));
}

/** Lines, Steps, Tips and Romanian text of freshly inserted Recipes, in batches. */
async function insertContent(tx: Tx, fresh: RecipeSeed[]) {
  if (fresh.length === 0) return;
  const known = new Set(SEED_INGREDIENTS.map((i) => i.slug));
  const lines = fresh.flatMap((recipe) =>
    recipe.lines.map((line, position) => {
      if (!known.has(line.ingredient)) {
        throw new Error(`Unknown Ingredient "${line.ingredient}"`);
      }
      return {
        id: id.line(recipe.slug, line.ingredient),
        recipeId: seedId.recipe(recipe.slug),
        position,
        ingredientId: seedId.ingredient(line.ingredient),
        quantity: line.quantity ?? null,
        unit: line.unit ?? null,
        optional: line.optional ?? false,
        note: line.note?.en ?? null,
      };
    }),
  );
  await tx.insert(recipeIngredientLines).values(lines);
  const lineNotes = fresh.flatMap((recipe) =>
    recipe.lines.flatMap((line) =>
      line.note
        ? [
            {
              lineId: id.line(recipe.slug, line.ingredient),
              locale: RO,
              note: line.note.ro,
            },
          ]
        : [],
    ),
  );
  if (lineNotes.length > 0) {
    await tx.insert(recipeIngredientLineTranslations).values(lineNotes);
  }

  await tx.insert(recipeSteps).values(
    fresh.flatMap((recipe) =>
      recipe.steps.map((step, position) => ({
        id: id.step(recipe.slug, step.key),
        recipeId: seedId.recipe(recipe.slug),
        position,
        text: step.text.en,
        timerSeconds: step.timerSeconds ?? null,
      })),
    ),
  );
  await tx.insert(recipeStepTranslations).values(
    fresh.flatMap((recipe) =>
      recipe.steps.map((step) => ({
        stepId: id.step(recipe.slug, step.key),
        locale: RO,
        text: step.text.ro,
      })),
    ),
  );

  const tips = fresh.flatMap((recipe) => {
    const recipeId = seedId.recipe(recipe.slug);
    const perStep = new Map<string, number>();
    return [
      ...(recipe.tips ?? []).map((tip, position) => ({
        id: id.tip(recipe.slug, position),
        recipeId,
        stepId: null as string | null,
        position,
        en: tip.en,
        ro: tip.ro,
      })),
      ...(recipe.stepTips ?? []).map((tip) => {
        const position = perStep.get(tip.step) ?? 0;
        perStep.set(tip.step, position + 1);
        return {
          id: id.stepTip(recipe.slug, tip.step, position),
          recipeId,
          stepId: id.step(recipe.slug, tip.step),
          position,
          en: tip.text.en,
          ro: tip.text.ro,
        };
      }),
    ];
  });
  if (tips.length > 0) {
    await tx.insert(recipeTips).values(
      tips.map(({ id: tipId, recipeId, stepId, position, en }) => ({
        id: tipId,
        recipeId,
        stepId,
        position,
        text: en,
      })),
    );
    await tx
      .insert(recipeTipTranslations)
      .values(tips.map((tip) => ({ tipId: tip.id, locale: RO, text: tip.ro })));
  }

  await tx.insert(recipeTranslations).values(
    fresh.map((recipe) => ({
      recipeId: seedId.recipe(recipe.slug),
      locale: RO,
      title: recipe.title.ro,
    })),
  );
}

/** Pairings, Nutrition Note and Eating Moment uses, English and Romanian, via the #159 writers. */
async function insertGuidance(
  tx: Tx,
  recipe: RecipeSeed,
  registries: Registries,
) {
  const recipeId = seedId.recipe(recipe.slug);
  const pairingId = (index: number) => id.pairing(recipe.slug, index);
  const momentId = (slug: string) => registries.moment.get(slug) as string;
  await writeGuidance(
    tx,
    { id: recipeId, familyId: null },
    {
      nutritionNote: recipe.nutritionNote.en,
      pairings: recipe.pairings.map((p, index) => ({
        id: pairingId(index),
        kind: p.kind,
        label: p.label.en,
        reason: p.reason.en,
        principle: p.principle ?? null,
        linkedIngredientId: p.ingredient
          ? seedId.ingredient(p.ingredient)
          : null,
        linkedRecipeId: p.recipe ? seedId.recipe(p.recipe) : null,
      })),
      eatingMoments: recipe.eatingMoments.map((use) => ({
        eatingMomentId: momentId(use.moment),
        polarity: use.polarity,
        reason: use.reason.en,
      })),
    },
    { allowNewIds: true },
  );
  await writeGuidanceTranslations(tx, recipeId, RO, {
    nutritionNote: recipe.nutritionNote.ro,
    pairings: Object.fromEntries(
      recipe.pairings.map((p, index) => [
        pairingId(index),
        { label: p.label.ro, reason: p.reason.ro },
      ]),
    ),
    eatingMoments: Object.fromEntries(
      recipe.eatingMoments.map((use) => [momentId(use.moment), use.reason.ro]),
    ),
  });
}

/**
 * Loads the starter Recipes: the Cuisine, Method and Eating Moment lists, then
 * every Base Recipe and its Variants with lines, steps, Tips, guidance and
 * Romanian text. Ids are stable and Recipe rows are inserted with ON CONFLICT
 * DO NOTHING; a Recipe's children are written only when its row was new, so
 * re-running changes nothing and an Admin's edits to a seeded Recipe (or the
 * lines, steps and Tips they deleted) are never undone. All Recipe rows go in
 * before any guidance, so Pairings may link any seeded Recipe.
 */
export async function seedRecipes(
  database: Pick<Database, 'transaction'>,
): Promise<void> {
  const bases = SEED_BASE_RECIPES;
  assertRecipeSeedValid({
    bases,
    cuisines: SEED_CUISINES,
    methods: SEED_METHODS,
    eatingMoments: SEED_EATING_MOMENTS,
    ingredientSlugs: new Set(SEED_INGREDIENTS.map((i) => i.slug)),
  });
  await database.transaction(async (tx) => {
    const registries = await seedRegistries(tx);
    const freshBases = await insertRecipes(
      tx,
      bases.map((base) => ({
        slug: base.slug,
        row: recipeRow(base, registries),
      })),
    );
    const freshVariants = await insertRecipes(
      tx,
      bases.flatMap((base) =>
        base.variants.map((variant) => ({
          slug: variant.slug,
          row: recipeRow(variant, registries, { id: seedId.recipe(base.slug) }),
        })),
      ),
    );
    const fresh = [
      ...bases.filter((base) => freshBases.has(base.slug)),
      ...bases.flatMap((base) =>
        base.variants.filter((v) => freshVariants.has(v.slug)),
      ),
    ];
    await insertContent(tx, fresh);
    for (const recipe of fresh) {
      await insertGuidance(tx, recipe, registries);
    }
  });
}
