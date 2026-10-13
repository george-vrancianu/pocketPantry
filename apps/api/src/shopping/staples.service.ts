import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { hasPgCode } from '../database/pg-errors';
import { ingredients, staples, suggestionDismissals } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { SettingsService } from '../settings/settings.service';
import {
  byShopOrder,
  loadIngredientPlacements,
} from '../catalog/ingredient-placement';
import {
  MAX_STAPLES,
  type AddStapleBody,
  type StapleView,
  type UpdateStapleBody,
} from './staples.schemas';

type StapleRow = typeof staples.$inferSelect;

const stapleNotFound = () => new ApiException(404, 'shopping.staple_not_found');

@Injectable()
export class StaplesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  /** The Family's Staples in shop order. */
  async list(memberId: string, locale: CatalogLocale): Promise<StapleView[]> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(staples)
      .where(eq(staples.familyId, familyId));
    return this.toViews(rows, locale);
  }

  async add(
    memberId: string,
    body: AddStapleBody,
    locale: CatalogLocale,
  ): Promise<StapleView> {
    const familyId = await this.settings.familyIdOf(memberId);
    let row: StapleRow;
    try {
      row = await this.database.transaction(async (tx) => {
        const [found] = await tx
          .select({ id: ingredients.id })
          .from(ingredients)
          .where(eq(ingredients.id, body.ingredientId));
        if (!found) {
          throw new ApiException(404, 'shopping.ingredient_not_found');
        }
        // Serialises concurrent adds so the cap cannot be overshot.
        await lockFamilies(tx, [familyId]);
        const [{ total }] = await tx
          .select({ total: count() })
          .from(staples)
          .where(eq(staples.familyId, familyId));
        if (total >= MAX_STAPLES) {
          throw new ApiException(409, 'shopping.staple_limit_reached', {
            max: MAX_STAPLES,
          });
        }
        const [inserted] = await tx
          .insert(staples)
          .values({
            familyId,
            ingredientId: body.ingredientId,
            quantity: body.quantity ?? null,
            unit: body.unit ?? null,
          })
          .returning();
        return inserted;
      });
    } catch (error) {
      if (hasPgCode(error, '23505')) {
        throw new ApiException(409, 'shopping.staple_already_exists');
      }
      throw error;
    }
    return (await this.toViews([row], locale))[0];
  }

  async update(
    memberId: string,
    stapleId: string,
    body: UpdateStapleBody,
    locale: CatalogLocale,
  ): Promise<StapleView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const [row] = await this.database
      .update(staples)
      .set({ quantity: body.quantity, unit: body.unit })
      .where(and(eq(staples.id, stapleId), eq(staples.familyId, familyId)))
      .returning();
    if (!row) throw stapleNotFound();
    return (await this.toViews([row], locale))[0];
  }

  async remove(memberId: string, stapleId: string): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.database.transaction(async (tx) => {
      // Same lock as a dismiss, so one cannot leave an orphan dismissal behind.
      await lockFamilies(tx, [familyId]);
      const [removed] = await tx
        .delete(staples)
        .where(and(eq(staples.id, stapleId), eq(staples.familyId, familyId)))
        .returning({ ingredientId: staples.ingredientId });
      if (!removed) throw stapleNotFound();
      // A dismissal only hides a Staple; it must not outlive it and hide a re-added one.
      await tx
        .delete(suggestionDismissals)
        .where(
          and(
            eq(suggestionDismissals.familyId, familyId),
            eq(suggestionDismissals.ingredientId, removed.ingredientId),
          ),
        );
    });
  }

  private async toViews(
    rows: StapleRow[],
    locale: CatalogLocale,
  ): Promise<StapleView[]> {
    const placements = await loadIngredientPlacements(
      this.database,
      locale,
      rows.map((row) => row.ingredientId),
    );
    return rows
      .map((row) => ({
        id: row.id,
        ingredientId: row.ingredientId,
        name: placements.get(row.ingredientId)?.name ?? '',
        quantity: row.quantity,
        unit: row.unit,
        aisle: placements.get(row.ingredientId)?.aisle ?? null,
      }))
      .sort(byShopOrder);
  }
}
