import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull, notInArray } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { lockFamilies } from '../family/family-locks';
import {
  cuisines,
  family,
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
import type { GuidanceBody } from './recipe-guidance.schemas';
import { writeGuidanceChecked } from './recipe-guidance-write';
import { loadResolvedGuidance } from './recipe-guidance';
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
 * A Family's own Recipes: Variants under a Catalog Base Recipe, or standalone
 * Base Recipes (which have no Variants). Every rule about writing one lives here, so the
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

  /**
   * The unsaved "Make a variant" draft from a Recipe the Family can see. The
   * parent is the source's Catalog base: the source itself, or the base of a
   * Variant (Catalog or the Family's own). A Family standalone Recipe has no
   * Catalog base, so it is refused (404 `recipes.parent_not_found`); a base
   * that is archived is refused too (409 `recipes.parent_archived`).
   */
  async variantDraft(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeDraft> {
    const familyId = await this.settings.familyIdOf(memberId);
    const row = await findVisibleRecipe(this.database, id, familyId);
    if (!row) throw recipeNotFound();
    const parentId = row.parentId ?? row.id;
    if (row.familyId !== null && row.parentId === null) {
      throw new ApiException(404, 'recipes.parent_not_found');
    }
    const [base] = await this.database
      .select({ archivedAt: recipes.archivedAt })
      .from(recipes)
      .where(eq(recipes.id, parentId));
    if (base?.archivedAt) {
      throw new ApiException(409, 'recipes.parent_archived');
    }
    const source = await resolveRecipe(this.database, row, locale);
    const guidance = await loadResolvedGuidance(this.database, row.id, locale);
    return {
      parentId,
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
      guidance: {
        nutritionNote: guidance.nutritionNote,
        pairings: guidance.pairings.map((p) => ({
          kind: p.kind,
          label: p.label,
          reason: p.reason,
          principle: p.principle,
          linkedIngredientId: p.link?.type === 'ingredient' ? p.link.id : null,
          linkedRecipeId: p.link?.type === 'recipe' ? p.link.id : null,
        })),
        eatingMoments: guidance.eatingMoments.map((m) => ({
          eatingMomentId: m.eatingMomentId,
          polarity: m.polarity,
          reason: m.reason,
        })),
      },
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
    await this.lockFamily(tx, familyId);
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
    if (document.guidance) {
      await writeGuidanceChecked(tx, { id, familyId }, document.guidance);
    }
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
      await this.lockFamily(tx, familyId);
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
      await this.lockFamily(tx, familyId);
      await lockRecipe(tx, id, familyId);
      // Archiving twice keeps the first time.
      await tx
        .update(recipes)
        .set({ archivedAt: new Date() })
        .where(
          and(
            eq(recipes.id, id),
            eq(recipes.familyId, familyId),
            isNull(recipes.archivedAt),
          ),
        );
    });
    return this.edit(familyId, id, locale);
  }

  /**
   * Replaces the guidance (Nutrition Note, Pairings, Eating Moments) of a
   * Family Recipe, as the Admin endpoint does for Catalog Recipes. It is its
   * own endpoint, not part of `update`. Guidance is never translated. A
   * Pairing may link Catalog Recipes or the Family's own, never another
   * Family's.
   */
  async setGuidance(
    memberId: string,
    id: string,
    body: GuidanceBody,
    locale: CatalogLocale,
  ): Promise<FamilyRecipeEdit> {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.database.transaction(async (tx) => {
      await this.lockFamily(tx, familyId);
      const recipe = await lockRecipe(tx, id, familyId);
      await writeGuidanceChecked(tx, recipe, body);
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
    // One snapshot, so the lines and their raw names always agree.
    return this.database.transaction(
      async (tx) => {
        const detail = await loadAdminDetail(tx, id, familyId);
        if (!detail) throw recipeNotFound();
        const { translations, ...rest } = detail;
        void translations; // Family Recipes are never translated
        const resolved = await loadResolvedGuidance(tx, id, locale);
        const links = new Map(resolved.pairings.map((p) => [p.id, p.link]));
        const rows = await tx
          .select()
          .from(recipeIngredientLines)
          .where(eq(recipeIngredientLines.recipeId, id));
        const names = await this.ingredientNames(
          tx,
          rows.flatMap((r) => (r.ingredientId ? [r.ingredientId] : [])),
          locale,
        );
        const byId = new Map(rows.map((row) => [row.id, row]));
        return {
          ...rest,
          pairings: detail.pairings.map((p) => {
            const link = links.get(p.id) ?? null;
            return {
              ...p,
              linkedIngredientName:
                link?.type === 'ingredient' ? link.name : null,
              linkedRecipeTitle: link?.type === 'recipe' ? link.title : null,
            };
          }),
          lines: detail.lines.map((line) => {
            const row = byId.get(line.id);
            return {
              ...line,
              rawName: row?.rawName ?? null,
              ingredientName: row?.ingredientId
                ? (names.get(row.ingredientId) ?? '')
                : (row?.rawName ?? ''),
            };
          }),
        };
      },
      { isolationLevel: 'repeatable read', accessMode: 'read only' },
    );
  }

  /** Locks the Family row; a Family deleted in the meantime is a 404, not a foreign key error. */
  private async lockFamily(tx: Tx, familyId: string) {
    await lockFamilies(tx, [familyId]);
    const [row] = await tx
      .select({ id: family.id })
      .from(family)
      .where(eq(family.id, familyId));
    if (!row) throw recipeNotFound();
  }

  private async ingredientNames(
    executor: Executor,
    ids: string[],
    locale: CatalogLocale,
  ) {
    const result = new Map<string, string>();
    if (ids.length === 0) return result;
    const canonical = await executor
      .select({ id: ingredients.id, name: ingredients.name })
      .from(ingredients)
      .where(inArray(ingredients.id, ids));
    const display = await loadDisplayNames(executor, locale, ids);
    for (const row of canonical) {
      result.set(row.id, display.pick('ingredient', row.id, row.name));
    }
    return result;
  }

  /**
   * The parent must be a live Catalog Base Recipe: Variants go under Catalog
   * bases only (a Family standalone Recipe has no Variants). A shared lock
   * makes an archive of the base wait for us. Existing Variants of an archived
   * base keep working; only new ones are refused.
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
    if (parent.familyId !== null) {
      throw new ApiException(404, 'recipes.parent_not_found');
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
   * dismissal). A change of case or spacing only keeps the existing entry too
   * (the normalised name is what counts). Deleted lines take their entries with them (cascade).
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
