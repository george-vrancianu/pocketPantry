import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, notInArray } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  cuisines,
  ingredients,
  methods,
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipes,
  recipeStepTranslations,
  recipeSteps,
  recipeTipTranslations,
  recipeTips,
} from '../database/schema';
import { itemNotFound, recipeNotFound } from './recipe-errors';
import { copyGuidance } from './recipe-guidance-write';
import { lockCatalogRecipe } from './recipe-locks';
import { loadAdminDetail } from './recipe-view';
import type {
  AdminRecipeDetail,
  AdminRecipeListItem,
  RecipeDocument,
  RecipeListQuery,
  VariantCreate,
} from './recipes.schemas';

/**
 * Catalog Recipe authoring: the document (metadata, Ingredient Lines, Steps),
 * Variants and archiving. Tips and translations live in sibling services.
 * Every mutation locks the Recipe row first, so concurrent edits of one
 * Recipe serialise.
 */
@Injectable()
export class RecipesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async list(query: RecipeListQuery): Promise<AdminRecipeListItem[]> {
    const rows = await this.database
      .select()
      .from(recipes)
      .where(
        and(
          isNull(recipes.familyId),
          query.baseOnly === 'true' ? isNull(recipes.parentId) : undefined,
          query.archived === 'exclude' ? isNull(recipes.archivedAt) : undefined,
        ),
      )
      .orderBy(asc(recipes.title), asc(recipes.id));
    return rows.map((row) => ({
      id: row.id,
      parentId: row.parentId,
      title: row.title,
      servings: row.servings,
      difficulty: row.difficulty,
      cuisineId: row.cuisineId,
      methodId: row.methodId,
      archived: row.archivedAt !== null,
    }));
  }

  async detail(id: string): Promise<AdminRecipeDetail> {
    const detail = await loadAdminDetail(this.database, id);
    if (!detail) throw recipeNotFound();
    return detail;
  }

  /** Creates a Base Recipe from the document. */
  async create(document: RecipeDocument): Promise<AdminRecipeDetail> {
    const id = randomUUID();
    await this.database.transaction(async (tx) => {
      await this.validate(tx, document);
      await tx.insert(recipes).values({
        id,
        title: document.title,
        servings: document.servings,
        prepMinutes: document.prepMinutes,
        cookMinutes: document.cookMinutes,
        difficulty: document.difficulty,
        cuisineId: document.cuisineId,
        methodId: document.methodId,
      });
      await this.writeLines(tx, id, document, new Set());
      await this.writeSteps(tx, id, document, new Set());
    });
    return this.detail(id);
  }

  /**
   * Replaces the document in place. Lines and Steps with an `id` are updated
   * and keep it (their Tips and translations anchor to it), those without are
   * inserted, those no longer listed are deleted. Position is the array order.
   * `parentId` is never touched: a Recipe's base is fixed at creation.
   */
  async update(id: string, document: RecipeDocument) {
    await this.database.transaction(async (tx) => {
      await lockCatalogRecipe(tx, id);
      await this.validate(tx, document);
      const existingLines = await tx
        .select({ id: recipeIngredientLines.id })
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
        new Set(existingLines.map((r) => r.id)),
      );
      await this.writeSteps(
        tx,
        id,
        document,
        new Set(existingSteps.map((r) => r.id)),
      );
    });
    return this.detail(id);
  }

  /** Archived Recipes are hidden from browsing and the Variant picker; nothing is deleted. */
  async archive(id: string): Promise<AdminRecipeDetail> {
    await this.database.transaction(async (tx) => {
      await lockCatalogRecipe(tx, id);
      await tx
        .update(recipes)
        .set({ archivedAt: new Date() })
        .where(and(eq(recipes.id, id), isNull(recipes.archivedAt)));
    });
    return this.detail(id);
  }

  /**
   * Makes a Variant of a Base Recipe: a full copy (metadata, Ingredient Lines,
   * Steps with new ids, Step Tips re-anchored to the new Steps, and the
   * translations of the copied text) that is an editable draft from then on.
   * Guidance (Pairings, Nutrition Note, Eating Moment uses) is copied too, with
   * its translations. Recipe-level Tips are not copied: the Variant inherits them live.
   */
  async createVariant(
    parentId: string,
    input: VariantCreate,
  ): Promise<AdminRecipeDetail> {
    const id = randomUUID();
    await this.database.transaction(async (tx) => {
      // Shared lock: an archive of the base waits for us or fails us cleanly.
      const [parent] = await tx
        .select()
        .from(recipes)
        .where(and(eq(recipes.id, parentId), isNull(recipes.familyId)))
        .for('share');
      if (!parent) {
        throw new ApiException(404, 'recipes.parent_not_found');
      }
      if (parent.parentId) {
        throw new ApiException(409, 'recipes.variant_of_variant');
      }
      if (parent.archivedAt) {
        throw new ApiException(409, 'recipes.parent_archived');
      }
      await tx.insert(recipes).values({
        id,
        parentId,
        title: input.title,
        servings: parent.servings,
        prepMinutes: parent.prepMinutes,
        cookMinutes: parent.cookMinutes,
        difficulty: parent.difficulty,
        cuisineId: parent.cuisineId,
        methodId: parent.methodId,
      });
      await this.copyContent(tx, parentId, id);
    });
    return this.detail(id);
  }

  private async copyContent(tx: Tx, fromId: string, toId: string) {
    await copyGuidance(tx, fromId, toId);
    const lines = await tx
      .select()
      .from(recipeIngredientLines)
      .where(eq(recipeIngredientLines.recipeId, fromId));
    const steps = await tx
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.recipeId, fromId));
    const stepTips = (
      await tx
        .select()
        .from(recipeTips)
        .where(eq(recipeTips.recipeId, fromId))
        .orderBy(asc(recipeTips.position))
    ).filter((tip) => tip.stepId !== null);

    const lineIds = new Map(lines.map((l) => [l.id, randomUUID()]));
    const stepIds = new Map(steps.map((s) => [s.id, randomUUID()]));
    const tipIds = new Map(stepTips.map((t) => [t.id, randomUUID()]));

    if (lines.length > 0) {
      await tx.insert(recipeIngredientLines).values(
        lines.map((l) => ({
          id: lineIds.get(l.id) as string,
          recipeId: toId,
          position: l.position,
          ingredientId: l.ingredientId,
          rawName: l.rawName,
          normalizedName: l.normalizedName,
          quantity: l.quantity,
          unit: l.unit,
          optional: l.optional,
          note: l.note,
        })),
      );
      const notes = await tx
        .select()
        .from(recipeIngredientLineTranslations)
        .where(
          inArray(recipeIngredientLineTranslations.lineId, [...lineIds.keys()]),
        );
      if (notes.length > 0) {
        await tx.insert(recipeIngredientLineTranslations).values(
          notes.map((t) => ({
            lineId: lineIds.get(t.lineId) as string,
            locale: t.locale,
            note: t.note,
          })),
        );
      }
    }
    if (steps.length > 0) {
      await tx.insert(recipeSteps).values(
        steps.map((s) => ({
          id: stepIds.get(s.id) as string,
          recipeId: toId,
          position: s.position,
          text: s.text,
          timerSeconds: s.timerSeconds,
        })),
      );
      const texts = await tx
        .select()
        .from(recipeStepTranslations)
        .where(inArray(recipeStepTranslations.stepId, [...stepIds.keys()]));
      if (texts.length > 0) {
        await tx.insert(recipeStepTranslations).values(
          texts.map((t) => ({
            stepId: stepIds.get(t.stepId) as string,
            locale: t.locale,
            text: t.text,
          })),
        );
      }
    }
    if (stepTips.length > 0) {
      await tx.insert(recipeTips).values(
        stepTips.map((t, index) => ({
          id: tipIds.get(t.id) as string,
          recipeId: toId,
          stepId: stepIds.get(t.stepId as string) as string,
          position: index,
          text: t.text,
        })),
      );
      const texts = await tx
        .select()
        .from(recipeTipTranslations)
        .where(inArray(recipeTipTranslations.tipId, [...tipIds.keys()]));
      if (texts.length > 0) {
        await tx.insert(recipeTipTranslations).values(
          texts.map((t) => ({
            tipId: tipIds.get(t.tipId) as string,
            locale: t.locale,
            text: t.text,
          })),
        );
      }
    }
  }

  /** The coded rules a Catalog Recipe document must meet, checked before any write. */
  private async validate(tx: Tx, document: RecipeDocument) {
    document.lines.forEach((line, index) => {
      if ((line.quantity === null) !== (line.unit === null)) {
        throw new ApiException(400, 'recipes.quantity_unit_mismatch', {
          line: index,
        });
      }
      if (line.ingredientId === null) {
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
        // Blocks a concurrent Ingredient delete until we commit.
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

  private async writeLines(
    tx: Tx,
    recipeId: string,
    document: RecipeDocument,
    existing: Set<string>,
  ) {
    const kept = document.lines.flatMap((l) => (l.id ? [l.id] : []));
    if (kept.some((lineId) => !existing.has(lineId))) {
      throw itemNotFound('line');
    }
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
    // Lines here are Catalog lines: rawName/normalizedName stay null. The Family
    // Recipe path (#137) must set them for Unmatched lines (matched xor named check).
    for (const [position, line] of document.lines.entries()) {
      const values = {
        position,
        ingredientId: line.ingredientId,
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
        // A cleared note leaves nothing to translate.
        if (line.note === null) {
          await tx
            .delete(recipeIngredientLineTranslations)
            .where(eq(recipeIngredientLineTranslations.lineId, line.id));
        }
      } else {
        await tx
          .insert(recipeIngredientLines)
          .values({ id: randomUUID(), recipeId, ...values });
      }
    }
  }

  /** Also used by FamilyRecipesService: Steps are the same for both owners. */
  async writeSteps(
    tx: Tx,
    recipeId: string,
    document: RecipeDocument,
    existing: Set<string>,
  ) {
    const kept = document.steps.flatMap((s) => (s.id ? [s.id] : []));
    if (kept.some((stepId) => !existing.has(stepId))) {
      throw itemNotFound('step');
    }
    // Deleting a Step deletes its Tips and translations (cascade).
    await tx
      .delete(recipeSteps)
      .where(
        and(
          eq(recipeSteps.recipeId, recipeId),
          kept.length > 0 ? notInArray(recipeSteps.id, kept) : undefined,
        ),
      );
    for (const [position, step] of document.steps.entries()) {
      const values = {
        position,
        text: step.text,
        timerSeconds: step.timerSeconds,
      };
      if (step.id) {
        await tx
          .update(recipeSteps)
          .set(values)
          .where(eq(recipeSteps.id, step.id));
      } else {
        await tx
          .insert(recipeSteps)
          .values({ id: randomUUID(), recipeId, ...values });
      }
    }
  }
}
