import { and, asc, eq, inArray, isNull, or } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor } from '../database/database.types';
import {
  cuisines,
  ingredients,
  methods,
  recipeHiddenTips,
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipes,
  recipeStepTranslations,
  recipeSteps,
  recipeTipTranslations,
  recipeTips,
  recipeTranslations,
} from '../database/schema';
import type {
  AdminRecipeDetail,
  RecipeLineView,
  RecipeStepView,
  RecipeTipView,
  RecipeTranslationsView,
  ResolvedRecipe,
} from './recipes.schemas';

type RecipeRow = typeof recipes.$inferSelect;

const lineView = (
  row: typeof recipeIngredientLines.$inferSelect,
): RecipeLineView => ({
  id: row.id,
  ingredientId: row.ingredientId,
  quantity: row.quantity,
  unit: row.unit,
  optional: row.optional,
  note: row.note,
});

const stepView = (row: typeof recipeSteps.$inferSelect): RecipeStepView => ({
  id: row.id,
  text: row.text,
  timerSeconds: row.timerSeconds,
});

const tipView = (row: typeof recipeTips.$inferSelect): RecipeTipView => ({
  id: row.id,
  stepId: row.stepId,
  text: row.text,
});

/** The Catalog Recipe row (no Family owner), or undefined. */
export async function findCatalogRecipe(
  executor: Executor,
  id: string,
): Promise<RecipeRow | undefined> {
  const [row] = await executor
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), isNull(recipes.familyId)));
  return row;
}

/** The Recipe row when it is owned by `familyId`, else undefined. */
export async function findFamilyRecipe(
  executor: Executor,
  id: string,
  familyId: string,
): Promise<RecipeRow | undefined> {
  const [row] = await executor
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.familyId, familyId)));
  return row;
}

/**
 * Awaits lazy query builders one after the other. A transaction has a single
 * connection, which must not run two queries at once.
 */
export async function inOrder<const T extends readonly unknown[]>(
  queries: T,
): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }> {
  const results: unknown[] = [];
  for (const query of queries) results.push(await query);
  return results as { -readonly [K in keyof T]: Awaited<T[K]> };
}

async function loadParts(executor: Executor, recipeId: string) {
  const [lines, steps, tips] = await inOrder([
    executor
      .select()
      .from(recipeIngredientLines)
      .where(eq(recipeIngredientLines.recipeId, recipeId))
      .orderBy(asc(recipeIngredientLines.position)),
    executor
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.recipeId, recipeId))
      .orderBy(asc(recipeSteps.position)),
    executor
      .select()
      .from(recipeTips)
      .where(eq(recipeTips.recipeId, recipeId))
      .orderBy(asc(recipeTips.position)),
  ]);
  return { lines, steps, tips };
}

async function loadTranslations(
  executor: Executor,
  recipeId: string,
  parts: Awaited<ReturnType<typeof loadParts>>,
): Promise<RecipeTranslationsView> {
  const ids = (rows: { id: string }[]) => rows.map((row) => row.id);
  const [titles, stepRows, lineRows, tipRows] = await inOrder([
    executor
      .select()
      .from(recipeTranslations)
      .where(eq(recipeTranslations.recipeId, recipeId)),
    parts.steps.length === 0
      ? []
      : executor
          .select()
          .from(recipeStepTranslations)
          .where(inArray(recipeStepTranslations.stepId, ids(parts.steps))),
    parts.lines.length === 0
      ? []
      : executor
          .select()
          .from(recipeIngredientLineTranslations)
          .where(
            inArray(recipeIngredientLineTranslations.lineId, ids(parts.lines)),
          ),
    parts.tips.length === 0
      ? []
      : executor
          .select()
          .from(recipeTipTranslations)
          .where(inArray(recipeTipTranslations.tipId, ids(parts.tips))),
  ]);
  const result: RecipeTranslationsView = {};
  const of = (locale: string) =>
    (result[locale] ??= { title: null, steps: {}, lines: {}, tips: {} });
  for (const row of titles) of(row.locale).title = row.title;
  for (const row of stepRows) of(row.locale).steps[row.stepId] = row.text;
  for (const row of lineRows) of(row.locale).lines[row.lineId] = row.note;
  for (const row of tipRows) of(row.locale).tips[row.tipId] = row.text;
  return result;
}

