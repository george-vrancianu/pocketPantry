import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, notInArray } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { lockFamilies } from '../family/family-locks';
import {
  cuisines,
  ingredients,
  methods,
  recipeIngredientLines,
  recipes,
  recipeSteps,
  unmatchedEntries,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { recordUnmatched } from '../unmatched/unmatched-entries';
import { itemNotFound, recipeNotFound } from './recipe-errors';
import { lockRecipe } from './recipe-locks';
import { RecipesService } from './recipes.service';
import { RecipeTipsService } from './recipe-tips.service';
import {
  findVisibleRecipe,
  loadAdminDetail,
  resolveRecipe,
} from './recipe-view';
import type {
  FamilyRecipeDocument,
  FamilyRecipeDraft,
  FamilyRecipeEdit,
  FamilyRecipeUpdate,
  HiddenTipsBody,
  TipCreate,
  TipOrder,
  TipUpdate,
} from './recipes.schemas';

type LineDocument = FamilyRecipeDocument['lines'][number];

/**
 * A Family's own Recipes: Variants under a Base Recipe the Family can see, or
 * standalone Base Recipes. Every rule about writing one lives here, so the
 * Member editor and the Plate Scan save (`createIn`) behave the same. Every
 * write locks the Family row, then the Recipe row (the order the Unmatched
 * queue uses). Family Recipes are never translated and the Admin paths never
 * reach them.
 */
@Injectable()
export class FamilyRecipesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly recipes: RecipesService,
    private readonly tips: RecipeTipsService,
  ) {}

  /** The unsaved "Make a variant" draft from any Recipe the Family can see. */
  async variantDraft(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeDraft> {
    const familyId = await this.settings.familyIdOf(memberId);
    const row = await findVisibleRecipe(this.database, id, familyId);
    if (!row) throw recipeNotFound();
    const source = await resolveRecipe(this.database, row, locale);
    return {
      parentId: row.parentId ?? row.id,
      title: source.title,
      servings: source.servings,
      prepMinutes: source.prepMinutes,
      cookMinutes: source.cookMinutes,
      difficulty: source.difficulty,
      cuisineId: source.cuisine?.id ?? null,
      methodId: source.method?.id ?? null,
      lines: source.lines.map((line) => ({
        ingredientId: line.ingredientId,
        rawName: line.ingredientId ? null : line.ingredientName,
        ingredientName: line.ingredientName,
        quantity: line.quantity,
        unit: line.unit,
        optional: line.optional,
        note: line.note,
      })),
      steps: source.steps.map((step) => ({
        text: step.text,
        timerSeconds: step.timerSeconds,
      })),
    };
  }

  async create(
    memberId: string,
    document: FamilyRecipeDocument,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeEdit> {
    const familyId = await this.settings.familyIdOf(memberId);
    const id = await this.database.transaction((tx) =>
      this.createIn(tx, familyId, document, locale),
    );
    return this.edit(familyId, id, locale);
  }

  /**
   * Creates a Family Recipe inside the caller's transaction and returns its
   * id. Unmatched line names are queued in the same transaction.
   */
  async createIn(
    tx: Tx,
    familyId: string,
    document: FamilyRecipeDocument,
    locale: string,
  ): Promise<string> {
    await lockFamilies(tx, [familyId]);
    await this.validate(tx, document);
    if (document.parentId)
      await this.assertParent(tx, familyId, document.parentId);
    const id = randomUUID();
    await tx.insert(recipes).values({
      id,
      familyId,
      parentId: document.parentId,
      title: document.title,
      servings: document.servings,
      prepMinutes: document.prepMinutes,
      cookMinutes: document.cookMinutes,
      difficulty: document.difficulty,
      cuisineId: document.cuisineId,
      methodId: document.methodId,
    });
    await this.writeLines(tx, id, document, new Map(), locale);
    await this.recipes.writeSteps(tx, id, document, new Set());
    return id;
  }

  /** The editable view of one of the Family's own Recipes; 404 for any other. */
  async editFor(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeEdit> {
    return this.edit(await this.settings.familyIdOf(memberId), id, locale);
  }

  /**
   * Replaces the document in place; lines and Steps with an `id` keep it (and
   * their Tips). The base is never changed.
   */
  async update(
    memberId: string,
    id: string,
    document: FamilyRecipeUpdate,
  ): Promise<FamilyRecipeEdit> {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.database.transaction(async (tx) => {
      await lockFamilies(tx, [familyId]);
      await lockRecipe(tx, id, familyId);
      await this.validate(tx, document);
      const existingLines = await tx
        .select()
        .from(recipeIngredientLines)
        .where(eq(recipeIngredientLines.recipeId, id));
      const existingSteps = await tx
        .select({ id: recipeSteps.id })
        .from(recipeSteps)
        .where(eq(recipeSteps.recipeId, id));
      await tx
        .update(recipes)
        .set({
          title: document.title,
          servings: document.servings,
          prepMinutes: document.prepMinutes,
          cookMinutes: document.cookMinutes,
          difficulty: document.difficulty,
          cuisineId: document.cuisineId,
          methodId: document.methodId,
        })
        .where(eq(recipes.id, id));
      await this.writeLines(
        tx,
        id,
        document,
        new Map(existingLines.map((row) => [row.id, row])),
        document.locale,
      );
      await this.recipes.writeSteps(
        tx,
        id,
        document,
        new Set(existingSteps.map((row) => row.id)),
      );
    });
    return this.edit(familyId, id, document.locale);
  }

  /** "Delete" in the UI: archived, never removed; its Variants and the base are untouched. */
  async archive(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeEdit> {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.database.transaction(async (tx) => {
      await lockFamilies(tx, [familyId]);
      await lockRecipe(tx, id, familyId);
      await tx
        .update(recipes)
        .set({ archivedAt: new Date() })
        .where(and(eq(recipes.id, id), eq(recipes.familyId, familyId)));
    });
    return this.edit(familyId, id, locale);
  }

  async createTip(
    memberId: string,
    id: string,
    input: TipCreate,
    locale: CatalogLocale,
  ) {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.tips.create(id, input, familyId);
    return this.edit(familyId, id, locale);
  }

  async updateTip(
    memberId: string,
    id: string,
    tipId: string,
    input: TipUpdate,
    locale: CatalogLocale,
  ) {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.tips.update(id, tipId, input, familyId);
    return this.edit(familyId, id, locale);
  }

  async deleteTip(memberId: string, id: string, tipId: string) {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.tips.delete(id, tipId, familyId);
  }

  async reorderTips(
    memberId: string,
    id: string,
    input: TipOrder,
    locale: CatalogLocale,
  ) {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.tips.reorder(id, input, familyId);
    return this.edit(familyId, id, locale);
  }

  async setHiddenTips(
    memberId: string,
    id: string,
    input: HiddenTipsBody,
    locale: CatalogLocale,
  ) {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.tips.setHidden(id, input, familyId);
    return this.edit(familyId, id, locale);
  }

  private async edit(
    familyId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeEdit> {
    const detail = await loadAdminDetail(this.database, id, familyId);
    if (!detail) throw recipeNotFound();
    const { translations, ...rest } = detail;
    void translations; // Family Recipes are never translated
    const rows = await this.database
      .select()
      .from(recipeIngredientLines)
      .where(eq(recipeIngredientLines.recipeId, id));
    const ingredientIds = rows.flatMap((r) =>
      r.ingredientId ? [r.ingredientId] : [],
    );
    const names = await this.ingredientNames(
      this.database,
      ingredientIds,
      locale,
    );
    const byId = new Map(rows.map((row) => [row.id, row]));
    return {
      ...rest,
      lines: detail.lines.map((line) => {
        const row = byId.get(line.id)!;
        return {
          ...line,
          rawName: row.rawName,
          ingredientName: row.ingredientId
            ? (names.get(row.ingredientId) ?? '')
            : (row.rawName ?? ''),
        };
      }),
    };
  }

  private async ingredientNames(
    executor: Executor,
    ids: string[],
    locale: CatalogLocale,
  ) {
    const result = new Map<string, string>();
    if (ids.length === 0) return result;
    const [canonical, display] = await Promise.all([
      executor
        .select({ id: ingredients.id, name: ingredients.name })
        .from(ingredients)
        .where(inArray(ingredients.id, ids)),
      loadDisplayNames(executor, locale, ids),
    ]);
    for (const row of canonical) {
      result.set(row.id, display.pick('ingredient', row.id, row.name));
    }
    return result;
  }

  /**
   * The base must be a live Base Recipe the Family can see: the Catalog's or
   * its own. A shared lock makes an archive of the base wait for us. Existing
   * Variants of an archived base keep working; only new ones are refused.
   */
  private async assertParent(tx: Tx, familyId: string, parentId: string) {
    const [parent] = await tx
      .select()
      .from(recipes)
      .where(eq(recipes.id, parentId))
      .for('share');
    if (!parent || (parent.familyId !== null && parent.familyId !== familyId)) {
      throw new ApiException(404, 'recipes.parent_not_found');
    }
    if (parent.parentId) {
      throw new ApiException(409, 'recipes.variant_of_variant');
    }
    if (parent.archivedAt) {
      throw new ApiException(409, 'recipes.parent_archived');
    }
  }

  private async validate(
    tx: Tx,
    document: Pick<
      FamilyRecipeDocument,
      'lines' | 'steps' | 'cuisineId' | 'methodId'
    >,
  ) {
    document.lines.forEach((line, index) => {
      if ((line.quantity === null) !== (line.unit === null)) {
        throw new ApiException(400, 'recipes.quantity_unit_mismatch', {
          line: index,
        });
      }
      if (line.ingredientId !== null && line.rawName !== null) {
        throw new ApiException(400, 'recipes.line_name_conflict', {
          line: index,
        });
      }
      if (
        line.ingredientId === null &&
        (line.rawName === null || normalizeName(line.rawName) === '')
      ) {
        throw new ApiException(400, 'recipes.ingredient_required', {
          line: index,
        });
      }
    });
    for (const [kind, items] of [
      ['line', document.lines],
      ['step', document.steps],
    ] as const) {
      const given = items.flatMap((item) => (item.id ? [item.id] : []));
      if (new Set(given).size !== given.length) {
        throw new ApiException(400, 'recipes.duplicate_item', { kind });
      }
    }
    const wanted = [
      ...new Set(document.lines.flatMap((l) => l.ingredientId ?? [])),
    ];
    if (wanted.length > 0) {
      const found = await tx
        .select({ id: ingredients.id })
        .from(ingredients)
        .where(inArray(ingredients.id, wanted))
        .orderBy(ingredients.id)
        .for('key share');
      if (found.length !== wanted.length) {
        throw new ApiException(404, 'catalog.not_found', {
          entity: 'ingredient',
        });
      }
    }
    if (document.cuisineId) {
      const [row] = await tx
        .select({ id: cuisines.id })
        .from(cuisines)
        .where(eq(cuisines.id, document.cuisineId))
        .for('key share');
      if (!row) {
        throw new ApiException(404, 'catalog.not_found', { entity: 'cuisine' });
      }
    }
    if (document.methodId) {
      const [row] = await tx
        .select({ id: methods.id })
        .from(methods)
        .where(eq(methods.id, document.methodId))
        .for('key share');
      if (!row) {
        throw new ApiException(404, 'catalog.not_found', { entity: 'method' });
      }
    }
  }

  /**
   * Writes the Ingredient Lines and keeps the Unmatched queue in step: a line
   * whose name is new or changed gets a fresh entry, a line that is now
   * matched loses its entry, and an unchanged name keeps its entry (and any
   * dismissal). Deleted lines take their entries with them (cascade).
   */
  private async writeLines(
    tx: Tx,
    recipeId: string,
    document: Pick<FamilyRecipeDocument, 'lines'>,
    prior: Map<string, typeof recipeIngredientLines.$inferSelect>,
    locale: string,
  ) {
    const kept = document.lines.flatMap((l) => (l.id ? [l.id] : []));
    if (kept.some((lineId) => !prior.has(lineId))) throw itemNotFound('line');
    await tx
      .delete(recipeIngredientLines)
      .where(
        and(
          eq(recipeIngredientLines.recipeId, recipeId),
          kept.length > 0
            ? notInArray(recipeIngredientLines.id, kept)
            : undefined,
        ),
      );
    const queue: { lineId: string; line: LineDocument }[] = [];
    const stale: string[] = [];
    for (const [position, line] of document.lines.entries()) {
      const normalizedName = line.rawName ? normalizeName(line.rawName) : null;
      const values = {
        position,
        ingredientId: line.ingredientId,
        rawName: line.rawName,
        normalizedName,
        quantity: line.quantity,
        unit: line.unit,
        optional: line.optional,
        note: line.note,
      };
      if (line.id) {
        await tx
          .update(recipeIngredientLines)
          .set(values)
          .where(eq(recipeIngredientLines.id, line.id));
        const before = prior.get(line.id)!;
        if (before.normalizedName !== normalizedName) {
          if (before.normalizedName !== null) stale.push(line.id);
          if (normalizedName !== null) queue.push({ lineId: line.id, line });
        }
      } else {
        const lineId = randomUUID();
        await tx
          .insert(recipeIngredientLines)
          .values({ id: lineId, recipeId, ...values });
        if (normalizedName !== null) queue.push({ lineId, line });
      }
    }
    if (stale.length > 0) {
      await tx
        .delete(unmatchedEntries)
        .where(inArray(unmatchedEntries.ingredientLineId, stale));
    }
    await recordUnmatched(
      tx,
      queue.map(({ lineId, line }) => ({
        rawName: line.rawName as string,
        locale,
        source: 'recipe' as const,
        ingredientLineId: lineId,
      })),
    );
  }
}
