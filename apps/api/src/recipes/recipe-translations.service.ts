import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Tx } from '../database/database.types';
import {
  recipeIngredientLines,
  recipeIngredientLineTranslations,
  recipeStepTranslations,
  recipeSteps,
  recipeTipTranslations,
  recipeTips,
  recipeTranslations,
} from '../database/schema';
import { itemNotFound, recipeNotFound } from './recipe-errors';
import { lockCatalogRecipe } from './recipe-locks';
import { loadAdminDetail } from './recipe-view';
import type { AdminRecipeDetail, TranslationsBody } from './recipes.schemas';

/**
 * Translations of Catalog Recipe text, one locale at a time. The source text
 * (English) lives on the rows, so only other locales are written. Rows in the
 * body are upserted, `null` deletes, anything not mentioned is left alone;
 * every id must belong to the Recipe.
 */
@Injectable()
export class RecipeTranslationsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async set(
    recipeId: string,
    locale: string,
    body: TranslationsBody,
  ): Promise<AdminRecipeDetail> {
    if (locale === FALLBACK_LOCALE) {
      throw new ApiException(400, 'recipes.source_locale');
    }
    await this.database.transaction(async (tx) => {
      await lockCatalogRecipe(tx, recipeId);
      await this.writeTitle(tx, recipeId, locale, body.title);
      await this.writeSteps(tx, recipeId, locale, body.steps);
      await this.writeLines(tx, recipeId, locale, body.lines);
      await this.writeTips(tx, recipeId, locale, body.tips);
    });
    const detail = await loadAdminDetail(this.database, recipeId);
    if (!detail) throw recipeNotFound();
    return detail;
  }

  private async writeTitle(
    tx: Tx,
    recipeId: string,
    locale: string,
    title: string | null | undefined,
  ) {
    if (title === undefined) return;
    if (title === null) {
      await tx
        .delete(recipeTranslations)
        .where(
          and(
            eq(recipeTranslations.recipeId, recipeId),
            eq(recipeTranslations.locale, locale),
          ),
        );
      return;
    }
    await tx
      .insert(recipeTranslations)
      .values({ recipeId, locale, title })
      .onConflictDoUpdate({
        target: [recipeTranslations.recipeId, recipeTranslations.locale],
        set: { title, updatedAt: new Date() },
      });
  }

  private async writeSteps(
    tx: Tx,
    recipeId: string,
    locale: string,
    entries: Record<string, string | null>,
  ) {
    const ids = Object.keys(entries);
    if (ids.length === 0) return;
    const owned = await tx
      .select({ id: recipeSteps.id })
      .from(recipeSteps)
      .where(
        and(eq(recipeSteps.recipeId, recipeId), inArray(recipeSteps.id, ids)),
      );
    if (owned.length !== ids.length) throw itemNotFound('step');
    for (const [stepId, text] of Object.entries(entries)) {
      if (text === null) {
        await tx
          .delete(recipeStepTranslations)
          .where(
            and(
              eq(recipeStepTranslations.stepId, stepId),
              eq(recipeStepTranslations.locale, locale),
            ),
          );
      } else {
        await tx
          .insert(recipeStepTranslations)
          .values({ stepId, locale, text })
          .onConflictDoUpdate({
            target: [
              recipeStepTranslations.stepId,
              recipeStepTranslations.locale,
            ],
            set: { text, updatedAt: new Date() },
          });
      }
    }
  }

  private async writeLines(
    tx: Tx,
    recipeId: string,
    locale: string,
    entries: Record<string, string | null>,
  ) {
    const ids = Object.keys(entries);
    if (ids.length === 0) return;
    const owned = await tx
      .select({ id: recipeIngredientLines.id })
      .from(recipeIngredientLines)
      .where(
        and(
          eq(recipeIngredientLines.recipeId, recipeId),
          inArray(recipeIngredientLines.id, ids),
          // A line without a source note has nothing to translate.
          isNotNull(recipeIngredientLines.note),
        ),
      );
    if (owned.length !== ids.length) throw itemNotFound('line');
    for (const [lineId, note] of Object.entries(entries)) {
      if (note === null) {
        await tx
          .delete(recipeIngredientLineTranslations)
          .where(
            and(
              eq(recipeIngredientLineTranslations.lineId, lineId),
              eq(recipeIngredientLineTranslations.locale, locale),
            ),
          );
      } else {
        await tx
          .insert(recipeIngredientLineTranslations)
          .values({ lineId, locale, note })
          .onConflictDoUpdate({
            target: [
              recipeIngredientLineTranslations.lineId,
              recipeIngredientLineTranslations.locale,
            ],
            set: { note, updatedAt: new Date() },
          });
      }
    }
  }

  private async writeTips(
    tx: Tx,
    recipeId: string,
    locale: string,
    entries: Record<string, string | null>,
  ) {
    const ids = Object.keys(entries);
    if (ids.length === 0) return;
    const owned = await tx
      .select({ id: recipeTips.id })
      .from(recipeTips)
      .where(
        and(eq(recipeTips.recipeId, recipeId), inArray(recipeTips.id, ids)),
      );
    if (owned.length !== ids.length) throw itemNotFound('tip');
    for (const [tipId, text] of Object.entries(entries)) {
      if (text === null) {
        await tx
          .delete(recipeTipTranslations)
          .where(
            and(
              eq(recipeTipTranslations.tipId, tipId),
              eq(recipeTipTranslations.locale, locale),
            ),
          );
      } else {
        await tx
          .insert(recipeTipTranslations)
          .values({ tipId, locale, text })
          .onConflictDoUpdate({
            target: [recipeTipTranslations.tipId, recipeTipTranslations.locale],
            set: { text, updatedAt: new Date() },
          });
      }
    }
  }
}