/**
 * The editing view of a Catalog Recipe (`familyId` null) or of one owned by
 * that Family, or null when there is no such Recipe in that scope.
 */
export async function loadAdminDetail(
  executor: Executor,
  id: string,
  familyId: string | null = null,
): Promise<AdminRecipeDetail | null> {
  const row =
    familyId === null
      ? await findCatalogRecipe(executor, id)
      : await findFamilyRecipe(executor, id, familyId);
  if (!row) return null;
  const parts = await loadParts(executor, id);
  let parentTips: AdminRecipeDetail['parentTips'] = null;
  if (row.parentId) {
    const [baseTips, hidden] = await inOrder([
      executor
        .select()
        .from(recipeTips)
        .where(
          and(eq(recipeTips.recipeId, row.parentId), isNull(recipeTips.stepId)),
        )
        .orderBy(asc(recipeTips.position)),
      executor
        .select({ tipId: recipeHiddenTips.tipId })
        .from(recipeHiddenTips)
        .where(eq(recipeHiddenTips.recipeId, id)),
    ]);
    const hiddenIds = new Set(hidden.map((h) => h.tipId));
    parentTips = baseTips.map((tip) => ({
      ...tipView(tip),
      hidden: hiddenIds.has(tip.id),
    }));
  }
  return {
    id: row.id,
    parentId: row.parentId,
    title: row.title,
    servings: row.servings,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    difficulty: row.difficulty,
    cuisineId: row.cuisineId,
    methodId: row.methodId,
    archived: row.archivedAt !== null,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    lines: parts.lines.map(lineView),
    steps: parts.steps.map(stepView),
    tips: parts.tips.map(tipView),
    parentTips,
    // Family Recipes are never translated.
    translations:
      familyId === null ? await loadTranslations(executor, id, parts) : {},
  };
}

/** A Recipe the Family may see: a Catalog one or one of its own. */
export const visibleTo = (familyId: string) =>
  or(isNull(recipes.familyId), eq(recipes.familyId, familyId));

/** The Recipe row when it is a Catalog Recipe or owned by `familyId`, else undefined. */
export async function findVisibleRecipe(
  executor: Executor,
  id: string,
  familyId: string,
): Promise<RecipeRow | undefined> {
  const [row] = await executor
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), visibleTo(familyId)));
  return row;
}

/**
 * A Catalog Recipe with its text resolved for `locale`: a translation when
 * there is one, else the source text. A Variant also shows its base's
 * Recipe-level Tips it does not hide. Archived Recipes are returned (flagged);
 * whether to show them is the caller's call. Null for an unknown or
 * Family-owned Recipe.
 */
export async function loadCatalogRecipe(
  executor: Executor,
  id: string,
  locale: CatalogLocale,
): Promise<ResolvedRecipe | null> {
  const row = await findCatalogRecipe(executor, id);
  return row ? resolveRecipe(executor, row, locale) : null;
}

/**
 * A Recipe row with its text resolved for `locale`. Family Recipes are never
 * translated, so they always show their source text; a Variant of a Catalog
 * Recipe still shows the base's inherited Tips in the locale.
 */
