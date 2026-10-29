import { and, inArray, isNotNull, isNull } from 'drizzle-orm';
import type { Database, Tx } from '../../../database/database.types';
import {
  catalogTranslations,
  eatingMoments,
  recipeHiddenTips,
  recipeTags,
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipes,
  recipeSteps,
  recipeStepTranslations,
  recipeTips,
  recipeTipTranslations,
  recipeTranslations,
  tagGroups,
  tags,
} from '../../../database/schema';
import { writeGuidanceTranslations } from '../../../recipes/recipe-guidance-translations';
import { writeGuidance } from '../../../recipes/recipe-guidance-write';
import type { EntityType } from '../../display-names';
import { normalizeName } from '../../normalize';
import { SEED_INGREDIENTS } from '../catalog-seed-data';
import { seedId, stableId, translationRows } from '../seed-catalog';
import { SEED_BASE_RECIPES } from './recipe-seed-data';
import type { RecipeSeed, SeedNamed, VariantSeed } from './recipe-seed-types';
import { SEED_EATING_MOMENTS, SEED_TAG_GROUPS, SEED_TAGS } from './registries';
import {
  assertAcceptance,
  assertRecipeSeedValid,
} from './validate-recipe-seed';

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

/**
 * The id of a seed Catalog Tag. Cuisine and Method Tags keep the ids their old
 * lists had (migration 0049 kept them), so a re-seed finds a Tag an Admin renamed.
 */
function seedTagId(groupSlug: string, slug: string) {
  return groupSlug === 'cuisine' || groupSlug === 'method'
    ? stableId(`${groupSlug}:${slug}`)
    : seedId.tag(`${groupSlug}:${slug}`);
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

  return { tag: await seedTags(tx), moment: momentPlan.ids };
}

/**
 * Tag Groups and Catalog Tags (ADR 0033). Groups and Tags that exist (by id or normalised name)
 * are left alone. Returns the id of every Tag by `group:slug`.
 */
