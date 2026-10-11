import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, notInArray } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipes,
  recipeStepTranslations,
  recipeSteps,
  recipeTipTranslations,
  recipeTips,
} from '../database/schema';
import { itemNotFound, recipeNotFound } from './recipe-errors';
import {
  assertLiveCatalogBase,
  recipeColumns,
  validateRecipeDocument,
} from './recipe-document-rules';
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
        ...recipeColumns(document),
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
        .set(recipeColumns(document))
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
      assertLiveCatalogBase(parent);
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
  private validate(tx: Tx, document: RecipeDocument) {
    return validateRecipeDocument(tx, document, (line, index) => {
      if (line.ingredientId === null) {
        throw new ApiException(400, 'recipes.ingredient_required', {
          line: index,
        });
      }
    });
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
    // Lines here are Catalog lines: always matched, so rawName/normalizedName
    // stay null. Family Recipes write their lines in FamilyRecipesService, which
    // sets them for Unmatched lines.
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
  ): Promise<string[]> {
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
    const ids: string[] = [];
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
        ids.push(step.id);
      } else {
        const stepId = randomUUID();
        await tx
          .insert(recipeSteps)
          .values({ id: stepId, recipeId, ...values });
        ids.push(stepId);
      }
    }
    return ids;
  }
}
