import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import {
  loadPickableTags,
  loadRecipeTags,
  loadTagsInUse,
  type RecipeTag,
} from '../tags/recipe-tags';
import { eatingMoments, recipes, recipeTags, tags } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import {
  loadAllergyWarnings,
  loadRecipeAllergens,
  loadViewerAllergies,
  loadViewerAllergyContext,
} from './recipe-allergens';
import { diffIngredients, lineKey, type DiffLine } from './recipe-diff';
import { recipeNotFound } from './recipe-errors';
import {
  findVisibleRecipe,
  inScope,
  liveCopiesOf,
  ownerOf,
  recipeTitles,
  resolveRecipe,
  visibleTo,
} from './recipe-view';
import type {
  BrowseQuery,
  RecipeDetail,
  RecipeFilters,
  RecipeList,
  RecipeListItem,
  RecipeScope,
  RecipeVariantItem,
  ResolvedRecipe,
} from './recipes.schemas';

type RecipeRow = typeof recipes.$inferSelect;

/** Recipes carrying every one of the Tags (AND); no Tags is no condition. */
function hasEveryTag(tagIds: readonly string[] | undefined) {
  const wanted = [...new Set(tagIds ?? [])];
  if (wanted.length === 0) return undefined;
  return inArray(
    recipes.id,
    sql`(SELECT ${recipeTags.recipeId} FROM ${recipeTags}
      WHERE ${inArray(recipeTags.tagId, wanted)}
      GROUP BY ${recipeTags.recipeId}
      HAVING count(DISTINCT ${recipeTags.tagId}) = ${wanted.length})`,
  );
}

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
   * archived base stay listed (the archived base itself does not).
   * `scope=family` always lists Variants, since the Family's Variants are its Recipes.
   */
  async list(
    memberId: string,
    query: BrowseQuery,
    locale: CatalogLocale,
  ): Promise<RecipeList> {
    const familyId = await this.settings.familyIdOf(memberId);
    const needle = normalizeName(query.search ?? '');
    // Search and filters list Variants beside bases; so does asking for them outright, and
    // `scope=family` always does.
    const listsVariants =
      query.scope === 'family' ||
      needle !== '' ||
      (query.tagIds?.length ?? 0) > 0 ||
      query.includeVariants === 'true';

    const rows = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          inScope(familyId, query.scope),
          isNull(recipes.archivedAt),
          listsVariants ? undefined : isNull(recipes.parentId),
          hasEveryTag(query.tagIds),
        ),
      )
      .orderBy(asc(recipes.id));

    // Variants keep working under an archived base; only one whose base is not
    // visible to the Family stays out.
    const parentIds = [
      ...new Set(rows.flatMap((r) => (r.parentId ? [r.parentId] : []))),
    ];
    const parents = await this.rowsById(this.database, parentIds, familyId);
    const live = rows.filter((r) => !r.parentId || parents.has(r.parentId));

    const titles = await recipeTitles(
      this.database,
      [...live, ...parents.values()],
      locale,
    );
    const matching =
      needle === '' ? live : this.matchingTitle(live, needle, titles);

    const baseIds = matching.filter((r) => !r.parentId).map((r) => r.id);
    const counts = await this.variantCounts(familyId, baseIds, query.scope);
    const [tagsOf, { hides, allergy }] = await Promise.all([
      loadRecipeTags(
        this.database,
        catalogScope(familyId),
        locale,
        matching.map((r) => r.id),
      ),
      loadViewerAllergyContext(
        this.database,
        this.settings,
        memberId,
        familyId,
        query.showHidden,
      ).then(async ({ allergies, hides }) => ({
        hides,
        allergy: await loadAllergyWarnings(
          this.database,
          catalogScope(familyId),
          matching.map((r) => r.id),
          locale,
          allergies,
        ),
      })),
    ]);
    const { warnings, hidden } = allergy;
    const shown = hides ? matching.filter((r) => !hidden.has(r.id)) : matching;
    const copies = await liveCopiesOf(
      this.database,
      familyId,
      shown.filter((r) => r.familyId === null).map((r) => r.id),
    );

    const items = shown
      .map((row): RecipeListItem => {
        const parent = row.parentId ? parents.get(row.parentId) : undefined;
        return {
          id: row.id,
          title: titles.get(row.id)!,
          parentId: row.parentId,
          base: parent
            ? { id: parent.id, title: titles.get(parent.id)! }
            : null,
          tags: tagsOf.get(row.id) ?? [],
          variantCount: counts.get(row.id) ?? 0,
          servings: row.servings,
          prepMinutes: row.prepMinutes,
          cookMinutes: row.cookMinutes,
          difficulty: row.difficulty,
          owner: ownerOf(row),
          familyCopyId: copies.get(row.id) ?? null,
          copiedFromId: row.copiedFromId,
          allergyWarning: warnings.get(row.id) ?? null,
        };
      })
      .sort(byTitle(locale));
    return {
      recipes: items,
      hiddenByAllergiesCount: matching.length - shown.length,
    };
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
    const resolved = await resolveRecipe(
      this.database,
      catalogScope(familyId),
      row,
      locale,
    );

    const baseAndDiff = async (): Promise<{
      base: RecipeDetail['base'];
      diff: RecipeDetail['diff'];
    }> => {
      if (!row.parentId) return { base: null, diff: null };
      const baseRow = await findVisibleRecipe(
        this.database,
        row.parentId,
        familyId,
      );
      if (!baseRow) return { base: null, diff: null };
      const baseResolved = await resolveRecipe(
        this.database,
        catalogScope(familyId),
        baseRow,
        locale,
      );
      return {
        base: {
          id: baseRow.id,
          title: baseResolved.title,
          archived: baseResolved.archived,
          familyCopyId:
            baseRow.familyId === null
              ? ((
                  await liveCopiesOf(this.database, familyId, [baseRow.id])
                ).get(baseRow.id) ?? null)
              : null,
        },
        diff: diffIngredients(diffLines(baseResolved), diffLines(resolved)),
      };
    };
    const [viewerAllergies, variants, { base, diff }] = await Promise.all([
      loadViewerAllergies(this.database, memberId, familyId),
      row.parentId
        ? Promise.resolve([])
        : this.variantsOfBase(row, familyId, locale),
      baseAndDiff(),
    ]);

    const { allergens, allergyWarning } = await loadRecipeAllergens(
      this.database,
      catalogScope(familyId),
      resolved,
      locale,
      viewerAllergies,
    );
    const familyCopyId =
      row.familyId === null
        ? ((await liveCopiesOf(this.database, familyId, [row.id])).get(
            row.id,
          ) ?? null)
        : null;
    const [copiedFromRow] =
      row.familyId !== null && row.parentId === null && row.copiedFromId
        ? await this.database
            .select({ archivedAt: recipes.archivedAt })
            .from(recipes)
            .where(eq(recipes.id, row.copiedFromId))
        : [];
    const copiedFrom =
      copiedFromRow && row.copiedFromId
        ? { id: row.copiedFromId, archived: copiedFromRow.archivedAt !== null }
        : null;
    // A Pairing's Catalog Recipe link also names the Family's live copy of it.
    const pairedIds = resolved.guidance.pairings.flatMap((p) =>
      p.link?.type === 'recipe' && p.link.owner === 'catalog'
        ? [p.link.id]
        : [],
    );
    const pairedCopies = await liveCopiesOf(this.database, familyId, pairedIds);
    const guidance = {
      ...resolved.guidance,
      pairings: resolved.guidance.pairings.map((p) =>
        p.link?.type === 'recipe' && p.link.owner === 'catalog'
          ? {
              ...p,
              link: {
                ...p.link,
                familyCopyId: pairedCopies.get(p.link.id) ?? null,
              },
            }
          : p,
      ),
    };
    return {
      ...resolved,
      guidance,
      base,
      variants,
      familyCopyId,
      copiedFrom,
      diff,
      allergens,
      allergyWarning,
    };
  }

  /** Every Tag the Member can put on a Recipe: all Catalog Tags and the Family's own, in their language. */
  async pickableTags(
    memberId: string,
    locale: CatalogLocale,
  ): Promise<RecipeTag[]> {
    return loadPickableTags(
      this.database,
      await this.settings.catalogScopeForMember(memberId),
      locale,
      await this.settings.familyIdOf(memberId),
    );
  }

  /**
   * The Tags in use on live Recipes in `recipeScope` (absent: the Catalog's and the Family's).
   */
  async filters(
    memberId: string,
    locale: CatalogLocale,
    recipeScope?: RecipeScope,
  ): Promise<RecipeFilters> {
    const scope = await this.settings.catalogScopeForMember(memberId);
    const familyId = await this.settings.familyIdOf(memberId);
    const [tagsInUse, momentRows] = await Promise.all([
      loadTagsInUse(
        this.database,
        scope,
        locale,
        and(
          inScope(familyId, recipeScope),
          isNull(recipes.archivedAt),
          // Explore offers Catalog Tags only, whatever a write path may have attached.
          recipeScope === 'catalog' ? isNull(tags.familyId) : undefined,
        ),
      ),
      this.database
        .select()
        .from(eatingMoments)
        .where(isNull(eatingMoments.archivedAt))
        .orderBy(asc(eatingMoments.sortOrder), asc(eatingMoments.id)),
    ]);
    const names = await loadDisplayNames(this.database, scope, locale, [
      ...momentRows.map((r) => r.id),
    ]);
    return {
      tags: tagsInUse,
      eatingMoments: momentRows.map((r) => ({
        id: r.id,
        name: names.pick('eating_moment', r.id, r.name),
      })),
    };
  }

  /**
   * A Base's Variants. A Family copy of a Catalog Base also lists the Family's own live
   * Variants of that Catalog Base: they are grouped under the copy on the Recipes list.
   */
  private async variantsOfBase(
    row: RecipeRow,
    familyId: string,
    locale: CatalogLocale,
  ): Promise<RecipeVariantItem[]> {
    const own = await this.variantsOf(row.id, familyId, locale);
    if (row.familyId === null || !row.copiedFromId) return own;
    const grouped = await this.variantsOf(
      row.copiedFromId,
      familyId,
      locale,
      true,
    );
    return [...own, ...grouped].sort((a, b) =>
      a.title.localeCompare(b.title, locale),
    );
  }

  private async variantsOf(
    baseId: string,
    familyId: string,
    locale: CatalogLocale,
    familyOnly = false,
  ): Promise<RecipeVariantItem[]> {
    const rows = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.parentId, baseId),
          familyOnly ? eq(recipes.familyId, familyId) : visibleTo(familyId),
          isNull(recipes.archivedAt),
        ),
      );
    const titles = await recipeTitles(this.database, rows, locale);
    const copies = await liveCopiesOf(
      this.database,
      familyId,
      rows.filter((r) => r.familyId === null).map((r) => r.id),
    );
    const tagsOf = await loadRecipeTags(
      this.database,
      catalogScope(familyId),
      locale,
      rows.map((r) => r.id),
    );
    return rows
      .map((row) => ({
        id: row.id,
        title: titles.get(row.id)!,
        tags: tagsOf.get(row.id) ?? [],
        owner: ownerOf(row),
        familyCopyId: copies.get(row.id) ?? null,
      }))
      .sort((a, b) => byTitle(locale)(a, b) || a.id.localeCompare(b.id));
  }

  private async variantCounts(
    familyId: string,
    baseIds: string[],
    scope: RecipeScope | undefined,
  ): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (baseIds.length === 0) return counts;
    const variants = await this.database
      .select({ parentId: recipes.parentId })
      .from(recipes)
      .where(
        and(
          inArray(recipes.parentId, baseIds),
          inScope(familyId, scope),
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
