import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  recipeHiddenTips,
  recipeIngredientLines,
  recipes,
  recipeSteps,
  recipeTips,
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { recipeNotFound } from './recipe-errors';
import { writeGuidanceChecked } from './recipe-guidance-write';
import { lockFamilyRow } from './recipe-locks';
import { resolveRecipe } from './recipe-view';

/**
 * Add to Family (ADR 0029): a frozen copy of a Catalog Recipe that the Member's
 * Family owns. The text is taken in the Member's Catalog Language, so the copy is
 * single-language like any Family Recipe. Idempotent per Family and source:
 * the Family row lock serialises concurrent adds, and the partial unique index
 * on (family, copied_from_id) is the backstop.
 *
 * Errors: 404 `recipes.not_found` (unknown, or another Family's Recipe),
 * 409 `recipes.copy_family_recipe` (the source is a Family Recipe),
 * 409 `recipes.copy_archived` (the Catalog Recipe is archived).
 */
@Injectable()
export class RecipeCopyService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async copy(
    memberId: string,
    sourceId: string,
    locale: CatalogLocale,
  ): Promise<{ id: string }> {
    const familyId = await this.settings.familyIdOf(memberId);
    const source = await this.readSource(this.database, sourceId, familyId);
    const live = await this.liveCopy(this.database, familyId, sourceId);
    if (live) return { id: live };

    const resolved = await resolveRecipe(
      this.database,
      catalogScope(familyId),
      source,
      locale,
    );
    const hidden = await this.database
      .select({ tipId: recipeHiddenTips.tipId })
      .from(recipeHiddenTips)
      .where(eq(recipeHiddenTips.recipeId, sourceId));

    const id = await this.database.transaction(async (tx) => {
      await lockFamilyRow(tx, familyId);
      // Re-read under the lock: a concurrent add finished first, or the source was archived.
      await this.readSource(tx, sourceId, familyId, true);
      const existing = await this.liveCopy(tx, familyId, sourceId);
      if (existing) return existing;

      const copyId = randomUUID();
      await tx.insert(recipes).values({
        id: copyId,
        familyId,
        parentId: source.parentId,
        copiedFromId: sourceId,
        title: resolved.title,
        servings: resolved.servings,
        prepMinutes: resolved.prepMinutes,
        cookMinutes: resolved.cookMinutes,
        difficulty: resolved.difficulty,
        cuisineId: resolved.cuisine?.id ?? null,
        methodId: resolved.method?.id ?? null,
      });
      if (resolved.lines.length > 0) {
        await tx.insert(recipeIngredientLines).values(
          resolved.lines.map((line, position) => ({
            id: randomUUID(),
            recipeId: copyId,
            position,
            ingredientId: line.ingredientId,
            quantity: line.quantity,
            unit: line.unit,
            optional: line.optional,
            note: line.note,
          })),
        );
      }
      const stepIds = new Map<string, string>();
      if (resolved.steps.length > 0) {
        await tx.insert(recipeSteps).values(
          resolved.steps.map((step, position) => {
            const stepId = randomUUID();
            stepIds.set(step.id, stepId);
            return {
              id: stepId,
              recipeId: copyId,
              position,
              text: step.text,
              timerSeconds: step.timerSeconds,
            };
          }),
        );
      }
      // Only the Recipe's own Tips: a Variant keeps inheriting its Base's, and keeps what it hides.
      const own = resolved.tips.filter((tip) => !tip.inherited);
      if (own.length > 0) {
        await tx.insert(recipeTips).values(
          own.map((tip, position) => ({
            id: randomUUID(),
            recipeId: copyId,
            stepId: tip.stepId ? (stepIds.get(tip.stepId) ?? null) : null,
            position,
            text: tip.text,
          })),
        );
      }
      if (hidden.length > 0) {
        await tx
          .insert(recipeHiddenTips)
          .values(hidden.map((h) => ({ recipeId: copyId, tipId: h.tipId })));
      }
      await writeGuidanceChecked(
        tx,
        { id: copyId, familyId },
        {
          nutritionNote: resolved.guidance.nutritionNote,
          // The resolved view drops links to archived Recipes, as a Variant draft does.
          pairings: resolved.guidance.pairings.map((p) => ({
            kind: p.kind,
            label: p.label,
            reason: p.reason,
            principle: p.principle,
            linkedIngredientId:
              p.link?.type === 'ingredient' ? p.link.id : null,
            linkedRecipeId: p.link?.type === 'recipe' ? p.link.id : null,
          })),
          eatingMoments: resolved.guidance.eatingMoments.map((m) => ({
            eatingMomentId: m.eatingMomentId,
            polarity: m.polarity,
            reason: m.reason,
          })),
        },
      );
      return copyId;
    });
    return { id };
  }

  private async readSource(
    executor: Database | Tx,
    id: string,
    familyId: string,
    lock = false,
  ) {
    const query = executor.select().from(recipes).where(eq(recipes.id, id));
    const [row] = await (lock ? query.for('key share') : query);
    // Another Family's Recipe answers like an unknown id.
    if (!row || (row.familyId !== null && row.familyId !== familyId)) {
      throw recipeNotFound();
    }
    if (row.familyId !== null) {
      throw new ApiException(409, 'recipes.copy_family_recipe');
    }
    if (row.archivedAt) throw new ApiException(409, 'recipes.copy_archived');
    return row;
  }

  private async liveCopy(
    executor: Database | Tx,
    familyId: string,
    sourceId: string,
  ): Promise<string | null> {
    const [row] = await executor
      .select({ id: recipes.id })
      .from(recipes)
      .where(
        and(
          eq(recipes.familyId, familyId),
          eq(recipes.copiedFromId, sourceId),
          isNull(recipes.archivedAt),
        ),
      );
    return row?.id ?? null;
  }
}