async function seedTags(tx: Tx) {
  const existingGroups = await tx
    .select({ id: tagGroups.id, normalizedName: tagGroups.normalizedName })
    .from(tagGroups);
  const groupPlan = planRegistry(
    existingGroups,
    SEED_TAG_GROUPS,
    seedId.tagGroup,
  );
  if (groupPlan.fresh.length > 0) {
    await tx
      .insert(tagGroups)
      .values(
        SEED_TAG_GROUPS.filter((g) => groupPlan.fresh.includes(g)).map((g) => ({
          id: groupPlan.ids.get(g.slug) as string,
          name: g.en,
          normalizedName: normalizeName(g.en),
          position: g.position,
        })),
      )
      .onConflictDoNothing({ target: tagGroups.id });
  }
  await insertNames(tx, 'tag_group', groupPlan.fresh, groupPlan.ids);

  const existingTags = (
    await tx
      .select({ id: tags.id, normalizedName: tags.normalizedName })
      .from(tags)
      .where(isNull(tags.familyId))
  ).map((t) => ({ id: t.id, normalizedName: t.normalizedName }));
  const tagIds = new Map<string, string>();
  for (const [groupSlug, rows] of Object.entries(SEED_TAGS)) {
    const plan = planRegistry(existingTags, rows, (slug) =>
      seedTagId(groupSlug, slug),
    );
    for (const [slug, id] of plan.ids) tagIds.set(`${groupSlug}:${slug}`, id);
    // A Tag planned for this group is "existing" for the next one (names are unique across groups).
    for (const row of plan.fresh) {
      existingTags.push({
        id: plan.ids.get(row.slug) as string,
        normalizedName: normalizeName(row.en),
      });
    }
    if (plan.fresh.length === 0) continue;
    await tx
      .insert(tags)
      .values(
        plan.fresh.map((row) => ({
          id: plan.ids.get(row.slug) as string,
          name: row.en,
          normalizedName: normalizeName(row.en),
          groupId: groupPlan.ids.get(groupSlug) as string,
        })),
      )
      .onConflictDoNothing({ target: tags.id });
    await insertNames(tx, 'tag', plan.fresh, plan.ids);
  }
  return tagIds;
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

function recipeRow(recipe: RecipeSeed | VariantSeed, parent?: Parent) {
  return {
    id: seedId.recipe(recipe.slug),
    parentId: parent?.id ?? null,
    familyId: null,
    title: recipe.title.en,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes ?? null,
    cookMinutes: recipe.cookMinutes ?? null,
    difficulty: recipe.difficulty ?? null,
  };
}

/** The Catalog Tag a Variant is made by (a Base Recipe has none). */
const variantTagId = (
  recipe: RecipeSeed | VariantSeed,
  registries: Registries,
) => {
  const key = (recipe as Partial<VariantSeed>).tag;
  return key ? (registries.tag.get(key) ?? null) : null;
};

/** Inserts the Recipe rows that do not exist yet; returns the slugs that were new. */
async function insertRecipes(
  tx: Tx,
  rows: {
    slug: string;
    row: ReturnType<typeof recipeRow>;
    tagId: string | null;
  }[],
): Promise<Set<string>> {
  if (rows.length === 0) return new Set();
  const inserted = await tx
    .insert(recipes)
    .values(rows.map((r) => r.row))
    .onConflictDoNothing({ target: recipes.id })
    .returning({ id: recipes.id });
  const ids = new Set(inserted.map((r) => r.id));
  // A Variant carries the Tag it is made by.
  const links = rows.flatMap(({ row, tagId }) =>
    ids.has(row.id) && tagId ? [{ recipeId: row.id, tagId }] : [],
  );
  if (links.length > 0) {
    await tx.insert(recipeTags).values(links).onConflictDoNothing();
  }
  return new Set(rows.filter((r) => ids.has(r.row.id)).map((r) => r.slug));
}

/** Lines, Steps, Tips and Romanian text of freshly inserted Recipes, in batches. */
async function insertContent(tx: Tx, fresh: RecipeSeed[]) {
  if (fresh.length === 0) return;
  const known = new Set(SEED_INGREDIENTS.map((i) => i.slug));
  const lineKey = (line: RecipeSeed['lines'][number]) =>
    line.key ?? line.ingredient;
  const lines = fresh.flatMap((recipe) =>
    recipe.lines.map((line, position) => {
      if (!known.has(line.ingredient)) {
        throw new Error(`Unknown Ingredient "${line.ingredient}"`);
      }
      return {
        id: id.line(recipe.slug, lineKey(line)),
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
              lineId: id.line(recipe.slug, lineKey(line)),
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

  // One position sequence per Recipe, as the API keeps it: Recipe-level Tips
  // first, then the Step Tips.
  const tips = fresh.flatMap((recipe) => {
    const recipeId = seedId.recipe(recipe.slug);
    const perStep = new Map<string, number>();
    const own = (recipe.tips ?? []).map((tip, n) => ({
      id: id.tip(recipe.slug, n),
      stepId: null as string | null,
      en: tip.en,
      ro: tip.ro,
    }));
    const onSteps = (recipe.stepTips ?? []).map((tip) => {
      const n = perStep.get(tip.step) ?? 0;
      perStep.set(tip.step, n + 1);
      return {
        id: id.stepTip(recipe.slug, tip.step, n),
        stepId: id.step(recipe.slug, tip.step),
        en: tip.text.en,
        ro: tip.text.ro,
      };
    });
    return [...own, ...onSteps].map((tip, position) => ({
      ...tip,
      recipeId,
      position,
    }));
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

/** The base Tips a fresh Variant does not inherit (only those that still exist). */
async function insertHiddenTips(
  tx: Tx,
  variants: { variant: VariantSeed; base: RecipeSeed }[],
) {
  const wanted = variants.flatMap(({ variant, base }) =>
    (variant.hideBaseTips ?? []).map((index) => ({
      recipeId: seedId.recipe(variant.slug),
      tipId: id.tip(base.slug, index),
    })),
  );
  if (wanted.length === 0) return;
  // An Admin may have deleted a base Tip since it was seeded.
  const existing = new Set(
    (
      await tx
        .select({ id: recipeTips.id })
        .from(recipeTips)
        .where(
          inArray(
            recipeTips.id,
            wanted.map((w) => w.tipId),
          ),
        )
    ).map((row) => row.id),
  );
  const rows = wanted.filter((w) => existing.has(w.tipId));
  if (rows.length > 0) {
    await tx.insert(recipeHiddenTips).values(rows).onConflictDoNothing();
  }
}

/** Pairings, Nutrition Note and Eating Moment uses, English and Romanian, via the #159 writers. */
async function insertGuidance(
  tx: Tx,
  recipe: RecipeSeed,
  registries: Registries,
  skipped: Set<string>,
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
        // A Variant skipped under an archived base has no row to link.
        linkedRecipeId:
          p.recipe && !skipped.has(p.recipe) ? seedId.recipe(p.recipe) : null,
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
 * Loads the starter Recipes: the Tag Groups, Catalog Tags and Eating Moments, then
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
    tags: SEED_TAGS,
    eatingMoments: SEED_EATING_MOMENTS,
    ingredientSlugs: new Set(SEED_INGREDIENTS.map((i) => i.slug)),
  });
  assertAcceptance(bases);
  await database.transaction(async (tx) => {
    const registries = await seedRegistries(tx);
    const freshBases = await insertRecipes(
      tx,
      bases.map((base) => ({
        slug: base.slug,
        row: recipeRow(base),
        tagId: null,
      })),
    );
    // The API refuses new Variants under an archived base, so does the seed.
    const archived = new Set(
      (
        await tx
          .select({ id: recipes.id })
          .from(recipes)
          .where(
            and(
              inArray(
                recipes.id,
                bases.map((base) => seedId.recipe(base.slug)),
              ),
              isNotNull(recipes.archivedAt),
            ),
          )
      ).map((row) => row.id),
    );
    const allVariants = bases.flatMap((base) =>
      base.variants.map((variant) => ({ variant, base })),
    );
    const open = allVariants.filter(
      ({ base }) => !archived.has(seedId.recipe(base.slug)),
    );
    const skipped = new Set<string>();
    if (open.length < allVariants.length) {
      const inserted = await tx
        .select({ id: recipes.id })
        .from(recipes)
        .where(
          inArray(
            recipes.id,
            allVariants.map(({ variant }) => seedId.recipe(variant.slug)),
          ),
        );
      const present = new Set(inserted.map((row) => row.id));
      for (const { variant, base } of allVariants) {
        if (
          archived.has(seedId.recipe(base.slug)) &&
          !present.has(seedId.recipe(variant.slug))
        ) {
          skipped.add(variant.slug);
        }
      }
      if (skipped.size > 0) {
        console.log(
          `Recipe seed: skipped Variants of archived base Recipes: ${[...skipped].join(', ')}`,
        );
      }
    }
    const freshVariants = await insertRecipes(
      tx,
      open.map(({ variant, base }) => ({
        slug: variant.slug,
        row: recipeRow(variant, { id: seedId.recipe(base.slug) }),
        tagId: variantTagId(variant, registries),
      })),
    );
    const fresh = [
      ...bases.filter((base) => freshBases.has(base.slug)),
      ...open
        .filter(({ variant }) => freshVariants.has(variant.slug))
        .map(({ variant }) => variant),
    ];
    await insertContent(tx, fresh);
    await insertHiddenTips(
      tx,
      open.filter(({ variant }) => freshVariants.has(variant.slug)),
    );
    for (const recipe of fresh) {
      await insertGuidance(tx, recipe, registries, skipped);
    }
  });
}