export async function resolveRecipe(
  executor: Executor,
  row: RecipeRow,
  locale: CatalogLocale,
): Promise<ResolvedRecipe> {
  const id = row.id;
  const translated = row.familyId === null;
  const parts = await loadParts(executor, id);
  const lineIds = translated ? parts.lines.map((l) => l.id) : [];
  const stepIds = translated ? parts.steps.map((s) => s.id) : [];

  const inherited = row.parentId
    ? await loadInheritedTips(executor, id, row.parentId)
    : [];
  const tipRows = [...(translated ? parts.tips : []), ...inherited];
  const tipIds = tipRows.map((t) => t.id);

  const [titleRow, lineT, stepT, tipT, names] = await Promise.all([
    translated
      ? executor
          .select()
          .from(recipeTranslations)
          .where(
            and(
              eq(recipeTranslations.recipeId, id),
              eq(recipeTranslations.locale, locale),
            ),
          )
      : [],
    lineIds.length === 0
      ? []
      : executor
          .select()
          .from(recipeIngredientLineTranslations)
          .where(
            and(
              inArray(recipeIngredientLineTranslations.lineId, lineIds),
              eq(recipeIngredientLineTranslations.locale, locale),
            ),
          ),
    stepIds.length === 0
      ? []
      : executor
          .select()
          .from(recipeStepTranslations)
          .where(
            and(
              inArray(recipeStepTranslations.stepId, stepIds),
              eq(recipeStepTranslations.locale, locale),
            ),
          ),
    tipIds.length === 0
      ? []
      : executor
          .select()
          .from(recipeTipTranslations)
          .where(
            and(
              inArray(recipeTipTranslations.tipId, tipIds),
              eq(recipeTipTranslations.locale, locale),
            ),
          ),
    loadDisplayNames(executor, locale, [
      ...parts.lines.flatMap((l) => (l.ingredientId ? [l.ingredientId] : [])),
      ...(row.cuisineId ? [row.cuisineId] : []),
      ...(row.methodId ? [row.methodId] : []),
    ]),
  ]);
  const lineNote = new Map(lineT.map((t) => [t.lineId, t.note]));
  const stepText = new Map(stepT.map((t) => [t.stepId, t.text]));
  const tipText = new Map(tipT.map((t) => [t.tipId, t.text]));

  const ingredientRows = await executor
    .select({ id: ingredients.id, name: ingredients.name })
    .from(ingredients)
    .where(
      inArray(
        ingredients.id,
        parts.lines.flatMap((l) => (l.ingredientId ? [l.ingredientId] : [])),
      ),
    );
  const canonical = new Map(ingredientRows.map((i) => [i.id, i.name]));

  const [cuisine, method] = await Promise.all([
    row.cuisineId ? loadListName(executor, 'cuisines', row.cuisineId) : null,
    row.methodId ? loadListName(executor, 'methods', row.methodId) : null,
  ]);

  return {
    id: row.id,
    parentId: row.parentId,
    owner: row.familyId === null ? 'catalog' : 'family',
    locale,
    title: titleRow[0]?.title ?? row.title,
    servings: row.servings,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    difficulty: row.difficulty,
    cuisine:
      row.cuisineId && cuisine
        ? {
            id: row.cuisineId,
            name: names.pick('cuisine', row.cuisineId, cuisine),
          }
        : null,
    method:
      row.methodId && method
        ? { id: row.methodId, name: names.pick('method', row.methodId, method) }
        : null,
    archived: row.archivedAt !== null,
    lines: parts.lines.map((line) => ({
      ...lineView(line),
      note: line.note === null ? null : (lineNote.get(line.id) ?? line.note),
      ingredientName: line.ingredientId
        ? names.pick(
            'ingredient',
            line.ingredientId,
            canonical.get(line.ingredientId) ?? '',
          )
        : (line.rawName ?? ''),
    })),
    steps: parts.steps.map((step) => ({
      ...stepView(step),
      text: stepText.get(step.id) ?? step.text,
    })),
    tips: [
      ...inherited.map((tip) => ({
        ...tipView(tip),
        text: tipText.get(tip.id) ?? tip.text,
        inherited: true,
      })),
      ...parts.tips.map((tip) => ({
        ...tipView(tip),
        text: tipText.get(tip.id) ?? tip.text,
        inherited: false,
      })),
    ],
  };
}

/** The base's Recipe-level Tips this Variant has not hidden, in the base's order. */
async function loadInheritedTips(
  executor: Executor,
  variantId: string,
  parentId: string,
) {
  const [baseTips, hidden] = await Promise.all([
    executor
      .select()
      .from(recipeTips)
      .where(and(eq(recipeTips.recipeId, parentId), isNull(recipeTips.stepId)))
      .orderBy(asc(recipeTips.position)),
    executor
      .select({ tipId: recipeHiddenTips.tipId })
      .from(recipeHiddenTips)
      .where(eq(recipeHiddenTips.recipeId, variantId)),
  ]);
  const hiddenIds = new Set(hidden.map((h) => h.tipId));
  return baseTips.filter((tip) => !hiddenIds.has(tip.id));
}

async function loadListName(
  executor: Executor,
  table: 'cuisines' | 'methods',
  id: string,
): Promise<string | null> {
  const t = table === 'cuisines' ? cuisines : methods;
  const [row] = await executor
    .select({ name: t.name })
    .from(t)
    .where(eq(t.id, id));
  return row?.name ?? null;
}
