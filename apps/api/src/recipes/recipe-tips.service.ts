import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull, max } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  recipeHiddenTips,
  recipes,
  recipeSteps,
  recipeTips,
} from '../database/schema';
import { recipeNotFound } from './recipe-errors';
import { lockRecipeForWrite } from './recipe-locks';
import { loadAdminDetail } from './recipe-view';
import type {
  AdminRecipeDetail,
  HiddenTipsBody,
  TipCreate,
  TipOrder,
  TipUpdate,
} from './recipes.schemas';

const tipNotFound = () => new ApiException(404, 'recipes.tip_not_found');

/**
 * Tips are on the Recipe (no step) or on one of its Steps. A Variant inherits
 * its base's Recipe-level Tips live and can hide any of them; Step Tips are
 * never inherited. Responses are the Recipe's full Admin detail.
 */
@Injectable()
export class RecipeTipsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async create(
    recipeId: string,
    input: TipCreate,
    familyId: string | null = null,
  ): Promise<AdminRecipeDetail> {
    await this.writeCreate(recipeId, input, familyId);
    return this.detail(recipeId, familyId);
  }

  /** `create` without the response, for callers that load their own view. */
  async writeCreate(
    recipeId: string,
    input: TipCreate,
    familyId: string | null = null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await lockRecipeForWrite(tx, recipeId, familyId);
      await this.assertStepOf(tx, recipeId, input.stepId);
      const [{ last }] = await tx
        .select({ last: max(recipeTips.position) })
        .from(recipeTips)
        .where(eq(recipeTips.recipeId, recipeId));
      await tx.insert(recipeTips).values({
        id: randomUUID(),
        recipeId,
        stepId: input.stepId,
        text: input.text,
        position: (last ?? -1) + 1,
      });
    });
  }

  async update(
    recipeId: string,
    tipId: string,
    input: TipUpdate,
    familyId: string | null = null,
  ): Promise<AdminRecipeDetail> {
    await this.writeUpdate(recipeId, tipId, input, familyId);
    return this.detail(recipeId, familyId);
  }

  /** `update` without the response, for callers that load their own view. */
  async writeUpdate(
    recipeId: string,
    tipId: string,
    input: TipUpdate,
    familyId: string | null = null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await lockRecipeForWrite(tx, recipeId, familyId);
      const tip = await this.requireTip(tx, recipeId, tipId);
      if (input.stepId !== undefined) {
        await this.assertStepOf(tx, recipeId, input.stepId);
      }
      await tx
        .update(recipeTips)
        .set({ text: input.text, stepId: input.stepId })
        .where(eq(recipeTips.id, tip.id));
      // A Tip moved onto a Step is no longer inheritable, so no Variant hides it.
      if (input.stepId) {
        await tx
          .delete(recipeHiddenTips)
          .where(eq(recipeHiddenTips.tipId, tip.id));
      }
    });
  }

  async delete(
    recipeId: string,
    tipId: string,
    familyId: string | null = null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await lockRecipeForWrite(tx, recipeId, familyId);
      await this.requireTip(tx, recipeId, tipId);
      await tx.delete(recipeTips).where(eq(recipeTips.id, tipId));
    });
  }

  /** `ids` must be every Tip of the Recipe; a stale list is refused. */
  async reorder(
    recipeId: string,
    input: TipOrder,
    familyId: string | null = null,
  ): Promise<AdminRecipeDetail> {
    await this.writeReorder(recipeId, input, familyId);
    return this.detail(recipeId, familyId);
  }

  /** `reorder` without the response, for callers that load their own view. */
  async writeReorder(
    recipeId: string,
    input: TipOrder,
    familyId: string | null = null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await lockRecipeForWrite(tx, recipeId, familyId);
      const current = await tx
        .select({ id: recipeTips.id })
        .from(recipeTips)
        .where(eq(recipeTips.recipeId, recipeId));
      const wanted = new Set(input.ids);
      if (
        current.length !== input.ids.length ||
        !current.every((row) => wanted.has(row.id))
      ) {
        throw new ApiException(409, 'recipes.tip_order_stale');
      }
      for (const [position, id] of input.ids.entries()) {
        await tx
          .update(recipeTips)
          .set({ position })
          .where(eq(recipeTips.id, id));
      }
    });
  }

  /**
   * Sets which of the base's Recipe-level Tips this Variant hides (the whole
   * set; empty shows them all). Only Variants hide, and only Recipe-level
   * Tips of their own base.
   */
  async setHidden(
    recipeId: string,
    input: HiddenTipsBody,
    familyId: string | null = null,
  ): Promise<AdminRecipeDetail> {
    await this.writeHidden(recipeId, input, familyId);
    return this.detail(recipeId, familyId);
  }

  /** `setHidden` without the response, for callers that load their own view. */
  async writeHidden(
    recipeId: string,
    input: HiddenTipsBody,
    familyId: string | null = null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      const recipe = await lockRecipeForWrite(tx, recipeId, familyId);
      if (!recipe.parentId)
        throw new ApiException(400, 'recipes.bad_hidden_tip');
      // Serialise with Tip changes on the base (they lock the base row).
      await tx
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.id, recipe.parentId))
        .for('share');
      if (input.tipIds.length > 0) {
        const valid = await tx
          .select({ id: recipeTips.id })
          .from(recipeTips)
          .where(
            and(
              inArray(recipeTips.id, input.tipIds),
              eq(recipeTips.recipeId, recipe.parentId),
              isNull(recipeTips.stepId),
            ),
          );
        if (valid.length !== input.tipIds.length) {
          throw new ApiException(400, 'recipes.bad_hidden_tip');
        }
      }
      await tx
        .delete(recipeHiddenTips)
        .where(eq(recipeHiddenTips.recipeId, recipeId));
      if (input.tipIds.length > 0) {
        await tx
          .insert(recipeHiddenTips)
          .values(input.tipIds.map((tipId) => ({ recipeId, tipId })));
      }
    });
  }

  private async detail(
    recipeId: string,
    familyId: string | null,
  ): Promise<AdminRecipeDetail> {
    const detail = await loadAdminDetail(this.database, recipeId, familyId);
    if (!detail) throw recipeNotFound();
    return detail;
  }

  private async requireTip(tx: Tx, recipeId: string, tipId: string) {
    const [tip] = await tx
      .select()
      .from(recipeTips)
      .where(and(eq(recipeTips.id, tipId), eq(recipeTips.recipeId, recipeId)));
    if (!tip) throw tipNotFound();
    return tip;
  }

  private async assertStepOf(tx: Tx, recipeId: string, stepId: string | null) {
    if (stepId === null) return;
    const [step] = await tx
      .select({ id: recipeSteps.id })
      .from(recipeSteps)
      .where(
        and(eq(recipeSteps.id, stepId), eq(recipeSteps.recipeId, recipeId)),
      );
    if (!step) throw new ApiException(400, 'recipes.bad_step_anchor');
  }
}
