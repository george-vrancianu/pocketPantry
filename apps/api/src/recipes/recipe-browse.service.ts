import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import {
  cuisines,
  methods,
  recipes,
  recipeTranslations,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { diffIngredients, lineKey, type DiffLine } from './recipe-diff';
import { recipeNotFound } from './recipe-errors';
import { findVisibleRecipe, resolveRecipe, visibleTo } from './recipe-view';
import type {
  BrowseQuery,
  RecipeDetail,
  RecipeFilters,
  RecipeListItem,
  RecipeOwner,
  RecipeVariantItem,
  ResolvedRecipe,
} from './recipes.schemas';

type RecipeRow = typeof recipes.$inferSelect;

const ownerOf = (row: RecipeRow): RecipeOwner =>
  row.familyId === null ? 'catalog' : 'family';

const byTitle =
  (locale: string) => (a: { title: string }, b: { title: string }) =>
    a.title.localeCompare(b.title, locale);

/** Member-facing Recipe reads, scoped to the Catalog plus the Member's own Family. */
@Injectable()
export class RecipeBrowseService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  /**
   * With no search or filter: live Base Recipes with their Variant counts.
   * With one: matching live Recipes, bases and Variants, each Variant labelled
   * with its base. A base matches on its own fields only. Variants of an
   * archived base are left out too.
   */
  async list(memberId: string, query: BrowseQuery): Promise<RecipeListItem[]> {
    const familyId = await this.settings.familyIdOf(memberId);
    const { locale } = query;
    const needle = normalizeName(query.search ?? '');
    const filtering =
      needle !== '' ||
      query.cuisineId !== undefined ||
      query.methodId !== undefined;

    const rows = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          visibleTo(familyId),
          isNull(recipes.archivedAt),
          filtering ? undefined : isNull(recipes.parentId),
          query.cuisineId ? eq(recipes.cuisineId, query.cuisineId) : undefined,
          query.methodId ? eq(recipes.methodId, query.methodId) : undefined,
        ),
      )
      .orderBy(asc(recipes.id));

    // Variants whose base is archived (or gone from view) stay out of browsing.
    const parentIds = [
      ...new Set(rows.flatMap((r) => (r.parentId ? [r.parentId] : []))),
    ];
    const parents = await this.rowsById(this.database, parentIds, familyId);
    const live = rows.filter(
      (r) =>
        !r.parentId ||
        (parents.get(r.parentId) && !parents.get(r.parentId)!.archivedAt),
    );

    const titles = await this.titlesOf(
      this.database,
      [...live, ...parents.values()],
      locale,
    );
    const matching =
      needle === '' ? live : this.matchingTitle(live, needle, titles);

    const baseIds = matching.filter((r) => !r.parentId).map((r) => r.id);
    const counts = await this.variantCounts(familyId, baseIds);
    const ref = await this.namedRefs(
      this.database,
      locale,
      matching.flatMap((r) => [r.cuisineId, r.methodId]),
    );

    return matching
      .map((row): RecipeListItem => {
        const parent = row.parentId ? parents.get(row.parentId) : undefined;
        return {
          id: row.id,
          title: titles.get(row.id)!,
          parentId: row.parentId,
          base: parent
            ? { id: parent.id, title: titles.get(parent.id)! }
            : null,
          cuisine: ref.cuisine(row.cuisineId),
          method: ref.method(row.methodId),
          variantCount: counts.get(row.id) ?? 0,
          servings: row.servings,
          prepMinutes: row.prepMinutes,
          cookMinutes: row.cookMinutes,
          difficulty: row.difficulty,
          owner: ownerOf(row),
        };
      })
      .sort(byTitle(locale));
  }

  /** A visible Recipe (archived too) with its base, live Variants and ingredient diff. */
  async detail(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<RecipeDetail> {
    const familyId = await this.settings.familyIdOf(memberId);
    const row = await findVisibleRecipe(this.database, id, familyId);
    if (!row) throw recipeNotFound();
    const resolved = await resolveRecipe(this.database, row, locale);

    let base: RecipeDetail['base'] = null;
    let diff: RecipeDetail['diff'] = null;
    if (row.parentId) {
      const baseRow = await findVisibleRecipe(
        this.database,
        row.parentId,
        familyId,
      );
      if (baseRow) {
        const baseResolved = await resolveRecipe(
          this.database,
          baseRow,
          locale,
        );
        base = {
          id: baseRow.id,
          title: baseResolved.title,
          archived: baseResolved.archived,
        };
        diff = diffIngredients(diffLines(baseResolved), diffLines(resolved));
      }
    }

    return {
      ...resolved,
      base,
      variants: row.parentId
        ? []
        : await this.variantsOf(row.id, familyId, locale),
      diff,
    };
  }

  /** Cuisines and Methods for the filter pickers, named in `locale`, sorted by name. */
  async filters(locale: CatalogLocale): Promise<RecipeFilters> {
    const [cuisineRows, methodRows] = await Promise.all([
      this.database.select().from(cuisines),
      this.database.select().from(methods),
    ]);
    const names = await loadDisplayNames(this.database, locale, [
      ...cuisineRows.map((r) => r.id),
      ...methodRows.map((r) => r.id),
    ]);
    const named = (
      type: 'cuisine' | 'method',
      rows: { id: string; name: string }[],
    ) =>
      rows
        .map((r) => ({ id: r.id, name: names.pick(type, r.id, r.name) }))
        .sort(
          (a, b) =>
            a.name.localeCompare(b.name, locale) || a.id.localeCompare(b.id),
        );
    return {
      cuisines: named('cuisine', cuisineRows),
      methods: named('method', methodRows),
    };
  }

  private async variantsOf(
    baseId: string,
    familyId: string,
    locale: CatalogLocale,
  ): Promise<RecipeVariantItem[]> {
    const rows = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.parentId, baseId),
          visibleTo(familyId),
          isNull(recipes.archivedAt),
        ),
      );
    const titles = await this.titlesOf(this.database, rows, locale);
    const ref = await this.namedRefs(
      this.database,
      locale,
      rows.flatMap((r) => [r.cuisineId, r.methodId]),
    );
    return rows
      .map((row) => ({
        id: row.id,
        title: titles.get(row.id)!,
        cuisine: ref.cuisine(row.cuisineId),
        method: ref.method(row.methodId),
        owner: ownerOf(row),
      }))
      .sort((a, b) => byTitle(locale)(a, b) || a.id.localeCompare(b.id));
  }

  private async variantCounts(
    familyId: string,
    baseIds: string[],
  ): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (baseIds.length === 0) return counts;
    const variants = await this.database
      .select({ parentId: recipes.parentId })
      .from(recipes)
      .where(
        and(
          inArray(recipes.parentId, baseIds),
          visibleTo(familyId),
          isNull(recipes.archivedAt),
        ),
      );
    for (const v of variants) {
      counts.set(v.parentId!, (counts.get(v.parentId!) ?? 0) + 1);
    }
    return counts;
  }

  private async rowsById(
    executor: Executor,
    ids: string[],
    familyId: string,
  ): Promise<Map<string, RecipeRow>> {
    if (ids.length === 0) return new Map();
    const rows = await executor
      .select()
      .from(recipes)
      .where(and(inArray(recipes.id, ids), visibleTo(familyId)));
    return new Map(rows.map((r) => [r.id, r]));
  }

  /** Title per Recipe in `locale`; Family Recipes and untranslated ones show the source title. */
  private async titlesOf(
    executor: Executor,
    rows: RecipeRow[],
    locale: CatalogLocale,
  ): Promise<Map<string, string>> {
    const catalogIds = rows.filter((r) => r.familyId === null).map((r) => r.id);
    const translated =
      catalogIds.length === 0
        ? []
        : await executor
            .select()
            .from(recipeTranslations)
            .where(
              and(
                inArray(recipeTranslations.recipeId, catalogIds),
                eq(recipeTranslations.locale, locale),
              ),
            );
    const byId = new Map(translated.map((t) => [t.recipeId, t.title]));
    return new Map(rows.map((r) => [r.id, byId.get(r.id) ?? r.title]));
  }

  /** Recipes whose title in the locale, or source title, contains the normalised needle. */
  private matchingTitle(
    rows: RecipeRow[],
    needle: string,
    titles: Map<string, string>,
  ): RecipeRow[] {
    return rows.filter(
      (r) =>
        normalizeName(titles.get(r.id)!).includes(needle) ||
        normalizeName(r.title).includes(needle),
    );
  }

  private async namedRefs(
    executor: Executor,
    locale: CatalogLocale,
    ids: (string | null)[],
  ) {
    const wanted = [...new Set(ids.flatMap((i) => (i ? [i] : [])))];
    const [cuisineRows, methodRows, names] = await Promise.all([
      wanted.length === 0
        ? []
        : executor.select().from(cuisines).where(inArray(cuisines.id, wanted)),
      wanted.length === 0
        ? []
        : executor.select().from(methods).where(inArray(methods.id, wanted)),
      loadDisplayNames(executor, locale, wanted),
    ]);
    const cuisineName = new Map(cuisineRows.map((r) => [r.id, r.name]));
    const methodName = new Map(methodRows.map((r) => [r.id, r.name]));
    return {
      cuisine: (id: string | null) =>
        id && cuisineName.has(id)
          ? { id, name: names.pick('cuisine', id, cuisineName.get(id)!) }
          : null,
      method: (id: string | null) =>
        id && methodName.has(id)
          ? { id, name: names.pick('method', id, methodName.get(id)!) }
          : null,
    };
  }
}

const diffLines = (recipe: ResolvedRecipe): DiffLine[] =>
  recipe.lines.map((line) => ({
    id: line.id,
    key: lineKey({
      ingredientId: line.ingredientId,
      normalizedName: normalizeName(line.ingredientName),
    }),
    ingredientId: line.ingredientId,
    ingredientName: line.ingredientName,
    quantity: line.quantity,
    unit: line.unit,
  }));
